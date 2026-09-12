/**
 * TokenVesting contract ABI.
 * Generated from contracts/TokenVesting.sol
 */
export const TOKEN_VESTING_ABI = [
  // ─── Constructor ────────────────────────────────────
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  // ─── Write Functions ─────────────────────────────────
  {
    "type": "function",
    "name": "createVesting",
    "inputs": [
      { "name": "token",           "type": "address", "internalType": "address" },
      { "name": "beneficiary",     "type": "address", "internalType": "address" },
      { "name": "totalAmount",     "type": "uint256", "internalType": "uint256" },
      { "name": "startTime",       "type": "uint64",  "internalType": "uint64"  },
      { "name": "cliffDuration",   "type": "uint64",  "internalType": "uint64"  },
      { "name": "vestingDuration", "type": "uint64",  "internalType": "uint64"  },
      { "name": "revocable",       "type": "bool",    "internalType": "bool"    }
    ],
    "outputs": [
      { "name": "scheduleId", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "release",
    "inputs": [
      { "name": "scheduleId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revoke",
    "inputs": [
      { "name": "scheduleId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      { "name": "newOwner", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // ─── Read Functions ───────────────────────────────────
  {
    "type": "function",
    "name": "computeReleasable",
    "inputs": [
      { "name": "scheduleId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVestingSchedule",
    "inputs": [
      { "name": "scheduleId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct TokenVesting.VestingSchedule",
        "components": [
          { "name": "token",           "type": "address", "internalType": "address" },
          { "name": "beneficiary",     "type": "address", "internalType": "address" },
          { "name": "creator",         "type": "address", "internalType": "address" },
          { "name": "totalAmount",     "type": "uint256", "internalType": "uint256" },
          { "name": "releasedAmount",  "type": "uint256", "internalType": "uint256" },
          { "name": "startTime",       "type": "uint64",  "internalType": "uint64"  },
          { "name": "cliffDuration",   "type": "uint64",  "internalType": "uint64"  },
          { "name": "vestingDuration", "type": "uint64",  "internalType": "uint64"  },
          { "name": "revocable",       "type": "bool",    "internalType": "bool"    },
          { "name": "revoked",         "type": "bool",    "internalType": "bool"    }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSchedulesByBeneficiary",
    "inputs": [
      { "name": "beneficiary", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSchedulesByCreator",
    "inputs": [
      { "name": "creator", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalSchedules",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  // ─── Events ───────────────────────────────────────────
  {
    "type": "event",
    "name": "VestingCreated",
    "inputs": [
      { "name": "scheduleId",      "type": "uint256", "indexed": true  },
      { "name": "token",           "type": "address", "indexed": true  },
      { "name": "beneficiary",     "type": "address", "indexed": true  },
      { "name": "creator",         "type": "address", "indexed": false },
      { "name": "totalAmount",     "type": "uint256", "indexed": false },
      { "name": "startTime",       "type": "uint64",  "indexed": false },
      { "name": "cliffDuration",   "type": "uint64",  "indexed": false },
      { "name": "vestingDuration", "type": "uint64",  "indexed": false },
      { "name": "revocable",       "type": "bool",    "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokensReleased",
    "inputs": [
      { "name": "scheduleId",  "type": "uint256", "indexed": true  },
      { "name": "beneficiary", "type": "address", "indexed": true  },
      { "name": "amount",      "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VestingRevoked",
    "inputs": [
      { "name": "scheduleId",     "type": "uint256", "indexed": true  },
      { "name": "token",          "type": "address", "indexed": true  },
      { "name": "creator",        "type": "address", "indexed": false },
      { "name": "returnedAmount", "type": "uint256", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      { "name": "previousOwner", "type": "address", "indexed": true },
      { "name": "newOwner",      "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  // ─── Custom Errors ────────────────────────────────────
  { "type": "error", "name": "ZeroAddress",         "inputs": [] },
  { "type": "error", "name": "ZeroAmount",           "inputs": [] },
  { "type": "error", "name": "InvalidDuration",      "inputs": [] },
  { "type": "error", "name": "NotBeneficiary",       "inputs": [] },
  { "type": "error", "name": "NothingToRelease",     "inputs": [] },
  { "type": "error", "name": "AlreadyRevoked",       "inputs": [] },
  { "type": "error", "name": "NotRevocable",         "inputs": [] },
  {
    "type": "error",
    "name": "ScheduleNotFound",
    "inputs": [{ "name": "scheduleId", "type": "uint256", "internalType": "uint256" }]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [{ "name": "account", "type": "address", "internalType": "address" }]
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }]
  }
] as const;

/** Minimal ERC-20 ABI for token approvals and balance checks */
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount",  "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner",   "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  }
] as const;
