// SPDX-License-Identifier: MIT
// 许可证声明：MIT 许可证（允许自由使用和修改）

pragma solidity ^0.8.24;
// 版本声明：使用 Solidity 编译器 0.8.24 版本

/**
 * @title SimpleToken - 简单的 ERC20 代币合约
 * @notice 这是一个教学用的 ERC20 代币实现，用于学习账户管理、Gas 机制和代币标准
 * @dev 实现了 ERC20 标准的核心功能：转账、授权、查询
 *
 * 学习要点：
 * 1. ERC20 代币标准接口（transfer, approve, transferFrom）
 * 2. mapping 数据类型管理账户余额
 * 3. 事件记录（Transfer, Approval）
 * 4. 构造函数初始化
 * 5. require 进行输入验证
 *
 * 行业背景：
 * ERC20 是以太坊上最流行的代币标准，99% 的代币项目都基于此标准。
 * 理解 ERC20 是学习 DeFi 的基础，因为：
 * - 所有 DeFi 协议都需要与 ERC20 代币交互
 * - 去中心化交易所（DEX）依赖 approve/transferFrom 机制
 * - 流动性挖矿、质押等都需要代币转账功能
 *
 * 实现步骤：
 * 1. 声明代币基本信息（名称、符号、小数位、总供应量）
 * 2. 使用 mapping 管理账户余额
 * 3. 实现转账函数（transfer）
 * 4. 实现授权机制（approve + transferFrom）
 * 5. 触发事件记录链上活动
 */
contract SimpleToken {

    // ========== 状态变量 ==========

    /// @notice 代币名称（如 "Bitcoin"）
    /// @dev 存储代币的完整名称，一般在交易所或钱包中显示
    string public name;

    /// @notice 代币符号（如 "BTC"）
    /// @dev 存储代币的交易符号，通常 3-5 个字母
    string public symbol;

    /// @notice 小数位数（通常 18）
    /// @dev 决定代币的最小单位
    /// 示例：decimals = 18 时，1 代币 = 10^18 个最小单位
    /// 与以太坊的 Wei 单位一致（1 ETH = 10^18 Wei）
    uint8 public decimals;

    /// @notice 总供应量
    /// @dev 代币的总数量，在构造函数中设置，之后保持不变（除非有增发/销毁机制）
    uint256 public totalSupply;

    /// @notice 账户余额映射
    /// @dev 存储每个地址的代币余额
    /// 数据结构：address => balance（地址映射到余额）
    /// Gas 成本：首次写入约 20,000 gas，后续修改约 5,000 gas
    mapping(address => uint256) public balanceOf;

    /// @notice 授权额度映射
    /// @dev 存储授权信息：谁可以花谁的钱
    /// 数据结构：owner => spender => amount（拥有者 => 被授权人 => 金额）
    /// 这是 ERC20 的核心机制，用于 DEX 等场景
    mapping(address => mapping(address => uint256)) public allowance;

    // ========== 事件 ==========

    /**
     * @notice 转账事件
     * @dev 记录所有转账操作，前端可以监听此事件
     * @param from 发送方地址（indexed 可被索引查询）
     * @param to 接收方地址（indexed 可被索引查询）
     * @param value 转账数量
     *
     * indexed 关键字：
     * - 最多 3 个 indexed 参数
     * - indexed 参数可以在链下被高效过滤查询
     * - 前端可以根据 from 或 to 地址过滤事件
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @notice 授权事件
     * @dev 记录所有授权操作
     * @param owner 代币拥有者地址（indexed）
     * @param spender 被授权地址（indexed）
     * @param value 授权数量
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ========== 构造函数 ==========

    /**
     * @notice 构造函数 - 部署时初始化代币
     * @dev 在合约部署时执行一次，初始化所有代币信息
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _decimals 小数位数
     * @param _initialSupply 初始供应量
     *
     * 实现步骤：
     * 1. 设置代币基本信息
     * 2. 设置总供应量
     * 3. 将所有代币分配给部署者
     * 4. 触发初始化事件
     *
     * 注意：
     * - 所有代币在部署时创建并分配给部署者
     * - address(0) 表示零地址（不存在的地址）
     * - Transfer 事件从 address(0) 表示代币"创建"
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        // 步骤 1：设置代币基本信息
        name = _name;
        symbol = _symbol;
        decimals = _decimals;

        // 步骤 2：设置总供应量
        totalSupply = _initialSupply;

        // 步骤 3：将所有代币分配给部署者
        // msg.sender 是部署合约的地址
        balanceOf[msg.sender] = _initialSupply;

        // 步骤 4：触发初始化事件
        // from 为 address(0) 表示这是代币创建（从无到有）
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // ========== 主逻辑函数 ==========

    /**
     * @notice 转账代币
     * @dev 核心功能：从调用者账户转账到接收账户
     * @param _to 接收地址
     * @param _value 转账数量
     * @return success 是否成功（固定返回 true）
     *
     * 使用场景：
     * - 用户之间转账
     * - 支付货款
     * - 捐赠
     *
     * 安全考虑：
     * 1. 必须检查余额充足（防止透支）
     * 2. 必须防止转账到零地址（防止代币丢失）
     * 3. Solidity 0.8+ 自动检查溢出（无需 SafeMath）
     *
     * 实现步骤：
     * 1. Checks（检查）：验证余额和地址
     * 2. Effects（效果）：更新双方余额
     * 3. Interactions（交互）：触发事件
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // ========== Checks（检查） ==========

        // 步骤 1：检查余额是否充足
        // require: 如果条件不满足，回滚交易并返回错误信息
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        // 步骤 2：检查接收地址不是零地址
        // address(0) 是无效地址，转账到这里会导致代币永久丢失
        require(_to != address(0), "Invalid address");

        // ========== Effects（效果） ==========

        // 步骤 3：减少发送方余额
        // -= 是减法赋值操作符，Solidity 0.8+ 会自动检查下溢
        balanceOf[msg.sender] -= _value;

        // 步骤 4：增加接收方余额
        // += 是加法赋值操作符，Solidity 0.8+ 会自动检查溢出
        balanceOf[_to] += _value;

        // ========== Interactions（交互） ==========

        // 步骤 5：触发 Transfer 事件
        // 前端可以监听此事件更新 UI
        emit Transfer(msg.sender, _to, _value);

        // 步骤 6：返回成功
        return true;
    }

    /**
     * @notice 授权其他地址使用代币
     * @dev 核心功能：允许 spender 代表调用者使用最多 _value 个代币
     * @param _spender 被授权地址
     * @param _value 授权数量
     * @return success 是否成功（固定返回 true）
     *
     * 使用场景：
     * - DEX 交易：用户授权 DEX 合约使用代币
     * - DeFi 协议：授权借贷协议使用代币作为抵押品
     * - 自动化支付：授权智能合约定期转账
     *
     * 安全考虑：
     * - 授权给恶意合约可能导致代币被盗
     * - 建议只授权需要的数量
     * - 可以通过 approve(_spender, 0) 撤销授权
     *
     * 实现步骤：
     * 1. 设置授权额度
     * 2. 触发授权事件
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // ========== Effects（效果） ==========

        // 步骤 1：设置授权额度
        // allowance[owner][spender] = amount
        // 表示 owner 授权 spender 可以使用 amount 个代币
        allowance[msg.sender][_spender] = _value;

        // ========== Interactions（交互） ==========

        // 步骤 2：触发 Approval 事件
        emit Approval(msg.sender, _spender, _value);

        // 步骤 3：返回成功
        return true;
    }

    /**
     * @notice 从授权账户转账
     * @dev 核心功能：允许第三方代表用户转账（需要事先授权）
     * @param _from 发送地址（被代理的用户）
     * @param _to 接收地址
     * @param _value 转账数量
     * @return success 是否成功（固定返回 true）
     *
     * 使用场景：
     * - DEX 交易：DEX 代表用户执行交易
     * - 借贷协议：代表用户转移抵押品
     * - 自动化策略：代表用户执行投资
     *
     * 安全考虑：
     * - 必须检查授权额度充足
     * - 每次调用后授权额度减少
     * - 遵循 CEI 模式（Checks-Effects-Interactions）
     *
     * 实现步骤：
     * 1. Checks：检查余额、授权额度、地址
     * 2. Effects：更新余额和授权额度
     * 3. Interactions：触发事件
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // ========== Checks（检查） ==========

        // 步骤 1：检查_from 的余额是否充足
        require(balanceOf[_from] >= _value, "Insufficient balance");

        // 步骤 2：检查授权额度是否充足
        // allowance[_from][msg.sender] 是_from 授权给 msg.sender 的额度
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");

        // 步骤 3：检查接收地址不是零地址
        require(_to != address(0), "Invalid address");

        // ========== Effects（效果） ==========

        // 步骤 4：减少_from 的余额
        balanceOf[_from] -= _value;

        // 步骤 5：增加_to 的余额
        balanceOf[_to] += _value;

        // 步骤 6：减少授权额度
        // 使用一次，额度减少一次
        allowance[_from][msg.sender] -= _value;

        // ========== Interactions（交互） ==========

        // 步骤 7：触发 Transfer 事件
        emit Transfer(_from, _to, _value);

        // 步骤 8：返回成功
        return true;
    }

    // ========== 视图函数（只读） ==========

    /**
     * @notice 获取账户余额
     * @dev 视图函数，不消耗 Gas（离线调用）
     * @param _account 账户地址
     * @return balance 余额
     *
     * Gas 说明：
     * - view 函数不修改状态
     * - 调用不需要发送交易
     * - 直接在本地节点执行并返回结果
     */
    function getBalance(address _account) public view returns (uint256 balance) {
        // 直接返回 mapping 中存储的余额
        return balanceOf[_account];
    }

    /**
     * @notice 获取授权额度
     * @dev 视图函数，不消耗 Gas
     * @param _owner 拥有者地址
     * @param _spender 被授权地址
     * @return amount 授权数量
     */
    function getAllowance(address _owner, address _spender) public view returns (uint256 amount) {
        // 直接返回嵌套 mapping 中存储的授权额度
        return allowance[_owner][_spender];
    }
}
