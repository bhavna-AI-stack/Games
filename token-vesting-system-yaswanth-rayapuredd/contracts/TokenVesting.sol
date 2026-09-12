// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenVesting
 * @author Token Vesting DApp - B.Tech Final Year Project
 * @notice Manages ERC-20 token vesting schedules with cliff period and linear unlocking.
 * @dev Supports multiple schedules per beneficiary using a monotonically increasing scheduleId counter.
 *      Any ERC-20 token can be vested (token address is stored per-schedule).
 *      Uses OpenZeppelin SafeERC20 for safe token transfers and Ownable for access control.
 *
 * Vesting Logic:
 *  - Before cliff:         0 tokens releasable
 *  - After cliff, before duration end:  linear proportion of total
 *  - After duration end:   remaining total releasable
 */
contract TokenVesting is Ownable {
    using SafeERC20 for IERC20;

    // =========================================================
    //  Structs
    // =========================================================

    /**
     * @notice Represents a single token vesting schedule.
     * @param token         Address of the ERC-20 token being vested
     * @param beneficiary   Address that receives the vested tokens
     * @param creator       Address that created and funded this schedule
     * @param totalAmount   Total tokens locked in this schedule
     * @param releasedAmount Tokens already released to the beneficiary
     * @param startTime     Unix timestamp when vesting period starts
     * @param cliffDuration Seconds after startTime before any tokens vest
     * @param vestingDuration Total vesting duration in seconds (from startTime)
     * @param revocable     Whether the owner can revoke this schedule
     * @param revoked       True if the schedule has been revoked
     */
    struct VestingSchedule {
        address token;
        address beneficiary;
        address creator;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint64 startTime;
        uint64 cliffDuration;
        uint64 vestingDuration;
        bool revocable;
        bool revoked;
    }

    // =========================================================
    //  State Variables
    // =========================================================

    /// @notice Auto-incrementing counter for schedule IDs (first schedule = 1)
    uint256 private _scheduleIdCounter;

    /// @notice Maps scheduleId => VestingSchedule
    mapping(uint256 => VestingSchedule) private _schedules;

    /// @notice Maps beneficiary address => list of their schedule IDs
    mapping(address => uint256[]) private _beneficiarySchedules;

    /// @notice Maps creator address => list of schedule IDs they created
    mapping(address => uint256[]) private _creatorSchedules;

    // =========================================================
    //  Events
    // =========================================================

    /**
     * @notice Emitted when a new vesting schedule is created
     * @param scheduleId    Unique ID of the new schedule
     * @param token         ERC-20 token being vested
     * @param beneficiary   Recipient of vested tokens
     * @param creator       Who created the schedule
     * @param totalAmount   Total tokens locked
     * @param startTime     Vesting start timestamp
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting duration in seconds
     * @param revocable     Whether this schedule can be revoked
     */
    event VestingCreated(
        uint256 indexed scheduleId,
        address indexed token,
        address indexed beneficiary,
        address creator,
        uint256 totalAmount,
        uint64 startTime,
        uint64 cliffDuration,
        uint64 vestingDuration,
        bool revocable
    );

    /**
     * @notice Emitted when vested tokens are released to the beneficiary
     * @param scheduleId    ID of the vesting schedule
     * @param beneficiary   Address that received the tokens
     * @param amount        Number of tokens released
     */
    event TokensReleased(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    /**
     * @notice Emitted when an owner revokes a vesting schedule
     * @param scheduleId        ID of the revoked schedule
     * @param token             ERC-20 token that was being vested
     * @param creator           Address that received the unvested tokens back
     * @param returnedAmount    Number of unvested tokens returned to creator
     */
    event VestingRevoked(
        uint256 indexed scheduleId,
        address indexed token,
        address creator,
        uint256 returnedAmount
    );

    // =========================================================
    //  Custom Errors
    // =========================================================

    /// @notice Thrown when a zero address is provided where a valid address is required
    error ZeroAddress();

    /// @notice Thrown when totalAmount is 0
    error ZeroAmount();

    /// @notice Thrown when vestingDuration is 0 or cliffDuration > vestingDuration
    error InvalidDuration();

    /// @notice Thrown when the scheduleId does not exist
    error ScheduleNotFound(uint256 scheduleId);

    /// @notice Thrown when the caller is not the beneficiary of the schedule
    error NotBeneficiary();

    /// @notice Thrown when there are no tokens available to release
    error NothingToRelease();

    /// @notice Thrown when the schedule has already been revoked
    error AlreadyRevoked();

    /// @notice Thrown when attempting to revoke a non-revocable schedule
    error NotRevocable();

    // =========================================================
    //  Constructor
    // =========================================================

    /**
     * @notice Deploys the TokenVesting contract with the deployer as owner
     */
    constructor() Ownable(msg.sender) {}

    // =========================================================
    //  External Write Functions
    // =========================================================

    /**
     * @notice Creates a new ERC-20 token vesting schedule.
     * @dev Caller must approve `totalAmount` of `token` to this contract first.
     *      Tokens are transferred from caller to this contract upon creation.
     * @param token           ERC-20 token to vest
     * @param beneficiary     Address that will receive vested tokens
     * @param totalAmount     Total number of tokens to vest (in token base units)
     * @param startTime       Unix timestamp when vesting begins (can be in the future)
     * @param cliffDuration   Seconds from startTime before any tokens unlock
     * @param vestingDuration Total vesting duration in seconds from startTime
     * @param revocable       Whether the owner can revoke this schedule
     * @return scheduleId     The unique ID of the newly created schedule
     */
    function createVesting(
        address token,
        address beneficiary,
        uint256 totalAmount,
        uint64 startTime,
        uint64 cliffDuration,
        uint64 vestingDuration,
        bool revocable
    ) external returns (uint256 scheduleId) {
        if (token == address(0)) revert ZeroAddress();
        if (beneficiary == address(0)) revert ZeroAddress();
        if (totalAmount == 0) revert ZeroAmount();
        if (vestingDuration == 0) revert InvalidDuration();
        if (cliffDuration > vestingDuration) revert InvalidDuration();

        // Pull tokens from creator into this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        // Assign schedule ID (starts at 1)
        unchecked {
            _scheduleIdCounter++;
        }
        scheduleId = _scheduleIdCounter;

        _schedules[scheduleId] = VestingSchedule({
            token: token,
            beneficiary: beneficiary,
            creator: msg.sender,
            totalAmount: totalAmount,
            releasedAmount: 0,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revocable: revocable,
            revoked: false
        });

        _beneficiarySchedules[beneficiary].push(scheduleId);
        _creatorSchedules[msg.sender].push(scheduleId);

        emit VestingCreated(
            scheduleId,
            token,
            beneficiary,
            msg.sender,
            totalAmount,
            startTime,
            cliffDuration,
            vestingDuration,
            revocable
        );
    }

    /**
     * @notice Releases all currently vested and unclaimed tokens to the beneficiary.
     * @dev Only the beneficiary can call this function.
     * @param scheduleId The ID of the vesting schedule to release from
     */
    function release(uint256 scheduleId) external {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.totalAmount == 0) revert ScheduleNotFound(scheduleId);
        if (schedule.revoked) revert AlreadyRevoked();
        if (schedule.beneficiary != msg.sender) revert NotBeneficiary();

        uint256 releasable = _computeReleasable(schedule);
        if (releasable == 0) revert NothingToRelease();

        schedule.releasedAmount += releasable;
        IERC20(schedule.token).safeTransfer(msg.sender, releasable);

        emit TokensReleased(scheduleId, msg.sender, releasable);
    }

    /**
     * @notice Revokes a vesting schedule, sending vested tokens to beneficiary
     *         and returning unvested tokens to the creator.
     * @dev Only callable by the contract owner. Schedule must be marked `revocable`.
     * @param scheduleId The ID of the vesting schedule to revoke
     */
    function revoke(uint256 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.totalAmount == 0) revert ScheduleNotFound(scheduleId);
        if (schedule.revoked) revert AlreadyRevoked();
        if (!schedule.revocable) revert NotRevocable();

        uint256 releasable = _computeReleasable(schedule);
        uint256 unvested = schedule.totalAmount - schedule.releasedAmount - releasable;

        // Release any vested tokens to beneficiary first
        if (releasable > 0) {
            schedule.releasedAmount += releasable;
            IERC20(schedule.token).safeTransfer(schedule.beneficiary, releasable);
        }

        // Mark as revoked and return unvested tokens to creator
        schedule.revoked = true;
        if (unvested > 0) {
            IERC20(schedule.token).safeTransfer(schedule.creator, unvested);
        }

        emit VestingRevoked(scheduleId, schedule.token, schedule.creator, unvested);
    }

    // =========================================================
    //  External View Functions
    // =========================================================

    /**
     * @notice Returns the number of tokens currently releasable for a schedule.
     * @param scheduleId The ID of the vesting schedule
     * @return releasable Amount of tokens the beneficiary can release right now
     */
    function computeReleasable(uint256 scheduleId) external view returns (uint256) {
        VestingSchedule storage schedule = _schedules[scheduleId];
        if (schedule.totalAmount == 0) revert ScheduleNotFound(scheduleId);
        if (schedule.revoked) return 0;
        return _computeReleasable(schedule);
    }

    /**
     * @notice Returns the full details of a vesting schedule.
     * @param scheduleId The ID of the vesting schedule
     * @return The VestingSchedule struct with all fields
     */
    function getVestingSchedule(uint256 scheduleId)
        external
        view
        returns (VestingSchedule memory)
    {
        if (_schedules[scheduleId].totalAmount == 0) revert ScheduleNotFound(scheduleId);
        return _schedules[scheduleId];
    }

    /**
     * @notice Returns all vesting schedule IDs where the given address is the beneficiary.
     * @param beneficiary The beneficiary address to query
     * @return Array of schedule IDs
     */
    function getSchedulesByBeneficiary(address beneficiary)
        external
        view
        returns (uint256[] memory)
    {
        return _beneficiarySchedules[beneficiary];
    }

    /**
     * @notice Returns all vesting schedule IDs created by the given address.
     * @param creator The creator address to query
     * @return Array of schedule IDs
     */
    function getSchedulesByCreator(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return _creatorSchedules[creator];
    }

    /**
     * @notice Returns the total number of vesting schedules ever created.
     * @return Total number of schedules (also the highest scheduleId)
     */
    function getTotalSchedules() external view returns (uint256) {
        return _scheduleIdCounter;
    }

    // =========================================================
    //  Internal Functions
    // =========================================================

    /**
     * @dev Computes the amount of tokens releasable from a schedule at the current block time.
     *      Logic:
     *        - Before cliff end  → 0
     *        - After vesting end → all remaining (totalAmount - releasedAmount)
     *        - Between cliff and vesting end → linear proportion minus already released
     * @param schedule Storage reference to the VestingSchedule
     * @return Amount of tokens currently releasable
     */
    function _computeReleasable(VestingSchedule storage schedule)
        private
        view
        returns (uint256)
    {
        uint64 currentTime = uint64(block.timestamp);
        uint64 cliffEnd = schedule.startTime + schedule.cliffDuration;
        uint64 vestingEnd = schedule.startTime + schedule.vestingDuration;

        // Before cliff: nothing vested
        if (currentTime < cliffEnd) {
            return 0;
        }

        // After full vesting duration: everything remaining is vested
        if (currentTime >= vestingEnd) {
            return schedule.totalAmount - schedule.releasedAmount;
        }

        // Linear vesting: (elapsed / duration) * total - already released
        uint256 elapsed = uint256(currentTime - schedule.startTime);
        uint256 vested = (schedule.totalAmount * elapsed) / uint256(schedule.vestingDuration);
        return vested - schedule.releasedAmount;
    }
}
