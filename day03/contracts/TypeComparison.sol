// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TypeComparison
 * @notice 演示 Solidity 与其他语言（JavaScript、Java）的异同
 * @dev 帮助理解 Solidity 的类型系统特点
 */
contract TypeComparison {
    // ═══════════════════════════════════════════════════════════
    // Solidity vs JavaScript/Java 的差异
    // ═══════════════════════════════════════════════════════════
    
    // 1. Solidity 是静态类型，必须声明类型
    uint256 public number = 100;  // ✅ 必须声明类型
    // var number = 100;          // ❌ Solidity 不支持 var
    
    // 2. Solidity 有明确的数值范围
    uint8 public smallNum = 255;   // 最大值 255
    // uint8 public overflow = 256; // ❌ 编译错误：溢出

    // 3. Solidity 0.8+ 有自动溢出检查
    function safeAdd(uint8 a, uint8 b) public pure returns (uint8) {
        // Solidity 0.8+ 会自动检查溢出
        return a + b; // 如果溢出会 revert
    }
    
    // 4. 布尔值只有 true/false，没有 truthy/falsy
    bool public isTrue = true;
    bool public isFalse = false;
    // bool public truthy = 1;    // ❌ 编译错误：不能隐式转换
    
    // ═══════════════════════════════════════════════════════════
    // 整型范围演示
    // ═══════════════════════════════════════════════════════════
    
    // uint8: 0 到 255
    uint8 public uint8Min = 0;
    uint8 public uint8Max = 255;
    
    // uint256: 0 到 2^256 - 1
    uint256 public uint256Max = type(uint256).max;
    
    // int8: -128 到 127
    int8 public int8Min = type(int8).min;
    int8 public int8Max = type(int8).max;
    
    // int256: -2^255 到 2^255 - 1
    int256 public int256Min = type(int256).min;
    int256 public int256Max = type(int256).max;
    
    // ═══════════════════════════════════════════════════════════
    // 类型检查和转换
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取类型的最大值
     */
    function getTypeMax() public pure returns (
        uint8 maxUint8,
        uint256 maxUint256,
        int8 maxInt8,
        int256 maxInt256
    ) {
        return (
            type(uint8).max,
            type(uint256).max,
            type(int8).max,
            type(int256).max
        );
    }
    
    /**
     * @notice 获取类型的最小值
     */
    function getTypeMin() public pure returns (
        int8 minInt8,
        int256 minInt256
    ) {
        return (
            type(int8).min,
            type(int256).min
        );
    }
    
    // ═══════════════════════════════════════════════════════════
    // 默认值演示
    // ═══════════════════════════════════════════════════════════
    
    bool public defaultBool;      // false
    uint256 public defaultUint;   // 0
    int256 public defaultInt;     // 0
    
    /**
     * @notice 获取默认值
     */
    function getDefaults() public view returns (
        bool _bool,
        uint256 _uint,
        int256 _int
    ) {
        return (defaultBool, defaultUint, defaultInt);
    }
    
    // ═══════════════════════════════════════════════════════════
    // 可见性对比（与 Java/JavaScript 的差异）
    // ═══════════════════════════════════════════════════════════
    
    // Solidity 有明确的可见性修饰符
    uint256 public publicVar = 100;    // 类似 Java public
    uint256 private privateVar = 200; // 类似 Java private
    uint256 internal internalVar = 300; // Solidity 特有
    
    // JavaScript 没有真正的 private（ES6+ 有 #private）
    // Java 有 public, private, protected, package-private
    // Solidity 有 public, private, internal, external
    
    /**
     * @notice 演示可见性访问
     */
    function demonstrateVisibility() public view returns (
        uint256 _public,
        uint256 _private,
        uint256 _internal
    ) {
        return (publicVar, privateVar, internalVar);
    }
}

