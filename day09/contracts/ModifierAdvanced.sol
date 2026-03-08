// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ModifierAdvanced
 * @notice 演示 modifier 的高级用法
 * @dev 用于学习 modifier 的复杂场景
 * 
 * 学习要点：
 * 1. modifier 中的条件逻辑
 * 2. modifier 中的状态修改
 * 3. modifier 中的循环和计算
 * 4. modifier 的 Gas 优化
 */
contract ModifierAdvanced {
    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════
    
    address public owner;
    uint256 public value;
    
    mapping(address => uint256) public callCounts;
    mapping(address => uint256) public lastCallTime;
    
    uint256 public cooldownPeriod = 60; // 60 秒冷却期
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event ValueSet(address indexed caller, uint256 value);
    event CallCountUpdated(address indexed caller, uint256 count);
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor() {
        owner = msg.sender;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 基础 Modifier
    // ═══════════════════════════════════════════════════════════
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 带状态修改的 Modifier
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 记录调用次数的 modifier
     * @dev 在函数执行前增加调用计数
     */
    modifier countCalls() {
        callCounts[msg.sender]++;
        emit CallCountUpdated(msg.sender, callCounts[msg.sender]);
        _;
    }
    
    /**
     * @notice 更新最后调用时间的 modifier
     * @dev 在函数执行前更新调用时间
     */
    modifier updateLastCallTime() {
        lastCallTime[msg.sender] = block.timestamp;
        _;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 带条件逻辑的 Modifier
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 冷却期 modifier
     * @dev 检查是否在冷却期内
     */
    modifier cooldown() {
        require(
            block.timestamp >= lastCallTime[msg.sender] + cooldownPeriod,
            "Cooldown period not expired"
        );
        _;
    }
    
    /**
     * @notice 限制调用次数的 modifier
     * @param _maxCalls 最大调用次数
     * @dev 检查调用次数是否超过限制
     */
    modifier limitCalls(uint256 _maxCalls) {
        require(callCounts[msg.sender] < _maxCalls, "Call limit exceeded");
        _;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 组合 Modifier 使用
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置值（带调用计数和冷却期）
     * @param _value 新值
     */
    function setValueWithCooldown(uint256 _value)
        public
        cooldown
        countCalls
        updateLastCallTime
    {
        value = _value;
        emit ValueSet(msg.sender, _value);
    }
    
    /**
     * @notice 设置值（限制调用次数）
     * @param _value 新值
     * @param _maxCalls 最大调用次数
     */
    function setValueWithLimit(uint256 _value, uint256 _maxCalls) 
        public 
        limitCalls(_maxCalls) 
        countCalls 
    {
        value = _value;
        emit ValueSet(msg.sender, _value);
    }
    
    // ═══════════════════════════════════════════════════════════
    // Owner 函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置冷却期（只有 owner 可以调用）
     * @param _period 冷却期（秒）
     */
    function setCooldownPeriod(uint256 _period) public onlyOwner {
        cooldownPeriod = _period;
    }
    
    /**
     * @notice 重置调用计数（只有 owner 可以调用）
     * @param _address 地址
     */
    function resetCallCount(address _address) public onlyOwner {
        callCounts[_address] = 0;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取调用次数
     * @param _address 地址
     * @return 调用次数
     */
    function getCallCount(address _address) public view returns (uint256) {
        return callCounts[_address];
    }
    
    /**
     * @notice 获取最后调用时间
     * @param _address 地址
     * @return 最后调用时间
     */
    function getLastCallTime(address _address) public view returns (uint256) {
        return lastCallTime[_address];
    }
    
    /**
     * @notice 检查是否可以调用（冷却期是否过期）
     * @param _address 地址
     * @return 是否可以调用
     */
    function canCall(address _address) public view returns (bool) {
        return block.timestamp >= lastCallTime[_address] + cooldownPeriod;
    }
}

