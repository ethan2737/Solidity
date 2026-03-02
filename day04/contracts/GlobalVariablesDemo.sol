// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GlobalVariablesDemo
 * @notice 演示 Solidity 全局变量和预定义变量
 * @dev 用于学习 msg.sender、msg.value、block、tx 等全局变量
 * 
 * 学习要点：
 * 1. msg.sender：交易发送者
 * 2. msg.value：发送的 ETH 数量
 * 3. msg.data：完整的调用数据
 * 4. block.timestamp：区块时间戳
 * 5. block.number：区块号
 * 6. block.coinbase：矿工地址
 * 7. tx.origin：交易发起者（注意安全风险）
 * 8. tx.gasprice：Gas 价格
 */
contract GlobalVariablesDemo {
    // ═══════════════════════════════════════════════════════════
    // 记录结构
    // ═══════════════════════════════════════════════════════════
    
    struct TransactionInfo {
        address sender;
        uint256 value;
        uint256 timestamp;
        uint256 blockNumber;
        address origin;
        uint256 gasPrice;
    }
    
    TransactionInfo[] public transactions;
    
    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════
    
    event TransactionRecorded(
        address indexed sender,
        uint256 value,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    // ═══════════════════════════════════════════════════════════
    // msg 变量
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 msg.sender（交易发送者）
     * @return 发送者地址
     */
    function getSender() public view returns (address) {
        return msg.sender;
    }
    
    /**
     * @notice 获取 msg.value（发送的 ETH 数量）
     * @return ETH 数量（wei）
     */
    function getValue() public payable returns (uint256) {
        return msg.value;
    }
    
    /**
     * @notice 获取 msg.data（完整的调用数据）
     * @return 调用数据
     */
    function getData() public pure returns (bytes memory) {
        return msg.data;
    }
    
    /**
     * @notice 获取 msg.sig（函数选择器）
     * @return 函数选择器（前4字节）
     */
    function getSig() public pure returns (bytes4) {
        return msg.sig;
    }
    
    // ═══════════════════════════════════════════════════════════
    // block 变量
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 block.timestamp（区块时间戳）
     * @return 时间戳（Unix 时间）
     */
    function getTimestamp() public view returns (uint256) {
        return block.timestamp;
    }
    
    /**
     * @notice 获取 block.number（区块号）
     * @return 区块号
     */
    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }
    
    /**
     * @notice 获取 block.coinbase（矿工地址）
     * @return 矿工地址
     */
    function getCoinbase() public view returns (address) {
        return block.coinbase;
    }
    
    /**
     * @notice 获取 block.prevrandao（区块随机数，Paris 升级后替代 difficulty）
     * @return 区块随机数
     */
    function getDifficulty() public view returns (uint256) {
        return block.prevrandao;
    }
    
    /**
     * @notice 获取 block.gaslimit（区块 Gas 限制）
     * @return Gas 限制
     */
    function getGasLimit() public view returns (uint256) {
        return block.gaslimit;
    }
    
    // ═══════════════════════════════════════════════════════════
    // tx 变量
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取 tx.origin（交易发起者）
     * @dev 注意：tx.origin 可能有安全风险，通常应该使用 msg.sender
     * @return 交易发起者地址
     */
    function getOrigin() public view returns (address) {
        return tx.origin;
    }
    
    /**
     * @notice 获取 tx.gasprice（Gas 价格）
     * @return Gas 价格（wei）
     */
    function getGasPrice() public view returns (uint256) {
        return tx.gasprice;
    }
    
    // ═══════════════════════════════════════════════════════════
    // 综合信息
    // ═══════════════════════════════════════════════════════════
    
    /**
     * @notice 获取所有 msg 信息
     * @return sender 发送者
     * @return value ETH 数量
     * @return data 调用数据
     * @return sig 函数选择器
     */
    function getAllMsgInfo() public payable returns (
        address sender,
        uint256 value,
        bytes memory data,
        bytes4 sig
    ) {
        return (msg.sender, msg.value, msg.data, msg.sig);
    }
    
    /**
     * @notice 获取所有 block 信息
     * @return timestamp 时间戳
     * @return number 区块号
     * @return coinbase 矿工地址
     * @return prevrandao 区块随机数（Paris 升级后替代 difficulty）
     * @return gasLimit Gas 限制
     */
    function getAllBlockInfo() public view returns (
        uint256 timestamp,
        uint256 number,
        address coinbase,
        uint256 prevrandao,
        uint256 gasLimit
    ) {
        return (
            block.timestamp,
            block.number,
            block.coinbase,
            block.prevrandao,
            block.gaslimit
        );
    }
    
    /**
     * @notice 获取所有 tx 信息
     * @return origin 交易发起者
     * @return gasPrice Gas 价格
     */
    function getAllTxInfo() public view returns (
        address origin,
        uint256 gasPrice
    ) {
        return (tx.origin, tx.gasprice);
    }
    
    /**
     * @notice 记录交易信息
     */
    function recordTransaction() public payable {
        TransactionInfo memory info = TransactionInfo({
            sender: msg.sender,
            value: msg.value,
            timestamp: block.timestamp,
            blockNumber: block.number,
            origin: tx.origin,
            gasPrice: tx.gasprice
        });
        
        transactions.push(info);
        
        emit TransactionRecorded(
            msg.sender,
            msg.value,
            block.timestamp,
            block.number
        );
    }
    
    /**
     * @notice 获取交易记录数量
     * @return 记录数量
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @notice 获取交易记录
     * @param _index 索引
     * @return 交易信息
     */
    function getTransaction(uint256 _index) public view returns (TransactionInfo memory) {
        require(_index < transactions.length, "Index out of bounds");
        return transactions[_index];
    }
    
    // ═══════════════════════════════════════════════════════════
    // 接收 ETH
    // ═══════════════════════════════════════════════════════════
    
    receive() external payable {
        recordTransaction();
    }
}

