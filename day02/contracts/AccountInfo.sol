// SPDX-License-Identifier: MIT
// 许可证声明：MIT 许可证

pragma solidity ^0.8.24;
// 版本声明：使用 Solidity 编译器 0.8.24 版本

/**
 * @title AccountInfo - 账户信息演示合约
 * @notice 演示如何获取和使用账户、交易、区块信息
 * @dev 包含以太坊全局变量的使用示例
 *
 * 学习要点：
 * 1. msg.sender - 交易发送者
 * 2. msg.value - 发送的 ETH 数量
 * 3. block.timestamp - 区块时间戳
 * 4. block.number - 区块号
 * 5. tx.origin - 交易发起者（注意安全风险）
 * 6. address.balance - 账户余额查询
 *
 * 行业背景：
 * 全局变量是智能合约获取链上信息的主要方式：
 * - msg.sender：用于权限验证、用户识别
 * - block.timestamp：用于时间锁、释放计划
 * - msg.value：用于接收 ETH、支付逻辑
 *
 * 安全警告：
 * - tx.origin 攻击：永远不要用 tx.origin 做权限验证
 * - block.timestamp 可被矿工微调（前后 15 秒内）
 * - 重要时间敏感应用应使用区块高度而非时间戳
 */
contract AccountInfo {

    // ========== 自定义数据类型 ==========

    /**
     * @notice 账户记录结构体
     * @dev 使用 struct 组织相关数据
     *
     * 结构体说明：
     * - 将多个相关变量组合成一个类型
     * - 方便存储和管理
     * - 可以作为函数参数和返回值
     */
    struct AccountRecord {
        address account;      // 账户地址
        uint256 balance;      // ETH 余额
        uint256 timestamp;    // 时间戳
        uint256 blockNumber;  // 区块号
    }

    // ========== 状态变量（Storage） ==========

    /// @notice 账户历史记录映射
    /// @dev 记录每个账户的历史信息
    /// 数据结构：address => AccountRecord[]（地址映射到记录数组）
    mapping(address => AccountRecord[]) public accountHistory;

    // ========== 事件 ==========

    /**
     * @notice 账户信息记录事件
     * @dev 记录每次账户信息的保存
     * @param account 账户地址（indexed 可被索引）
     * @param balance ETH 余额
     * @param timestamp 时间戳
     * @param blockNumber 区块号
     */
    event AccountInfoRecorded(
        address indexed account,
        uint256 balance,
        uint256 timestamp,
        uint256 blockNumber
    );

    // ========== 主逻辑函数 ==========

    /**
     * @notice 记录账户信息
     * @dev 将当前调用者的账户信息保存到历史记录
     *
     * 使用场景：
     * - 记录用户首次访问时间
     * - 审计追踪
     * - 用户活动历史
     *
     * 实现步骤：
     * 1. 创建新的记录结构体
     * 2. 填充账户信息
     * 3. 添加到历史记录数组
     * 4. 触发事件
     */
    function recordAccountInfo() public {
        // 步骤 1：创建 Memory 中的记录
        // memory 表示临时存储，函数结束后清除
        AccountRecord memory record = AccountRecord({
            account: msg.sender,              // 调用者地址
            balance: address(msg.sender).balance,  // 调用者 ETH 余额
            timestamp: block.timestamp,       // 当前区块时间戳
            blockNumber: block.number         // 当前区块号
        });

        // 步骤 2：添加到 Storage 中的历史记录数组
        // push 会在数组末尾添加新元素
        accountHistory[msg.sender].push(record);

        // 步骤 3：触发事件
        emit AccountInfoRecorded(
            record.account,
            record.balance,
            record.timestamp,
            record.blockNumber
        );
    }

    /**
     * @notice 获取当前账户信息
     * @dev 视图函数，返回当前调用者的账户信息
     * @return account 账户地址
     * @return balance ETH 余额
     * @return timestamp 时间戳
     * @return blockNumber 区块号
     *
     * Gas 说明：
     * - view 函数不修改状态
     * - 调用不消耗 Gas（离线执行）
     */
    function getCurrentAccountInfo() public view returns (
        address account,
        uint256 balance,
        uint256 timestamp,
        uint256 blockNumber
    ) {
        // 返回多个值（元组）
        return (
            msg.sender,                    // 调用者地址
            address(msg.sender).balance,   // 调用者 ETH 余额
            block.timestamp,               // 当前区块时间戳
            block.number                   // 当前区块号
        );
    }

    /**
     * @notice 获取交易信息
     * @dev 返回交易的详细信息
     * @param 此函数是 payable 的，可以接收 ETH
     * @return sender 发送者地址（msg.sender）
     * @return value 发送的 ETH 数量（msg.value）
     * @return origin 交易发起者（tx.origin）
     *
     * 重要概念：
     * - msg.sender：直接调用者（可能是合约）
     * - tx.origin：原始发起者（始终是 EOA 账户）
     *
     * 安全警告：
     * ⚠️ 永远不要用 tx.origin 做权限验证！
     * 攻击场景：
     * 1. 用户使用恶意合约调用你的合约
     * 2. tx.origin 是用户地址
     * 3. msg.sender 是恶意合约地址
     * 4. 如果用 tx.origin 验证，恶意合约可以冒充用户
     */
    function getTransactionInfo() public payable returns (
        address sender,
        uint256 value,
        address origin
    ) {
        return (
            msg.sender,    // 直接调用者
            msg.value,     // 发送的 ETH 数量（以 wei 为单位）
            tx.origin      // 原始发起者（注意安全风险）
        );
    }

    /**
     * @notice 接收 ETH 的函数
     * @dev 当合约收到纯 ETH 转账时自动执行
     *
     * 使用场景：
     * - 捐赠合约
     * - 收款合约
     * - ICO/IDO
     *
     * receive 函数特点：
     * - 必须是 external payable
     * - 不能有参数
     * - 不能有返回值
     * - gas 限制 2300（只能触发事件，不能写存储）
     */
    receive() external payable {
        // 收到 ETH 时自动记录账户信息
        recordAccountInfo();
    }

    // ========== 视图函数 ==========

    /**
     * @notice 获取账户历史记录数量
     * @dev 视图函数
     * @param _account 账户地址
     * @return 历史记录数量
     */
    function getHistoryCount(address _account) public view returns (uint256) {
        return accountHistory[_account].length;
    }

    /**
     * @notice 获取账户历史记录
     * @dev 视图函数，返回指定索引的记录
     * @param _account 账户地址
     * @param _index 记录索引
     * @return account 账户地址
     * @return balance ETH 余额
     * @return timestamp 时间戳
     * @return blockNumber 区块号
     *
     * 安全考虑：
     * - 检查索引越界
     * - 防止 DoS 攻击
     */
    function getHistory(address _account, uint256 _index) public view returns (
        address account,
        uint256 balance,
        uint256 timestamp,
        uint256 blockNumber
    ) {
        // 检查索引是否越界
        require(_index < accountHistory[_account].length, "Index out of bounds");

        // 获取记录
        AccountRecord memory record = accountHistory[_account][_index];

        // 返回记录内容
        return (
            record.account,
            record.balance,
            record.timestamp,
            record.blockNumber
        );
    }
}
