/**
 * Time/date utilities for the Token Vesting DApp.
 */
import type { VestingStatus } from '../types/vesting';

/**
 * Formats a Unix timestamp (seconds) to a readable date string.
 * @param timestamp - Unix timestamp in seconds (bigint or number)
 * @returns e.g. "Jun 28, 2026"
 */
export function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp * 1000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a Unix timestamp to a full datetime string.
 * @param timestamp - Unix timestamp in seconds
 * @returns e.g. "Jun 28, 2026 at 3:00 PM"
 */
export function formatDateTime(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp * 1000;
  return new Date(ms).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Converts a duration in seconds to a human-readable string.
 * @param seconds - Duration in seconds (bigint or number)
 * @returns e.g. "1 year 6 months" or "30 days"
 */
export function formatDuration(seconds: bigint | number): string {
  const s = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  if (s === 0) return '0 days';

  const years = Math.floor(s / (365 * 24 * 3600));
  const months = Math.floor((s % (365 * 24 * 3600)) / (30 * 24 * 3600));
  const days = Math.floor((s % (30 * 24 * 3600)) / (24 * 3600));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0 && years === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

  return parts.join(' ') || '< 1 day';
}

/**
 * Converts days to seconds.
 * @param days - Number of days
 * @returns Seconds as bigint
 */
export function daysToSeconds(days: number): bigint {
  return BigInt(Math.floor(days * 24 * 3600));
}

/**
 * Returns the vesting status based on current time and schedule parameters.
 * @param startTime - Vesting start (unix seconds, bigint)
 * @param cliffDuration - Cliff period in seconds (bigint)
 * @param vestingDuration - Total vesting duration in seconds (bigint)
 * @param revoked - Whether the schedule is revoked
 * @param totalAmount - Total tokens
 * @param releasedAmount - Tokens released
 * @returns VestingStatus
 */
export function getVestingStatus(
  startTime: bigint,
  cliffDuration: bigint,
  vestingDuration: bigint,
  revoked: boolean,
  totalAmount: bigint,
  releasedAmount: bigint
): VestingStatus {
  if (revoked) return 'revoked';

  const now = BigInt(Math.floor(Date.now() / 1000));
  const cliffEnd = startTime + cliffDuration;
  const vestingEnd = startTime + vestingDuration;

  if (now < cliffEnd) return 'cliff';
  if (now >= vestingEnd && releasedAmount >= totalAmount) return 'completed';
  if (now >= vestingEnd) return 'completed';
  return 'vesting';
}

/**
 * Returns the time remaining until the vesting end.
 * @param startTime - Vesting start in seconds
 * @param vestingDuration - Total duration in seconds
 * @returns Human-readable string e.g. "~180 days remaining"
 */
export function timeUntilEnd(startTime: bigint, vestingDuration: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const vestingEnd = startTime + vestingDuration;

  if (now >= vestingEnd) return 'Completed';

  const remaining = Number(vestingEnd - now);
  return `~${Math.ceil(remaining / 86400)} days remaining`;
}
