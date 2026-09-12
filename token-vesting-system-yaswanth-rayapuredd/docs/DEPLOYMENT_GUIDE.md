# Deployment Guide – Token Vesting DApp

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Bundled with Node |
| Git | Any | [git-scm.com](https://git-scm.com) |
| MetaMask | Latest | Chrome Extension |

---

## Step 1 – Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd token-vesting-dapp

# Install Hardhat / contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Step 2 – Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Your deployer wallet private key (keep secret!)
PRIVATE_KEY=0x1c5789045cf4803b4ac807673c156b9fbe8f2c49b2d250f9fbdf70d620499d35

# SCAI RPC (default is fine)
SCAI_RPC_URL=https://mainnet-rpc.scai.network

# From https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=45828494bf9d888dfb4e95caab7eb5fb

# Filled automatically after deployment
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=34
```

> ⚠️ **Never commit `.env` to version control.** It contains your private key.

---

## Step 3 – Compile the Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

Artifacts are generated in `artifacts/` and `typechain-types/`.

---

## Step 4 – Run Tests

```bash
npx hardhat test
```

All tests should pass:
```
  TokenVesting
    Deployment
      ✓ Should set the deployer as owner
      ✓ Should start with zero schedules
    createVesting
      ✓ Should create a vesting schedule and emit VestingCreated
      ...
  24 passing (2s)
```

---

## Step 5 – Local Development Deployment

### 5a. Start local Hardhat node
```bash
npx hardhat node
```
This starts a local EVM at `http://127.0.0.1:8545` with pre-funded test accounts.

### 5b. Deploy to localhost (new terminal)
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Output:
```
TokenVesting deployed successfully!
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

The script **automatically updates** `frontend/src/constants/addresses.ts` with the address.

### 5c. Add localhost to MetaMask
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

Import one of the Hardhat test accounts using its private key (shown in `npx hardhat node` output).

### 5d. Run the frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173`

---

## Step 6 – SCAI Mainnet Deployment

### 6a. Ensure wallet has SCAI balance
Your deployer wallet needs SCAI tokens for gas fees.
- Wallet: derived from `PRIVATE_KEY` in `.env`
- Explorer: [https://explorer.securechain.ai](https://explorer.securechain.ai)

### 6b. Deploy to SCAI Mainnet
```bash
npx hardhat run scripts/deploy.ts --network scai
```

Output:
```
Network:   scai
Chain ID:  34
Deployer:  0xYourAddress
Balance:   X.XX SCAI

Deploying TokenVesting...
✅ TokenVesting deployed successfully!
   Contract Address: 0xYOUR_CONTRACT_ADDRESS
   Transaction Hash: 0x...
```

The deploy script will automatically:
1. Update `frontend/src/constants/addresses.ts`
2. Update `.env` with `VITE_CONTRACT_ADDRESS`

### 6c. Verify deployment
Visit:
```
https://explorer.securechain.ai/address/0xYOUR_CONTRACT_ADDRESS
```

### 6d. Run frontend against SCAI Mainnet
```bash
cd frontend
npm run dev
```
Switch MetaMask to SCAI Mainnet (Chain ID 34) and connect.

---

## MetaMask – Add SCAI Mainnet

| Field | Value |
|---|---|
| Network Name | SCAI Mainnet |
| New RPC URL | `https://mainnet-rpc.scai.network` |
| Chain ID | `34` |
| Currency Symbol | `SCAI` |
| Block Explorer | `https://explorer.securechain.ai` |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `insufficient funds` | Add SCAI tokens to deployer wallet |
| `nonce too low` | Reset MetaMask account (Settings → Advanced → Reset Account) |
| `contract not deployed` | Ensure `TOKEN_VESTING_ADDRESS` in `addresses.ts` is set |
| Tailwind styles missing | Run `npm install` in `frontend/` |
| TypeScript errors | Run `npx hardhat compile` to generate typechain types |
| WalletConnect not working | Check `VITE_WALLETCONNECT_PROJECT_ID` in `.env` |

---

## Production Build

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

Deploy `dist/` to Vercel, Netlify, or IPFS.
