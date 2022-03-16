import * as anchor from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";

export function getShellToken(): PublicKey {
    // mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // devnet: FT5uQVjDVMrYh5jXfinLSns15SHjvdPVnyjC7Hitv54j
    return new anchor.web3.PublicKey(
        "9orxGYrDdQzuNQdUGfHTVS2xWyGC6snFDf13eezaZCbv"
    );
}

export function getTrtnToken(): PublicKey {
    return new anchor.web3.PublicKey(
        "8rDACnycUMGFvndX74ZM9sxjEbR3gUpVHDjDbL4qW6Zf"
    );
}

export function getUsdcToken(): PublicKey {
    // mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    // devnet: DM5nx4kDo7E2moAkie97C32FSaZUCx9rTx1rwwRfm9VM
    return new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );
}
