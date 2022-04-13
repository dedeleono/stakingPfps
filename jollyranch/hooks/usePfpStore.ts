import create from "zustand";
import * as anchor from "@project-serum/anchor";
import {ConfirmOptions, Connection, PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@project-serum/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    Token,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {getPfpProgram} from "../utils/program";
import {getTrtnToken} from "../utils/token";

import hashTable from "../lib/hash_table/pfp_hash_table.json";
import legendariesHashTable from "../lib/hash_table/pfp_legendaries_hash_table.json";
import NftsData from "../utils/nftsData";
import {toast} from "react-toastify";
import {timeout} from "../utils/common";

type PfpState = {
    program: Program;
    connection: Connection;
    jollyranch: PublicKey;
    jollyBump: number;
    recieverSplAccount: PublicKey;
    spl_token: PublicKey;
    splBump: number;
    wallet_token_account: PublicKey;
    jollyAccount: any;
};

type PfpStats = {
    totalStaked: number,
    stakedNfts: any,
    unStakedNfts: any,
};

interface UsePfpStore {
    state : PfpState;
    stats: PfpStats,
    getStats: () => Promise<boolean>;
    initState: (wallet: AnchorWallet,loadStats?: boolean) => Promise<boolean>;
    stakeNFT:(nftPubKey: PublicKey) => Promise<boolean>;
    unStakeNFT:(stakePubKey: PublicKey, nftPubKey: PublicKey) => Promise<boolean>;
    redeemRewards:(stakePubKey: PublicKey) => Promise<boolean>;
    redeemAllRewards:(redeemAllChunk: number) => Promise<boolean>;
}

const usePfpStore = create<UsePfpStore>((set, get) => ({
    state: {} as PfpState,
    stats: {} as PfpStats,
    getStats: async () => {
        const program = get().state.program;
        const nfts = new NftsData(program,hashTable,legendariesHashTable, 4.2, 10);
        const totalStaked = await nfts.getTotalStakedNfts();
        const stakedNfts = await nfts.getWalletStakedNfts();
        const unStakedNfts = await nfts.getWalletUnStakedNfts();
        set({
            stats: {
                totalStaked,
                stakedNfts,
                unStakedNfts,
            },
        });
        return true;
    },
    initState: async (wallet: AnchorWallet, loadStats=false) => {
        const connection = new anchor.web3.Connection(
            process.env.NEXT_PUBLIC_RPC_ENDPOINT as string,
            "processed" as ConfirmOptions
        );

        const provider = new Provider(connection, wallet, "processed" as ConfirmOptions);
        const program = getPfpProgram(provider);

        const [jollyranch, jollyBump] =
            await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from("jolly_account")],
                program.programId
            );

        const [recieverSplAccount, splBump] =
            await anchor.web3.PublicKey.findProgramAddress(
                [jollyranch.toBuffer()],
                program.programId
            );

        const spl_token = getTrtnToken();
        const wallet_token_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            spl_token,
            wallet.publicKey
        );

        const jollyAccount = await program.account.jollyRanch.fetch(
            jollyranch.toString()
        );

        set({
            state: {
                program,
                connection,
                jollyranch,
                jollyBump,
                recieverSplAccount,
                spl_token,
                splBump,
                wallet_token_account,
                jollyAccount,
            },
        });

        if(loadStats) {
            await get().getStats();
        }
        return true
    },
    stakeNFT: async (nftPubKey: PublicKey) => {
        const _state = get().state;
        const nft = new anchor.web3.PublicKey(nftPubKey);
        const stake = anchor.web3.Keypair.generate();
        const [stake_spl, stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
                [stake.publicKey.toBuffer()],
                _state.program.programId
            );
        let wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nft,
            _state.program.provider.wallet.publicKey
        );

        // check if token has an associated account
        // if not send from the wallet account
        const largestAccounts = await _state.connection.getTokenLargestAccounts(
            nft
        );
        const hasATA =
            largestAccounts.value[0].address.toString() ===
            wallet_nft_account.toString();
        if (!hasATA) {
            wallet_nft_account = largestAccounts.value[0].address;
        }
        try {
            await _state.program.rpc.stakeNft(stakeBump, {
                accounts: {
                    authority: _state.program.provider.wallet.publicKey.toString(),
                    stake: stake.publicKey.toString(),
                    senderSplAccount: wallet_nft_account.toString(),
                    recieverSplAccount: stake_spl.toString(),
                    mint: nft.toString(),
                    systemProgram: anchor.web3.SystemProgram.programId.toString(),
                    tokenProgram: TOKEN_PROGRAM_ID.toString(),
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
                },
                signers: [stake],
            });
            await timeout(300);
            get().getStats();
            toast.success("Stake completed!");
            return true;
        } catch (e:any) {
            console.log('error calling rpc stakeNft', e);
            toast.error(`Stake failed ${e?.message ? e.message : ''}`);
            return false;
        }
    },
    unStakeNFT: async (stakePubKey: PublicKey, nftPubKey: PublicKey) => {
        const _state = get().state;
        const wallet_nft_account = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            nftPubKey,
            _state.program.provider.wallet.publicKey
        );
        const [stake_spl, _stakeBump] =
            await anchor.web3.PublicKey.findProgramAddress(
                [stakePubKey.toBuffer()],
                _state.program.programId
            );
        try {
            await _state.program.rpc.redeemNft({
                accounts: {
                    stake: stakePubKey.toString(),
                    jollyranch: _state.jollyranch.toString(),
                    authority: _state.program.provider.wallet.publicKey.toString(),
                    senderSplAccount: stake_spl.toString(),
                    recieverSplAccount: wallet_nft_account.toString(),
                    senderTritonAccount: _state.recieverSplAccount.toString(),
                    recieverTritonAccount: _state.wallet_token_account.toString(),
                    mint: _state.spl_token.toString(),
                    nft: nftPubKey.toString(),
                    systemProgram: anchor.web3.SystemProgram.programId.toString(),
                    tokenProgram: TOKEN_PROGRAM_ID.toString(),
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
                },
            });
            await timeout(300);
            get().getStats();
            toast.success("Unstake completed!");
            return true;
        } catch (e:any) {
            console.log('error calling rpc unstakeNFT', e);
            toast.error(`UnStake failed ${e?.message ? e.message : ''}`);
            return false;
        }
    },
    redeemRewards: async (stakePubKey: PublicKey) => {
        const _state = get().state;
        try {
            await _state.program.rpc.redeemRewards({
                accounts: {
                    stake: stakePubKey.toString(),
                    jollyranch: _state.jollyranch.toString(),
                    authority: _state.program.provider.wallet.publicKey.toString(),
                    senderSplAccount: _state.recieverSplAccount.toString(),
                    recieverSplAccount: _state.wallet_token_account.toString(),
                    mint: _state.spl_token.toString(),
                    systemProgram: anchor.web3.SystemProgram.programId.toString(),
                    tokenProgram: TOKEN_PROGRAM_ID.toString(),
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
                },
            });
            await timeout(300);
            get().getStats();
            toast.success("Redeem rewards completed!");
            return true;
        } catch (e:any) {
            console.log('error calling rpc redeemRewards', e);
            toast.error(`Redeem rewards failed ${e?.message ? e.message : ''}`);
            return false;
        }
    },
    redeemAllRewards: async (redeemAllChunk: number) => {
        const _state = get().state;
        const _stakedMints = get().stats.stakedNfts;
        let tx;
        // Chunked request to prevent transaction to large error (1232 bytes)
        let i, j, stakedMintsChunked;
        try {
            for (i = 0, j = _stakedMints.length; i < j; i += redeemAllChunk) {
                tx = new anchor.web3.Transaction();
                stakedMintsChunked = _stakedMints.slice(i, i + redeemAllChunk);
                // do whatever
                for (let k = 0; k < stakedMintsChunked.length; k++) {
                    const redeem = await _state.program.instruction.redeemRewards({
                        accounts: {
                            stake: stakedMintsChunked[k].stakeAccount.publicKey.toString(),
                            jollyranch: _state.jollyranch.toString(),
                            authority: _state.program.provider.wallet.publicKey.toString(),
                            senderSplAccount: _state.recieverSplAccount.toString(),
                            recieverSplAccount: _state.wallet_token_account.toString(),
                            mint: _state.spl_token.toString(),
                            systemProgram: anchor.web3.SystemProgram.programId.toString(),
                            tokenProgram: TOKEN_PROGRAM_ID.toString(),
                            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
                            rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
                        },
                    });
                    tx.add(redeem);
                }
                await _state.program.provider.send(tx);
            }
            await timeout(300);
            get().getStats();
            toast.success("Redeem all rewards completed!");
            return true;
        } catch (e:any) {
            console.log('error calling rpc redeemAllRewards', e);
            toast.error(`Redeem all rewards failed ${e?.message ? e.message : ''}`);
            return false;
        }
    },
}))


export default usePfpStore
