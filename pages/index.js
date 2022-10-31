import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'

import { AptosClient } from "aptos";
import { useWallet } from '@manahippo/aptos-wallet-adapter';
import cmHelper from "../helpers/candyMachineHelper"
import ConnectWalletButton from '../helpers/Aptos/ConnectWalletButton';
import {candyMachineAddress, collectionName, collectionCoverUrl, MaxMint, NODE_URL, CONTRACT_ADDRESS, COLLECTION_SIZE} from "../helpers/candyMachineInfo"

import Spinner from "react-bootstrap/Spinner"
import Modal from "react-bootstrap/Modal"

import { toast } from 'react-toastify';

const aptosClient = new AptosClient(NODE_URL);
const autoCmRefresh = 10000;

export default function Home() {
  const wallet = useWallet();
  const [isFetchignCmData, setIsFetchignCmData] = useState(false)
  const [candyMachineData, setCandyMachineData] = useState({data: {}, fetch: fetchCandyMachineData})
  const [timeLeftToMint, setTimeLeftToMint] = useState({presale: "", public: "", timeout: null})

  const [mintInfo, setMintInfo] = useState({numToMint: 1, minting: false, success: false, mintedNfts: []})

  const [canMint, setCanMint] = useState(false)

  useEffect(() => {
    if (!wallet.autoConnect && wallet.wallet?.adapter) {
        wallet.connect();
    }
  }, [wallet.autoConnect, wallet.wallet, wallet.connect]);
  

  const [decActive, setDecActive] = useState(true);
  const [incActive, setIncActive] = useState(false);
  const [notificationActive, setNotificationActive] = useState(false);

  const inc = async () => {
    const mintAmoutInput = document.getElementById('mint-amount-input'); 
    if (mintInfo.numToMint === 1) {
      setDecActive(current => !current);
      mintInfo.numToMint += 1; 
    } else if (mintInfo.numToMint === 2) {
      setIncActive(current => !current);
      mintInfo.numToMint += 1; 
    } else if (mintInfo.numToMint < 3) {
      mintInfo.numToMint += 1; 
      mintAmoutInput.value = mintInfo.numToMint;
    }
  }

  const dec = async () => {
    const mintAmoutInput = document.getElementById('mint-amount-input'); 
    if (mintInfo.numToMint === 2) {
      setDecActive(current => !current);
      mintInfo.numToMint -= 1; 
    } else if (mintInfo.numToMint === 3) {
      setIncActive(current => !current);
      mintInfo.numToMint -= 1; 
    } else if (mintInfo.numToMint > 1) {
      mintInfo.numToMint -= 1; 
      mintAmoutInput.value = mintInfo.numToMint;
    }
  }

  function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
  }

  const mint = async () => {
    if (wallet.account?.address?.toString() === undefined) {
      setNotificationActive(current => !current);
      await timeout(3000);
      setNotificationActive(current => !current);
    }
    if (wallet.account?.address?.toString() === undefined || mintInfo.minting) return;

    console.log(wallet.account?.address?.toString());
    setMintInfo({...mintInfo, minting: true})
    // Generate a transaction
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::candy_machine_v2::mint_tokens`,
      type_arguments: [],
      arguments: [
      	candyMachineAddress,
	      collectionName,
	      mintInfo.numToMint,
      ]
    };

    let txInfo;
    try {
      const txHash = await wallet.signAndSubmitTransaction(payload);
      console.log(txHash);
      txInfo = await aptosClient.waitForTransactionWithResult(txHash.hash)
    } catch (err) {
      txInfo = {
        success: false,
        vm_status: err.message,
      }
    }
    handleMintTxResult(txInfo)
    if (txInfo.success) setCandyMachineData({...candyMachineData, data: {...candyMachineData.data, numMintedTokens: (parseInt(candyMachineData.data.numMintedTokens) + parseInt(mintInfo.numToMint)).toString()}})
  }

  async function handleMintTxResult(txInfo) {
    console.log(txInfo);
    const mintSuccess = txInfo.success;
    console.log(mintSuccess ? "Mint success!" : `Mint failure, an error occured.`)

    let mintedNfts = []
    if (!mintSuccess) {
        /// Handled error messages
        const handledErrorMessages = new Map([
            ["Failed to sign transaction", "An error occured while signing."],
            ["Move abort in 0x1::coin: EINSUFFICIENT_BALANCE(0x10006): Not enough coins to complete transaction", "Insufficient funds to mint."],
        ]);

        const txStatusError = txInfo.vm_status;
        console.error(`Mint not successful: ${txStatusError}`);
        let errorMessage = handledErrorMessages.get(txStatusError);
        errorMessage = errorMessage === undefined ? "Unkown error occured. Try again." : errorMessage;

        toast.error(errorMessage);
    } else {
        mintedNfts = await cmHelper.getMintedNfts(aptosClient, candyMachineData.data.tokenDataHandle, candyMachineData.data.cmResourceAccount, collectionName, txInfo)
        toast.success("Minting success!")
    }

    
    setMintInfo({...mintInfo, minting: false, success: mintSuccess, mintedNfts})
}



  async function fetchCandyMachineData(indicateIsFetching = false) {
    console.log("Fetching candy machine data...")
    if (indicateIsFetching) setIsFetchignCmData(true)
    const cmResourceAccount = await cmHelper.getCandyMachineResourceAccount();
    if (cmResourceAccount === null) {
      setCandyMachineData({...candyMachineData, data: {}})
      setIsFetchignCmData(false)
      return
    }

    const collectionInfo = await cmHelper.getCandyMachineCollectionInfo(cmResourceAccount);
    const configData = await cmHelper.getCandyMachineConfigData(collectionInfo.candyMachineConfigHandle);
    setCandyMachineData({...candyMachineData, data: {cmResourceAccount, ...collectionInfo, ...configData}})
    setIsFetchignCmData(false)
  }

  function verifyTimeLeftToMint() {
    const mintTimersTimeout = setTimeout(verifyTimeLeftToMint, 1000)
    if (candyMachineData.data.presaleMintTime === undefined || candyMachineData.data.publicMintTime === undefined) return

    const currentTime = Math.round(new Date().getTime() / 1000);
    setTimeLeftToMint({timeout : mintTimersTimeout, presale: cmHelper.getTimeDifference(currentTime, candyMachineData.data.presaleMintTime), public: cmHelper.getTimeDifference(currentTime, candyMachineData.data.publicMintTime)})
  }

  useEffect(() => {
    fetchCandyMachineData(true)
    setInterval(fetchCandyMachineData, autoCmRefresh)
  }, [])

  useEffect(() => {
    clearTimeout(timeLeftToMint.timeout)
    verifyTimeLeftToMint()
    console.log(candyMachineData.data)
  }, [candyMachineData])

  // useEffect(() => {
  //   setCanMint(wallet.connected && candyMachineData.data.isPublic && parseInt(candyMachineData.data.numUploadedTokens) > parseInt(candyMachineData.data.numMintedTokens) && timeLeftToMint.presale === "LIVE")
  // }, [wallet, candyMachineData, timeLeftToMint])
  useEffect(() => {
    setCanMint(true)
  }, [wallet, candyMachineData, timeLeftToMint])

  return (
    <div className="bg-gray-500">
      <div className={styles.container}>
        <Head>
          <title>Aptos NFT Mint</title>
          <meta name="description" content="Aptos NFT Mint" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>
            {collectionName} Mint
          </h1>
          <div className={styles.topcorner}>
            <ConnectWalletButton connectButton={!wallet.connected} className="d-flex" />
          </div>
          <img src={collectionCoverUrl} className={styles.mintimage} />
          <div id="collection-info" className="d-flex flex-column align-items-center text-white" style={{width: "80%"}}>
            {isFetchignCmData ? <Spinner animation="border" role="status" className="mt-5"><span className="visually-hidden">Loading...</span></Spinner> : 
            <>
              <div className="d-flex align-items-center my-3">
                <div className={styles.inputbtnsbox}>
                <button onClick={inc} className={styles.inputbtns} style={{border: incActive ? '1px solid grey' : ''}}>▲</button>
                <button onClick={dec} className={styles.inputbtns} style={{border: decActive ? '1px solid grey' : ''}}>▼</button>
                </div>
                <input id="mint-amount-input" className={`${styles.defaultInput} me-3`} type="number" min="1" max={candyMachineData.data.maxMintsPerWallet === undefined ? 10 : Math.min(candyMachineData.data.maxMintsPerWallet, candyMachineData.data.numUploadedTokens - candyMachineData.data.numMintedTokens)} value={mintInfo.numToMint} onChange={(e) => setMintInfo({...mintInfo, numToMint: e.target.value})} />
                <button className={styles.button} onClick={mint} disabled={!canMint}>{mintInfo.minting ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner> : "Mint"}</button>
              </div>
            </>}
            <div className={styles.mintstats}>
              <div className={styles.spacebetween}>
                <h6>Minted NFTs:</h6>
                <h6>{candyMachineData.data.numMintedTokens} / {COLLECTION_SIZE}</h6>
              </div>
              <div className={styles.spacebetween}>
                <h6>Is Mint Public: </h6>
                <span style={{width: "15px", height: "15px", borderRadius: "50%", background: candyMachineData.data.isPublic ? "green" : "red"}}></span>
              </div>
              <div className={styles.spacebetween}>
                <h6>Mint fee: </h6>
                <h6>{candyMachineData.data.mintFee * mintInfo.numToMint} $APT</h6>
              </div>
              <div className={styles.spacebetween}>
                <h6>Max mints per wallet: </h6>
                <h6>{MaxMint}</h6>
              </div>
              <div className={styles.spacebetween}>
                <h6>Presale Mint:</h6>
                <h6>{timeLeftToMint.public === "LIVE" ? "LIVE" : timeLeftToMint.public.days + " days : " + timeLeftToMint.public.hours + " hours : " + timeLeftToMint.public.minutes + " minutes : " + timeLeftToMint.public.seconds + " seconds"}</h6>
              </div>
              <div className={styles.spacebetween}>
                <h6>Public Mint: </h6>
                <h6>{timeLeftToMint.presale === "LIVE" ? "LIVE" : timeLeftToMint.presale.days + " days : " + timeLeftToMint.presale.hours + " hours : " + timeLeftToMint.presale.minutes + " minutes : " + timeLeftToMint.presale.seconds + " seconds"}</h6>
              </div>
            </div>
          <div className={styles.notification} style={{opacity: notificationActive ? '1' : ''}}>
            <h6 className={styles.notificationtext}>Please connect your wallet at the top right of the page</h6>
          </div>  
          </div>

          <Modal id="mint-results-modal" show={mintInfo.success} onHide={() => setMintInfo({...mintInfo, success: false, mintedNfts: []})} centered size="lg">
            <Modal.Body className="d-flex flex-column align-items-center pt-5 pb-3">
                <div className="d-flex justify-content-center w-100 my-5" style={{flexWrap: "wrap"}}>
                    {mintInfo.mintedNfts.map(mintedNft => <div key={mintedNft.name} className={`${styles.mintedNftCard} d-flex flex-column mx-3`}>
                        <img src={mintedNft.imageUri === null ? "" : mintedNft.imageUri} />
                        <h5 className="text-white text-center mt-2">{mintedNft.name}</h5>
                    </div>)}
                </div>
            </Modal.Body>
        </Modal>
        </main>

      </div>
    </div>
  )
}
