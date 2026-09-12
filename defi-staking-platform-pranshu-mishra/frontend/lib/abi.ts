export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner,address spender) view returns (uint256)"
];

export const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function Withdraw(uint256 amount)",
  "function claimRewards()",
  "function stakedBalance(address) view returns(uint256)",
  "function pendingRewards(address) view returns(uint256)",
  "function apr() view returns(uint256)"
];