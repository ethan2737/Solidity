// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SimpleFlashLoan.sol";

/**
 * @title FlashLoanReceiver
 * @notice 闪电贷接收者示例合约
 * @dev 演示如何使用闪电贷进行套利或其他操作
 * 
 * 使用场景示例：
 * 1. 套利：在不同 DEX 之间进行价格套利
 * 2. 清算：使用闪电贷清算抵押不足的贷款
 * 3. 抵押品置换：快速更换抵押品类型
 * 4. 自清算：使用闪电贷偿还自己的贷款并取回抵押品
 */
contract FlashLoanReceiver is IFlashLoanReceiver {
    using SafeERC20 for IERC20;

    // 闪电贷池子地址
    address public immutable flashLoanPool;

    // 事件：闪电贷接收者
    event FlashLoanReceived(address indexed token, uint256 amount, uint256 fee);

    // 事件：操作完成
    event OperationCompleted(address indexed token, uint256 profit);

    constructor(address _flashLoanPool){
        flashLoanPool = _flashLoanPool;
    }

    /**
     * @notice 闪电贷回调函数
     * @param token 借出的代币地址
     * @param amount 借出的数量
     * @param fee 手续费
     */
    function onFlashLoan(address token, uint256 amount, uint256 fee, bytes calldata /* data */) external override {
        // 验证调用者是否为闪电贷池子
        require(msg.sender == flashLoanPool, "Invalid caller");
        emit FlashLoanReceived(token, amount, fee);

        // 在这里执行你的操作逻辑
        // 例如：套利、清算、交换等
        
        // 示例：简单的套利逻辑（伪代码）
        // 1. 使用借来的资金在 DEX A 购买代币
        // 2. 在 DEX B 卖出代币获得更多资金
        // 3. 归还本金 + 手续费
        // 4. 保留利润
        
        // 注意：在实际操作中，你需要确保有足够的利润来支付手续费
        
        // 计算需要归还的总金额（本金 + 手续费）
        uint256 repayAmount = amount + fee;
        
        // 检查当前余额是否足够归还
        uint256 currentBalance = IERC20(token).balanceOf(address(this));
        require(currentBalance >= repayAmount, "Insufficient funds to repay");
        
        // 归还资金给闪电贷池子
        IERC20(token).safeTransfer(flashLoanPool, repayAmount);
        
        // 如果有利润，记录事件
        if (currentBalance > repayAmount) {
            uint256 profit = currentBalance - repayAmount;
            emit OperationCompleted(token, profit);
        }
    }

    /**
     * @notice 发起闪电贷
     * @param token 要借出的代币地址
     * @param amount 借出的数量
     * @param data 传递给回调函数的额外数据
     */
    function executeFlashLoan(
        address token,
        uint256 amount,
        bytes calldata data
    ) external {
        SimpleFlashLoan(flashLoanPool).flashLoan(token, amount, data);
    }

    /**
     * @notice 获取合约的代币余额
     * @param token 代币地址
     * @return 余额
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}


/**
 * @title ArbitrageFlashLoanReceiver
 * @notice 使用闪电贷进行套利的示例合约
 * @dev 这是一个简化的套利示例，实际应用中需要连接真实的 DEX
 */
contract ArbitrageFlashLoanReceiver is IFlashLoanReceiver {
    using SafeERC20 for IERC20;

    address public immutable flashLoanPool;
    
    // 模拟的 DEX 价格（实际应用中需要从链上获取）
    mapping(address => mapping(address => uint256)) public dexPrices;
    
    event ArbitrageExecuted(
        address tokenA,
        address tokenB,
        uint256 profit
    );

    constructor(address _flashLoanPool) {
        flashLoanPool = _flashLoanPool;
    }

    /**
     * @notice 设置 DEX 价格（用于测试）
     */
    function setDexPrice(
        address tokenA,
        address tokenB,
        uint256 price
    ) external {
        dexPrices[tokenA][tokenB] = price;
    }

    /**
     * @notice 闪电贷回调 - 执行套利
     */
    function onFlashLoan(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override {
        require(msg.sender == flashLoanPool, "Invalid caller");
        
        // 解析数据：获取目标代币和套利路径
        // dexA、dexB 在实际套利中会使用，此处为示例简化
        (address targetToken, address dexA_, address dexB_) = abi.decode(
            data,
            (address, address, address)
        );
        // 避免未使用变量警告
        require(dexA_ != dexB_);
        
        // 模拟套利逻辑：
        // 1. 在 DEX A 用 token 购买 targetToken
        // 2. 在 DEX B 用 targetToken 购买 token
        // 3. 如果利润 > 手续费，则执行
        
        // 注意：这是简化示例，实际需要调用真实的 DEX 合约
        
        // 计算需要归还的金额
        uint256 repayAmount = amount + fee;
        
        // 确保有足够资金归还
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= repayAmount, "Insufficient funds");
        
        // 归还资金
        IERC20(token).safeTransfer(flashLoanPool, repayAmount);
        
        // 如果有利润
        if (balance > repayAmount) {
            uint256 profit = balance - repayAmount;
            emit ArbitrageExecuted(token, targetToken, profit);
        }
    }

    /**
     * @notice 执行套利闪电贷
     */
    function executeArbitrage(
        address token,
        uint256 amount,
        address targetToken,
        address dexA,
        address dexB
    ) external {
        bytes memory data = abi.encode(targetToken, dexA, dexB);
        SimpleFlashLoan(flashLoanPool).flashLoan(token, amount, data);
    }
}

