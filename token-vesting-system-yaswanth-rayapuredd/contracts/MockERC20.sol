// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @notice A simple ERC-20 token used for testing the TokenVesting contract.
 * @dev Mints an initial supply to the deployer. Do NOT use in production.
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @param name_     Token name (e.g. "Mock USDC")
     * @param symbol_   Token symbol (e.g. "mUSDC")
     * @param decimals_ Token decimals (e.g. 18)
     * @param initialSupply Total tokens minted to deployer (in base units)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    /// @inheritdoc ERC20
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mints additional tokens to a given address (owner only).
     * @param to     Recipient address
     * @param amount Amount to mint in base units
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
