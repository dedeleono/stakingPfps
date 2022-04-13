import * as anchor from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";

export function getShellToken(): PublicKey {
    // mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // devnet: FT5uQVjDVMrYh5jXfinLSns15SHjvdPVnyjC7Hitv54j
    return new anchor.web3.PublicKey(
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS_SHELL as string
    );
}

export function getTrtnToken(): PublicKey {
    return new anchor.web3.PublicKey(
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS_TRTN as string
    );
}

export function getUsdcToken(): PublicKey {
    // mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // devnet: DM5nx4kDo7E2moAkie97C32FSaZUCx9rTx1rwwRfm9VM
    return new PublicKey(
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS_USDC as string
    );
}

export function getMetaplexToken(): PublicKey {
    return new anchor.web3.PublicKey(
        process.env.NEXT_PUBLIC_METAPLEX_TOKEN_METADATA_PROGRAM as string
    );
}
