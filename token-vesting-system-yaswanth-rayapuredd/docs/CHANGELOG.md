# CHANGELOG

All notable changes to VestChain – Token Vesting DApp are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2026-06-28

### Added – Smart Contracts
- `TokenVesting.sol` — Core vesting contract with cliff + linear vesting
  - `createVesting()` — Create a new ERC-20 vesting schedule
  - `release()` — Beneficiary releases vested tokens
  - `revoke()` — Owner revokes revocable schedules
  - `computeReleasable()` — View releasable token amount
  - `getVestingSchedule()` — Read full schedule data
  - `getSchedulesByBeneficiary()` — Index by beneficiary
  - `getSchedulesByCreator()` — Index by creator
  - `getTotalSchedules()` — Global count
  - Full NatSpec documentation
  - OpenZeppelin `Ownable` + `SafeERC20`
- `MockERC20.sol` — Test ERC-20 token with configurable decimals
- Hardhat test suite — 24 unit tests with full coverage

### Added – Frontend
- React 18 + Vite 5 + TypeScript project scaffold
- Tailwind CSS v3 dark Web3 design system with:
  - Glassmorphism card components
  - Purple-blue gradient color palette
  - Ambient glow orb background
  - Smooth animations (fade-in, slide-up, shimmer)
- Wagmi v2 + RainbowKit v2 wallet integration
  - SCAI Mainnet (Chain ID 34) chain definition
  - MetaMask + WalletConnect support
  - Dark-themed RainbowKit modal

### Added – Pages
- **Dashboard** — Stats, quick actions, recent schedules grid
- **Create Vesting** — 2-step approve → create flow with Zod validation
- **My Vestings** — Beneficiary schedule list with status cards
- **Vesting Details** — Timeline visualization, live releasable, release button
- **Admin Panel** — Owner-gated management with revoke capability
- **404 Not Found** — Gradient error page

### Added – Components
- `Navbar` — Sticky glassmorphism nav with ConnectButton
- `Layout` — Shared page wrapper with ambient orbs
- `Card` / `CardHeader` — Base glassmorphism containers
- `Button` — Primary / Secondary / Danger / Ghost variants
- `StatusBadge` — Animated status badges (cliff/vesting/completed/revoked)
- `ProgressBar` — Animated gradient progress bar
- `Spinner` / `PageSpinner` — Loading states
- `Input` — Form input with label, error, and hint
- `VestingCard` — Schedule summary card
- `VestingProgress` — Detailed timeline with cliff marker
- `StatsCard` — Dashboard stat widget

### Added – Hooks & Utils
- `useVesting.ts` — All contract read/write hooks (Wagmi v2 API)
- `useTokenApproval.ts` — ERC-20 allowance and approve hooks
- `useAdminCheck.ts` — Owner verification hook
- `format.ts` — Token amount formatting, address truncation
- `time.ts` — Duration formatting, timestamp conversion, status computation

### Added – Documentation
- `README.md` — Project overview and quick start
- `ARCHITECTURE.md` — System diagrams (Mermaid) and component tree
- `SMART_CONTRACT.md` — Contract reference with function signatures
- `DEPLOYMENT_GUIDE.md` — Step-by-step local and mainnet deployment
- `TESTING.md` — Test structure and coverage guide
- `USER_MANUAL.md` — End-user guide with screenshots guide
- `PROJECT_REPORT.md` — Academic B.Tech final year project report
- `CHANGELOG.md` — This file
- `SCREENSHOTS.md` — Screenshot guide for documentation

### Configuration
- SCAI Mainnet: Chain ID 34, RPC `https://mainnet-rpc.scai.network`
- WalletConnect Project ID configured
- `.env` and `.gitignore` set up for secure key management
- Hardhat configured for localhost + SCAI Mainnet networks

---

## Future Planned Releases

### [1.1.0] – Planned
- Token allowlist for supported vesting tokens
- Batch vesting creation (multiple beneficiaries in one tx)
- Email notifications via EPNS/Push Protocol

### [1.2.0] – Planned
- Vesting schedule NFT receipt (ERC-721)
- Governance token integration
- Multi-sig support for admin operations

### [2.0.0] – Planned
- Factory pattern for gas-efficient multi-beneficiary deployments
- The Graph indexer for real-time event querying
- Verifiable on-chain randomness for vesting unlock games
