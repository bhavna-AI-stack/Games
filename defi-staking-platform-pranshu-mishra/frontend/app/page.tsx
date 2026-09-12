"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";

import ConnectWallet from "../components/ConnectWallet";
import { ERC20_ABI, STAKING_ABI } from "../lib/abi";
import {
  STAKE_TOKEN,
  REWARD_TOKEN,
  STAKING,
} from "../lib/contracts";

export default function Home() {
  const [provider, setProvider] =
    useState<ethers.BrowserProvider | null>(null);

  const [signer, setSigner] =
    useState<ethers.JsonRpcSigner | null>(null);

  const [account, setAccount] = useState("");

  const [balance, setBalance] = useState("0");
  const [rewardBalance, setRewardBalance] = useState("0");
  const [staked, setStaked] = useState("0");
  const [rewards, setRewards] = useState("0");
  const [apr, setApr] = useState("0");

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [lastTx, setLastTx] = useState("");

  async function loadData(
    currentProvider: ethers.BrowserProvider,
    address: string
  ) {
    try {
      const token = new ethers.Contract(
        STAKE_TOKEN,
        ERC20_ABI,
        currentProvider
      );

      const rewardToken = new ethers.Contract(
        REWARD_TOKEN,
        ERC20_ABI,
        currentProvider
      );

      const staking = new ethers.Contract(
        STAKING,
        STAKING_ABI,
        currentProvider
      );

      const tokenBalance = await token.balanceOf(address);

      const rewardTokenBalance =
        await rewardToken.balanceOf(address);

      const stakedBalance =
        await staking.stakedBalance(address);

      const pendingRewards =
        await staking.pendingRewards(address);

      const currentAPR = await staking.apr();

      setBalance(ethers.formatEther(tokenBalance));

      setRewardBalance(
        ethers.formatEther(rewardTokenBalance)
      );

      setStaked(ethers.formatEther(stakedBalance));
      setRewards(ethers.formatEther(pendingRewards));
      setApr(currentAPR.toString());
    } catch (err) {
      console.error("Load data error:", err);
      setError("Unable to load blockchain data.");
    }
  }

  async function handleConnect(
    currentProvider: ethers.BrowserProvider,
    currentSigner: ethers.JsonRpcSigner,
    address: string
  ) {
    setProvider(currentProvider);
    setSigner(currentSigner);
    setAccount(address);
    setError("");

    await loadData(currentProvider, address);
  }

  async function approveTokens() {
    if (!signer || !amount) {
      setError("Enter an amount first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Waiting for approval...");
      setError("");
      setLastTx("");

      const token = new ethers.Contract(
        STAKE_TOKEN,
        ERC20_ABI,
        signer
      );

      const tx = await token.approve(
        STAKING,
        ethers.parseEther(amount)
      );

      setLastTx(tx.hash);

      await tx.wait();

      setMessage("STK approval successful!");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.reason ||
          err?.shortMessage ||
          err?.message ||
          "Approval failed."
      );

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  async function stakeTokens() {
    if (!signer || !provider || !amount) {
      setError("Enter an amount first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Waiting for stake transaction...");
      setError("");
      setLastTx("");

      const staking = new ethers.Contract(
        STAKING,
        STAKING_ABI,
        signer
      );

      const tx = await staking.stake(
        ethers.parseEther(amount)
      );

      setLastTx(tx.hash);

      await tx.wait();

      setMessage("Successfully staked STK!");
      setAmount("");

      await loadData(provider, account);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.reason ||
          err?.shortMessage ||
          err?.message ||
          "Stake failed."
      );

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  async function withdrawTokens() {
    if (!signer || !provider || !amount) {
      setError("Enter an amount first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Waiting for withdrawal...");
      setError("");
      setLastTx("");

      const staking = new ethers.Contract(
        STAKING,
        STAKING_ABI,
        signer
      );

      const tx = await staking.Withdraw(
        ethers.parseEther(amount)
      );

      setLastTx(tx.hash);

      await tx.wait();

      setMessage("Successfully withdrawn STK!");
      setAmount("");

      await loadData(provider, account);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.reason ||
          err?.shortMessage ||
          err?.message ||
          "Withdrawal failed."
      );

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  async function claimRewards() {
    if (!signer || !provider) {
      setError("Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Claiming rewards...");
      setError("");
      setLastTx("");

      const staking = new ethers.Contract(
        STAKING,
        STAKING_ABI,
        signer
      );

      const tx = await staking.claimRewards();

      setLastTx(tx.hash);

      await tx.wait();

      setMessage("Rewards claimed successfully!");

      await loadData(provider, account);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.reason ||
          err?.shortMessage ||
          err?.message ||
          "Claim failed."
      );

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!provider || !account) return;

    const interval = setInterval(() => {
      loadData(provider, account);
    }, 10000);

    return () => clearInterval(interval);
  }, [provider, account]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <Image
            src="/etherauthority-logo.png"
            alt="EtherAuthority"
            width={180}
            height={60}
            style={{
              objectFit: "contain",
              marginBottom: "20px",
            }}
          />

          <h1
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            DeFi Staking Platform
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "17px",
            }}
          >
            Stake STK tokens and earn RWD rewards
          </p>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            Training Project — Ethereum Sepolia Testnet
          </p>
        </div>

        {/* Wallet */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "25px",
            border: "1px solid #334155",
          }}
        >
          <ConnectWallet onConnect={handleConnect} />

          {account && (
            <p
              style={{
                marginTop: "15px",
                color: "#94a3b8",
                wordBreak: "break-all",
              }}
            >
              <b>Wallet:</b> {account}
            </p>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={cardStyle}>
            <span style={labelStyle}>STK Balance</span>

            <strong style={valueStyle}>
              {Number(balance).toFixed(2)}
            </strong>

            <small>STK</small>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Staked</span>

            <strong style={valueStyle}>
              {Number(staked).toFixed(2)}
            </strong>

            <small>STK</small>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>
              Pending Rewards
            </span>

            <strong style={valueStyle}>
              {Number(rewards).toFixed(8)}
            </strong>

            <small>RWD</small>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>RWD Balance</span>

            <strong style={valueStyle}>
              {Number(rewardBalance).toFixed(6)}
            </strong>

            <small>RWD</small>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>APR</span>

            <strong style={valueStyle}>
              {apr}%
            </strong>

            <small>Annual Rate</small>
          </div>
        </div>

        {/* Staking Actions */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: "16px",
            padding: "25px",
            border: "1px solid #334155",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Staking Actions
          </h2>

          <input
            type="number"
            min="0"
            step="any"
            placeholder="Enter STK amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "white",
              fontSize: "16px",
              boxSizing: "border-box",
              marginBottom: "15px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={approveTokens}
              disabled={
                loading || !account || !amount
              }
              style={buttonStyle}
            >
              Approve STK
            </button>

            <button
              onClick={stakeTokens}
              disabled={
                loading || !account || !amount
              }
              style={buttonStyle}
            >
              Stake
            </button>

            <button
              onClick={withdrawTokens}
              disabled={
                loading || !account || !amount
              }
              style={buttonStyle}
            >
              Withdraw
            </button>

            <button
              onClick={claimRewards}
              disabled={
                loading ||
                !account ||
                Number(rewards) <= 0
              }
              style={buttonStyle}
            >
              Claim Rewards
            </button>
          </div>

          {loading && (
            <p
              style={{
                marginTop: "20px",
                color: "#facc15",
              }}
            >
              ⏳ {message}
            </p>
          )}

          {!loading && message && (
            <p
              style={{
                marginTop: "20px",
                color: "#4ade80",
              }}
            >
              ✓ {message}
            </p>
          )}

          {error && (
            <p
              style={{
                marginTop: "20px",
                color: "#f87171",
                wordBreak: "break-word",
              }}
            >
              ✕ {error}
            </p>
          )}

          {lastTx && (
            <p
              style={{
                marginTop: "15px",
                wordBreak: "break-all",
                color: "#94a3b8",
              }}
            >
              Transaction:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${lastTx}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#60a5fa",
                }}
              >
                View on Sepolia Etherscan
              </a>
            </p>
          )}
        </div>

        {/* Contract Details */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: "16px",
            padding: "25px",
            marginTop: "25px",
            border: "1px solid #334155",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "15px",
            }}
          >
            Smart Contract Details
          </h2>

          <p
            style={{
              color: "#94a3b8",
              marginBottom: "8px",
            }}
          >
            <b>Network:</b> Ethereum Sepolia Testnet
          </p>

          <p
            style={{
              color: "#94a3b8",
              marginBottom: "8px",
              wordBreak: "break-all",
            }}
          >
            <b>Staking Contract:</b>{" "}
            {STAKING}
          </p>

          <p
            style={{
              color: "#94a3b8",
              marginBottom: "8px",
              wordBreak: "break-all",
            }}
          >
            <b>Stake Token:</b>{" "}
            {STAKE_TOKEN}
          </p>

          <p
            style={{
              color: "#94a3b8",
              wordBreak: "break-all",
            }}
          >
            <b>Reward Token:</b>{" "}
            {REWARD_TOKEN}
          </p>

          <a
            href={`https://sepolia.etherscan.io/address/${STAKING}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "15px",
              color: "#60a5fa",
              textDecoration: "none",
            }}
          >
            View Staking Contract on Sepolia Etherscan →
          </a>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            marginTop: "35px",
            paddingTop: "25px",
            borderTop: "1px solid #334155",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            DeFi Staking Platform
          </p>

          <p style={{ marginBottom: "8px" }}>
            Built by <strong>Pranshu Mishra</strong>
          </p>

          <p>
            Powered by <strong>EtherAuthority</strong>
          </p>
        </footer>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "14px",
};

const valueStyle = {
  fontSize: "25px",
};

const buttonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};