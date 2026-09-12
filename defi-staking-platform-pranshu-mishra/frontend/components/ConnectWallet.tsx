"use client";

import { useState } from "react";
import { ethers } from "ethers";

type Props = {
  onConnect: (
    provider: ethers.BrowserProvider,
    signer: ethers.JsonRpcSigner,
    address: string
  ) => void;
};

export default function ConnectWallet({ onConnect }: Props) {
  const [account, setAccount] = useState("");

  async function connect() {
    try {
      if (!(window as any).ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );

      // Show current network
      const network = await provider.getNetwork();
      alert(`Chain ID: ${network.chainId.toString()}`);

      // Connect wallet
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const address = await signer.getAddress();

      setAccount(address);

      onConnect(provider, signer, address);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <>
      <button
        onClick={connect}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {account ? "Connected" : "Connect Wallet"}
      </button>

      <p>
        <b>Wallet:</b> {account || "Not Connected"}
      </p>
    </>
  );
}