/**
 * Formatting utilities for the Token Vesting DApp.
 */

/**
 * Formats a bigint token amount to a human-readable string.
 * @param amount - Raw token amount in base units (wei-like)
 * @param decimals - Token decimals (usually 18)
 * @param displayDecimals - Number of decimal places to show (default 4)
 * @returns Formatted string e.g. "1,234.5678"
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  if (amount === 0n) return '0';
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return whole.toLocaleString();
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.slice(0, displayDecimals).replace(/0+$/, '');
  if (!trimmed) return whole.toLocaleString();
  return `${whole.toLocaleString()}.${trimmed}`;
}

/**
 * Formats a token amount with its symbol.
 * @param amount - Raw amount in base units
 * @param decimals - Token decimals
 * @param symbol - Token symbol
 * @returns e.g. "1,234.56 USDC"
 */
export function formatTokenWithSymbol(
  amount: bigint,
  decimals: number,
  symbol: string
): string {
  return `${formatTokenAmount(amount, decimals, 2)} ${symbol}`;
}

/**
 * Truncates an Ethereum address for display.
 * @param address - Full 0x address
 * @param startChars - Characters to show at start (default 6)
 * @param endChars - Characters to show at end (default 4)
 * @returns e.g. "0x1234...abcd"
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Computes the vesting progress percentage (0-100).
 * @param totalAmount - Total tokens to vest
 * @param releasedAmount - Tokens already released
 * @returns Percentage 0-100
 */
export function calcVestedPercent(totalAmount: bigint, releasedAmount: bigint): number {
  if (totalAmount === 0n) return 0;
  return Math.min(100, Number((releasedAmount * 10000n) / totalAmount) / 100);
}

/**
 * Computes the linear vested amount at a given timestamp.
 * @param totalAmount - Total locked amount
 * @param startTime - Vesting start (unix seconds)
 * @param cliffDuration - Cliff in seconds
 * @param vestingDuration - Total duration in seconds
 * @param releasedAmount - Already released
 * @param now - Current timestamp in seconds (default: Date.now()/1000)
 * @returns Releasable amount
 */
export function computeReleasableOffchain(
  totalAmount: bigint,
  startTime: bigint,
  cliffDuration: bigint,
  vestingDuration: bigint,
  releasedAmount: bigint,
  now: bigint = BigInt(Math.floor(Date.now() / 1000))
): bigint {
  const cliffEnd = startTime + cliffDuration;
  const vestingEnd = startTime + vestingDuration;

  if (now < cliffEnd) return 0n;
  if (now >= vestingEnd) return totalAmount - releasedAmount;

  const elapsed = now - startTime;
  const vested = (totalAmount * elapsed) / vestingDuration;
  return vested - releasedAmount;
}
