// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VariableTypes
 * @notice 演示 Solidity 变量类型：布尔和整型
 * @dev 用于学习变量声明、类型、可见性修饰符
 * 
 * 学习要点：
 * 1. 布尔类型 (bool)
 * 2. 整型 (int8-int256, uint8-uint256)
 * 3. 变量声明和初始化
 * 4. 可见性修饰符 (public, private, internal, external)
 * 5. 常量 (constant, immutable)
 */
contract VariableTypes {
    // ═══════════════════════════════════════════════════════════
    // 布尔类型 (bool)
    // ═══════════════════════════════════════════════════════════
    
    // public: 自动生成 getter 函数，外部可访问
    bool public isActive = true;
    
    // private: 只能在合约内部访问
    bool private isLocked = false;
    
    // internal: 合约内部和继承合约可访问（默认）
    bool internal isPaused = false;
    
    // ═══════════════════════════════════════════════════════════
    // 无符号整型 (uint)
    // ═══════════════════════════════════════════════════════════
    
    // uint8: 0 到 2^8 - 1 (0 到 255)
    uint8 public smallNumber = 100;
    
    // uint256: 0 到 2^256 - 1 (默认，通常简写为 uint)
    uint256 public largeNumber = 1000000;
    uint public defaultUint = 42; // uint 等同于 uint256
    
    // private uint
    uint private secretNumber = 999;
    
    // ═══════════════════════════════════════════════════════════
    // 有符号整型 (int)
    // ═══════════════════════════════════════════════════════════
    
    // int8: -2^7 到 2^7 - 1 (-128 到 127)
    int8 public smallInt = -50;
    
    // int256: -2^255 到 2^255 - 1 (默认，通常简写为 int)
    int256 public largeInt = -1000000;
    int public defaultInt = -42; // int 等同于 int256
    
    // ═══════════════════════════════════════════════════════════
    // 常量 (constant)
    // ═══════════════════════════════════════════════════════════
    
    // constant: 编译时常量，不能修改，不占用存储
    uint256 public constant MAX_VALUE = 1000000;
    bool public constant IS_ENABLED = true;
    
    // ═══════════════════════════════════════════════════════════
    // 不可变变量 (immutable)
    // ═══════════════════════════════════════════════════════════
    
    // immutable: 只能在构造函数中设置一次，之后不能修改
    uint256 public immutable INITIAL_VALUE;
    
    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════
    
    constructor(uint256 _initialValue) {
        INITIAL_VALUE = _initialValue;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 公共函数：设置和获取值
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 设置布尔值（public 函数，外部可调用）
     */
    function setIsActive(bool _value) public {
        isActive = _value;
    }
    
    /**
     * @notice 设置小数字（演示 uint8）
     */
    function setSmallNumber(uint8 _value) public {
        require(_value <= 255, "Value exceeds uint8 limit");
        smallNumber = _value;
    }
    
    /**
     * @notice 设置大数字（演示 uint256）
     */
    function setLargeNumber(uint256 _value) public {
        largeNumber = _value;
    }
    
    /**
     * @notice 设置有符号整数（演示 int）
     */
    function setSmallInt(int8 _value) public {
        require(_value >= -128 && _value <= 127, "Value out of int8 range");
        smallInt = _value;
    }
    
    /**
     * @notice 设置大整数（演示 int256）
     */
    function setLargeInt(int256 _value) public {
        largeInt = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 内部函数：访问 private 变量
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取私有布尔值（internal 函数）
     */
    function getIsLocked() public view returns (bool) {
        return isLocked;
    }
    
    /**
     * @notice 设置私有布尔值
     */
    function setIsLocked(bool _value) public {
        isLocked = _value;
    }
    
    /**
     * @notice 获取私有数字（演示 private 变量的访问）
     */
    function getSecretNumber() public view returns (uint) {
        return secretNumber;
    }
    
    /**
     * @notice 设置私有数字
     */
    function setSecretNumber(uint _value) public {
        secretNumber = _value;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 外部函数 (external)
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 外部函数示例（只能从外部调用）
     */
    function externalFunction() external pure returns (string memory) {
        return "This is an external function";
    }
    
    // ═══════════════════════════════════════════════════════════
    // 视图函数 (view)：只读，不修改状态
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有布尔值
     */
    function getAllBooleans() public view returns (
        bool _isActive,
        bool _isLocked,
        bool _isPaused
    ) {
        return (isActive, isLocked, isPaused);
    }
    
    /**
     * @notice 获取所有无符号整数
     */
    function getAllUints() public view returns (
        uint8 _smallNumber,
        uint256 _largeNumber,
        uint _defaultUint,
        uint _secretNumber
    ) {
        return (smallNumber, largeNumber, defaultUint, secretNumber);
    }
    
    /**
     * @notice 获取所有有符号整数
     */
    function getAllInts() public view returns (
        int8 _smallInt,
        int256 _largeInt,
        int _defaultInt
    ) {
        return (smallInt, largeInt, defaultInt);
    }
    
    /**
     * @notice 获取所有常量
     */
    function getConstants() public pure returns (
        uint256 _maxValue,
        bool _isEnabled
    ) {
        return (MAX_VALUE, IS_ENABLED);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 纯函数 (pure)：不读取也不修改状态
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 纯函数示例：计算两个数的和
     */
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    /**
     * @notice 纯函数示例：比较两个布尔值
     */
    function compareBooleans(bool a, bool b) public pure returns (bool) {
        return a == b;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 类型转换示例
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 类型转换：uint8 转 uint256
     */
    function convertUint8ToUint256(uint8 _value) public pure returns (uint256) {
        return uint256(_value);
    }
    
    /**
     * @notice 类型转换：uint256 转 uint8（可能溢出）
     */
    function convertUint256ToUint8(uint256 _value) public pure returns (uint8) {
        require(_value <= 255, "Value too large for uint8");
        return uint8(_value);
    }
    
    /**
     * @notice 类型转换：int 转 uint（注意负数）
     */
    function convertIntToUint(int256 _value) public pure returns (uint256) {
        require(_value >= 0, "Cannot convert negative to uint");
        return uint256(_value);
    }
}

