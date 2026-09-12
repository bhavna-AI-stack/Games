// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";

import {StakeToken} from "../src/StakeToken.sol";
import {RewardToken} from "../src/RewardToken.sol";
import {Staking} from "../src/Staking.sol";

contract StakingTest is Test {
    StakeToken stakeToken;
    RewardToken rewardToken;
    Staking staking;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public{
        stakeToken = new StakeToken();
        rewardToken = new RewardToken();

        staking = new Staking (
            stakeToken,
            rewardToken
        );
    }

    function testConstructorSetsTokenAddress() public view {
        assertEq(address(staking.stakeToken()),address(stakeToken));
        assertEq(address(staking.rewardToken()),address (rewardToken));
    }

    function testUserCanStake() public {
        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(
            address(staking),
            100 ether
        );

        staking.stake(100 ether);

        vm.stopPrank();

        assertEq(
            staking.stakedBalance(alice),
            100 ether
            );
        
        assertEq(
            staking.publicStake(),
            100 ether
        );
    }

    function testUserCanWithdraw() public {
        stakeToken.transfer(alice, 100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        staking.stake(100 ether);

        staking.Withdraw(40 ether);

        vm.stopPrank();

        assertEq(
            staking.stakedBalance(alice),
            60 ether
        );
        assertEq(
            staking.publicStake(),
            60 ether
        );
        assertEq(
            stakeToken.balanceOf(alice),
            40 ether
        );
    }

    function testCannotStakeZero() public{
        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        vm.expectRevert(Staking.ZeroAmount.selector);

        staking.stake(0);

        vm.stopPrank();
    }

    function testCannotWithdrawMoreThanReward() public {
        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        staking.stake(100 ether);

        vm.expectRevert(Staking.InsufficientStake.selector);

        staking.Withdraw(150 ether);

        vm.stopPrank();

    }

    function testCannotClaimWithoutRewards() public {
        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        staking.stake(100 ether);

        vm.expectRevert(Staking.NoRewards.selector);

        staking.claimRewards();

        vm.stopPrank();
    }

    function testUserCanClaimReward() public {
        rewardToken.transfer(address(staking),100000 ether);

        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        staking.stake(100 ether);

        vm.warp(block.timestamp + 365 days);

        staking.claimRewards();

        vm.stopPrank();

        assertGt(rewardToken.balanceOf(alice),0);

        assertEq(staking.pendingRewards(alice),0);

    }

    function testOwnerCanSetAPR() public {

        assertEq(staking.apr(),10);

        staking.setAPR(15);

        assertEq(staking.apr(),15);

    }

    function testNonOwnerCanNotSetAPR() public {

        vm.startPrank(alice);

        vm.expectRevert();

        staking.setAPR(20);

        vm.stopPrank();

        assertEq(staking.apr(),10);
    }

    function testPause() public {
        staking.pause();

        assertEq(staking.paused(),true);

        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        vm.expectRevert();

        staking.stake(100 ether);

        vm.stopPrank();
    }

    function testunPause() public {
        staking.pause();
        assertTrue(staking.paused());

        staking.unpause();

        assertFalse(staking.paused());

        stakeToken.transfer(alice,100 ether);

        vm.startPrank(alice);

        stakeToken.approve(address(staking),100 ether);

        staking.stake(100 ether);

        vm.stopPrank();

        assertEq(staking.stakedBalance(alice),100 ether);
        assertEq(staking.publicStake(),100 ether);
    }

    function testCanNotSetAPRToZero() public {
        vm.expectRevert(Staking.InvalidAPR.selector);

        staking.setAPR(0);
    }
}