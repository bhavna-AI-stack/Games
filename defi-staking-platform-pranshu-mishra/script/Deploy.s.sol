// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";

import {StakeToken} from "../src/StakeToken.sol";
import {RewardToken} from "../src/RewardToken.sol";
import {Staking} from "../src/Staking.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        StakeToken stakeToken = new StakeToken();
        RewardToken rewardToken = new RewardToken();

        Staking staking = new Staking(
            stakeToken,
            rewardToken
        );

        vm.stopBroadcast();
    }
}