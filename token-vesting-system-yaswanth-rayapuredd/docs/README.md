# VestChain – Token Vesting DApp

> **B.Tech Final Year Project** | Blockchain Technology | 2026

A production-ready, fully on-chain ERC-20 token vesting DApp deployed on **SCAI Mainnet** (Chain ID: 34). Create vesting schedules with cliff periods and linear unlocking — no backend, no centralized intermediaries.

[![SCAI Network](https://img.shields.io/badge/Network-SCAI%20Mainnet-6366f1)](https://securechain.ai)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636)](https://docs.soliditylang.org)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Features

| Feature | Description |
|---|---|
| 🔗 **Connect Wallet** | MetaMask + WalletConnect via RainbowKit |
| 📊 **Dashboard** | Live on-chain stats and recent schedules |
| ➕ **Create Vesting** | 2-step flow: approve ERC-20 → create schedule |
| 📋 **My Vestings** | All schedules where you are the beneficiary |
| 🔍 **Vesting Details** | Timeline, live releasable amount, release button |
| 🔐 **Admin Panel** | Owner-only: view and revoke created schedules |

---

## Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Styling |
| Wagmi | 2.x | Ethereum hooks |
| Viem | 2.x | EVM interactions |
| RainbowKit | 2.2.x | Wallet connect UI |
| React Router | 6.x | Client-side routing |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |

### Smart Contracts
| Package | Version | Purpose |
|---|---|---|
| Solidity | ^0.8.20 | Contract language |
| Hardhat | ^2.22 | Development framework |
| OpenZeppelin | ^5.0 | Security libraries |

---

## Network: SCAI Mainnet

| Field | Value |
|---|---|
| Chain ID | `34` |
| RPC URL | `https://mainnet-rpc.scai.network` |
| Block Explorer | `https://explorer.securechain.ai` |
| Native Token | `SCAI` (18 decimals) |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MetaMask browser extension
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd token-vesting-dapp

# Install Hardhat dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key and WalletConnect Project ID
```

### 3. Compile & Test

```bash
npx hardhat compile
npx hardhat test
```

### 4. Deploy Contract

```bash
# Local (for development)
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost

# SCAI Mainnet
npx hardhat run scripts/deploy.ts --network scai
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Folder Structure

```
token-vesting-dapp/
├── contracts/
│   ├── TokenVesting.sol     # Main vesting contract
│   └── MockERC20.sol        # Test token
├── scripts/
│   └── deploy.ts            # Deployment script
├── test/
│   └── TokenVesting.test.ts # Unit tests
├── docs/                    # Documentation
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI
│       ├── pages/           # Route pages
│       ├── hooks/           # Wagmi hooks
│       ├── utils/           # Helpers
│       ├── constants/       # Addresses & chain config
│       ├── contracts/       # ABI
│       └── types/           # TypeScript interfaces
├── hardhat.config.ts
└── .env.example
```

---

## License

MIT © 2026 — VestChain DApp Team
