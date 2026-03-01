// SPDX-License-Identifier: MIT
// 许可证声明：MIT 许可证

pragma solidity ^0.8.24;
// 版本声明：使用 Solidity 编译器 0.8.24 版本

/**
 * @title GasDemo - Gas 消耗演示合约
 * @notice 演示不同操作的 Gas 消耗差异，帮助理解 Gas 机制
 * @dev 包含 Storage、Memory、Calldata 等不同数据位置的操作示例
 *
 * 学习要点：
 * 1. Storage vs Memory vs Calldata 的 Gas 差异
 * 2. 不同操作的 Gas 成本对比
 * 3. Gas 优化基本原则
 * 4. 事件 vs Storage 存储成本
 *
 * 行业背景：
 * Gas 是以太坊的核心机制，理解 Gas 消耗对开发至关重要：
 * - Gas 费用 = Gas Used × Gas Price
 * - Storage 操作最昂贵（需要所有节点同步更新）
 * - Memory 操作中等成本（临时数据）
 * - Calldata 最便宜（只读参数）
 * - 优化 Gas 可以显著降低用户成本
 *
 * Gas 成本参考（近似值）：
 * - 基础交易：21,000 gas
 * - Storage 写入（0→1）：~20,000 gas
 * - Storage 写入（1→1）：~5,000 gas
 * - Storage 读取：~2,100 gas
 * - 事件日志：~375 + 375/topic + 8/byte gas
 */
contract GasDemo {

    // ========== 状态变量（Storage） ==========

    /// @notice Storage 变量示例
    /// @dev 永久存储在区块链上，写入成本高
    /// Gas 成本：
    /// - 首次写入（0→非 0）：约 20,000 gas
    /// - 修改写入（非 0→非 0）：约 5,000 gas
    /// - 删除（非 0→0）：返还约 15,000 gas
    uint256 public storageValue;

    /// @notice 余额映射
    /// @dev 每个地址的余额存储在 Storage 中
    mapping(address => uint256) public balances;

    // ========== 事件 ==========

    /// @notice Storage 更新事件
    /// @dev 事件比 Storage 存储便宜，适合记录历史数据
    event StorageUpdated(uint256 oldValue, uint256 newValue);

    /// @notice 余额更新事件
    /// @param account 账户地址（indexed 可被索引）
    /// @param balance 新余额
    event BalanceUpdated(address indexed account, uint256 balance);

    // ========== 主逻辑函数 ==========

    /**
     * @notice 更新 Storage 变量（消耗较多 Gas）
     * @dev 演示 Storage 写入的 Gas 成本
     * @param _value 新值
     *
     * Gas 分析：
     * - 基础交易成本：21,000 gas
     * - Storage 写入：~20,000 gas（首次）或~5,000 gas（修改）
     * - 事件日志：~1,500 gas
     * - 总计：约 43,500 gas（首次）或 28,500 gas（修改）
     */
    function updateStorage(uint256 _value) public {
        // 保存旧值（用于事件）
        uint256 oldValue = storageValue;

        // Storage 写入：这是最昂贵的操作
        storageValue = _value;

        // 触发事件：比 Storage 存储便宜
        emit StorageUpdated(oldValue, _value);
    }

    /**
     * @notice 使用 Memory（临时变量，不消耗 Storage Gas）
     * @dev 演示 Memory 操作的低成本
     * @param _value 输入值
     * @return 计算结果
     *
     * Gas 分析：
     * - 基础交易成本：21,000 gas
     * - Memory 操作：成本很低（临时数据，交易结束即清除）
     * - 总计：约 21,500 gas
     *
     * Memory vs Storage：
     * - Memory：临时内存，函数执行完即清除
     * - Storage：永久存储，保存在区块链上
     */
    function useMemory(uint256 _value) public pure returns (uint256) {
        // Memory 变量：存储在临时内存中
        uint256 memoryValue = _value * 2;
        return memoryValue;
    }

    /**
     * @notice 使用 Calldata（函数参数，最便宜）
     * @dev 演示 Calldata 的最低成本
     * @param _value 输入值（calldata，只读）
     * @return 计算结果
     *
     * Gas 分析：
     * - 基础交易成本：21,000 gas
     * - Calldata 读取：几乎零成本（数据已经在内存中）
     * - 总计：约 21,200 gas
     *
     * Calldata 特点：
     * - 只读，不能修改
     * - 数据存储在调用数据区
     * - 不需要复制到 Memory
     */
    function useCalldata(uint256 _value) public pure returns (uint256) {
        // _value 是 calldata 类型（函数参数默认）
        // 直接读取，无需复制
        return _value * 3;
    }

    /**
     * @notice 更新映射（Storage 操作）
     * @dev 演示 mapping 的 Storage 写入成本
     * @param _account 账户地址
     * @param _amount 新余额
     *
     * Gas 分析：
     * - 首次写入新地址：约 20,000 gas
     * - 修改已有地址：约 5,000 gas
     */
    function updateBalance(address _account, uint256 _amount) public {
        // Storage 写入：更新映射中的值
        balances[_account] = _amount;

        // 触发事件
        emit BalanceUpdated(_account, _amount);
    }

    /**
     * @notice 多次 Storage 写入（消耗更多 Gas）
     * @dev 演示多次 Storage 操作的累积成本
     * @param _value1 第一个值
     * @param _value2 第二个值
     * @param _value3 第三个值
     *
     * Gas 分析：
     * - 第一次 Storage 写入：~20,000 gas
     * - 映射写入：~20,000 gas
     * - Storage 覆盖写入：~5,000 gas
     * - 总计：约 67,000 gas
     *
     * 优化建议：
     * - 合并多次写入为一次
     * - 使用事件代替部分 Storage
     */
    function multipleStorageWrites(
        uint256 _value1,
        uint256 _value2,
        uint256 _value3
    ) public {
        // 第一次写入
        storageValue = _value1;

        // 映射写入
        balances[msg.sender] = _value2;

        // 覆盖写入（成本较低）
        storageValue = _value3;
    }

    // ========== 视图函数（不消耗 Gas） ==========

    /**
     * @notice 读取 Storage（view 函数，免费）
     * @dev 视图函数不消耗 Gas，因为是离线读取
     * @return 当前 Storage 值
     */
    function readStorage() public view returns (uint256) {
        return storageValue;
    }

    /**
     * @notice 读取映射（view 函数，免费）
     * @dev 视图函数不消耗 Gas
     * @param _account 账户地址
     * @return 账户余额
     */
    function readBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }

    // ========== 特殊函数 ==========

    /**
     * @notice 空函数（只消耗基础 Gas）
     * @dev 演示最小的 Gas 消耗
     *
     * Gas 分析：
     * - 基础交易成本：21,000 gas
     * - 无其他操作
     * - 总计：约 21,500 gas
     */
    function emptyFunction() public {
        // 什么都不做
    }

    /**
     * @notice 复杂计算（消耗计算 Gas）
     * @dev 演示循环计算的 Gas 成本
     * @param _value 循环次数
     * @return 计算结果
     *
     * Gas 分析：
     * - 基础交易成本：21,000 gas
     * - 每次循环：约 5-10 gas
     * - _value = 100 时：约 22,000 gas
     * - _value = 1000 时：约 30,000 gas
     *
     * 注意：
     * - 循环次数过多可能导致 Gas 不足
     * - 避免在合约中使用未限制边界的循环
     */
    function complexCalculation(uint256 _value) public pure returns (uint256) {
        uint256 result = 0;

        // 循环累加
        for (uint256 i = 0; i < _value; i++) {
            result += i;
        }

        return result;
    }
}
