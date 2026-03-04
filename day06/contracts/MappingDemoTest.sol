// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MappingDemoTest {
    // 基本映射
    mapping(address => uint256) public balance;
    mapping(uint256 => address) public idToAddress;
}