// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.24;

contract CompleteDemo {
    // constant 常量
    uint8 public constant decimals = 18;    // 代币精度
    uint256 public constant totalSupply = 1000000 * 10**18; // 总供应量
    address public constant burnAddress = 0x000000000000000000000000000000000000dEaD; // 燃烧地址

    // immutable 不可变量
    address public immutable owner;          // 合约所有者（部署者）
    address public immutable treasury;       // 国库地址
    uint256 public immutable launchData;     // 上线时间

    // 普通状态变量
    string public name;                     // 代币名称
    string public symbol;                   // 代币符号
    uint256 public totalSupplyCurrent;       // 当前总供应量
    mapping(address => uint256) public balanceOf; // 地址余额映射

    // 捐赠相关
    uint256 public totalReceived;           // 总接收金额
    uint256 public receiveCount;            // receive 调用次数
    uint256 public fallbackCount;           // fallback 调用次数
    mapping(address => uint256) public donations; // 地址 -> 捐赠金额`

    // 事件
    event Transfer(address indexed from, address indexed to, uint256 value); // 转账事件
    event Received(address indexed sender, uint256 amount); // 收到 ETH 事件
    event FallbackCalled(address indexed sender, uint256 amount, bytes data); // fallback 调用事件
    event Withdrawn(address indexed to, uint256 amount); // 提现事件

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
        require(_treasury != address(0), "Invalid Treasury address");
        // 赋值 immutable 变量（只能在构造函数中赋值一次）
        owner = msg.sender; // 部署者为所有者
        treasury = _treasury; // 设置国库地址
        launchData = block.timestamp; // 设置上线时间为当前区块时间

        // 初始化代币信息
        name = _name; // 设置代币名称
        symbol = _symbol; // 设置代币符号

        // 铸造初始代币给部署者
        totalSupplyCurrent = _initialSupply; // 设置当前总供应量
        balanceOf[msg.sender] = _initialSupply; // 将初始供应量分配给部署者

        // 触发转账事件（从地址0表示铸造）
        emit Transfer(address(0), msg.sender, _initialSupply);

    }

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
        // 增加 receive函数的调用次数
        receiveCount ++;

        // 记录捐赠（首次捐赠时）
        if (donations[msg.sender] == 0 && msg.value > 0){
            donations[msg.sender] = msg.value; // 记录捐赠金额
        }

        // 触发收到 ETH 事件
        emit Received(msg.sender, msg.value);
    }

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
        // 增加 receive函数的调用次数
        receiveCount ++;

        // 记录捐赠（首次捐赠时）
        if (donations[msg.sender] == 0 && msg.value > 0){
            donations[msg.sender] = msg.value; // 记录捐赠金额
        }

        // 触发 fallback 调用事件
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    /**
     * @notice 转账函数
     * @param to 接收地址
     * @param amount 转账金额
     * @return success 是否成功
     */
    function transfer(address to, uint256 amount) public returns (bool success){
        require(to != address(0), "invalid address");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");

        // 执行转账 - 从发送者扣除
        balanceOf[msg.sender] -= amount;
        // 执行转账 - 给接收者增加
        balanceOf[to] += amount;
        // 触发转账事件
        emit Transfer(msg.sender, to, amount);
        // 返回成功
        return true;
    }

    /**
     * @notice 铸造新代币（仅 owner）
     * @param account 接收地址
     * @param amount 铸造金额
     */
    function mint(address account, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        require(account != address(0), "Invalid address");

        // 增加总供应量
        totalSupplyCurrent += amount;
        // 给接收地址增加余额
        balanceOf[account] += amount;

        // 触发转账事件（从地址0表示铸造）
        emit Transfer(address(0), account, amount);
    }
}