import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TokenVesting, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// ============================================================
//  Helper Constants
// ============================================================
const ONE_DAY = 24 * 60 * 60;        // 1 day in seconds
const THIRTY_DAYS = 30 * ONE_DAY;    // 30 days cliff
const ONE_YEAR = 365 * ONE_DAY;      // 1 year vesting
const TOTAL_TOKENS = ethers.parseEther("1000"); // 1000 tokens

// ============================================================
//  TokenVesting Unit Tests
// ============================================================
describe("TokenVesting", function () {
  let vesting: TokenVesting;
  let token: MockERC20;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let other: SignerWithAddress;

  let startTime: number;

  beforeEach(async function () {
    [owner, creator, beneficiary, other] = await ethers.getSigners();

    // Deploy MockERC20 to creator
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    token = await MockERC20Factory.connect(creator).deploy(
      "Mock Token",
      "MTK",
      18,
      ethers.parseEther("10000") // 10,000 tokens
    );

    // Deploy TokenVesting (owner = deployer = owner signer)
    const VestingFactory = await ethers.getContractFactory("TokenVesting");
    vesting = await VestingFactory.connect(owner).deploy();

    // Set startTime to now
    startTime = await time.latest();
  });

  // ----------------------------------------------------------
  //  Deployment
  // ----------------------------------------------------------
  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await vesting.owner()).to.equal(owner.address);
    });

    it("Should start with zero schedules", async function () {
      expect(await vesting.getTotalSchedules()).to.equal(0);
    });
  });

  // ----------------------------------------------------------
  //  createVesting
  // ----------------------------------------------------------
  describe("createVesting", function () {
    beforeEach(async function () {
      // Approve vesting contract to spend creator's tokens
      await token.connect(creator).approve(await vesting.getAddress(), TOTAL_TOKENS);
    });

    it("Should create a vesting schedule and emit VestingCreated", async function () {
      const tx = await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          true
        );

      await expect(tx)
        .to.emit(vesting, "VestingCreated")
        .withArgs(
          1,
          await token.getAddress(),
          beneficiary.address,
          creator.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          true
        );

      expect(await vesting.getTotalSchedules()).to.equal(1);
    });

    it("Should transfer tokens from creator to contract", async function () {
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        );

      expect(await token.balanceOf(await vesting.getAddress())).to.equal(TOTAL_TOKENS);
    });

    it("Should store schedule with correct data", async function () {
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          true
        );

      const schedule = await vesting.getVestingSchedule(1);
      expect(schedule.token).to.equal(await token.getAddress());
      expect(schedule.beneficiary).to.equal(beneficiary.address);
      expect(schedule.creator).to.equal(creator.address);
      expect(schedule.totalAmount).to.equal(TOTAL_TOKENS);
      expect(schedule.releasedAmount).to.equal(0);
      expect(schedule.revocable).to.be.true;
      expect(schedule.revoked).to.be.false;
    });

    it("Should index schedule under beneficiary and creator", async function () {
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        );

      const byBeneficiary = await vesting.getSchedulesByBeneficiary(beneficiary.address);
      const byCreator = await vesting.getSchedulesByCreator(creator.address);

      expect(byBeneficiary).to.deep.equal([1n]);
      expect(byCreator).to.deep.equal([1n]);
    });

    it("Should revert with ZeroAddress if token is address(0)", async function () {
      await expect(
        vesting.connect(creator).createVesting(
          ethers.ZeroAddress,
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        )
      ).to.be.revertedWithCustomError(vesting, "ZeroAddress");
    });

    it("Should revert with ZeroAddress if beneficiary is address(0)", async function () {
      await expect(
        vesting.connect(creator).createVesting(
          await token.getAddress(),
          ethers.ZeroAddress,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        )
      ).to.be.revertedWithCustomError(vesting, "ZeroAddress");
    });

    it("Should revert with ZeroAmount if totalAmount is 0", async function () {
      await expect(
        vesting.connect(creator).createVesting(
          await token.getAddress(),
          beneficiary.address,
          0,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        )
      ).to.be.revertedWithCustomError(vesting, "ZeroAmount");
    });

    it("Should revert with InvalidDuration if vestingDuration is 0", async function () {
      await expect(
        vesting.connect(creator).createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          0,
          0,
          false
        )
      ).to.be.revertedWithCustomError(vesting, "InvalidDuration");
    });

    it("Should revert with InvalidDuration if cliff > vesting duration", async function () {
      await expect(
        vesting.connect(creator).createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          ONE_YEAR + ONE_DAY, // cliff > duration
          ONE_YEAR,
          false
        )
      ).to.be.revertedWithCustomError(vesting, "InvalidDuration");
    });
  });

  // ----------------------------------------------------------
  //  Cliff Enforcement
  // ----------------------------------------------------------
  describe("Cliff Enforcement", function () {
    beforeEach(async function () {
      await token.connect(creator).approve(await vesting.getAddress(), TOTAL_TOKENS);
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          THIRTY_DAYS,
          ONE_YEAR,
          false
        );
    });

    it("Should return 0 releasable before cliff ends", async function () {
      // Move time forward but stay before cliff
      await time.increase(THIRTY_DAYS - ONE_DAY);
      const releasable = await vesting.computeReleasable(1);
      expect(releasable).to.equal(0);
    });

    it("Should revert release() call before cliff", async function () {
      await time.increase(THIRTY_DAYS - ONE_DAY);
      await expect(
        vesting.connect(beneficiary).release(1)
      ).to.be.revertedWithCustomError(vesting, "NothingToRelease");
    });

    it("Should have releasable amount > 0 after cliff", async function () {
      // Move past cliff
      await time.increase(THIRTY_DAYS + ONE_DAY);
      const releasable = await vesting.computeReleasable(1);
      expect(releasable).to.be.gt(0);
    });
  });

  // ----------------------------------------------------------
  //  Linear Vesting & Release
  // ----------------------------------------------------------
  describe("Linear Vesting and Release", function () {
    beforeEach(async function () {
      await token.connect(creator).approve(await vesting.getAddress(), TOTAL_TOKENS);
      // No cliff for linear vesting tests
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          0, // no cliff
          ONE_YEAR,
          false
        );
    });

    it("Should release ~50% of tokens at half the vesting duration", async function () {
      const halfYear = ONE_YEAR / 2;
      await time.increase(halfYear);

      const releasable = await vesting.computeReleasable(1);
      const expected = TOTAL_TOKENS / 2n;

      // Allow small margin for timestamp variance
      expect(releasable).to.be.closeTo(expected, ethers.parseEther("1"));
    });

    it("Should release 100% of tokens after full vesting duration", async function () {
      await time.increase(ONE_YEAR + ONE_DAY);

      const releasable = await vesting.computeReleasable(1);
      expect(releasable).to.equal(TOTAL_TOKENS);
    });

    it("Should emit TokensReleased on successful release", async function () {
      await time.increase(ONE_YEAR / 2);

      const releasable = await vesting.computeReleasable(1);
      await expect(vesting.connect(beneficiary).release(1))
        .to.emit(vesting, "TokensReleased")
        .withArgs(1, beneficiary.address, (amount: bigint) => amount >= releasable);
    });

    it("Should transfer correct token amount to beneficiary on release", async function () {
      await time.increase(ONE_YEAR);

      const balanceBefore = await token.balanceOf(beneficiary.address);
      await vesting.connect(beneficiary).release(1);
      const balanceAfter = await token.balanceOf(beneficiary.address);

      expect(balanceAfter - balanceBefore).to.equal(TOTAL_TOKENS);
    });

    it("Should revert if non-beneficiary calls release()", async function () {
      await time.increase(ONE_YEAR);
      await expect(
        vesting.connect(other).release(1)
      ).to.be.revertedWithCustomError(vesting, "NotBeneficiary");
    });

    it("Should accumulate released amount correctly across multiple releases", async function () {
      // First release at 6 months
      await time.increase(ONE_YEAR / 2);
      await vesting.connect(beneficiary).release(1);

      // Second release at 1 year
      await time.increase(ONE_YEAR / 2);
      await vesting.connect(beneficiary).release(1);

      const schedule = await vesting.getVestingSchedule(1);
      expect(schedule.releasedAmount).to.equal(TOTAL_TOKENS);

      const balance = await token.balanceOf(beneficiary.address);
      expect(balance).to.equal(TOTAL_TOKENS);
    });
  });

  // ----------------------------------------------------------
  //  Revocation
  // ----------------------------------------------------------
  describe("Revocation", function () {
    beforeEach(async function () {
      await token.connect(creator).approve(await vesting.getAddress(), TOTAL_TOKENS);
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          0, // no cliff
          ONE_YEAR,
          true // revocable
        );
    });

    it("Should revoke a schedule and return unvested tokens to creator", async function () {
      const halfYear = ONE_YEAR / 2;
      await time.increase(halfYear);

      const creatorBalanceBefore = await token.balanceOf(creator.address);
      await vesting.connect(owner).revoke(1);
      const creatorBalanceAfter = await token.balanceOf(creator.address);

      // ~50% returned to creator
      const returned = creatorBalanceAfter - creatorBalanceBefore;
      expect(returned).to.be.closeTo(TOTAL_TOKENS / 2n, ethers.parseEther("1"));
    });

    it("Should emit VestingRevoked with correct data", async function () {
      await time.increase(ONE_YEAR / 2);

      await expect(vesting.connect(owner).revoke(1))
        .to.emit(vesting, "VestingRevoked")
        .withArgs(1, await token.getAddress(), creator.address, (v: bigint) => v > 0n);
    });

    it("Should mark the schedule as revoked", async function () {
      await vesting.connect(owner).revoke(1);
      const schedule = await vesting.getVestingSchedule(1);
      expect(schedule.revoked).to.be.true;
    });

    it("Should revert release() after revocation", async function () {
      await vesting.connect(owner).revoke(1);
      await expect(
        vesting.connect(beneficiary).release(1)
      ).to.be.revertedWithCustomError(vesting, "AlreadyRevoked");
    });

    it("Should revert double revocation", async function () {
      await vesting.connect(owner).revoke(1);
      await expect(
        vesting.connect(owner).revoke(1)
      ).to.be.revertedWithCustomError(vesting, "AlreadyRevoked");
    });

    it("Should revert revocation of non-revocable schedule", async function () {
      // Create a non-revocable schedule
      await token.connect(creator).approve(await vesting.getAddress(), TOTAL_TOKENS);
      await vesting
        .connect(creator)
        .createVesting(
          await token.getAddress(),
          beneficiary.address,
          TOTAL_TOKENS,
          startTime,
          0,
          ONE_YEAR,
          false // NOT revocable
        );

      await expect(
        vesting.connect(owner).revoke(2)
      ).to.be.revertedWithCustomError(vesting, "NotRevocable");
    });

    it("Should revert revocation by non-owner", async function () {
      await expect(
        vesting.connect(other).revoke(1)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });
  });

  // ----------------------------------------------------------
  //  Multiple Schedules
  // ----------------------------------------------------------
  describe("Multiple Schedules", function () {
    it("Should support multiple schedules per beneficiary", async function () {
      const amount = ethers.parseEther("100");
      await token
        .connect(creator)
        .approve(await vesting.getAddress(), amount * 3n);

      for (let i = 0; i < 3; i++) {
        await vesting.connect(creator).createVesting(
          await token.getAddress(),
          beneficiary.address,
          amount,
          startTime,
          0,
          ONE_YEAR,
          false
        );
      }

      const schedules = await vesting.getSchedulesByBeneficiary(beneficiary.address);
      expect(schedules.length).to.equal(3);
      expect(schedules).to.deep.equal([1n, 2n, 3n]);
    });
  });
});
