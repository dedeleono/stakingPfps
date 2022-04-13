import * as anchor from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";

export function getSccAccount1(): PublicKey {
    return new anchor.web3.PublicKey(
        "TRTNuj8GgjnBSSohYgyJhxF4gkhSscxJ4kDELy9Hdh8"
    );
}

export function getSccAccount2(): PublicKey {
    return new anchor.web3.PublicKey(
        "Gu7VPxS8GhcweU6vDVjbcBomAgHuRHrBYpJ5VQsQvea8"
    );
}

export function getSccAccounts(): PublicKey[] {
    return [getSccAccount1(), getSccAccount2()];
}
