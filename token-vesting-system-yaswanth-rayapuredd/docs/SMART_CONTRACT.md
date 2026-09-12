# Smart Contract Documentation – TokenVesting.sol

## Overview

`TokenVesting.sol` is the core smart contract of the VestChain DApp. It manages ERC-20 token vesting schedules with cliff periods and linear unlocking.

- **Location**: `contracts/TokenVesting.sol`
- **Solidity**: `^0.8.20`
- **Inherits**: `Ownable` (OpenZeppelin v5)
- **Uses**: `SafeERC20` (OpenZeppelin v5)
- **License**: MIT

---

## VestingSchedule Struct

```solidity
struct VestingSchedule {
    address token;           // ERC-20 token being vested
    address beneficiary;     // Who receives the tokens
    address creator;         // Who funded this schedule
    uint256 totalAmount;     // Total tokens locked (base units)
    uint256 releasedAmount;  // Tokens already released
    uint64  startTime;       // Unix timestamp when vesting starts
    uint64  cliffDuration;   // Seconds after start before any tokens vest
    uint64  vestingDuration; // Total vesting period in seconds
    bool    revocable;       // Can owner cancel this schedule?
    bool    revoked;         // Has this schedule been revoked?
}
```

---

## Functions

### `createVesting()`

```solidity
function createVesting(
    address token,
    address beneficiary,
    uint256 totalAmount,
    uint64  startTime,
    uint64  cliffDuration,
    uint64  vestingDuration,
    bool    revocable
) external returns (uint256 scheduleId)
```

Creates a new vesting schedule. Transfers `totalAmount` of `token` from the caller (creator) to the contract.

**Requirements:**
- `token` ≠ address(0)
- `beneficiary` ≠ address(0)
- `totalAmount` > 0
- `vestingDuration` > 0
- `cliffDuration` ≤ `vestingDuration`
- Caller must have approved ≥ `totalAmount` of `token` to this contract

**Emits:** `VestingCreated`

---

### `release(scheduleId)`

```solidity
function release(uint256 scheduleId) external
```

Releases all currently vested and unclaimed tokens to the beneficiary.

**Requirements:**
- Schedule must exist
- Must not be revoked
- Caller must be the beneficiary
- Releasable amount must be > 0

**Emits:** `TokensReleased`

---

### `revoke(scheduleId)`

```solidity
function revoke(uint256 scheduleId) external onlyOwner
```

Revokes a vesting schedule. Sends any vested tokens to the beneficiary, returns unvested tokens to the creator.

**Requirements:**
- Schedule must exist and not already be revoked
- Schedule must be marked `revocable`
- Caller must be the contract owner

**Emits:** `VestingRevoked`

---

### `computeReleasable(scheduleId)` *(view)*

```solidity
function computeReleasable(uint256 scheduleId) external view returns (uint256)
```

Returns the number of tokens currently releasable for a given schedule.

---

### `getVestingSchedule(scheduleId)` *(view)*

```solidity
function getVestingSchedule(uint256 scheduleId) 
    external view returns (VestingSchedule memory)
```

Returns the full `VestingSchedule` struct for a given ID.

---

### `getSchedulesByBeneficiary(address)` *(view)*

```solidity
function getSchedulesByBeneficiary(address beneficiary) 
    external view returns (uint256[] memory)
```

Returns all schedule IDs where the given address is the beneficiary.

---

### `getSchedulesByCreator(address)` *(view)*

```solidity
function getSchedulesByCreator(address creator) 
    external view returns (uint256[] memory)
```

Returns all schedule IDs created by a given address.

---

### `getTotalSchedules()` *(view)*

```solidity
function getTotalSchedules() external view returns (uint256)
```

Returns the total number of vesting schedules ever created. Also equals the highest schedule ID.

---

## Events

| Event | Parameters | Emitted When |
|---|---|---|
| `VestingCreated` | scheduleId, token, beneficiary, creator, totalAmount, startTime, cliffDuration, vestingDuration, revocable | New schedule created |
| `TokensReleased` | scheduleId, beneficiary, amount | Beneficiary claims tokens |
| `VestingRevoked` | scheduleId, token, creator, returnedAmount | Owner revokes schedule |

---

## Custom Errors

| Error | Condition |
|---|---|
| `ZeroAddress()` | token or beneficiary is address(0) |
| `ZeroAmount()` | totalAmount is 0 |
| `InvalidDuration()` | vestingDuration == 0 or cliffDuration > vestingDuration |
| `ScheduleNotFound(id)` | scheduleId does not exist |
| `NotBeneficiary()` | Caller is not the beneficiary |
| `NothingToRelease()` | Releasable amount is 0 |
| `AlreadyRevoked()` | Schedule already revoked |
| `NotRevocable()` | Schedule is not marked revocable |

---

## Vesting Math

The linear vesting formula after the cliff period:

```
vestedAmount = totalAmount × (currentTime - startTime) / vestingDuration

releasable = vestedAmount - releasedAmount
```

**Timeline visualization:**

```
startTime        cliffEnd          vestingEnd
    │                │                  │
    ├────────────────┼──────────────────┤
    │  Cliff Period  │  Linear Vesting  │
    │  (0 released)  │  (linear unlock) │
```

---

## Gas Estimates (approximate)

| Function | Gas |
|---|---|
| `createVesting` | ~120,000 |
| `release` | ~65,000 |
| `revoke` | ~70,000 |
| `computeReleasable` | ~8,000 (view) |
| `getVestingSchedule` | ~10,000 (view) |
