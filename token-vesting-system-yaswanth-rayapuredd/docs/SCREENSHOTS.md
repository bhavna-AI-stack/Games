# Screenshots Guide – VestChain Token Vesting DApp

This document describes the expected UI for each page. Take screenshots and place them in `docs/screenshots/` to include in the final project report.

---

## Screenshot 1 – Dashboard (Home Page)

**Route:** `/`  
**Filename:** `docs/screenshots/01-dashboard.png`

**What it should show:**
- Dark background with dot grid and purple ambient glow orbs
- "VestChain" logo in navbar (top left)
- RainbowKit ConnectButton (top right)
- Hero section: "Token **Vesting** DApp" with gradient text
- "Live on SCAI Mainnet" pill badge
- 4 stat cards: Total Schedules, My Vestings, Created By Me, Network
- Quick action cards: Create Vesting and My Vestings
- Recent vesting schedule cards (or empty state)

---

## Screenshot 2 – Connect Wallet Modal

**Trigger:** Click "Connect Wallet" button  
**Filename:** `docs/screenshots/02-connect-wallet.png`

**What it should show:**
- RainbowKit dark modal overlay
- Wallet options: MetaMask, WalletConnect
- App name "Token Vesting DApp"
- Dark glassmorphism backdrop blur

---

## Screenshot 3 – Create Vesting (Step 1: Form Fill)

**Route:** `/create`  
**Filename:** `docs/screenshots/03-create-form.png`

**What it should show:**
- Page title "Create Vesting Schedule"
- Step indicator: Step 1 "Approve Token" (active) → Step 2 "Create Schedule" (inactive)
- Form fields:
  - ERC-20 Token Address input
  - Beneficiary Address input
  - Total Amount input
  - Start Date picker
  - Cliff Period (days) input
  - Vesting Duration (days) input
  - Revocable checkbox
- "Step 1 – Approve Token Transfer" primary button
- "How it works" info box at the bottom

---

## Screenshot 4 – Create Vesting (Step 2: After Approval)

**Route:** `/create` (after token approval)  
**Filename:** `docs/screenshots/04-create-step2.png`

**What it should show:**
- Step 1 marked with ✓ (green)
- Step 2 "Create Schedule" now active (highlighted)
- "Step 2 – Create Vesting Schedule" button enabled

---

## Screenshot 5 – My Vestings Page

**Route:** `/my-vestings`  
**Filename:** `docs/screenshots/05-my-vestings.png`

**What it should show:**
- Page title "My Vestings" with schedule count badge
- Grid of VestingCard components, each showing:
  - Schedule ID (e.g. #1)
  - Status badge (Cliff Period / Vesting / Completed)
  - Token amount and symbol
  - Gradient progress bar
  - Beneficiary address (truncated)
  - Start date, cliff, duration
  - Released / Remaining amounts
  - "Details →" link

---

## Screenshot 6 – Vesting Details Page

**Route:** `/vesting/1`  
**Filename:** `docs/screenshots/06-vesting-details.png`

**What it should show:**
- Back breadcrumb: "My Vestings / Schedule #1"
- Large token amount with status badge
- VestingProgress component:
  - Timeline bar with cliff marker
  - Date labels (Start, Cliff, End)
  - 4 data cells: Total Locked, Released, Releasable Now, Cliff Period
- "Release X.XX TOKENS" primary button (if releasable)
- Schedule Details card with full info table:
  - Token address (clickable link to explorer)
  - Beneficiary, Creator addresses
  - Start Time, Cliff Duration, Total Duration
  - Revocable flag, Status badge

---

## Screenshot 7 – Admin Panel (Owner View)

**Route:** `/admin`  
**Filename:** `docs/screenshots/07-admin-panel.png`

**What it should show:**
- "Admin Panel" title with "Owner" accent badge
- Contract info card: contract address (clickable) + owner address
- Warning banner about irreversibility of revocation
- Grid of created schedule cards
- Each card has a red "Revoke Schedule" button
- Revocable and non-revocable schedules shown differently

---

## Screenshot 8 – Admin Panel (Access Denied)

**Route:** `/admin` (non-owner wallet)  
**Filename:** `docs/screenshots/08-access-denied.png`

**What it should show:**
- Lock icon in danger color
- "Access Denied" heading
- "Admin Panel is restricted to the contract owner"
- Truncated owner address shown
- "Back to Dashboard" secondary button

---

## Screenshot 9 – 404 Not Found

**Route:** `/anything-invalid`  
**Filename:** `docs/screenshots/09-not-found.png`

**What it should show:**
- Large "404" in gradient text
- "Page Not Found" heading
- Brief description
- "Back to Dashboard" button

---

## How to Take Screenshots

### Browser DevTools (Recommended)

1. Open Chrome DevTools (F12)
2. Click the **Device Toolbar** icon (Ctrl+Shift+M)
3. Set to **1440×900** (desktop) or **375×812** (mobile)
4. Right-click → **"Capture screenshot"** for viewport
5. Or use **"Capture full size screenshot"** for full page

### Recommended Sizes
| View | Width | Height |
|---|---|---|
| Desktop | 1440px | 900px |
| Tablet | 768px | 1024px |
| Mobile | 375px | 812px |

---

## Adding Screenshots to Report

After taking screenshots, reference them in `PROJECT_REPORT.md`:

```markdown
![Dashboard Page](screenshots/01-dashboard.png)
*Figure 1: Dashboard showing live on-chain stats on SCAI Mainnet*
```
