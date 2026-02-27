// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HelloWorld
 * @notice 第一个 Solidity 智能合约 - Hello World
 * @dev 这是一个简单的示例合约，用于学习 Solidity 基础
 *
 * 学习要点：
 * 1. Solidity 版本声明 (pragma solidity)
 * 2. 合约声明 (contract)
 * 3. 状态变量 (state variable)
 * 4. 函数 (function)
 * 5. 可见性修饰符 (public)
 * 6. 视图函数 (view)
 * 7. 事件 (event)
 */
contract HelloWorld {
    // 状态变量：存储在区块链上
    string public message;

    // 事件：用于记录区块链上的活动
    event MessageChanged(string oldMessage, string newMessage);

    /**
     * @notice 构造函数：在合约部署时执行一次
     * @param _message 初始消息
     */
    constructor(string memory _message) {
        message = _message;
        emit MessageChanged("", _message);
    }

    /**
     * @notice 设置消息
     * @param _newMessage 新消息
     */
    function setMessage(string memory _newMessage) public {
        string memory oldMessage = message;
        message = _newMessage;
        emit MessageChanged(oldMessage, _newMessage);
    }

    /**
     * @notice 获取当前消息（只读函数）
     * @return 当前消息
     */
    function getMessage() public view returns (string memory) {
        return message;
    }

    /**
     * @notice 获取合约部署者地址
     * @return 部署者地址
     */
    function getDeployer() public view returns (address) {
        return msg.sender;
    }
}
