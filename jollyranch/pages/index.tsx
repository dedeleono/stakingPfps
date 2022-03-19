import Head from "next/head";
import React ,{useState, useEffect, useRef } from "react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { getNftsForOwner } from "../lib/mint-one-token";
import NFTLoader from "../components/NFTLoader";
import Navigation from "../components/Navigation";
import Bg from "../public/images/out.jpg";
import usePfpStore from "../hooks/usePfpStore";


const redeemAllChunk = 10;

export default function Home() {
  const setupPfp = usePfpStore(state => state.setupPfp);
  const getTotalStakedRats = usePfpStore(state => state.getTotalStakedRats);
  const getStakedNfts = usePfpStore(state => state.getStakedNfts);
  const stakedNFTs = usePfpStore(state => state.stakedNFTs);
  const stakedMints = usePfpStore(state => state.stakedMints);
  const getStakedMints = usePfpStore(state => state.getStakedMints);
  const totalRatsStaked = usePfpStore(state => state.totalRatsStaked);
  const resetStakedMints = usePfpStore(state => state.resetStakedMints);
  const resetStakedNFTs = usePfpStore(state => state.resetStakedNFTs);
  const stakeNFT = usePfpStore(state => state.stakeNFT);
  const redeemRewards = usePfpStore(state => state.redeemRewards);
  const redeemAllRewards = usePfpStore(state => state.redeemAllRewards);
  const redeemNFT = usePfpStore(state => state.redeemNFT);
  const stakingRewards = usePfpStore(state => state.stakingRewards);
  const pfpState = usePfpStore(state => state.pfpState);

  const wallet = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [loadingStakes, setLoadingStakes] = useState(true);
  const [refreshStateCounter, setRefreshStateCounter] = useState(0);

  const loaderRef = useRef(null);
  const modalRef = useRef(null);
  const [loader, setLoader] = useState(0);

  const txTimeout = 10000;

  const refresh = async () => {
    setLoader(0);
    loaderRef.current.click();
    const downloadTimer = setInterval(() => {
      if (loader >= 5000) {
        clearInterval(downloadTimer);
      }
      setLoader((prevLoader) => prevLoader + 10);
    }, 10);
    setTimeout(() => {
      modalRef.current.click();
      // forceUpdate();
      setRefreshStateCounter(refreshStateCounter + 1);
      // refreshData();
    }, txTimeout + 10);
  };

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      await setupPfp(wallet);
    })();
  }, [wallet]);

  useEffect(() => {
    // console.log("pfpState refreshed");
    if (pfpState["program"] && wallet.publicKey) {
      (async () => {
        setLoadingNfts(true);
        const nftsForOwner = await getNftsForOwner(
          pfpState.connection,
          wallet.publicKey
        );
        // console.log("nftsforowner", nftsForOwner);
        setNfts(nftsForOwner as any);
      })();
      (async () => {
        await getTotalStakedRats();
        await getStakedNfts();
        setLoadingNfts(false);
      })();
    } else {
      console.log("reset pfpState");
      resetStakedMints();
      resetStakedNFTs();
      setNfts([]);
    }
  }, [pfpState, refreshStateCounter]);

  useEffect(() => {
    if (stakedNFTs.length > 0) {
      setLoadingStakes(true);
      (async () => {
        await getStakedMints();
        setLoadingStakes(false);
      })();
    } else {
      setLoadingStakes(false);
    }
  }, [stakedNFTs]);

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
          {/* Loading Modal */}
          <a href="#loader" className="btn btn-primary hidden" ref={loaderRef}>
            open loader
          </a>
          <div id="loader" className="modal">
            <div className="modal-box stat">
              <div className="stat-figure text-primary">
                <button className="btn loading btn-circle btn-lg bg-base-200 btn-ghost" />
              </div>
              <p style={{ fontFamily: "Montserrat" }}>Loading...</p>
              <div className="stat-desc max-w-[90%]">
                <progress
                  value={loader}
                  max="5000"
                  className="progress progress-black"
                />
              </div>
              <a
                href="#"
                style={{ fontFamily: "Montserrat" }}
                className="btn hidden"
                ref={modalRef}
              >
                Close
              </a>
            </div>
          </div>
          <div className="text-center pt-8 md:pt-20 col-span-1 container mx-auto max-w-screen-xl">
            <div className="grid-cols-3">
              {/* Navbar Section */}
              <div className="navbar mb-8 shadow-lg bg-neutral text-neutral-content rounded-box">
                <div className="px-2 mx-2 navbar-start">
                  <img className="w-60 -my-10" src="/logo-citizen.png" />
                </div>
                <div className="hidden px-2 mx-2 navbar-center sm:flex">
                  <div className="flex items-stretch">
                    {wallet.publicKey && (
                      <div className="w-full mt-2">
                        <div className="stat bg-accent">
                          <div className="stat-value text-white">
                            {totalRatsStaked.toLocaleString("en-US")}/6,666
                          </div>
                          <div
                            className="stat-title text-white"
                            style={{ fontFamily: "Montserrat" }}
                          >
                            {((totalRatsStaked/6666)*100).toFixed(2)}% Citizen Staked
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="navbar-end">
                  <div
                    className="btn btn-primary z-50 mr-4"
                    style={{ color: "#fff" }}
                  >
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
                </div>
              </div>
              <div>
                {(pfpState["program"] && wallet.connected && wallet.publicKey && !loadingStakes && !loadingNfts && nfts.length === 0 && stakedMints.length === 0) && (
                    <div>
                      <div className="w-full flex justify-center justify-items-center text-center">
                        <div className="max-w-md">
                          <h1 className="text-4xl font-bold" style={{ fontFamily: "Jangkuy" }}>You don&apos;t have any Citizens 😥</h1>
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
              <div className="card bg-info bg-opacity-10 mb-8 backdrop-blur-sm">
                {/* begin app windows */}
                <div className="flex justify-center px-2 py-4">
                  {loadingStakes && wallet.connected && (
                    <h1
                      className="text-lg font-400 animate-pulse"
                      style={{
                        fontFamily: "Scratchy",
                        fontSize: "2.5rem",
                        color: "#D5D3D2",
                      }}
                    >
                      Loading your Staked NFT&apos;s, please wait...
                    </h1>
                  )}
                  {!wallet.connected && (
                    <p
                      style={{
                        fontFamily: "Scratchy",
                        fontSize: "2.5rem",
                        color: "#D5D3D2",
                      }}
                    >
                      Please connect your wallet above
                    </p>
                  )}
                  {stakedMints.length > 0 && !loadingStakes && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {stakedMints.length > 1 && (
                          <div
                              className="card w-72 m-4 card-bordered card-compact shadow-2xl bg-primary-content text"
                          >
                            <button
                                className="btn h-full btn-secondary font-jangkuy"
                                onClick={async () => {
                                  await redeemAllRewards(redeemAllChunk);
                                  await refresh();
                                }}
                            >
                          <span className="flex p-4 flex-col items-center">
                            <span className="block text-lg pb-2">Redeem all</span>
                            <span className="block w-1/2">
                              <img src="/images/trtn.png"/>
                            </span>
                            {(stakedMints.length > redeemAllChunk) && (
                                <span className="font-normal font-sans leading-normal mt-2 opacity-50">
                                    {Math.ceil(stakedMints.length / redeemAllChunk)} transactions will be prompted
                                </span>
                            )}
                          </span>
                            </button>
                          </div>
                      )}
                      {stakedMints.map((nft:any, i) => {
                        // console.log("mint nft", nft);
                        return (
                          <NFTLoader
                            key={i}
                            isStaked={true}
                            nft={nft}
                            stakingRewards={stakingRewards}
                            onRedeem={async () => {
                              await redeemRewards(nft.nft_account.publicKey);
                              await refresh();
                            }}
                            unStake={async () => {
                              await redeemNFT(
                                nft.nft_account.publicKey,
                                nft.nft_account.account.mint
                              );
                              await refresh();
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                  {stakedMints.length == 0 &&
                    !loadingStakes &&
                    wallet.publicKey && (
                      <p
                        className="text-lg font-400"
                        style={{
                          fontFamily: "Scratchy",
                          fontSize: "2.5rem",
                          color: "#D5D3D2",
                        }}
                      >
                        You don&apos;t have any Citizens staked
                      </p>
                    )}
                </div>
              </div>
              {wallet.connected && (
                  <div className="border mockup-window border-base-200 mb-8">
                    <div className="flex justify-center px-2 py-4 border-t border-base-200">
                      <div>
                        {loadingNfts && wallet.connected && (
                            <h1
                                className="text-lg font-bold animate-pulse"
                                style={{
                                  fontFamily: "Scratchy",
                                  fontSize: "2.5rem",
                                  color: "#D5D3D2",
                                }}
                            >
                              Loading your NFT&apos;s, please wait...
                            </h1>
                        )}
                        {!wallet.connected && (
                            <p
                                style={{
                                  fontFamily: "Scratchy",
                                  fontSize: "2.5rem",
                                  color: "#D5D3D2",
                                }}
                            >
                              Please connect your wallet above
                            </p>
                        )}
                        {!loadingNfts && wallet.connected && nfts.length === 0 && (
                            <h1
                                className="text-lg font-400"
                                style={{
                                  fontFamily: "Scratchy",
                                  fontSize: "2.5rem",
                                  color: "#D5D3D2",
                                }}
                            >
                              You don&apos;t have any Citizens in your wallet
                            </h1>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {nfts.map((nft) => {
                          return (
                              <NFTLoader
                                  key={nft.id}
                                  isStaked={false}
                                  nft={nft}
                                  onStake={async () => {
                                    // console.log(
                                    //   "mint, cheese, lockup: ",
                                    //   nft.mint,
                                    //   cheese,
                                    //   lockup
                                    // );
                                    await stakeNFT(nft.mint);
                                    await refresh();
                                  }}
                              />
                          );
                        })}
                      </div>
                    </div>
                  </div>
              )}
              {/* end app windows */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
