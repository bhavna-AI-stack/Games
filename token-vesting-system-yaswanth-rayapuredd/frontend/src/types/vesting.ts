/**
 * TypeScript types for the Token Vesting DApp.
 * These mirror the on-chain VestingSchedule struct and extend it with UI-specific fields.
 */

/** On-chain VestingSchedule struct (as returned by getVestingSchedule) */
export interface VestingSchedule {
  token: `0x${string}`;
  beneficiary: `0x${string}`;
  creator: `0x${string}`;
  totalAmount: bigint;
  releasedAmount: bigint;
  startTime: bigint;
  cliffDuration: bigint;
  vestingDuration: bigint;
  revocable: boolean;
  revoked: boolean;
}

/** VestingSchedule enriched with computed UI fields */
export interface VestingScheduleUI extends VestingSchedule {
  /** The numeric schedule ID on-chain */
  scheduleId: bigint;
  /** Percentage of tokens vested so far (0-100) */
  vestedPercent: number;
  /** Human-readable vesting status */
  status: VestingStatus;
  /** Tokens currently releasable */
  releasableAmount: bigint;
  /** Token symbol (fetched from ERC-20 contract) */
  tokenSymbol: string;
  /** Token decimals */
  tokenDecimals: number;
}

/** Possible states of a vesting schedule */
export type VestingStatus =
  | 'cliff'       // In cliff period — nothing releasable
  | 'vesting'     // Actively vesting linearly
  | 'completed'   // Fully vested (all tokens releasable or released)
  | 'revoked';    // Revoked by owner

/** Form values for creating a new vesting schedule */
export interface CreateVestingFormValues {
  /** ERC-20 token contract address */
  tokenAddress: string;
  /** Beneficiary wallet address */
  beneficiaryAddress: string;
  /** Total amount of tokens (in human-readable form, e.g. "1000") */
  totalAmount: string;
  /** Start date as ISO string or Date */
  startDate: string;
  /** Cliff period in days */
  cliffDays: number;
  /** Total vesting duration in days */
  vestingDays: number;
  /** Whether this schedule can be revoked by the owner */
  revocable: boolean;
}

/** Stats shown on the Dashboard */
export interface DashboardStats {
  totalSchedules: bigint;
  myBeneficiarySchedules: number;
  myCreatedSchedules: number;
}
