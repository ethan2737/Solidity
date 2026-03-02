// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// 定义合约：类型比较
contract TypeComparison {
    // solidity vs javascript/java 的差异

    // 1. solidity 是静态类型，必须声明类型
    uint256 public number = 100;

    // 2. Solidity 有明确的数值范围
    uint8 public smallNum = 255; // 最大值 255，超出则会编译出错：溢出

    // 3. solidity 0.8+ 版本有溢出检查
    function safeAdd(uint8 a, uint8 b) public pure returns (uint8){
        // solidity 0.8+ 会自动检查溢出
        return a + b; // 如果溢出会 revert(恢复)
    }

    // 4. 布尔值只有true/false, 没有truthy/falsy
    bool public isTrue = true;
    bool public isFalse = false;

    // 整型范围演示
    // uint8 0~255
    uint8 public uint8Min = 0;
    uint8 public uint8Max = 255;

    // uint256 0~2^256-1
    // type(X).min/max 获取变量的元信息，最大值或者最小值
    uint256 public uint256Max = type(uint256).max;

    // int8: -128 ~ 127
    int8 public int8Min = type(int8).min;
    int8 public int8Max = type(int8).max;

    // int256: -2^255 ~ 2^255 -1
    int256 public int256Min = type(int256).min;
    int256 public int256Max = type(int256).max;

    // 检查类型转换
    // 获取类型的最大值
    function getTypeMax() public pure returns (uint8 maxUint8, uint256 maxUint256, int8 maxInt8, int256 maxInt256){
        return (
            type(uint8).max,
            type(uint256).max,
            type(int8).max,
            type(int256).max
        );
    }

    // 获取类型的最小值
    function getTypeMin() public pure returns (
        int8 minInt8,
        int256 minInt256
    ) {
        return (
            type(int8).min,
            type(int256).min
        );
    }

    // 默认值演示
    bool public defaultBool; //false
    uint256 public defaultUint; //0
    int256 public defaultInt; // 0

    /**
    * @notice 获取默认值
    */
    function getDefault() public view returns (bool _bool, uint256 _uint, int256 _int){
        return (
            defaultBool, defaultUint, defaultInt
        );
    }

    // 可见性对比（与 Java/JavaScript 的差异）
    // Solidity 有明确的可见性修饰符
    uint256 public publicVar = 100; // 公共的，全部可见
    uint256 private privateVar = 200; // 私有的，当前合约可见
    uint256 internal internalVar = 300; // 当前合约+子合约（继承）可见

    // Solidity 有 public, private, internal, external
    /**
     * @notice 演示可见性访问
     */
    function demonstrateVisibility() public view returns(
        uint256 _public,
        uint256 _private,
        uint256 _internal
    ){
        return (publicVar, privateVar, internalVar);
    }

}