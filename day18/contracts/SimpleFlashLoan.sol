// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IFlashLoanReceiver
 * @notice 闪电贷接收者接口
 * @dev 任何想要接收闪电贷的合约都必须实现此接口
 */
interface IFlashLoanReceiver{
    /**
     * @notice 闪电贷回调函数
     * @param token 借出的代币地址
     * @param amount 借出的数量
     * @param fee 手续费
     * @param data 额外的数据
     */
    function onFlashLoan(address token, uint256 amount, uint fee, bytes calldata data) external;
}

/**
 * @title SimpleFlashLoan
 * @notice 一个简单的闪电贷模拟合约
 * @dev 演示闪电贷的基本原理：在同一笔交易中借出和归还资金
 * 
 * 闪电贷核心机制：
 * 1. 借出资金给接收者
 * 2. 调用接收者的回调函数
 * 3. 验证资金是否已归还（本金 + 手续费）
 * 4. 如果未归还，整个交易回滚
 */
contract SimpleFlashLoan {
    using SafeERC20 for IERC20;

    // 闪电贷手续费率（基点， 100 = 1%）
    uint256 public constant FLASH_LOAN_FEE_BPS = 9;     // 0.09%

    // 事件:闪电贷执行
    event FlashLoan(address indexed token, address indexed borrower, uint256 amount, uint256 fee);

    /**
     * @notice 执行闪电贷
     * @param token 要借出的代币地址
     * @param amount 借出的数量
     * @param data 传递给回调函数的额外数据
     */
    function flashLoan(address token, uint256 amount, bytes calldata data) external {
        IERC20 tokenContract = IERC20(token);

        // 记录借出前的余额
        uint256 balanceBefore = tokenContract.balanceOf(address(this));

        // 检查池子是否有足够的资金
        require(balanceBefore >= amount, "Insufficient liquidity");

        // 计算手续费
        uint256 fee = (amount * FLASH_LOAN_FEE_BPS) / 10000;

        // 1. 借出资金给调用者
        tokenContract.safeTransfer(msg.sender, amount);

        // 2. 调用接收者的回调函数，接收者需要实现 IFlashLoanReceiver 接口
        IFlashLoanReceiver(msg.sender).onFlashLoan(token, amount, fee, data);

        // 3. 验证资金是否已归还（本金+手续费）
        uint256 balanceAfter = tokenContract.balanceOf(address(this));
        uint256 requireBalance = balanceBefore + fee;

        require(balanceAfter >= requireBalance, "Flash loan not repaid");

        emit FlashLoan(token, msg.sender, amount, fee);
    }


    /**
     * @notice 向池子存入资金（用于测试）
     * @param token 代币地址
     * @param amount 存入数量
     */
    function deposit(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }


    /**
     * @notice 获取池子余额
     * @param token 代币地址
     * @return 余额
     */
    function getBalance(address token) external view returns(uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}


