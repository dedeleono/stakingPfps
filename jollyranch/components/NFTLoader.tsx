import React, {FC, useEffect, useState} from "react";
import CountUpValue from "./shared/CountUpValue";
import Image from "next/image";
import {AiOutlineCloudDownload, AiOutlineInfoCircle, AiOutlineCloseCircle} from "react-icons/ai";

interface NFTLoaderProps {
  nft: NFT;
  isStaked: boolean;
  onStake?: any;
  onRedeem?: any;
  unStake?: any;
  stakingRewards?: any;
}
interface NFT {
  id: number;
  attributes: any;
  image: string;
  name: string;
  mint: any;
  nft_account: any;
  redemption_rate: number,
}

const NFTLoader: FC<NFTLoaderProps> = ({
  nft,
  isStaked,
  onStake,
  onRedeem,
  unStake,
  stakingRewards,
}) => {
  const [image, setImage] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  useEffect(() => {
    if(nft.image.includes('ipfs.dweb.link')){
      // We need to transform https://xxx.ipfs.dweb.link to https://ipfs.io/ipfs/xxx
      const id = nft.image.split('//').pop().split('.')[0];
      const _image = `https://ipfs.io/ipfs/${id}?ext=png`;
      setImage(_image);
    } else {
      setImage(nft.image)
    }
  }, [nft.image]);

    return (
      <div
        className="card group w-72 m-4 card-compact shadow-2xl bg-primary-content text bg-opacity-90"
      >
        <figure className="relative">
          {!imageLoaded && (
              <div className="animate-pulse card flex justify-center items-center card-compact bg-slate-800 absolute top-0 left-0 right-0 bottom-0 !w-auto rounded-b-none" >
                <div className="btn loading btn-circle btn-lg btn-ghost" />
              </div>)}
          {image && (
            <div className="flex">
              <Image
                  quality={90}
                  src={image}
                  width={500}
                  height={500}
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
                        <div>
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
                  className="absolute top-3 right-3 cursor-pointer transition-opacity duration-150 opacity-30 md:opacity-0 group-hover:opacity-30"
                  title="View attributes"
                  onClick={() => setShowAttributes(prevState => !prevState)}
              >
                {showAttributes ? <AiOutlineCloseCircle size={21} /> : <AiOutlineInfoCircle size={21} />}
              </div>
            </div>
          )}

        </figure>
        {isStaked ? (
            <div className="card-body text-center items-center">

              <h2
                  className="card-title"
                  style={{ fontFamily: "Jangkuy", fontSize: "1.1rem" }}
              >
                {nft.name}
              </h2>
              <div className="mb-3">
                <p className="text-sm opacity-60">Unredeemed Rewards</p>
                <p
                    className="text-lg text-yellow font-bold"
                >
                  {stakingRewards[nft.nft_account.id.toString()] > -1
                      ? <span><CountUpValue value={stakingRewards[nft.nft_account.id.toString()]} decimals={4} showCents={true} /> $TRTN</span>
                      : "Loading..."}
                </p>
              </div>
              <div className="grid grid-cols-2 w-full">
                <div>
                  <div className="opacity-60 text-sm">
                    Date staked
                  </div>
                  <div className="text-sm">
                    {new Date(
                        nft.nft_account.account.startDate * 1000
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
                  <div className="text-sm">
                    {nft.redemption_rate}{' '}$TRTN
                  </div>
                </div>
              </div>
              <div className="justify-center card-actions">
                <button
                    className="btn rounded-full btn-sm btn-secondary"
                    onClick={onRedeem}
                >
                  redeem
                </button>
                <button
                    className="btn rounded-full btn-sm btn-accent"
                    onClick={unStake}
                >
                  unstake
                </button>
              </div>
            </div>
        ) : (
            <div className="card-body">
              <h2
                  className="card-title"
                  style={{ fontFamily: "Jangkuy", fontSize: "1.2rem" }}
              >
                {nft.name}
              </h2>
              <div className="mb-3">
                <p className="text-sm opacity-60">Daily stake rewards</p>
                <p
                    className="text-lg text-yellow font-bold"
                >
                  {nft.redemption_rate}{' '}$TRTN
                </p>
              </div>
              <button
                  className="btn rounded-full btn-md btn-secondary"
                  onClick={onStake}
              >
                Stake & earn
              </button>
            </div>
        )}
      </div>
    );
};

export default NFTLoader;
