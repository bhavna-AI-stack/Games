import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWalletContext } from "../../context/WalletContext";
import contractService from "../../services/contractService";

const HeroStats = () => {
  const { contractReady } = useWalletContext();

  const [stats, setStats] = useState({
    players: "--",
    prizePool: "--",
    lotteryStatus: "--",
    referralStatus: "Live",
    countdown: "--:--:--",
  });

  useEffect(() => {
    let interval;
    let cancelled = false;

    const loadStats = async () => {
      try {
        if (!contractReady || cancelled) return;

        const contract =
          await contractService.getContract();

        if (!contract || cancelled) return;

        const details =
          await contract.getLotteryDetails();

        const players =
          Number(details.playersCount);

        const lotteryOpen =
          details.isOpen;

        const endTime =
          Number(details.endTime);

        const prizePoolRaw =
          await contract.getContractEthBalance();

        const prizePool =
          Number(
            ethers.formatEther(prizePoolRaw)
          ).toFixed(3);

        if (cancelled) return;

        const now =
          Math.floor(Date.now() / 1000);

        let lotteryStatus;
        let countdown;

        if (lotteryOpen) {
          lotteryStatus = "Open";

          const remaining =
            endTime - now;

          if (remaining > 0) {
            const h = String(
              Math.floor(remaining / 3600)
            ).padStart(2, "0");

            const m = String(
              Math.floor(
                (remaining % 3600) / 60
              )
            ).padStart(2, "0");

            const s = String(
              remaining % 60
            ).padStart(2, "0");

            countdown =
              `${h}:${m}:${s}`;
          } else {
            countdown = "Closing...";
          }
        } else {
          /*
           * Lottery is closed.
           * Winner selection is handled by the
           * backend keeper, NOT the frontend.
           */
          lotteryStatus =
            players > 0
              ? "Result Pending"
              : "Closed";

          countdown =
            players > 0
              ? "Waiting for result"
              : "--:--:--";
        }

        setStats({
          players: players.toString(),

          prizePool:
            `${prizePool} ETH`,

          lotteryStatus,

          referralStatus:
            "Live",

          countdown,
        });
      } catch (error) {
        console.error(
          "Failed to load lottery stats:",
          error
        );
      }
    };

    loadStats();

    /*
     * Refresh blockchain data every 5 seconds.
     * No winner-selection transaction is sent
     * from the frontend.
     */
    interval = setInterval(
      loadStats,
      5000
    );

    return () => {
      cancelled = true;

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [contractReady]);

  return (
    <div className="hero-card">
      <h3>
        Live Lottery Overview
      </h3>

      <div className="stat-item">
        <span>
          Total Players
        </span>

        <strong>
          {stats.players}
        </strong>
      </div>

      <div className="stat-item">
        <span>
          Total Prize Pool
        </span>

        <strong>
          {stats.prizePool}
        </strong>
      </div>

      <div className="stat-item">
        <span>
          Today's Lottery
        </span>

        <strong>
          {stats.lotteryStatus}
        </strong>
      </div>

      <div className="stat-item">
        <span>
          Referral Rewards
        </span>

        <strong>
          {stats.referralStatus}
        </strong>
      </div>

      <div className="stat-item">
        <span>
          Next Draw In
        </span>

        <strong>
          {stats.countdown}
        </strong>
      </div>
    </div>
  );
};

export default HeroStats;