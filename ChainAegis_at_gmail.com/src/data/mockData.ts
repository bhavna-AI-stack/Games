import type { AuditReport, ComplianceItem } from '../types';

export const mockReports: AuditReport[] = [
  {
    id: 'rep-001',
    projectName: 'MiniDEX AMM Exchange',
    platform: 'Base / Hardhat',
    auditDate: '2026-06-27',
    score: 88,
    commitHash: 'a8b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9',
    summary: 'The MiniDEX AMM constant product pool was audited. We identified a potential reentrancy vulnerability in liquidity removal, fee-on-transfer mismatch, and slippage protection concerns. Most issues have been mitigated.',
    findings: [
      {
        id: 'FIND-001',
        title: 'Reentrancy Vulnerability in Liquidity Removal',
        severity: 'high',
        location: 'DexPool.sol#L91-L115',
        description: 'In the removeLiquidity function, the contract transfers ERC20 Token A and Token B to the receiver BEFORE emitting the event and completing internal balance syncs. If the token is a custom ERC20 with transfer callbacks (e.g., ERC777), msg.sender could reenter and withdraw multiple times.',
        impact: 'An attacker could drain the pool reserves of Token A and B using custom tokens with transfer hooks, leading to complete insolvency of the liquidity provider pool.',
        recommendation: 'Implement the checks-effects-interactions pattern or add OpenZeppelin\'s ReentrancyGuard. Update the contract state and reserves prior to performing external transfers.',
        vulnerableCode: `function removeLiquidity(uint256 lpAmount) external returns (uint256 amountA, uint256 amountB) {
    ...
    // Transfer tokens to sender first
    require(tokenA.transfer(msg.sender, amountA), "Token A transfer failed");
    require(tokenB.transfer(msg.sender, amountB), "Token B transfer failed");
    
    // Update reserves after transfers
    reserveA -= amountA;
    reserveB -= amountB;
    emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
}`,
        securedCode: `function removeLiquidity(uint256 lpAmount) external nonReentrant returns (uint256 amountA, uint256 amountB) {
    ...
    // 1. Effects: Update reserves first
    reserveA -= amountA;
    reserveB -= amountB;
    
    // 2. Burn LP tokens
    _burn(msg.sender, lpAmount);
    
    emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
    
    // 3. Interactions: Transfer last
    require(tokenA.transfer(msg.sender, amountA), "Token A transfer failed");
    require(tokenB.transfer(msg.sender, amountB), "Token B transfer failed");
}`,
        status: 'fixed'
      },
      {
        id: 'FIND-002',
        title: 'Missing Slippage Tolerances in Swapping',
        severity: 'medium',
        location: 'DexPool.sol#L137-L172',
        description: 'The swap function executes swaps based on the current pool reserves without any user-defined slippage parameters. If a transaction remains in the mempool, the reserves can shift, forcing the user to accept a significantly worse exchange rate than calculated.',
        impact: 'Users can be front-run via sandwich attacks, causing severe slippage and loss of funds during large swaps.',
        recommendation: 'Accept a minimumAmountOut parameter in the swap function and verify that the actual amountOut is greater than or equal to minimumAmountOut.',
        vulnerableCode: `function swap(address tokenInAddress, uint256 amountIn) external returns (uint256 amountOut) {
    ...
    amountOut = getAmountOut(amountIn, rIn, rOut);
    require(amountOut > 0, "Output amount too small");
    ...
    require(tokenOut.transfer(msg.sender, amountOut), "Output transfer failed");
}`,
        securedCode: `function swap(
    address tokenInAddress, 
    uint256 amountIn, 
    uint256 minAmountOut
) external returns (uint256 amountOut) {
    ...
    amountOut = getAmountOut(amountIn, rIn, rOut);
    require(amountOut >= minAmountOut, "Slippage limit exceeded");
    ...
    require(tokenOut.transfer(msg.sender, amountOut), "Output transfer failed");
}`,
        status: 'fixed'
      },
      {
        id: 'FIND-003',
        title: 'Fee-on-Transfer Token Insolvency Risk',
        severity: 'medium',
        location: 'DexPool.sol#L53-L85',
        description: 'The addLiquidity and swap functions assume that the amount of tokens received is exactly equal to the amountIn parameter. If a fee-on-transfer token is used, the contract receives less than amountIn, but increases the reserve by amountIn, leading to discrepancies.',
        impact: 'Reserves will drift from actual contract balances, causing subsequent swaps or liquidity removals to fail due to insufficient contract balances.',
        recommendation: 'Check the contract balance before and after the transfer to determine the actual amount of tokens received.',
        vulnerableCode: `function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 lpTokensToMint) {
    require(tokenA.transferFrom(msg.sender, address(this), amountA), "Token A failed");
    ...
    reserveA += amountA;
}`,
        securedCode: `function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 lpTokensToMint) {
    uint256 balanceBeforeA = tokenA.balanceOf(address(this));
    require(tokenA.transferFrom(msg.sender, address(this), amountA), "Token A failed");
    uint256 actualAmountA = tokenA.balanceOf(address(this)) - balanceBeforeA;
    ...
    reserveA += actualAmountA;
}`,
        status: 'acknowledged'
      }
    ]
  },
  {
    id: 'rep-002',
    projectName: 'Nexora NFT Marketplace',
    platform: 'Ethereum / Hardhat',
    auditDate: '2026-06-18',
    score: 94,
    commitHash: 'd5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4',
    summary: 'Nexora NFT Marketplace was audited for list, buy, and auction mechanics. The contracts showcase excellent access controls, but had minor issues with reentrancy in listing cancelations and ERC721 safety checks.',
    findings: [
      {
        id: 'FIND-004',
        title: 'Reentrancy via safeTransferFrom Callback',
        severity: 'high',
        location: 'NexoraMarketplace.sol#L140-L165',
        description: 'When buying an NFT, the contract performs safeTransferFrom to send the NFT to the buyer. Since the receiver contract receives a callback (onERC721Received), they can reenter the marketplace buy/auction methods before states are fully updated.',
        impact: 'Attackers can exploit the callback to buy the same NFT multiple times or disrupt active auction timers.',
        recommendation: 'Add a nonReentrant modifier to the buy and auction claim functions, and update listings to inactive prior to transferring the asset.',
        vulnerableCode: `function buyItem(uint256 listingId) external payable {
    Listing storage listing = listings[listingId];
    ...
    IERC721(listing.nftAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
    listing.active = false; // state updated after transfer
    payable(listing.seller).transfer(listing.price);
}`,
        securedCode: `function buyItem(uint256 listingId) external payable nonReentrant {
    Listing storage listing = listings[listingId];
    ...
    listing.active = false; // update state first
    IERC721(listing.nftAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
    payable(listing.seller).transfer(listing.price);
}`,
        status: 'fixed'
      },
      {
        id: 'FIND-005',
        title: 'Unchecked ETH Transfer Failure',
        severity: 'low',
        location: 'NexoraMarketplace.sol#L210',
        description: 'Direct transfer of ETH using transfer() is used to send seller earnings. If the seller is a smart contract that rejects ETH or consumes high gas, the transfer fails and transactions revert, trapping the NFT and listing.',
        impact: 'Legitimate purchases could be DOSed if the seller address refuses ETH.',
        recommendation: 'Use the low-level call method with limit gas checks instead of transfer(), or adopt a pull-payment pattern.',
        vulnerableCode: `payable(listing.seller).transfer(listing.price);`,
        securedCode: `(bool success, ) = payable(listing.seller).call{value: listing.price}("");
require(success, "ETH transfer failed");`,
        status: 'fixed'
      }
    ]
  },
  {
    id: 'rep-003',
    projectName: 'LendingVault DeFi Protocol',
    platform: 'Arbitrum / Foundry',
    auditDate: '2026-05-12',
    score: 72,
    commitHash: '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t',
    summary: 'LendingVault protocol is a yield-generating vault. The audit identified a critical division-by-zero vulnerability, pool price oracle manipulation, and missing initialization checks. The score reflects high risk before mitigations.',
    findings: [
      {
        id: 'FIND-006',
        title: 'Oracle Manipulation via Spot Price Checks',
        severity: 'critical',
        location: 'LendingVault.sol#L305',
        description: 'The vault calculates collateral valuations directly from the spot exchange rate in the AMM pool. An attacker can flashloan a large amount of assets, manipulate the spot price, inflate their collateral value, borrow excessive vault funds, and dump the assets.',
        impact: 'Total drainage of the LendingVault assets, causing complete vault insolvency.',
        recommendation: 'Use Decentralized Oracles like Chainlink Price Feeds or TWAP (Time-Weighted Average Price) with long window feeds instead of the immediate spot price.',
        vulnerableCode: `function getCollateralValue(address user) public view returns (uint256) {
    uint256 spotPrice = dexPool.getReserves() / token.balanceOf(address(dexPool));
    return userCollateral[user] * spotPrice;
}`,
        securedCode: `function getCollateralValue(address user) public view returns (uint256) {
    // Fetch price from verified Chainlink Oracle
    uint256 oraclePrice = AggregatorV3Interface(priceFeed).latestAnswer();
    return (userCollateral[user] * oraclePrice) / 1e8;
}`,
        status: 'open'
      },
      {
        id: 'FIND-007',
        title: 'Division by Zero on Empty Vault Withdrawals',
        severity: 'high',
        location: 'LendingVault.sol#L188',
        description: 'When the total supply of vault shares drops to zero, a user withdraw shares calculation results in a division by zero, locking user transactions and freezing the contract.',
        impact: 'Denial of service and potential lock of final user deposits in the pool.',
        recommendation: 'Add checks for total supply and handle the zero supply edge case safely.',
        vulnerableCode: `uint256 amountToReturn = (shares * totalAssets()) / totalSupply();`,
        securedCode: `uint256 supply = totalSupply();
uint256 amountToReturn = supply == 0 ? shares : (shares * totalAssets()) / supply;`,
        status: 'fixed'
      }
    ]
  }
];

export const complianceChecklist: ComplianceItem[] = [
  {
    id: 'comp-1',
    category: 'Access Control',
    name: 'Privileged Actions Guarded',
    description: 'Ensure functions modifying critical parameters (fees, owners, withdraws) have owner-only modifiers like onlyOwner.',
    checked: true,
    severity: 'high'
  },
  {
    id: 'comp-2',
    category: 'Reentrancy',
    name: 'Reentrancy Protections Active',
    description: 'Check for nonReentrant modifiers or verify checks-effects-interactions is followed strictly on external calls.',
    checked: true,
    severity: 'high'
  },
  {
    id: 'comp-3',
    category: 'Arithmetic',
    name: 'Safe Math / Compiler Assertions',
    description: 'Solidity ^0.8.0 handles overflow checks by default, but verify that unchecked blocks are not vulnerable to overflows.',
    checked: true,
    severity: 'medium'
  },
  {
    id: 'comp-4',
    category: 'Oracle Security',
    name: 'TWAP or Chainlink Oracle Usage',
    description: 'Verify spot price oracle checks are replaced by secure Decentralized Oracles to prevent oracle manipulation.',
    checked: false,
    severity: 'high'
  },
  {
    id: 'comp-5',
    category: 'Token Safety',
    name: 'Fee-on-Transfer Compatibility',
    description: 'Check balance differences instead of assuming parameters match transfer quantities during deposit/swap calculations.',
    checked: false,
    severity: 'medium'
  },
  {
    id: 'comp-6',
    category: 'Gas Optimization',
    name: 'Optimal Loops and Array Lengths',
    description: 'Ensure arrays are bounded to prevent loops from consuming more gas than the block limit allows.',
    checked: true,
    severity: 'low'
  },
  {
    id: 'comp-7',
    category: 'Compiler Guard',
    name: 'Latest Stable Compiler Version',
    description: 'Ensure contracts compile on latest secure Solidity releases (e.g. ^0.8.20) and avoid deprecated opcodes.',
    checked: true,
    severity: 'low'
  }
];
