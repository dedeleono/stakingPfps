import React, {FC, useEffect, useState} from "react";
import Modal from "./Modal";
import {PublicKey} from "@solana/web3.js";

interface DepositConfirmModalProps {
    isOpen: boolean,
    isPending: boolean,
    handleConfirm: (lockPeriod:number) => void,
    nftsToStake?: [{
        publicKey: PublicKey
    }],
    handleClose?: () => void,
}

const StakeModal: FC<DepositConfirmModalProps>  = ({isOpen, isPending,handleConfirm, nftsToStake, handleClose}) => {
    const [lockPeriod, setLockPeriod] = useState(0);
    function handleLockChange(e) {
        setLockPeriod(parseInt(e.target.value))
    }
    return (
        <Modal isOpen={isOpen} handleClose={handleClose}>
            <img src="/images/wave.svg" className="absolute left-0 right-0 -top-4 z-0" />
            <div className="flex justify-around relative">
                <h4
                    className={`text-center font-jangkuy text-xl font-bold pb-10 ${isPending ? 'animate-pulse' : ''}`}
                >
                    Stake Nft
                </h4>
            </div>
            <div className="my-3 mt-5 text-center font-montserrat text-lg">Receive a bonus multiplier when locking</div>
            <div className="md:px-3">
                <div className="mb-8">
                    <div className="w-full flex justify-between text-xs">
                        <span>No lock</span>
                        <span>7 days</span>
                        <span>14 days</span>
                        <span>21 days</span>
                        <span>28 days</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="28"
                        value={lockPeriod}
                        onChange={handleLockChange}
                        className="range range-md range-secondary px-3"
                        step="7"
                    />
                    <div className="w-full flex justify-between text-xs opacity-50 px-4">
                        <span>0%</span>
                        <span>2%</span>
                        <span>3%</span>
                        <span>4%</span>
                        <span>5%</span>
                    </div>
                </div>
            </div>
            <button
                className={`btn mt-2 btn-secondary btn-lg w-full rounded-full relative overflow-hidden shadow ${isPending && 'loading'}`}
                onClick={() => handleConfirm(lockPeriod/7)}
            >
                <img src="/images/bubbles-1.svg" className="absolute top-0 -right-10" />
                <img src="/images/bubbles-2.svg" className="absolute top-0 left-0" />
                <span className="flex  leading-normal flex-col">
                 <span>Stake {!!lockPeriod && ` & lock for ${lockPeriod} days`}</span>
                    {(nftsToStake && nftsToStake.length > 5) && (
                        <span className="text-[0.55rem] md:text-[0.8rem] -mt-1 font-[Montserrat] normal-case opacity-50">
                            {Math.ceil(nftsToStake.length / 5)}{" "}
                            transactions will be prompted
                        </span>
                    )}
                </span>
            </button>
        </Modal>
    );

}

export default StakeModal;
