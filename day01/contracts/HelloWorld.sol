// SPDX-License-Identifier: MIT
// 许可证声明：MIT 许可证（允许自由使用和修改）

pragma solidity ^0.8.24;
// 版本声明：使用 Solidity 编译器 0.8.24 版本
// ^ 符号表示兼容该版本但不包括下一个主版本（<0.9.0）

/**
 * @title HelloWorld - 第一个 Solidity 智能合约
 * @notice 这是一个教学用的 HelloWorld 合约，用于学习 Solidity 编程入门
 * @dev 合约包含了 Solidity 最基础的元素：状态变量、构造函数、函数、事件
 *
 * 学习要点：
 * 1. pragma solidity - 版本声明语法
 * 2. contract - 合约声明
 * 3. string public - 状态变量与可见性修饰符
 * 4. event - 事件定义与触发
 * 5. constructor - 构造函数
 * 6. function - 函数定义
 * 7. view - 视图函数（只读不修改状态）
 * 8. memory - 内存数据位置
 *
 * 行业背景：
 * HelloWorld 合约相当于编程界的"Hello World"，是学习任何编程语言的传统起点。
 * 在 Solidity 中，它帮助我们理解：
 * - 智能合约是运行在区块链上的程序
 * - 合约部署后有自己的地址
 * - 状态变量永久存储在区块链上
 * - 函数调用需要消耗 Gas（但 view 函数免费）
 *
 * 实现步骤：
 * 1. 声明 SPDX 许可证和 Solidity 版本
 * 2. 定义合约名称
 * 3. 声明状态变量（存储消息）
 * 4. 定义事件（记录消息变更）
 * 5. 实现构造函数（初始化）
 * 6. 实现 setMessage 函数（修改消息）
 * 7. 实现 getMessage 函数（读取消息）
 */
contract HelloWorld {

    // ========== 状态变量 ==========

    /// @notice 存储的消息内容
    /// @dev public 修饰符自动生成 getter 函数
    /// 数据位置：storage（永久存储在区块链上）
    /// Gas 成本：首次写入约 20,000 gas，后续修改约 5,000 gas
    string public message;

    // ========== 事件 ==========

    /**
     * @notice 消息变更事件
     * @dev 事件用于记录链上活动，前端可以监听和查询
     * @param oldMessage 旧消息
     * @param newMessage 新消息
     *
     * 使用场景：
     * - 前端应用监听消息变更历史
     * - 区块浏览器显示合约活动日志
     * - 链下服务索引合约状态变化
     */
    event MessageChanged(
        string oldMessage,  // 变更前的消息
        string newMessage   // 变更后的消息
    );

    // ========== 构造函数 ==========

    /**
     * @notice 构造函数 - 合约部署时自动执行一次
     * @dev 构造函数在合约部署时执行，用于初始化状态
     * @param _message 初始消息内容
     *
     * 实现步骤：
     * 1. 将传入的参数赋值给状态变量 message
     * 2. 触发 MessageChanged 事件，记录初始化过程
     *
     * 注意：
     * - 构造函数只在部署时执行一次
     * - 构造函数不能直接调用
     * - 构造函数不消耗额外 Gas（包含在部署成本中）
     */
    constructor(string memory _message) {
        // 步骤 1：初始化状态变量
        message = _message;

        // 步骤 2：触发初始化事件
        // 空字符串表示这是第一次设置（从无到有）
        emit MessageChanged("", _message);
    }

    // ========== 主逻辑函数 ==========

    /**
     * @notice 设置新的消息内容
     * @dev 任何人都可以调用此函数更新消息
     * @param _newMessage 新的消息内容
     *
     * 使用场景：
     * - 更新合约状态
     * - 发布链上公告
     * - 记录重要信息
     *
     * 安全考虑：
     * - 任何人都可以调用，无权限控制
     * - 没有输入验证（允许空字符串）
     * - 每次调用都会消耗 Gas
     *
     * 实现步骤：
     * 1. 保存当前消息（用于事件记录）
     * 2. 更新状态变量
     * 3. 触发事件
     */
    function setMessage(string memory _newMessage) public {
        // ========== Effects（状态更新） ==========
        // 步骤 1：保存旧消息（用于事件）
        string memory oldMessage = message;

        // 步骤 2：更新状态变量
        message = _newMessage;

        // ========== Interactions（外部交互） ==========
        // 步骤 3：触发事件，记录变更历史
        emit MessageChanged(oldMessage, _newMessage);
    }

    // ========== 视图函数（只读） ==========

    /**
     * @notice 获取当前存储的消息
     * @dev view 函数不修改状态，调用不消耗 Gas（离线执行）
     * @return 当前的消息内容
     *
     * Gas 说明：
     * - view 函数不修改区块链状态
     * - 调用不需要发送交易
     * - 直接在本地节点执行并返回结果
     *
     * 使用场景：
     * - 前端应用读取合约状态
     * - 其他合约查询数据
     */
    function getMessage() public view returns (string memory) {
        // 直接返回状态变量的值
        return message;
    }

    /**
     * @notice 获取合约部署者的地址
     * @dev 使用 msg.sender 获取调用者地址
     * @return 调用者的地址
     *
     * 重要概念：
     * - msg.sender: 当前调用的发送者地址
     * - 在构造函数中，msg.sender 是部署者
     * - 在普通函数中，msg.sender 是调用者
     *
     * 安全提示：
     * - 此函数返回的是调用者而非原始部署者
     * - 如需记录部署者，应在构造函数中保存
     */
    function getDeployer() public view returns (address) {
        // 返回当前调用者的地址
        return msg.sender;
    }
}
