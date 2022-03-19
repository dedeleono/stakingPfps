import create from "zustand";
import * as anchor from "@project-serum/anchor";
//TODO change to PfpIDL
import shillCityIDL from "../../target/idl/shill_city.json";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, Connection, PublicKey } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getTrtnToken } from "../utils/token";
import axios from "axios";
import { programs } from "@metaplex/js";

const {
  metadata: { Metadata },
} = programs;

type PfpState = {
  program: any;
  connection: Connection;
  jollyranch: PublicKey;
  jollyBump: number;
  recieverSplAccount: PublicKey;
  spl_token: PublicKey;
  splBump: number;
  wallet_token_account: PublicKey;
  jollyAccount: PublicKey;
};

interface UsePfpStore {
  pfpState: PfpState;
  stakedNFTs: [];
  stakingRewards: any;
  stakedMints: [];
  totalRatsStaked: number;
  setupPfp: (wallet: AnchorWallet) => void;
  stakeNFT: (nftPubKey: PublicKey) => void;
  getNftData: (nftPubKey: any) => void;
  getStakedNfts: () => void;
  getStakedMints: () => void;
  redeemRewards: (nftPubKey: PublicKey) => void;
  redeemAllRewards: (redeemAllChunk: number) => void;
  redeemNFT: (stakePubKey: PublicKey, nftPubKey: PublicKey) => void;
  getTotalStakedRats: () => void;
  resetStakedMints: () => void;
  resetStakedNFTs: () => void;
}

const usePfpStore = create<UsePfpStore>((set: any, get: any) => ({
  pfpState: {} as PfpState,
  stakedNFTs: [],
  stakingRewards: {},
  stakedMints: [],
  totalRatsStaked: 0,
  setupPfp: async (wallet: AnchorWallet) => {
    const opts = {
      preflightCommitment: "processed" as ConfirmOptions,
    };
    const endpoint =
      "https://bold-withered-pond.solana-mainnet.quiknode.pro/608c8586df23a01f2bdbfd77fd8d54b5f87f3211/";
    const connection = new anchor.web3.Connection(
      endpoint,
      opts.preflightCommitment
    );
    const provider = new Provider(connection, wallet, opts.preflightCommitment);
    //TODO change program ID
    const shillCityCapital = new anchor.web3.PublicKey(
      "EdYp85RTTNJJAFCXuCPc1uoSJuchchxEXr9W39tmktFu"
    );

    // console.log("shillCityCapital", shillCityCapital);
    // console.log("shillCityCapital", shillCityCapital.toString());
    const program = new Program(
      shillCityIDL as anchor.Idl,
      shillCityCapital.toString(),
      provider
    );
    // console.log("program got ran", program);
    // default behavior new jollyranch each test

    // const jollyranch = anchor.web3.Keypair.generate();
    // switch to pda account for same jollyranch testing

    // console.log("program", program);

    // console.log("program", program.programId.toString());

    // pda generation example
    const [jollyranch, jollyBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("jolly_account")],
        program.programId
      );

    // console.log("jollyranch", jollyranch.toBase58());
    // console.log("jollyBump", jollyBump);

    // use your own token here ex CHEESE
    const spl_token = getTrtnToken();
    const [recieverSplAccount, splBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [jollyranch.toBuffer()],
        program.programId
      );
    // console.log("recieverSplAccount", recieverSplAccount.toBase58());
    // console.log("splBump", splBump);

    // console.log("wallet", wallet);
    // console.log("wallet pulbic key", wallet.publicKey.toString());

    const wallet_token_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      spl_token,
      wallet.publicKey
    );
    // console.log("wallet_token_account", wallet_token_account.toBase58());

    const jollyAccount = await program.account.jollyRanch.fetch(
      jollyranch.toString()
    );
    // console.log("jollyAccount", jollyAccount);
    // console.log("jollyAccount.amount", jollyAccount.amount.toString());
    // console.log(
    //   "jollyAccount.amountRedeemed",
    //   jollyAccount.amountRedeemed.toString()
    // );
    // console.log("program", program);
    // console.log("jollyAccount", jollyAccount);
    // console.log("jollyAccount amount", jollyAccount.amount.toNumber());
    // console.log(
    //   "jollyAccount amount redeemed",
    //   jollyAccount.amountRedeemed.toNumber()
    // );
    set({
      pfpState: {
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
  },
  stakeNFT: async (nftPubKey: PublicKey) => {
    const _pfpState = get().pfpState;
    const nft = new anchor.web3.PublicKey(nftPubKey);
    // console.log("nft", nft.toString());
    // console.log("cheese", cheese);
    // console.log("lockup", lockup);
    const stake = anchor.web3.Keypair.generate();
    const [stake_spl, stakeBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stake.publicKey.toBuffer()],
        _pfpState.program.programId
      );
    let wallet_nft_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nft,
      _pfpState.program.provider.wallet.publicKey
    );

    // check if token has an associated account
    // if not send from the wallet account
    const largestAccounts = await _pfpState.connection.getTokenLargestAccounts(
      nft
    );
    // console.log("largestAccounts", largestAccounts);
    // const largestAccountInfo = await _pfpState.connection.getParsedAccountInfo(
    //   largestAccounts.value[0].address
    // );
    // console.log(
    //   "largestAccounts.value[0].address",
    //   largestAccounts.value[0].address.toString()
    // );
    // console.log(largestAccountInfo.value.data.parsed.info.owner);
    const hasATA =
      largestAccounts.value[0].address.toString() ===
      wallet_nft_account.toString();
    if (!hasATA) {
      wallet_nft_account = largestAccounts.value[0].address;
    }

    // console.log("wallet_nft_account", wallet_nft_account.toString());
    await _pfpState.program.rpc.stakeNft(stakeBump, {
      accounts: {
        authority: _pfpState.program.provider.wallet.publicKey.toString(),
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
  },
  getNftData: async (nftPubKey: any) => {
    const _pfpState = get().pfpState;
    // console.log("nftPubKey", nftPubKey);
    const tokenAccount = new anchor.web3.PublicKey(nftPubKey);
    //TODO check if this is program id is ok
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [pda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new anchor.web3.PublicKey(tokenAccount.toString()).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    const accountInfo: any = await _pfpState.connection.getParsedAccountInfo(
      pda
    );

    const metadata: any = new Metadata(
      _pfpState.program.provider.wallet.publicKey.toString(),
      accountInfo.value
    );
    const { data }: any = await axios.get(metadata.data.data.uri);
    return data;
  },
  getStakedNfts: async () => {
    const _pfpState = get().pfpState;
    // console.log("jollyState program", jollyState.program);
    const unWithdrawnNFTs = [];
    const newStakedNFTs = await _pfpState.program.account.stake.all([
      {
        memcmp: {
          offset: 8, // Discriminator
          // bytes: bs58.encode(wallet.publicKey.toBuffer()),
          bytes: _pfpState.program.provider.wallet.publicKey.toBase58(),
        },
      },
    ]);
    // console.log("newStakedNFTs", newStakedNFTs);
    await newStakedNFTs.map((stake) => {
      if (stake.account.withdrawn === false) {
        unWithdrawnNFTs.push(stake);
      }
    });
    // console.log("setting newStakedNFTs to unWithdrawnNFTs", unWithdrawnNFTs);
    set({
      stakedNFTs: unWithdrawnNFTs,
    });
    // console.log("stakedNfts on load:", stakedNfts);
    // return stakedNfts;
  },
  getStakedMints: async () => {
    const _stakedNFTs = get().stakedNFTs;
    const _pfpState = get().pfpState;
    const _stakingRewards = get().stakingRewards;
    // console.log("running getStakedMints with these nft accounts:", stakedNFTs);
    const allStakedMints = await Promise.all(
      _stakedNFTs.map(async (nft_account, i) => {
        // console.log("nft_account", nft_account);
        const [stake_spl, _stakeBump] =
          await anchor.web3.PublicKey.findProgramAddress(
            [nft_account.publicKey.toBuffer()],
            _pfpState.program.programId
          );
        // console.log("stake_spl", stake_spl);
        // console.log("stake_spl", stake_spl.toString());

        let endpoint = JSON.parse(
          process.env.NEXT_PUBLIC_QUICKNODE_MAINNET_BETA_RPC_ENDPOINT
        );
        endpoint = endpoint[Math.floor(Math.random() * endpoint.length)];

        const nft_public_key = await axios
          .post(endpoint, {
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [
              stake_spl.toString(),
              {
                encoding: "jsonParsed",
              },
            ],
          })
          .then(async (res) => {
            // console.log("res", res);
            // console.log("res.data.result", res.data.result);
            // console.log(
            //   "returned res data in getStakedMints:",
            //   res.data.result.value.data.parsed
            // );
            return res.data.result.value?.data.parsed.info.mint;
          });

        // console.log("nft_public_key", nft_public_key);
        if (nft_public_key) {
          const nft = await get().getNftData(nft_public_key);
          nft["nft_account"] = nft_account;
          nft["nft_account"].id = i;
          // console.log("running pushed nft to mints", nft);
          // allStakedMints.push(nft);
          return nft;
        }
      })
    );
    // console.log("allStakedMints", allStakedMints);
    allStakedMints.map((nft) => {
      if (nft) {
        // console.log("nft", nft);
        //TODO Change mints?
        const mints = [
          "9Gd3CpPFgK5PbfRnEuhF2JmDSUFEyWkHPkB7GA4SfSdA",
          "APA8t9faSRNdZvB1opJvB5DQ8h3aeCFyNxZiaCMSArTZ",
          "FrLGhta8fHTcyFTqiTDUwiDiG59L5xnvnqJwS2ssVXu7",
          "662zoahSfHgZYjQ9bzcS8MzqRfsF2H1h549uZUebC4e6",
          "Fs9SpcHN8J7PN8gjmp7Xvhae8EA4Zwifa79eNCQHJNgW",
          "4j99GW37LGL1Er7otAsqRdWgNDt9srZguim9n4rFCoDj",
        ];
        let redemption_rate = 6.9;
        // console.log("nft", nft.nft_account.account.mint.toString());
        if (mints.includes(nft.nft_account.account.mint.toString())) {
          redemption_rate = 16.9;
        }
        const currDate = new Date().getTime() / 1000;
        const daysElapsed =
          Math.abs(currDate - nft.nft_account.account.startDate) /
          (60 * 60 * 24);
        const amountRedeemed =
          nft.nft_account.account.amountRedeemed.toNumber() / 1e6;
        // console.log(
        //   "amountRedeemed",
        //   nft.nft_account.account.amountRedeemed.toNumber() / 1e6
        // );
        const estimateRewards = redemption_rate * daysElapsed - amountRedeemed;
        _stakingRewards[nft.nft_account.id.toString()] = estimateRewards;
      }
    });
    set({
      stakingRewards: { ..._stakingRewards },
      stakedMints: allStakedMints.filter((e) => e),
    });
  },
  redeemRewards: async (nftPubKey: PublicKey) => {
    const _pfpState = get().pfpState;
    await _pfpState.program.rpc.redeemRewards({
      accounts: {
        stake: nftPubKey.toString(),
        jollyranch: _pfpState.jollyranch.toString(),
        authority: _pfpState.program.provider.wallet.publicKey.toString(),
        senderSplAccount: _pfpState.recieverSplAccount.toString(),
        recieverSplAccount: _pfpState.wallet_token_account.toString(),
        mint: _pfpState.spl_token.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
  },
  redeemAllRewards: async (redeemAllChunk: number) => {
    const _pfpState = get().pfpState;
    const _stakedMints = get().stakedMints;
    const tx = new anchor.web3.Transaction();
    // Chunked request to prevent transaction to large error (1232 bytes)
    let i, j, stakedMintsChunked;
    for (i = 0, j = _stakedMints.length; i < j; i += redeemAllChunk) {
      stakedMintsChunked = _stakedMints.slice(i, i + redeemAllChunk);
      // do whatever
      for (let k = 0; k < stakedMintsChunked.length; k++) {
        const redeem = await _pfpState.program.instruction.redeemRewards({
          accounts: {
            stake: stakedMintsChunked[k].nft_account.publicKey.toString(),
            jollyranch: _pfpState.jollyranch.toString(),
            authority: _pfpState.program.provider.wallet.publicKey.toString(),
            senderSplAccount: _pfpState.recieverSplAccount.toString(),
            recieverSplAccount: _pfpState.wallet_token_account.toString(),
            mint: _pfpState.spl_token.toString(),
            systemProgram: anchor.web3.SystemProgram.programId.toString(),
            tokenProgram: TOKEN_PROGRAM_ID.toString(),
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
            rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
          },
        });
        tx.add(redeem);
      }
      try {
        await _pfpState.program.provider.send(tx);
      } catch (err) {
        console.log(err);
        break;
      }
    }
  },
  redeemNFT: async (stakePubKey: PublicKey, nftPubKey: PublicKey) => {
    const _pfpState = get().pfpState;
    console.log("stakesPubKey", stakePubKey.toString());
    console.log("nftPubKey", nftPubKey.toString());
    const wallet_nft_account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nftPubKey,
      _pfpState.program.provider.wallet.publicKey
    );
    console.log("wallet_nft_account", wallet_nft_account.toString());
    const [stake_spl, _stakeBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [stakePubKey.toBuffer()],
        _pfpState.program.programId
      );

    console.log("stake_spl", stake_spl.toString());

    await _pfpState.program.rpc.redeemNft({
      accounts: {
        stake: stakePubKey.toString(),
        jollyranch: _pfpState.jollyranch.toString(),
        authority: _pfpState.program.provider.wallet.publicKey.toString(),
        senderSplAccount: stake_spl.toString(),
        recieverSplAccount: wallet_nft_account.toString(),
        senderTritonAccount: _pfpState.recieverSplAccount.toString(),
        recieverTritonAccount: _pfpState.wallet_token_account.toString(),
        mint: _pfpState.spl_token.toString(),
        nft: nftPubKey.toString(),
        systemProgram: anchor.web3.SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        rent: anchor.web3.SYSVAR_RENT_PUBKEY.toString(),
      },
    });
  },
  getTotalStakedRats: async () => {
    const _pfpState = get().pfpState;
    // console.log("runnning total staked rats");
    let totalStillStaked = 0;
    const totalStaked = await _pfpState.program.account.stake.all();
    // console.log("totalStaked", totalStaked);
    // if (totalStaked[0]) {
    //   console.log("totalStaked", totalStaked[0].account.authority.toString());
    // }
    await totalStaked.map((stake) => {
      if (stake.account.withdrawn === false) {
        totalStillStaked++;
      }
    });
    set({
      totalRatsStaked: totalStillStaked,
    });
  },
  resetStakedMints: () => {
    set({ stakedMints: [] });
  },
  resetStakedNFTs: () => {
    set({ stakedNFTs: [] });
  },
}));

export default usePfpStore;
