// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AddressDemo
 * @notice 演示 Solidity 地址类型的使用
 * @dev 用于学习 address 类型、msg.sender、msg.value 等预定义变量
 * 
 * 学习要点：
 * 1. address 类型：20 字节的地址
 * 2. address payable：可以接收 ETH 的地址
 * 3. msg.sender：交易发送者
 * 4. msg.value：发送的 ETH 数量
 * 5. address(this)：当前合约地址
 * 6. 地址比较和转换
 */
contract AddressDemo {
    // ═══════════════════════════════════════════════════════════
    // 地址类型变量
    // ═══════════════════════════════════════════════════════════
    
    // 普通地址（不能直接接收 ETH）
    address public owner;
    address public manager;
    
    // payable 地址（可以接收 ETH）
    address payable public treasury;
    
    // 地址数组
    address[] public members;
    
    // 地址映射
    mapping(address => bool) public isMember;
    mapping(address => uint256) public balances;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event MemberAdded(address indexed member);
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor(address _manager) {
        // msg.sender 是部署者地址
        owner = msg.sender;
        manager = _manager;
        
        // 将部署者转换为 payable 地址作为 treasury
        treasury = payable(msg.sender);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 地址操作函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取当前合约地址
     * @return 合约地址
     */
    function getContractAddress() public view returns (address) {
        return address(this);
    }
    
    /**
     * @notice 获取交易发送者地址
     * @return 发送者地址
     */
    function getSender() public view returns (address) {
        return msg.sender;
    }
    
    /**
     * @notice 获取发送的 ETH 数量
     * @return ETH 数量（wei）
     */
    function getValue() public payable returns (uint256) {
        return msg.value;
    }
    
    /**
     * @notice 获取所有信息
     * @return contractAddress 合约地址
     * @return sender 发送者地址
     * @return value 发送的 ETH 数量
     */
    function getAllInfo() public payable returns (
        address contractAddress,
        address sender,
        uint256 value
    ) {
        return (address(this), msg.sender, msg.value);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 地址比较
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 检查地址是否为零地址
     * @param _address 要检查的地址
     * @return 是否为零地址
     */
    function isZeroAddress(address _address) public pure returns (bool) {
        return _address == address(0);
    }
    
    /**
     * @notice 比较两个地址是否相等
     * @param _addr1 地址1
     * @param _addr2 地址2
     * @return 是否相等
     */
    function compareAddresses(address _addr1, address _addr2) public pure returns (bool) {
        return _addr1 == _addr2;
    }
    
    /**
     * @notice 检查调用者是否是 owner
     * @return 是否是 owner
     */
    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 地址转换
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 将 address 转换为 address payable
     * @param _address 普通地址
     * @return payable 地址
     */
    function toPayable(address _address) public pure returns (address payable) {
        return payable(_address);
    }
    
    /**
     * @notice 将 address payable 转换为 address
     * @param _payableAddress payable 地址
     * @return 普通地址
     */
    function fromPayable(address payable _payableAddress) public pure returns (address) {
        return address(_payableAddress);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 成员管理
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加成员
     * @param _member 成员地址
     */
    function addMember(address _member) public {
        require(_member != address(0), "Invalid address");
        require(!isMember[_member], "Already a member");
        
        members.push(_member);
        isMember[_member] = true;
        
        emit MemberAdded(_member);
    }
    
    /**
     * @notice 获取成员数量
     * @return 成员数量
     */
    function getMemberCount() public view returns (uint256) {
        return members.length;
    }
    
    /**
     * @notice 获取所有成员
     * @return 成员地址数组
     */
    function getAllMembers() public view returns (address[] memory) {
        return members;
    }
    
    // ═══════════════════════════════════════════════════════════
    // ETH 操作（需要 payable）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 接收 ETH
     */
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @notice 存款（显式调用）
     */
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @notice 提取 ETH
     * @param _amount 提取数量
     */
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        require(address(this).balance >= _amount, "Contract balance insufficient");
        
        balances[msg.sender] -= _amount;
        
        // 需要将地址转换为 payable 才能转账
        payable(msg.sender).transfer(_amount);
        
        emit Withdrawal(msg.sender, _amount);
    }
    
    /**
     * @notice 获取合约余额
     * @return 合约 ETH 余额
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice 获取账户余额
     * @param _account 账户地址
     * @return 账户余额
     */
    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }
    
    // ═══════════════════════════════════════════════════════════
    // Owner 操作
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 更改 owner（只有当前 owner 可以）
     * @param _newOwner 新 owner 地址
     */
    function changeOwner(address _newOwner) public {
        require(msg.sender == owner, "Only owner can change owner");
        require(_newOwner != address(0), "Invalid address");
        
        address oldOwner = owner;
        owner = _newOwner;
        
        emit OwnerChanged(oldOwner, _newOwner);
    }
    
    /**
     * @notice 设置 treasury（只有 owner 可以）
     * @param _treasury 新的 treasury 地址
     */
    function setTreasury(address payable _treasury) public {
        require(msg.sender == owner, "Only owner can set treasury");
        require(_treasury != address(0), "Invalid address");
        
        treasury = _treasury;
    }
}

