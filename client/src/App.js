import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import "./App.css";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x96c75e323c54a115c658cC14011a0D26448fFa37";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getAllWaves = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          /*
           * Call getAllWaves method from Smart Contract
           */
          const waves = await wavePortalContract.getAllWaves();

          /*
           * only address, timestamp, and message is needed in UI
           */
          let wavesCleaned = [];
          waves.forEach((wave) => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
            });
          });
          console.log(waves, wavesCleaned);
          setAllWaves(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    };

    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        // * Check if we're authorized to access the user's wallet

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          getAllWaves();
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkIfWalletIsConnected();
  }, []);

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // * Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Sup mate!</div>

        <div className="bio">
          I am Xavier and I'm just a really cool guy. Connect your Ethereum
          wallet and wave at me!
        </div>
        {currentAccount && (
          <input
            type="text"
            className="textbox"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        )}
        <button className="waveButton" onClick={wave}>
          Shoot me a wave!
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <hr className="line" />
        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="wave-item">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
