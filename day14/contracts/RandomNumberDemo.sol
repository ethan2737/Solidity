// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RandomNumberDemo
 * @notice 演示不安全的随机数生成方法（仅用于学习）
 * @dev 展示为什么链上随机数不安全
 */
contract RandomNumberDemo {
    // 随机数计数器
    uint256 public nonce;
    // 用户随机数映射
    mapping(address => uint256) public userRandomNumbers;

    // 事件
    event RandomNumberGenerated(address indexed user, uint256 randomNumber, string method);

    /**
     * @notice 方法1：使用 blockhash 生成随机数（不安全）
     * @dev 矿工可以操纵 blockhash
     */
    function generateRandomWithBlockhash() public returns (uint256) {
        uint256 randomNumber = uint256(blockhash(block.number - 1)) % 100;
        userRandomNumbers[msg.sender] = randomNumber;
        emit RandomNumberGenerated(msg.sender, randomNumber, "blockhash");
        return randomNumber;
    }

    /**
     * @notice 方法2：使用 block.timestamp 生成随机数（不安全）
     * @dev 矿工可以在一定范围内操纵 timestamp
     */
    function generateRandomWithTimestamp() public returns (uint256) {
        uint256 randomNumber = block.timestamp % 100;
        userRandomNumbers[msg.sender] = randomNumber;
        emit RandomNumberGenerated(msg.sender, randomNumber, "timestamp");
        return randomNumber;
    }

    /**
     * @notice 方法3：使用 block.prevrandao 生成随机数（不安全）
     * @dev 在 PoS 网络中，prevrandao 是可预测的
     */
    function generateRandomWithPrevRandao() public returns (uint256) {
        uint256 randomNumber = block.prevrandao % 100;
        userRandomNumbers[msg.sender] = randomNumber;
        emit RandomNumberGenerated(msg.sender, randomNumber, "prevrandao");
        return randomNumber;
    }

    /**
     * @notice 方法4：组合多个因素（仍然不安全）
     * @dev 即使组合，如果输入都是公开的，仍然可预测
     */
    function generateRandomWithCombination() public returns (uint256) {
        uint256 randomNumber = uint256(
            keccak256(abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                msg.sender,
                nonce
            ))
        ) % 100;

        nonce++;
        userRandomNumbers[msg.sender] = randomNumber;
        emit RandomNumberGenerated(msg.sender, randomNumber, "combination");
        return randomNumber;
    }

    /**
     * @notice 获取用户的随机数
     */
    function getUserRandomNumber(address user) public view returns (uint256) {
        return userRandomNumbers[user];
    }
}
