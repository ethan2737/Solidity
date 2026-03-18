// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice 用于测试的 ERC20 代币
 */
contract MockERC20 is ERC20 {
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 totalSupply
        ) ERC20(name, symbol) {
            _mint(msg.sender, totalSupply);
        }
    
    /**
     * @notice 铸造代币（用于测试）
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}