import React, {FC, useState} from "react";
import CountUpValue from "./CountUpValue";
import Image from "next/image";
import {AiOutlineCloudDownload, AiOutlineInfoCircle, AiOutlineCloseCircle} from "react-icons/ai";

interface NFTLoaderProps {
  nft: NFT;
  onStake?: any;
  onRedeem?: any;
  unStake?: any;
}
interface NFT {
  id: number;
  isStaked: boolean,
  isLegendary: boolean,
  attributes: any;
  image: string;
  name: string;
  mint: any;
  stakeAccount: any;
  redemptionRate: number,
  estimateRewards: number,
}

const NFTLoader: FC<NFTLoaderProps> = ({
  nft,
  onStake,
  onRedeem,
  unStake,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  async function handleOnStake() {
    setIsPending(true);
    await onStake(nft.mint);
    setIsPending(false);
  }

  async function handleOnUnStake() {
    setIsPending(true);
    await unStake(nft.stakeAccount.publicKey, nft.stakeAccount.account.mint);
    setIsPending(false);
  }

  async function handleOnRedeem() {
    setIsPending(true);
    await onRedeem(nft.stakeAccount.publicKey);
    setIsPending(false);
  }

    return (
      <div
        className="card group w-72 m-4 card-compact bg-primary-content text bg-opacity-90 relative"
      >
        <figure className="relative">
          {!imageLoaded && (
              <div className="animate-pulse card flex justify-center items-center card-compact bg-slate-800 absolute top-0 left-0 right-0 bottom-0 !w-auto rounded-b-none" >
                <div className="btn loading btn-circle btn-lg btn-ghost" />
              </div>)}
          {nft.image && (
            <div className="flex">
              <Image
                  objectFit="cover"
                  quality={80}
                  src={nft.image}
                  width={400}
                  height={400}
                  alt={nft.name}
                  onLoadingComplete={() => setImageLoaded(true)}
              />
              <a
                  href={nft.image}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="absolute top-3 right-10 transition-opacity duration-150 opacity-30 md:opacity-0 group-hover:opacity-30"
                  title="Download original image"
              >
                <AiOutlineCloudDownload size={24} />
              </a>
              {showAttributes && (
                  <div className="absolute text-sm grid grid-cols-2 top-0 left-0 h-full w-full bg-primary-content/80 p-4 pt-10 text-left">
                    {nft.attributes.map((_attribute: any) => (
                        <div key={`nft-attr-${_attribute.trait_type}`}>
                          <div className="opacity-60 text-xs">
                            {_attribute.trait_type}
                          </div>
                          <div className="">
                            {_attribute.value}
                          </div>
                        </div>
                    ))}
                    <a className="flex w-full" href={`https://solscan.io/token/${nft.mint}`} rel="noopener noreferrer"  target="_blank">
                      <img src="/images/solscan.svg" className="w-4 h-5 mr-1" />
                      <div className="underline">View on solscan</div>
                    </a>
                  </div>
              )}
              <div
                  className="absolute top-3 right-3 cursor-pointer transition-opacity duration-150 opacity-30 md:opacity-0 group-hover:text-shadow-lg group-hover:opacity-30"
                  title="View attributes"
                  onClick={() => setShowAttributes(prevState => !prevState)}
              >
                {showAttributes ? <AiOutlineCloseCircle size={21} /> : <AiOutlineInfoCircle size={21} />}
              </div>
            </div>
          )}
        </figure>
        <div className="card-body text-center items-center">
          <h2
              className="card-title font-jangkuy  !text-[1.1rem]"
          >
            {nft.name}
          </h2>
          {nft.isStaked ? (
              <div>
                <div className="mb-3">
                  <p className="text-sm opacity-60">Unredeemed Rewards</p>
                  <p
                      className="text-lg text-yellow font-bold"
                  >
                    {!!nft.redemptionRate && <span><CountUpValue value={nft.estimateRewards} decimals={4} showCents={true} /> $TRTN</span>}
                  </p>
                </div>
                <div className="grid grid-cols-2 w-full my-2">
                  <div>
                    <div className="opacity-60 text-sm">
                      Date staked
                    </div>
                    <div className="text-[0.8rem]">
                      {new Date(
                          nft.stakeAccount.account.startDate * 1000
                      ).toLocaleDateString("en-US", {
                        day: "numeric", // numeric, 2-digit
                        year: "numeric", // numeric, 2-digit
                        month: "short", // numeric, 2-digit, long, short, narrow
                        hour: "numeric", // numeric, 2-digit
                        minute: "numeric", // numeric, 2-digit
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="opacity-60 text-sm">
                      Daily Rewards
                    </div>
                    <div className="text-[0.8rem]">
                      {nft.redemptionRate}{' '}$TRTN
                    </div>
                  </div>
                </div>
                <div className="justify-center card-actions">
                  <button
                      className="btn rounded-md btn-sm btn-secondary font-[Jangkuy] text-[0.8rem]"
                      disabled={isPending}
                      onClick={handleOnRedeem}
                  >
                    redeem
                  </button>
                  <button
                      className="btn rounded-md btn-sm btn-accent font-[Jangkuy] text-[0.8rem]"
                      disabled={isPending}
                      onClick={handleOnUnStake}
                  >
                    unstake
                  </button>
                </div>
              </div>
          ) : (
              <div>
                <div className="mb-3">
                  <p className="text-sm opacity-60">Daily stake rewards</p>
                  <p
                      className="text-lg text-yellow font-bold"
                  >
                    {nft.redemptionRate}{' '}$TRTN
                  </p>
                </div>
                <div className="justify-center card-actions">
                  <button
                      className="btn rounded-md btn-sm btn-secondary font-[Jangkuy] text-[0.8rem]"
                      disabled={isPending}
                      onClick={handleOnStake}
                  >
                    Stake & earn
                  </button>
                </div>
              </div>
          )}
        </div>
        {isPending && (<div className="btn btn-ghost loading absolute inset-0 p-0 leading-none w-full h-full before:!w-7 before:!h-7 before:!border-[3px] bg-primary-content/70" />)}
      </div>
    );
};

export default NFTLoader;
