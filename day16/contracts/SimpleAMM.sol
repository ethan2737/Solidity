// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// testToken 接口
interface TestToken {
    function transfer(address to, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns(bool);
    function balanceOf(address account) external view returns(uint256);
}

/**
 * @title SimpleAMM
 * @notice 简单的 AMM（自动做市商）合约，实现 x·y=k 恒定乘积模型
 * @dev 学习要点：
 * 1. 理解 x·y=k 恒定乘积模型
 * 2. 实现流动性提供（Add Liquidity）
 * 3. 实现代币交换（Swap）
 * 4. 理解滑点（Slippage）概念
 */
contract SimpleAMM {
    // 状态变量
    address public tokenA;      // 代币A地址
    address public tokenB;      // 代币B地址

    uint256 public reserveA;        // 代币A储备量
    uint256 public reserveB;        // 代币B储备量

    uint256 public constant MINIMUM_LIQUIDITY = 10**3;      //最小流动性（防止为零）

    // 事件：增加流动性
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    // 事件：移除流动性
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    // 事件：交换
    event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);


    // 构造函数
    constructor(address _tokenA, address _tokenB){
        // 判断 tokenA和tokenB的地址是否为零地址，并且tokenA与tokenB不能相等
        require(_tokenA != address(0), "Invailid token A address");
        require(_tokenB != address(0), "Invailid token B address");
        require(_tokenA != _tokenB, "Tokens must be different");

        // 初始化赋值
        tokenA = _tokenA;
        tokenB = _tokenB;
    }


    // 核心函数：添加流动性（Add Liquidity）

    /**
     * @notice 添加流动性到池子
     * @param _amountA 代币 A 的数量
     * @param _amountB 代币 B 的数量
     * @dev 首次添加流动性时，可以任意比例添加
     *      后续添加流动性时，必须按照当前储备比例添加
     */
    function addLiquidity(uint256 _amountA, uint256 _amountB) external {
        // 代币数量必须大于0
        require(_amountA >0 && _amountB > 0, "Amounts must be greater than 0");

        // 从用户转移代币到合约
        TestToken(tokenA).transferFrom(msg.sender, address(this), _amountA);
        TestToken(tokenB).transferFrom(msg.sender, address(this), _amountB);

        uint256 liquidity;

        if (reserveA == 0 && reserveB == 0){
            // 首次添加流动性
            liquidity = sqrt(_amountA * _amountB) - MINIMUM_LIQUIDITY;
            // 判断流动性大于0
            require(liquidity > 0, "Insufficient liquidity");
        } else {
            // 后续添加流动性，必须按照当前比例
            require(_amountA * reserveB ==_amountB * reserveA, "Amounts must be proportional to reserves");

            // 计算流动性份额（简化版本，实际 Uniswap 使用更复杂的公式）
            liquidity = (reserveA == 0) ? 0 : (_amountA * totalLiquidity()) / reserveA;
        }

        // 更新储备量
        reserveA += _amountA;
        reserveB += _amountB;

        // 触发更加流动性事件
        emit LiquidityAdded(msg.sender, _amountA, _amountB, liquidity);
    }

    // 核心函数：代币交换（Swap）

    /**
     * @notice 交换代币（使用 x·y=k 恒定乘积模型）
     * @param _tokenIn 输入代币地址
     * @param _amountIn 输入代币数量
     * @return amountOut 输出代币数量
     * @dev 基于公式：x * y = k（恒定乘积）
     *      交换后：(x + Δx) * (y - Δy) = k
     *      因此：Δy = (y * Δx) / (x + Δx)
     */
    function swap(address _tokenIn, uint256 _amountIn) external returns(uint256 amountOut){
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



    // 辅助函数
    /**
     * @notice 计算平方根（用于首次流动性计算）
     * @param y 输入值
     * @return z 平方根
     */
    function sqrt(uint256 y) internal pure returns(uint256 z) {
        if (y > 3){
            z = y;
            uint256 x = y / 2+1;
            while (x < z){
                z = x;
                x = (y / x+x) / 2;
            }
        } else if(y != 0) {
            z = 1;
        }
    }

    /**
     * @notice 获取总流动性（简化版本，实际应该跟踪 LP 代币）
     * @return 总流动性
     */
    function totalLiquidity() public view returns(uint256){
        return sqrt(reserveA * reserveB);
    }


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

}