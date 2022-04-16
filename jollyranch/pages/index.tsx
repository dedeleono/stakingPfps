import Head from "next/head";
import React ,{useState, useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {ToastContainer} from 'react-toastify';
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import NFTLoader from "../components/shared/NFTLoader";
import Navigation from "../components/Navigation";
import Bg from "../public/images/out.jpg";
import usePfpStore from "../hooks/usePfpStore";
import StakeModal from "../components/shared/StakeModal";


const redeemAllChunk = 10;
const unstakeAllChunk = 5;

export default function Home() {
  const wallet = useAnchorWallet();
  const initState = usePfpStore((state) => state.initState);
  const stats = usePfpStore((state) => state.stats);
  const stakeNFTs = usePfpStore((state) => state.stakeNFTs);
  const unStakeNFTs = usePfpStore((state) => state.unStakeNFTs);
  const unStakeAllNFTs = usePfpStore((state) => state.unstakeAllNFTs);
  const redeemRewards = usePfpStore((state) => state.redeemRewards);
  const redeemAllRewards = usePfpStore((state) => state.redeemAllRewards);
  const [initLoading, setInitLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isRedeemingAll, setIsRedeemingAll] = useState(false);
  const [isUnstakingAll, setIsUnstakingAll] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [nftsToStake, setNftsToStake] = useState(null);
  const [showStakeModal, setShowStakeModal] = useState(null);

  useEffect(() => {
    async function initStore() {
      setInitLoading(true);
      await initState(wallet, true);
      setInitLoading(false);
    }
    if (wallet?.publicKey) {
      setWalletConnected(true);
      initStore();
    } else {
      setWalletConnected(false);
    }
  }, [wallet]);


  function handleOnStake(_nftsToStake) {
    setNftsToStake(_nftsToStake);
    setShowStakeModal(true);
  }

  async function handleOnConfirmStake(lockPeriod: number) {
    setIsStaking(true);
    let stakeResult;
    if(nftsToStake) {
      stakeResult = await stakeNFTs(nftsToStake,lockPeriod);

    }
    setIsStaking(false);
    setShowStakeModal(!stakeResult);
  }

  return (
    <>
      <Head>
        <title>Shill City Citizens</title>
        <meta
          name="description"
          content="An nft staking platform for Shill City Citizens"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div
          style={{
            backgroundImage: `url(${Bg.src})`,
            backgroundAttachment: "fixed",
            objectFit: "contain",
            backgroundRepeat: "no-repeat",
            zIndex: "10",
            display: "absolute",
            backgroundSize: "cover",
          }}
          className="grid grid-cols-1 min-h-screen bg-neutral-focus text-neutral-content pt-16 p-2 md:p-16 bg-center"
        >
          <Navigation activeId="shill-city-citizen" />
          <div className="text-center pt-8 md:pt-20 col-span-1 container mx-auto max-w-screen-xl">
            <div className="grid-cols-3">
              <div className="navbar mb-8 shadow-lg bg-neutral text-neutral-content rounded-box">
                <div className="px-2 mx-2 navbar-start">
                  <img className="w-60 -my-10" src="/logo-citizen.png" />
                </div>
                <div className="hidden px-2 mx-2 navbar-center sm:flex">
                  <div className="flex items-stretch">
                    {!!(walletConnected && stats?.totalStaked) && (
                        <div className="w-full mt-2  m-2.5">
                          <div className="stat bg-accent">
                            <div className="stat-value text-white">
                              {stats?.totalStaked.toLocaleString("en-US")}/6,666
                            </div>
                            <div
                                className="stat-title text-white"
                                style={{ fontFamily: "Montserrat" }}
                            >
                              {((stats?.totalStaked/6666)*100).toFixed(2)}% Citizens Staked
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
                <div className="navbar-end">
                  <div className="mr-4 justify-center align-center">
                    {!walletConnected && (
                        <div className="btn btn-primary z-50 text-white">
                          <WalletMultiButton
                              style={{
                                all: "unset",
                                height: "100%",
                                width: "100%",
                                zIndex: "10",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontFamily: "Montserrat",
                                fontSize: "0.8rem",
                              }}
                          />
                        </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {!!(stats?.unStakedNfts && !stats.unStakedNfts.length && stats?.stakedNfts && !stats.stakedNfts.length) && (
                    <div>
                      <div className="w-full flex justify-center justify-items-center text-center">
                        <div className="max-w-md">
                          <h1 className="text-4xl font-bold font-jangkuy">
                            You don&apos;t have any Citizens 😥
                          </h1>
                          <div className="mt-5 mb-8">
                            <a
                                href="https://magiceden.io/marketplace/sea_shanties_citizens"
                                rel="noreferrer noopener"
                                target="_blank"
                                className="btn btn-lg btn-secondary"
                            >
                              Buy on Magic Eden
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </div>
              {!!(stats?.stakedNfts && stats.stakedNfts.length > 0) && (
                  <div className="md:grid grid-cols-5 mb-4 gap-4">
                    <div className="card col-span-3 gap-4 bg-neutral bg-opacity-60 md:backdrop-blur-sm flex flex-row text-left p-8 justify-center items-center">
                      <div>
                        <h2 className="font-jangkuy text-xl  md:text-3xl py-2">The first empire:<br/>Old Atlantis</h2>
                        <div className="font-bold opacity-50 max-w-3xl font-[Montserrat]">Recruit war parties and send them to get TRTN, common, rare and legendary items. These are needed to get the Gen 2 citizens. Items are NFTs that can be traded or sold on secondary markets.</div>
                        <a href="https://game.shill-city.com/" className="btn mt-3">Recruit now</a>
                      </div>
                      <div className="w-1/2 md:flex text-center hidden lg:block">
                        <img className="max-w-sm inline" src="/images/logo-atlantis.png" />
                      </div>
                    </div>
                    <div className="card bg-neutral col-span-2 bg-opacity-60 md:backdrop-blur-sm text-left p-8 mt-4 md:mt-0 ">
                      <h2 className="font-jangkuy  text-xl  md:text-3xl py-2">
                        Locking period staking <span className="text-yellow"> is live!</span>
                      </h2>
                      <div className="font-bold opacity-50 max-w-3xl font-[Montserrat]">Stake and lock your NFT for a period of time to increase the amount of TRTN you&apos;ll get!<br /><br />
                        Unstake your citizen and restake to get the option. During the lock period you can still redeem your TRTN.</div>

                    </div>
                  </div>
              )}
              <div className="card bg-info bg-opacity-10 mb-8 md:backdrop-blur-sm">
                <div className="flex justify-center px-2 py-4 border-base-200">
                  {walletConnected ? (
                      <>
                        {initLoading ? (
                            <div className="font-scratchy text-white text-5xl animate-pulse">
                              Loading your Citizens, please wait...
                            </div>
                        ) : (
                            <>
                              {stats?.stakedNfts && stats.stakedNfts.length > 0 ? (
                                  <div>
                                    {(stats.stakedNfts.length > 1) && (
                                        <>
                                          <div className="md:flex px-2 md:px-4 md:place-content-end gap-1 md:gap-4">
                                            <button
                                                className={`btn h-full md:btn-lg btn-secondary mt-4 font-jangkuy ${isRedeemingAll && 'loading'}`}
                                                onClick={async () => {
                                                  setIsRedeemingAll(true);
                                                  await redeemAllRewards(redeemAllChunk);
                                                  setIsRedeemingAll(false);
                                                }}
                                            >
                                            <span className="flex  leading-normal flex-col">
                                              <span>Redeem All</span>
                                              {(stats.stakedNfts.length > redeemAllChunk) && (
                                                  <span className="text-[0.55rem] md:text-[0.8rem] -mt-1 font-[Montserrat] normal-case opacity-50">
                                                    {Math.ceil(stats.stakedNfts.length / redeemAllChunk)}{" "}
                                                    transactions will be prompted
                                                  </span>
                                              )}
                                            </span>
                                            </button>
                                            <button
                                                className={`btn h-full md:btn-lg btn-outline btn-secondary mt-4 font-jangkuy ${isUnstakingAll && 'loading'}`}
                                                onClick={async () => {
                                                  setIsUnstakingAll(true);
                                                  await unStakeAllNFTs();
                                                  setIsUnstakingAll(false);
                                                }}
                                            >
                                            <span className="flex  leading-normal flex-col">
                                            <span>unStake All</span>
                                              {(stats.stakedNfts.length > unstakeAllChunk) && (
                                                  <span className="text-[0.55rem] md:text-[0.8rem] -mt-1 font-[Montserrat] normal-case opacity-50">
                                          {Math.ceil(stats.stakedNfts.length / unstakeAllChunk)}{" "}
                                                    transactions will be prompted
                                            </span>
                                              )}
                                            </span>
                                            </button>
                                          </div>
                                        </>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                      {stats.stakedNfts.map((nft) => {
                                        return (
                                            <NFTLoader
                                                key={nft.id}
                                                nft={nft}
                                                onStake={(_nftToStake) => handleOnStake([_nftToStake])}
                                                onRedeem={redeemRewards}
                                                unStake={(stakePubKey,nftPubKey) => unStakeNFTs([{stakePubKey, nftPubKey}])}
                                            />
                                        );
                                      })}
                                    </div>
                                  </div>
                              ) : (
                                  <div className="font-scratchy text-white text-5xl">
                                    You don&apos;t have any Citizens staked
                                  </div>
                              )}
                            </>
                        )}
                      </>
                  ) : (
                      <div className="font-scratchy text-white text-5xl">
                        Please connect your wallet above
                      </div>
                  )}
                </div>
              </div>
              {!!(walletConnected && stats?.unStakedNfts) && (
                  <div className="border mockup-window border-base-200 mb-8">
                    <div className="flex -mt-6 pb-4  px-4  place-content-end">
                      {(stats.unStakedNfts.length > 1) && (
                          <button
                              className={`btn h-full md:btn-lg btn-secondary font-jangkuy`}
                              onClick={() => {
                                handleOnStake(stats.unStakedNfts.map(_unStakeNft => _unStakeNft.mint));
                              }}
                          >
                            <span className="flex  leading-normal flex-col">
                              <span>Stake All</span>
                            </span>
                          </button>
                      )}
                    </div>
                    <div className="flex justify-center px-2 py-4 border-t border-base-200">
                      <div>
                        {!!(stats?.unStakedNfts && stats.unStakedNfts.length == 0 && wallet?.publicKey) && (
                            <div className="font-scratchy text-white text-5xl">
                              You don&apos;t have any Citizens in your wallet
                            </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {!!stats?.unStakedNfts && stats.unStakedNfts.map((nft) => {
                          return (
                              <NFTLoader
                                  key={nft.id}
                                  nft={nft}
                                  onStake={(_nftToStake) => handleOnStake([_nftToStake])}
                                  onRedeem={redeemRewards}
                                  unStake={(stakePubKey,nftPubKey) => unStakeNFTs([{stakePubKey, nftPubKey}])}
                              />
                          );
                        })}
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer position="top-center" theme="dark"/>
        <StakeModal
            isOpen={showStakeModal}
            nftsToStake={nftsToStake}
            isPending={isStaking}
            handleClose={() => setShowStakeModal(false)}
            handleConfirm={handleOnConfirmStake}
        />
      </main>

    </>
  );
}
