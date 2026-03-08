// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CompleteDemo
 * @notice 完整演示合约：整合 Day 11 和 Day 12 的核心知识点
 * @dev 包含构造函数、constant/immutable、receive/fallback 的完整示例
 *
 * 学习要点：
 * 1. 构造函数：合约部署时执行一次
 * 2. constant：编译时确定的常量
 * 3. immutable：部署时确定、之后不可变的变量
 * 4. receive：接收纯以太币
 * 5. fallback：处理未知函数调用和带数据的以太币
 * 6. 提取资金功能
 */
contract CompleteDemo {
    // ═══════════════════════════════════════════════════════════
    // constant 常量（编译时确定）
    // ═══════════════════════════════════════════════════════════

    uint8 public constant DECIMALS = 18;                    // 代币精度
    uint256 public constant TOTAL_SUPPLY = 1000000 * 10**18; // 总供应量
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD; // 燃烧地址

    // ═══════════════════════════════════════════════════════════
    // immutable 不可变量（部署时确定）
    // ═══════════════════════════════════════════════════════════

    address public immutable owner;           // 合约所有者（部署者）
    address public immutable treasury;        // 国库地址
    uint256 public immutable launchDate;     // 上线时间

    // ═══════════════════════════════════════════════════════════
    // 普通状态变量
    // ═══════════════════════════════════════════════════════════

    string public name;                      // 代币名称
    string public symbol;                    // 代币符号

    uint256 public totalSupply;              // 当前总供应量
    mapping(address => uint256) public balanceOf;  // 地址余额映射

    // 捐赠相关
    uint256 public totalReceived;            // 总接收金额
    uint256 public receiveCount;             // receive 调用次数
    uint256 public fallbackCount;            // fallback 调用次数
    mapping(address => uint256) public donations;  // 地址 -> 捐赠金额

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    event Transfer(address indexed from, address indexed to, uint256 value);  // 转账事件
    event Received(address indexed sender, uint256 amount);                  // 收到 ETH 事件
    event FallbackCalled(address indexed sender, uint256 amount, bytes data);  // fallback 调用事件
    event Withdrawn(address indexed to, uint256 amount);                   // 提现事件

    // ═══════════════════════════════════════════════════════════
    // 构造函数（部署时执行一次）
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 构造函数
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param _treasury 国库地址
     * @param _initialSupply 初始供应量
     *
     * 初始化内容：
     * 1. 设置 owner（immutable）
     * 2. 设置 treasury（immutable）
     * 3. 设置 launchDate（immutable）
     * 4. 初始化代币信息
     * 5. 铸造初始代币给部署者
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _treasury,
        uint256 _initialSupply
    ) {
        // 验证参数
        require(_treasury != address(0), "Invalid treasury address");

        // 赋值 immutable 变量（只能在构造函数中赋值一次）
        owner = msg.sender;           // 部署者地址
        treasury = _treasury;          // 国库地址
        launchDate = block.timestamp;  // 上线时间

        // 初始化代币信息
        name = _name;
        symbol = _symbol;

        // 铸造初始代币
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;

        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // ═══════════════════════════════════════════════════════════
    // receive() 函数 - 接收纯以太币（没有数据）
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice receive() 函数
     * @dev 当收到纯以太币转账时自动调用
     *
     * 触发条件：
     * - address.transfer(amount)
     * - address.send(amount)
     * - call{value: amount}("")
     *
     * 注意：
     * - 必须声明为 payable
     * - 只能处理纯 ETH，不能处理数据
     */
    receive() external payable {
        // 增加总接收金额
        totalReceived += msg.value;
        // 增加 receive 调用计数
        receiveCount++;

        // 记录捐赠（首次捐赠时）
        if (donations[msg.sender] == 0 && msg.value > 0) {
            // 新捐赠者
        }
        donations[msg.sender] += msg.value;

        // 触发事件
        emit Received(msg.sender, msg.value);
    }

    // ═══════════════════════════════════════════════════════════
    // fallback() 函数 - 处理未知函数调用和带数据的以太币
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice fallback() 函数
     * @dev 当没有其他函数匹配时调用
     *
     * 触发条件：
     * - 调用不存在的函数
     * - 调用存在但数据不匹配的函数
     * - 有数据的以太币转账（如果没有 receive）
     *
     * 注意：
     * - 必须声明为 payable（如果要接收以太币）
     * - 可以处理数据（通过 msg.data）
     */
    fallback() external payable {
        // 增加总接收金额
        totalReceived += msg.value;
        // 增加 fallback 调用计数
        fallbackCount++;

        // 记录捐赠
        donations[msg.sender] += msg.value;

        // 触发事件（包含数据）
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    // ═══════════════════════════════════════════════════════════
    // 代币功能函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 转账函数
     * @param to 接收地址
     * @param amount 转账金额
     * @return success 是否成功
     */
    function transfer(address to, uint256 amount) public returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        // 扣除发送者余额
        balanceOf[msg.sender] -= amount;
        // 增加接收者余额
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @notice 铸造新代币（仅 owner）
     * @param account 接收地址
     * @param amount 铸造金额
     */
    function mint(address account, uint256 amount) public {
        require(msg.sender == owner, "Only owner");
        require(account != address(0), "Invalid address");

        totalSupply += amount;
        balanceOf[account] += amount;

        emit Transfer(address(0), account, amount);
    }

    /**
     * @notice 燃烧代币
     * @param amount 燃烧金额
     */
    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, BURN_ADDRESS, amount);
    }

    // ═══════════════════════════════════════════════════════════
    // 捐赠相关函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取合约余额
     * @return 合约当前 ETH 余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice 获取某个地址的捐赠金额
     * @param donor 捐赠者地址
     * @return 捐赠金额
     */
    function getDonation(address donor) public view returns (uint256) {
        return donations[donor];
    }

    /**
     * @notice 提取以太币（只有 owner 可以调用）
     * @param to 接收地址（必须是 payable）
     * @param amount 提取金额
     *
     * 使用 call 方式发送 ETH（推荐）
     */
    function withdraw(address payable to, uint256 amount) public {
        // 权限检查
        require(msg.sender == owner, "Only owner");
        require(to != address(0), "Invalid address");

        // 余额检查
        uint256 balance = address(this).balance;
        require(balance >= amount, "Insufficient balance");

        // 使用 call 发送 ETH（推荐，无 Gas 限制）
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(to, amount);
    }

    /**
     * @notice 提取所有以太币（只有 owner 可以调用）
     * @param to 接收地址
     */
    function withdrawAll(address payable to) public {
        require(msg.sender == owner, "Only owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdrawn(to, balance);
    }

    /**
     * @notice 捐赠并记录消息
     * @param message 捐赠消息
     */
    function donateWithMessage(string memory message) public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        totalReceived += msg.value;
        donations[msg.sender] += msg.value;

        // 注意：这里只是示例，不实际存储 message
        emit Received(msg.sender, msg.value);
    }

    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取合约信息
     * @return _name 代币名称
     * @return _symbol 代币符号
     * @return _totalSupply 总供应量
     * @return _owner 所有者
     * @return _treasury 国库
     * @return _launchDate 上线时间
     */
    function getContractInfo() public view returns (
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _owner,
        address _treasury,
        uint256 _launchDate
    ) {
        return (
            name,
            symbol,
            totalSupply,
            owner,
            treasury,
            launchDate
        );
    }
}
