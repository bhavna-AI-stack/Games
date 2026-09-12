# User Manual – VestChain Token Vesting DApp

## Introduction

VestChain is a Web3 application that lets you create and manage ERC-20 token vesting schedules directly on the SCAI blockchain. There is no account, no sign-up, and no backend — your MetaMask wallet is your identity.

---

## Getting Started

### Step 1 – Install MetaMask

Download MetaMask from [metamask.io](https://metamask.io) and create or import a wallet.

### Step 2 – Add SCAI Mainnet to MetaMask

1. Open MetaMask → click the network dropdown (top center)
2. Click **"Add Network"** → **"Add a network manually"**
3. Fill in:

| Field | Value |
|---|---|
| Network Name | SCAI Mainnet |
| New RPC URL | `https://mainnet-rpc.scai.network` |
| Chain ID | `34` |
| Currency Symbol | `SCAI` |
| Block Explorer URL | `https://explorer.securechain.ai` |

4. Click **Save**

### Step 3 – Open the DApp

Navigate to the deployed DApp URL in your browser.

---

## Connecting Your Wallet

1. Click the **"Connect Wallet"** button in the top-right navigation bar
2. Select **MetaMask** (or WalletConnect for mobile wallets)
3. In the MetaMask popup, select your account and click **Connect**
4. Ensure MetaMask is on **SCAI Mainnet** (Chain ID: 34)
5. The button will show your address and network when connected

---

## Dashboard

The Dashboard is the home page (`/`). It shows:

- **Total Schedules** — Total vesting schedules created on-chain
- **My Vestings** — Schedules where you are the beneficiary
- **Created By Me** — Schedules you funded and created
- **Network** — SCAI Mainnet indicator

**Quick Actions:**
- **Create Vesting Schedule** → Takes you to the Create form
- **My Vestings** → Takes you to your beneficiary schedules

**Recent Schedules** — The 3 most recently created schedules are shown as cards.

---

## Creating a Vesting Schedule

Navigate to **"Create Vesting"** in the navbar (`/create`).

### Step 1 – Fill the Form

| Field | Description | Example |
|---|---|---|
| ERC-20 Token Address | The token contract to vest | `0xAbc...` |
| Beneficiary Address | Who receives vested tokens | `0xDef...` |
| Total Amount | How many tokens to lock | `1000` |
| Start Date | When vesting begins | `2026-07-01` |
| Cliff Period (days) | Days with no token release | `30` |
| Vesting Duration (days) | Total days for full unlock | `365` |
| Revocable | Allow owner to cancel? | ✓ (checkbox) |

**Cliff Period** = Number of days after the start date where **no tokens** can be released.  
After the cliff, tokens unlock **linearly** until the end of the vesting duration.

**Example:** 1000 tokens, 30-day cliff, 365-day vesting:
- Day 0–30: 0 tokens releasable
- Day 30: cliff ends, linear vesting begins
- Day 182: ~498 tokens releasable
- Day 365: 1000 tokens fully released

### Step 2 – Approve Token (MetaMask Popup)

Click **"Step 1 – Approve Token Transfer"**

MetaMask will ask you to sign an **approve** transaction allowing the vesting contract to spend your tokens. Click **Confirm**.

### Step 3 – Create Schedule (MetaMask Popup)

Once approval is confirmed, click **"Step 2 – Create Vesting Schedule"**

MetaMask will ask you to sign the **createVesting** transaction. Click **Confirm**.

After confirmation, you'll be redirected to **My Vestings**.

---

## Viewing My Vestings

Navigate to **"My Vestings"** (`/my-vestings`).

This page shows all schedules where **your connected wallet is the beneficiary**.

Each card shows:
- Schedule ID and status badge (Cliff Period / Vesting / Completed / Revoked)
- Token amount and symbol
- Progress bar (% released)
- Beneficiary, start date, cliff, duration
- Released amount and remaining amount

Click **"Details"** on any card to open the full details page.

---

## Releasing Tokens (Claiming)

1. Open a vesting schedule from My Vestings
2. On the **Vesting Details** page, check the **"Releasable Now"** amount
3. If amount > 0, click **"Release X.XX TOKENS"**
4. Confirm the transaction in MetaMask
5. Tokens are sent directly to your wallet

**Notes:**
- You can only release if you are the beneficiary
- Nothing can be released during the cliff period
- You can release multiple times — tokens accumulate linearly

---

## Admin Panel (Owner Only)

Navigate to **"Admin Panel"** (`/admin`).

> This page is only visible to the wallet that deployed the contract.

**What you can do:**
- View all vesting schedules you created
- See contract address and your owner address
- **Revoke** a schedule (if it was created as revocable)

**Revoking a schedule:**
1. Click **"Revoke Schedule"** on a card
2. Confirm the dialog warning
3. Confirm the MetaMask transaction
4. Effect: Any vested tokens are sent to the beneficiary; unvested tokens return to you (creator)

> ⚠️ Revocation is **permanent and irreversible**.

---

## Viewing on Block Explorer

Any transaction or contract can be viewed on the SCAI Explorer:

```
https://explorer.securechain.ai/tx/0xYOUR_TX_HASH
https://explorer.securechain.ai/address/0xCONTRACT_ADDRESS
```

---

## Status Meanings

| Status | Meaning |
|---|---|
| 🟡 **Cliff Period** | In the cliff window — no tokens releasable yet |
| 🟣 **Vesting** | Past cliff, tokens unlocking linearly |
| 🟢 **Completed** | All tokens have been released |
| 🔴 **Revoked** | Schedule was cancelled by the owner |

---

## FAQ

**Q: Can I create multiple vesting schedules for the same beneficiary?**  
A: Yes. Each call to `createVesting` creates a new independent schedule with its own ID.

**Q: What happens if I don't release tokens for a long time?**  
A: They accumulate. You can release all releasable tokens in a single transaction anytime.

**Q: Can the beneficiary lose their tokens?**  
A: Only if the schedule was created as **Revocable** and the owner revokes it. Non-revocable schedules cannot be cancelled.

**Q: Do I pay gas for releasing tokens?**  
A: Yes, the beneficiary pays a small SCAI gas fee to call `release()`.
