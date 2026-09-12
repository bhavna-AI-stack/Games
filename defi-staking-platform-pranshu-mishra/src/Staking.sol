// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable,Pausable,ReentrancyGuard{

    using SafeERC20 for ERC20;

    ERC20 public immutable stakeToken;
    ERC20 public immutable rewardToken;

    uint256 private constant YEAR=365 * 24 * 60 * 60;

    mapping (address => uint256) public stakedBalance;
    mapping (address => uint256) public pendingRewards;
    mapping (address => uint256) public lastUpdated;

    uint256 public publicStake;
    uint256 public apr=10;

    event Staked(address indexed user,uint256 amount);
    event Withdrawn(address indexed user,uint256 amount);
    event RewardClaimed(address indexed user,uint256 amount); 
    event APRupdated(uint256 oldAPR,uint256 newAPR);

    error ZeroAmount();
    error InsufficientStake();
    error NoRewards();
    error InvalidAPR();

    constructor(
        ERC20 _stakeToken,
        ERC20 _rewardToken
    )
    Ownable(msg.sender)
    {
        stakeToken=_stakeToken;
        rewardToken=_rewardToken;
    }

    function stake(uint256 amount)
    external
    nonReentrant
    whenNotPaused
    {

        if(amount==0){
            revert ZeroAmount();
        }
        _updateRewards(msg.sender);

       stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        stakedBalance[msg.sender] +=amount;
        publicStake +=amount;

        lastUpdated[msg.sender]=block.timestamp;

        emit Staked(msg.sender,amount);
    }

    function _updateRewards(address user) internal{
        if(stakedBalance[user]==0){
            lastUpdated[user]=block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastUpdated[user];

        uint256 reward = (stakedBalance[user] * apr * timeElapsed) / (100*YEAR);

        pendingRewards[user] +=reward;

        lastUpdated[user]=block.timestamp;
    }

    function Withdraw(uint256 amount)
    external
    nonReentrant
    whenNotPaused
    {
        if(amount == 0){
            revert ZeroAmount();
        }

        _updateRewards(msg.sender);

        if(stakedBalance[msg.sender]<amount){
            revert InsufficientStake();
        }

        stakedBalance[msg.sender] -=amount;
        publicStake -= amount;

        stakeToken.safeTransfer(
            msg.sender,
            amount
        );

        lastUpdated[msg.sender] = block.timestamp;
        emit Withdrawn(msg.sender,amount);
    }

    function claimRewards()
    external
    whenNotPaused
    nonReentrant{
        _updateRewards(msg.sender);

        uint256 reward= pendingRewards[msg.sender];

        if(reward==0){
            revert NoRewards();
        }
        pendingRewards[msg.sender]=0;

        rewardToken.safeTransfer(
            msg.sender,
            reward
        );
        emit RewardClaimed(msg.sender,reward);
    }

    function setAPR(uint256 newAPR)
    external
    onlyOwner
    {
        if(newAPR==0){
            revert InvalidAPR();
        }

        uint256 oldAPR=apr;
        apr=newAPR;

        emit APRupdated(oldAPR,newAPR);
    }

    function pause()
    external
    onlyOwner{
        _pause();
    }

    function unpause()
    external
    onlyOwner{
        _unpause();
    }

}