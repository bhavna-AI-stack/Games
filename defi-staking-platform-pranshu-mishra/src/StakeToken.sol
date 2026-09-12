// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakeToken is ERC20{

    constructor() ERC20("Stake Token","STK"){
        _mint(msg.sender, 1_00_000 * 10 ** decimals());
    }

}