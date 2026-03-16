// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TestToken.sol";

/**
 * @title AMMWithLPToken
 * @notice 带 LP 代币的 AMM 合约，实现 x·y=k 恒定乘积模型
 * @dev 学习要点：
 * 1. 理解 x·y=k 恒定乘积模型
 * 2. 实现流动性提供（Add Liquidity）和 LP 代币
 * 3. 实现流动性移除（Remove Liquidity）
 * 4. 实现代币交换（Swap）
 * 5. 理解滑点（Slippage）概念
 * 
 * 小贴士：理解 AMM 原理有助于你后续做流动性池、LP 代币合约开发。
 */
contract AMMWithLPToken {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    address public tokenA;  // 代币 A 地址
    address public tokenB;  // 代币 B 地址
    
    uint256 public reserveA;  // 代币 A 储备量
    uint256 public reserveB;  // 代币 B 储备量
    
    uint256 public totalSupply;  // LP 代币总供应量
    mapping(address => uint256) public balanceOf;  // LP 代币余额
    
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;  // 最小流动性（防止除零）
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Invalid token A address");
        require(_tokenB != address(0), "Invalid token B address");
        require(_tokenA != _tokenB, "Tokens must be different");
        
        tokenA = _tokenA;
        tokenB = _tokenB;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 核心函数：添加流动性（Add Liquidity）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加流动性到池子
     * @param _amountA 代币 A 的数量
     * @param _amountB 代币 B 的数量
     * @return liquidity LP 代币数量
     * @dev 首次添加流动性时，可以任意比例添加
     *      后续添加流动性时，必须按照当前储备比例添加
     */
    function addLiquidity(uint256 _amountA, uint256 _amountB) external returns (uint256 liquidity) {
        require(_amountA > 0 && _amountB > 0, "Amounts must be greater than 0");
        
        // 从用户转移代币到合约
        TestToken(tokenA).transferFrom(msg.sender, address(this), _amountA);
        TestToken(tokenB).transferFrom(msg.sender, address(this), _amountB);
        
        if (reserveA == 0 && reserveB == 0) {
            // 首次添加流动性
            liquidity = sqrt(_amountA * _amountB) - MINIMUM_LIQUIDITY;
            require(liquidity > 0, "Insufficient liquidity");
            
            // 将最小流动性发送到零地址（永久锁定）
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            // 后续添加流动性，必须按照当前比例
            require(
                _amountA * reserveB == _amountB * reserveA,
                "Amounts must be proportional to reserves"
            );
            
            // 计算流动性份额：liquidity = (amountA * totalSupply) / reserveA
            liquidity = (_amountA * totalSupply) / reserveA;
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        // 更新储备量
        reserveA += _amountA;
        reserveB += _amountB;
        
        // 铸造 LP 代币给用户
        _mint(msg.sender, liquidity);
        
        emit LiquidityAdded(msg.sender, _amountA, _amountB, liquidity);
        
        return liquidity;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 核心函数：移除流动性（Remove Liquidity）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 从池子移除流动性
     * @param _liquidity LP 代币数量
     * @return amountA 返回的代币 A 数量
     * @return amountB 返回的代币 B 数量
     */
    function removeLiquidity(uint256 _liquidity) external returns (uint256 amountA, uint256 amountB) {
        require(_liquidity > 0, "Liquidity must be greater than 0");
        require(balanceOf[msg.sender] >= _liquidity, "Insufficient liquidity");
        
        // 计算应该返回的代币数量
        amountA = (_liquidity * reserveA) / totalSupply;
        amountB = (_liquidity * reserveB) / totalSupply;
        
        require(amountA > 0 && amountB > 0, "Insufficient amounts");
        
        // 销毁 LP 代币
        _burn(msg.sender, _liquidity);
        
        // 更新储备量
        reserveA -= amountA;
        reserveB -= amountB;
        
        // 转移代币给用户
        TestToken(tokenA).transfer(msg.sender, amountA);
        TestToken(tokenB).transfer(msg.sender, amountB);
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, _liquidity);
        
        return (amountA, amountB);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 核心函数：代币交换（Swap）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 交换代币（使用 x·y=k 恒定乘积模型）
     * @param _tokenIn 输入代币地址
     * @param _amountIn 输入代币数量
     * @return amountOut 输出代币数量
     * @dev 基于公式：x * y = k（恒定乘积）
     *      交换后：(x + Δx) * (y - Δy) = k
     *      因此：Δy = (y * Δx) / (x + Δx)
     */
    function swap(address _tokenIn, uint256 _amountIn) external returns (uint256 amountOut) {
        require(_amountIn > 0, "Amount must be greater than 0");
        require(_tokenIn == tokenA || _tokenIn == tokenB, "Invalid token");
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (_tokenIn == tokenA) {
            reserveIn = reserveA;
            reserveOut = reserveB;
        } else {
            reserveIn = reserveB;
            reserveOut = reserveA;
        }
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        // 计算输出数量（x·y=k 恒定乘积模型）
        // amountOut = (reserveOut * amountIn) / (reserveIn + amountIn)
        // 注意：这里没有手续费，实际 Uniswap 会收取 0.3% 手续费
        amountOut = (reserveOut * _amountIn) / (reserveIn + _amountIn);
        
        require(amountOut > 0, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        // 从用户转移输入代币
        TestToken(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        
        // 更新储备量
        if (_tokenIn == tokenA) {
            reserveA += _amountIn;
            reserveB -= amountOut;
            // 转移输出代币给用户
            TestToken(tokenB).transfer(msg.sender, amountOut);
        } else {
            reserveB += _amountIn;
            reserveA -= amountOut;
            // 转移输出代币给用户
            TestToken(tokenA).transfer(msg.sender, amountOut);
        }
        
        emit Swap(msg.sender, _tokenIn, _tokenIn == tokenA ? tokenB : tokenA, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @notice 计算交换输出数量（不执行交换）
     * @param _tokenIn 输入代币地址
     * @param _amountIn 输入代币数量
     * @return amountOut 输出代币数量
     */
    function getAmountOut(address _tokenIn, uint256 _amountIn) external view returns (uint256 amountOut) {
        require(_amountIn > 0, "Amount must be greater than 0");
        require(_tokenIn == tokenA || _tokenIn == tokenB, "Invalid token");
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (_tokenIn == tokenA) {
            reserveIn = reserveA;
            reserveOut = reserveB;
        } else {
            reserveIn = reserveB;
            reserveOut = reserveA;
        }
        
        if (reserveIn == 0 || reserveOut == 0) {
            return 0;
        }
        
        // x·y=k 恒定乘积模型
        amountOut = (reserveOut * _amountIn) / (reserveIn + _amountIn);
        
        return amountOut;
    }
    
    // ═══════════════════════════════════════════════════════════
    // LP 代币函数（类似 ERC20）
    // ═══════════════════════════════════════════════════════════
    
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 辅助函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取当前储备量
     * @return _reserveA 代币 A 储备量
     * @return _reserveB 代币 B 储备量
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }
    
    /**
     * @notice 获取恒定乘积 k 的值
     * @return k 恒定乘积值
     */
    function getK() external view returns (uint256 k) {
        return reserveA * reserveB;
    }
    
    /**
     * @notice 计算平方根（用于首次流动性计算）
     * @param y 输入值
     * @return z 平方根
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}

