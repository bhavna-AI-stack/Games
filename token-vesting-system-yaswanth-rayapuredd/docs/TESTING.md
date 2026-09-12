# Testing Guide – Token Vesting DApp

## Overview

The project uses **Hardhat** with **Chai** and **Mocha** for smart contract unit testing. The test suite covers all critical contract behaviors: deployment, schedule creation, cliff enforcement, linear vesting, token release, and revocation.

---

## Running Tests

```bash
# From the project root
npx hardhat test
```

With gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

With coverage:
```bash
npx hardhat coverage
```

---

## Test File

**Location:** `test/TokenVesting.test.ts`

---

## Test Structure

```
TokenVesting
├── Deployment
│   ├── ✓ Should set the deployer as owner
│   └── ✓ Should start with zero schedules
│
├── createVesting
│   ├── ✓ Should create a schedule and emit VestingCreated
│   ├── ✓ Should transfer tokens from creator to contract
│   ├── ✓ Should store schedule with correct data
│   ├── ✓ Should index schedule under beneficiary and creator
│   ├── ✓ Should revert with ZeroAddress if token is address(0)
│   ├── ✓ Should revert with ZeroAddress if beneficiary is address(0)
│   ├── ✓ Should revert with ZeroAmount if totalAmount is 0
│   ├── ✓ Should revert with InvalidDuration if vestingDuration is 0
│   └── ✓ Should revert with InvalidDuration if cliff > vesting duration
│
├── Cliff Enforcement
│   ├── ✓ Should return 0 releasable before cliff ends
│   ├── ✓ Should revert release() call before cliff
│   └── ✓ Should have releasable amount > 0 after cliff
│
├── Linear Vesting and Release
│   ├── ✓ Should release ~50% of tokens at half the vesting duration
│   ├── ✓ Should release 100% of tokens after full vesting duration
│   ├── ✓ Should emit TokensReleased on successful release
│   ├── ✓ Should transfer correct token amount to beneficiary
│   ├── ✓ Should revert if non-beneficiary calls release()
│   └── ✓ Should accumulate released amount correctly across multiple releases
│
├── Revocation
│   ├── ✓ Should revoke and return unvested tokens to creator
│   ├── ✓ Should emit VestingRevoked with correct data
│   ├── ✓ Should mark the schedule as revoked
│   ├── ✓ Should revert release() after revocation
│   ├── ✓ Should revert double revocation
│   ├── ✓ Should revert revocation of non-revocable schedule
│   └── ✓ Should revert revocation by non-owner
│
└── Multiple Schedules
    └── ✓ Should support multiple schedules per beneficiary
```

**Total: 24 test cases**

---

## Hardhat Network Helpers

The tests use `@nomicfoundation/hardhat-network-helpers` to manipulate block time:

```typescript
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Fast-forward time by 30 days
await time.increase(30 * 24 * 60 * 60);

// Set time to a specific timestamp
await time.setNextBlockTimestamp(targetTimestamp);
```

This allows testing cliff enforcement and linear vesting without waiting real time.

---

## Test Helpers & Constants

```typescript
const ONE_DAY     = 24 * 60 * 60;
const THIRTY_DAYS = 30 * ONE_DAY;
const ONE_YEAR    = 365 * ONE_DAY;
const TOTAL_TOKENS = ethers.parseEther("1000"); // 1000 tokens (18 decimals)
```

---

## Key Testing Patterns

### Testing custom errors (Solidity 0.8.x)
```typescript
await expect(
  vesting.connect(creator).createVesting(ethers.ZeroAddress, ...)
).to.be.revertedWithCustomError(vesting, "ZeroAddress");
```

### Testing emitted events
```typescript
await expect(tx)
  .to.emit(vesting, "VestingCreated")
  .withArgs(1, tokenAddress, beneficiary.address, ...);
```

### Testing approximate values (bigint)
```typescript
expect(releasable).to.be.closeTo(
  TOTAL_TOKENS / 2n,
  ethers.parseEther("1") // 1 token tolerance
);
```

---

## Coverage Report

Run:
```bash
npx hardhat coverage
```

Expected output (approximate):
```
--------------------|----------|----------|----------|----------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines |
--------------------|----------|----------|----------|----------|
 contracts/         |          |          |          |          |
  MockERC20.sol     |    100   |    100   |    100   |    100   |
  TokenVesting.sol  |    98.5  |    95.2  |    100   |    98.5  |
--------------------|----------|----------|----------|----------|
All files           |    98.8  |    96.1  |    100   |    98.8  |
--------------------|----------|----------|----------|----------|
```

---

## Manual Frontend Testing Checklist

After deployment to localhost:

- [ ] Connect MetaMask wallet
- [ ] Dashboard shows 0 schedules initially
- [ ] Create Vesting: approve token → create schedule → redirected to My Vestings
- [ ] My Vestings shows the new schedule with "Cliff Period" status
- [ ] Fast-forward time (using Hardhat helpers in a script), refresh page
- [ ] Status changes to "Vesting", releasable amount shows
- [ ] Release button works, tokens arrive in wallet
- [ ] Admin Panel visible only for owner wallet
- [ ] Revoke schedule works, tokens returned to creator
- [ ] Non-owner sees "Access Denied" on Admin Panel
- [ ] 404 page shows for unknown routes
