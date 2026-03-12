// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITargetContract
 * @notice 目标合约接口定义
 */
interface ITargetContract {
    function getValue() external view returns(uint256);
    function setValue(uint256 _value) external;
    function incrementCounter() external;
    function getInfo() external view returns(uint256, address, uint256, address);
}

/**
 * @title ComprehensiveDemo
 * @notice 综合演示合约 - 整合 ABI 编码、合约交互、call 和 delegatecall
 * @dev 本合约演示 Solidity 高级特性，包括：
 * 1. ABI 编码和解码（abi.encode, abi.encodePacked, abi.encodeWithSignature 等）
 * 2. 合约间交互（接口调用、low-level call）
 * 3. call vs delegatecall 的区别
 * 4. 错误处理和返回值解析
 *
 * 学习要点：
 * - 理解 ABI 编码规则
 * - 掌握合约间交互的多种方式
 * - 理解 call 和 delegatecall 的本质区别
 * - 了解存储布局对 delegatecall 的重要性
 */
contract ComprehensiveDemo {
    uint256 public value;
    address public owner;
    uint256 public counter;
    string public name;

    address public targetContract;      // 目标合约地址
    address public proxyContract;       // 代理合约地址
    mapping(address => uint256) public callCounts; // 记录每个地址的调用次数

    // ABI 编码事件
    event EncodeData(bytes indexed data, string method);
    event DecodedData(uint256 value, string name, address addr);
    event HashComputed(bytes32 hash);

    // 合约交互事件
    event ContractCalled(address indexed target, bytes selector, bool success);
}