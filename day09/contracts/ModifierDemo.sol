// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ModifierDemo
 * @notice 演示 Solidity 函数修改器（modifier）的使用
 * @dev 用于学习 modifier 的定义和使用，控制权限和逻辑复用
 * 
 * 学习要点：
 * 1. modifier 定义：modifier onlyOwner()
 * 2. modifier 使用：在函数中使用 modifier
 * 3. modifier 参数：带参数的 modifier
 * 4. modifier 组合：多个 modifier 组合使用
 * 5. modifier 执行顺序：_; 的位置
 */
contract ModifierDemo {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    address public owner;
    uint256 public value;
    bool public paused;
    
    mapping(address => bool) public admins;
    mapping(address => uint256) public balances;
    
    uint256 public minValue = 10;
    uint256 public maxValue = 1000;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event ValueSet(address indexed caller, uint256 oldValue, uint256 newValue);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event Paused(address indexed caller);
    event Unpaused(address indexed caller);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        owner = msg.sender;
        paused = false;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Modifier 定义（如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice onlyOwner modifier（如题目要求）
     * @dev 只有 owner 可以调用
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;  // 执行函数体
    }
    
    /**
     * @notice onlyAdmin modifier
     * @dev 只有 admin 或 owner 可以调用
     */
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admin or owner");
        _;
    }
    
    /**
     * @notice whenNotPaused modifier
     * @dev 合约未暂停时可以调用
     */
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    /**
     * @notice whenPaused modifier
     * @dev 合约暂停时可以调用
     */
    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }
    
    /**
     * @notice validValue modifier（带参数）
     * @param _value 要检查的值
     * @dev 检查值是否在有效范围内
     */
    modifier validValue(uint256 _value) {
        require(_value >= minValue && _value <= maxValue, "Value out of range");
        _;
    }
    
    /**
     * @notice hasBalance modifier（带参数）
     * @param _amount 需要的余额
     * @dev 检查调用者是否有足够的余额
     */
    modifier hasBalance(uint256 _amount) {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        _;
    }
    
    /**
     * @notice nonZeroAddress modifier（带参数）
     * @param _address 要检查的地址
     * @dev 检查地址不为零地址
     */
    modifier nonZeroAddress(address _address) {
        require(_address != address(0), "Zero address not allowed");
        _;
    }
    
    /**
     * @notice 带前置和后置逻辑的 modifier
     * @dev 演示 _; 的位置
     */
    modifier withLogging() {
        // 前置逻辑：记录调用前状态
        uint256 oldValue = value;
        _;  // 执行函数体
        // 后置逻辑：记录调用后状态
        emit ValueSet(msg.sender, oldValue, value);
    }
    
    // ═══════════════════════════════════════════════════════════
    // Owner 函数（使用 onlyOwner modifier，如题目要求）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置值（只有 owner 可以调用，如题目要求）
     * @param _value 新值
     */
    function setValue(uint256 _value) public onlyOwner {
        value = _value;
    }
    
    /**
     * @notice 设置最小值和最大值（只有 owner 可以调用）
     * @param _min 最小值
     * @param _max 最大值
     */
    function setMinMax(uint256 _min, uint256 _max) public onlyOwner {
        require(_min < _max, "Min must be less than max");
        minValue = _min;
        maxValue = _max;
    }
    
    /**
     * @notice 转移所有权（只有 owner 可以调用）
     * @param _newOwner 新 owner
     */
    function transferOwnership(address _newOwner) public onlyOwner nonZeroAddress(_newOwner) {
        owner = _newOwner;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Admin 函数（使用 onlyAdmin modifier）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 添加管理员（只有 owner 可以调用）
     * @param _admin 管理员地址
     */
    function addAdmin(address _admin) public onlyOwner nonZeroAddress(_admin) {
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    /**
     * @notice 移除管理员（只有 owner 可以调用）
     * @param _admin 管理员地址
     */
    function removeAdmin(address _admin) public onlyOwner {
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }
    
    /**
     * @notice 管理员设置值（admin 或 owner 可以调用）
     * @param _value 新值
     */
    function adminSetValue(uint256 _value) public onlyAdmin {
        value = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Pause 函数（使用 whenNotPaused/whenPaused modifier）
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 暂停合约（只有 owner 可以调用）
     */
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }
    
    /**
     * @notice 恢复合约（只有 owner 可以调用）
     */
    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    /**
     * @notice 设置值（合约未暂停时可以调用）
     * @param _value 新值
     */
    function setValueWhenNotPaused(uint256 _value) public whenNotPaused {
        value = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 带参数的 Modifier 使用
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置值（带值验证）
     * @param _value 新值
     */
    function setValueWithValidation(uint256 _value) public validValue(_value) {
        value = _value;
    }
    
    /**
     * @notice 设置余额
     * @param _account 账户地址
     * @param _amount 余额
     */
    function setBalance(address _account, uint256 _amount) public nonZeroAddress(_account) {
        balances[_account] = _amount;
    }
    
    /**
     * @notice 提取余额（需要足够的余额）
     * @param _amount 提取数量
     */
    function withdraw(uint256 _amount) public hasBalance(_amount) {
        balances[msg.sender] -= _amount;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Modifier 组合使用
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置值（组合多个 modifier）
     * @param _value 新值
     */
    function setValueWithMultipleModifiers(uint256 _value) 
        public 
        onlyOwner 
        whenNotPaused 
        validValue(_value) 
        withLogging 
    {
        value = _value;
    }
    
    /**
     * @notice 管理员设置值（组合多个 modifier）
     * @param _value 新值
     */
    function adminSetValueWithModifiers(uint256 _value) 
        public 
        onlyAdmin 
        whenNotPaused 
        validValue(_value) 
    {
        value = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // Modifier 执行顺序演示
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 演示 modifier 执行顺序
     * @dev modifier 按顺序执行，_; 位置决定函数体执行时机
     */
    modifier modifierA() {
        // 前置逻辑 A
        _;  // 执行函数体
        // 后置逻辑 A
    }
    
    modifier modifierB() {
        // 前置逻辑 B
        _;  // 执行函数体
        // 后置逻辑 B
    }
    
    /**
     * @notice 演示 modifier 执行顺序
     * @dev 执行顺序：modifierA 前置 -> modifierB 前置 -> 函数体 -> modifierB 后置 -> modifierA 后置
     */
    function demonstrateModifierOrder() public modifierA modifierB {
        // 函数体
        value = 9999;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取值
     * @return 当前值
     */
    function getValue() public view returns (uint256) {
        return value;
    }
    
    /**
     * @notice 检查是否是管理员
     * @param _address 地址
     * @return 是否是管理员
     */
    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] || _address == owner;
    }
    
    /**
     * @notice 获取余额
     * @param _account 账户地址
     * @return 余额
     */
    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }
}

