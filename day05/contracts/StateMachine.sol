// SPDX-License-Identifier: MIT
// 许可证标识：MIT 是最常见的开源许可证，允许代码自由使用、修改和分发

pragma solidity ^0.8.24;
// Solidity 编译器版本要求：使用 0.8.24 及以上版本
// ^ 表示向上兼容，即 0.8.24 到 0.9.0 之间的版本都可以

/**
 * @title StateMachine
 * @notice 使用枚举实现状态机模式
 * @dev 演示枚举在状态机中的实际应用
 *
 * 学习要点：
 * 1. 状态机设计模式
 * 2. 状态转换规则
 * 3. 状态验证
 * 4. 枚举在复杂流程控制中的应用
 *
 * ═══════════════════════════════════════════════════════════════════
 * 状态机模式详解
 * ═══════════════════════════════════════════════════════════════════
 *
 * 什么是状态机模式？
 * 状态机是一种设计模式，用于管理系统的状态转换。
 * 在智能合约中，状态机确保：
 * - 系统只能处于明确定义的状态之一
 * - 状态转换必须遵循预定义的规则
 * - 非法转换会被阻止
 *
 * 本合约实现的工作流：
 * ┌─────────┐  submitForReview()  ┌─────────┐  approve()  ┌──────────┐
 * │  Draft  │ ──────────────────>│ Review  │ ───────────>│ Approved │
 * └─────────┘                     └─────────┘              └──────────┘
 *      ▲                                │                         │
 *      │ reject()                       │                         │
 *      │                                ▼                         │
 *      │                          (reject返回)                    │
 *      │                                                         │
 *      │                                │                    activate()
 *      │                                │                         │
 *      │                                │                         ▼
 *      │                                │                   ┌─────────┐
 *      │                                │                   │ Active  │
 *      │                                │                   └─────────┘
 *      │                                │                         │
 *      │                                │                    suspend()
 *      │                                │                         │
 *      │                                │                         ▼
 *      │                                │                   ┌───────────┐
 *      │                                │                   │ Suspended │
 *      │                                │                   └───────────┘
 *      │                                │                         │
 *      │                                │                    resume()
 *      │                                │                         │
 *      └────────────────────────────────┘                         │
 *                                                               │
 *                           terminate() ─────────────────────────┘
 *                                                               ▼
 *                                                         ┌────────────┐
 *                                                         │ Terminated │
 *                                                         └────────────┘
 *                                                         (终态，不可逆)
 *
 * 角色说明：
 * - Owner（所有者）：可以提交审核、激活、暂停、恢复、终止
 * - Reviewer（审核者）：可以批准、拒绝
 *
 */

contract StateMachine {
    // ═══════════════════════════════════════════════════════════
    // 状态枚举
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 合约状态枚举
     * @dev 定义合约可能处于的所有状态
     *
     * 状态说明：
     * - Draft（草稿）：初始状态，合约刚创建
     * - Review（审核中）：已提交，等待审核
     * - Approved（已批准）：审核通过，等待激活
     * - Active（激活）：正常运行状态
     * - Suspended（暂停）：暂时停止，可以恢复
     * - Terminated（终止）：最终状态，不可逆
     *
     * 状态类型：
     * - 临时状态：Draft, Review, Approved, Active, Suspended
     * - 终态：Terminated（一旦终止，不可恢复）
     */
    enum ContractState {
        Draft,      // 0 - 草稿，初始状态
        Review,     // 1 - 审核中
        Approved,   // 2 - 已批准
        Active,     // 3 - 激活
        Suspended,  // 4 - 暂停
        Terminated  // 5 - 终止（终态，不可逆）
    }

    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 当前合约状态
     * @dev 初始值为 Draft（草稿状态）
     */
    ContractState public state = ContractState.Draft;

    /**
     * @notice 合约所有者地址
     * @dev 部署合约的账户，拥有管理权限
     */
    address public owner;

    /**
     * @notice 审核者地址
     * @dev 有权批准或拒绝合约的账户
     */
    address public reviewer;

    /**
     * @notice 状态转换历史记录结构体
     * @dev 用于记录每一次状态转换的信息
     */
    struct StateTransition {
        ContractState fromState;    // 转换前的状态
        ContractState toState;      // 转换后的状态
        uint256 timestamp;         // 转换时间（区块时间戳）
        address triggeredBy;        // 触发转换的账户
    }

    /**
     * @notice 状态转换历史数组
     * @dev 按时间顺序记录所有状态转换
     */
    StateTransition[] public transitionHistory;

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 状态转换事件
     * @dev 当状态发生变化时触发，便于前端监听和链外记录
     *
     * 事件参数：
     * - indexed 参数：可被 EVM 索引，支持快速搜索
     * - non-indexed 参数：存储在事件数据中
     */
    event StateTransitioned(
        ContractState indexed fromState,  // 索引：原状态
        ContractState indexed toState,    // 索引：新状态
        address indexed triggeredBy,       // 索引：触发者
        uint256 timestamp                 // 时间戳
    );

    // ═══════════════════════════════════════════════════════════
    // 修饰符（Modifiers）
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 仅所有者修饰符
     * @dev 检查调用者是否为合约所有者
     *
     * 修饰符的作用：
     * - 可重用的访问控制逻辑
     * - 将重复的 require 语句提取出来
     * - 使代码更简洁、更易读
     *
     * 工作原理：
     * 1. 先执行 require 检查
     * 2. 如果通过，执行 _; （下划线）代表的函数体
     * 3. 函数执行完毕后继续
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;  // 执行函数体
    }

    /**
     * @notice 仅审核者修饰符
     * @dev 检查调用者是否为审核者
     */
    modifier onlyReviewer() {
        require(msg.sender == reviewer, "Only reviewer");
        _;
    }

    /**
     * @notice 状态检查修饰符
     * @dev 检查当前状态是否匹配指定状态
     *
     * 用途：
     * - 确保函数只能在特定状态下执行
     * - 实现状态转换的前置条件检查
     *
     * 示例用法：
     * function activate() public onlyOwner inState(ContractState.Approved) { ... }
     * 解读：只有所有者可以调用，且当前状态必须是 Approved
     */
    modifier inState(ContractState _state) {
        require(state == _state, "Invalid state");
        _;
    }

    // ═══════════════════════════════════════════════════════════
    // 构造函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 构造函数
     * @dev 初始化合约所有者、审核者和初始状态
     *
     * @param _reviewer 审核者地址
     */
    constructor(address _reviewer) {
        owner = msg.sender;           // 部署者成为所有者
        reviewer = _reviewer;         // 设置审核者
        state = ContractState.Draft;  // 初始状态为草稿

        // 记录初始状态转换（从 Draft 到 Draft）
        // 这样 transitionHistory[0] 记录了合约的创建信息
        _recordTransition(ContractState.Draft, ContractState.Draft);
    }

    // ═══════════════════════════════════════════════════════════
    // 状态转换函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 提交审核
     * @dev 将合约从 Draft 提交到 Review 状态
     *
     * 前置条件：
     * - 调用者必须是 owner（通过 onlyOwner 修饰符）
     * - 当前状态必须是 Draft（通过 inState 修饰符）
     *
     * 状态转换：Draft → Review
     *
     * 权限：只有所有者可以调用
     */
    function submitForReview() public onlyOwner inState(ContractState.Draft) {
        _transitionTo(ContractState.Review);
    }

    /**
     * @notice 批准合约
     * @dev 将合约从 Review 批准到 Approved 状态
     *
     * 前置条件：
     * - 调用者必须是 reviewer（通过 onlyReviewer 修饰符）
     * - 当前状态必须是 Review（通过 inState 修饰符）
     *
     * 状态转换：Review → Approved
     *
     * 权限：只有审核者可以调用
     */
    function approve() public onlyReviewer inState(ContractState.Review) {
        _transitionTo(ContractState.Approved);
    }

    /**
     * @notice 拒绝合约
     * @dev 将合约从 Review 拒绝回 Draft 状态
     *
     * 前置条件：
     * - 调用者必须是 reviewer
     * - 当前状态必须是 Review
     *
     * 状态转换：Review → Draft
     *
     * 权限：只有审核者可以调用
     */
    function reject() public onlyReviewer inState(ContractState.Review) {
        _transitionTo(ContractState.Draft);
    }

    /**
     * @notice 激活合约
     * @dev 将合约从 Approved 激活到 Active 状态
     *
     * 前置条件：
     * - 调用者必须是 owner
     * - 当前状态必须是 Approved
     *
     * 状态转换：Approved → Active
     *
     * 权限：只有所有者可以调用
     */
    function activate() public onlyOwner inState(ContractState.Approved) {
        _transitionTo(ContractState.Active);
    }

    /**
     * @notice 暂停合约
     * @dev 将合约从 Active 暂停到 Suspended 状态
     *
     * 前置条件：
     * - 调用者必须是 owner
     * - 当前状态必须是 Active
     *
     * 状态转换：Active → Suspended
     *
     * 权限：只有所有者可以调用
     *
     * 注意：暂停是可逆的，可以通过 resume() 恢复
     */
    function suspend() public onlyOwner inState(ContractState.Active) {
        _transitionTo(ContractState.Suspended);
    }

    /**
     * @notice 恢复合约
     * @dev 将合约从 Suspended 恢复到 Active 状态
     *
     * 前置条件：
     * - 调用者必须是 owner
     * - 当前状态必须是 Suspended
     *
     * 状态转换：Suspended → Active
     *
     * 权限：只有所有者可以调用
     */
    function resume() public onlyOwner inState(ContractState.Suspended) {
        _transitionTo(ContractState.Active);
    }

    /**
     * @notice 终止合约
     * @dev 将合约终止，进入终态 Terminated
     *
     * 终止条件：
     * - 调用者必须是 owner
     * - 当前状态必须是 Active、Suspended 或 Approved 之一
     *
     * 状态转换：
     * - Active → Terminated
     * - Suspended → Terminated
     * - Approved → Terminated
     *
     * 重要：Terminated 是终态，不可逆！
     * 合约终止后将永远无法回到其他状态
     */
    function terminate() public onlyOwner {
        require(
            state == ContractState.Active ||
            state == ContractState.Suspended ||
            state == ContractState.Approved,
            "Cannot terminate from current state"
        );
        _transitionTo(ContractState.Terminated);
    }

    // ═══════════════════════════════════════════════════════════
    // 内部函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 执行状态转换
     * @dev 内部函数，处理状态转换的核心逻辑
     *
     * 工作流程：
     * 1. 保存旧状态
     * 2. 更新为新状态
     * 3. 记录转换历史
     * 4. 触发事件
     *
     * @param _newState 要转换到的新状态
     */
    function _transitionTo(ContractState _newState) internal {
        ContractState oldState = state;  // 保存旧状态
        state = _newState;               // 更新为新状态

        // 记录转换历史
        _recordTransition(oldState, _newState);

        // 触发事件，通知外部
        emit StateTransitioned(oldState, _newState, msg.sender, block.timestamp);
    }

    /**
     * @notice 记录状态转换历史
     * @dev 内部函数，将转换记录添加到历史数组
     *
     * 用途：
     * - 审计追踪：了解合约的状态变更历史
     * - 问题排查：查看状态如何演变
     * - 数据分析：了解工作流使用情况
     *
     * @param _fromState 原状态
     * @param _toState 新状态
     */
    function _recordTransition(ContractState _fromState, ContractState _toState) internal {
        transitionHistory.push(StateTransition({
            fromState: _fromState,
            toState: _toState,
            timestamp: block.timestamp,
            triggeredBy: msg.sender
        }));
    }

    // ═══════════════════════════════════════════════════════════
    // 查询函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取当前状态
     * @dev view 函数，返回合约当前的状态
     *
     * @return 当前状态（ContractState 枚举）
     */
    function getCurrentState() public view returns (ContractState) {
        return state;
    }

    /**
     * @notice 检查是否在特定状态
     * @dev 判断当前状态是否等于指定状态
     *
     * @param _state 要检查的状态
     * @return true 表示当前在指定状态，false 表示不在
     */
    function isInState(ContractState _state) public view returns (bool) {
        return state == _state;
    }

    /**
     * @notice 获取状态转换历史数量
     * @dev 返回历史记录数组的长度
     *
     * @return 历史记录数量
     */
    function getTransitionCount() public view returns (uint256) {
        return transitionHistory.length;
    }

    /**
     * @notice 获取状态转换历史
     * @dev 根据索引获取特定的历史记录
     *
     * @param _index 历史记录索引（从 0 开始）
     * @return 对应的状态转换记录
     */
    function getTransition(uint256 _index) public view returns (StateTransition memory) {
        require(_index < transitionHistory.length, "Index out of bounds");
        return transitionHistory[_index];
    }

    /**
     * @notice 检查是否可以转换到指定状态
     * @dev 判断从当前状态是否可以转换到目标状态
     *
     * 这是一个"查询函数"，不执行任何转换
     * 用途：前端显示可用的操作按钮
     *
     * @param _targetState 目标状态
     * @return true 表示可以转换，false 表示不能
     */
    function canTransitionTo(ContractState _targetState) public view returns (bool) {
        // 定义允许的状态转换规则

        // Draft → Review：提交审核
        if (state == ContractState.Draft && _targetState == ContractState.Review) return true;

        // Review → Approved：审核通过
        if (state == ContractState.Review && _targetState == ContractState.Approved) return true;

        // Review → Draft：审核拒绝
        if (state == ContractState.Review && _targetState == ContractState.Draft) return true;

        // Approved → Active：激活
        if (state == ContractState.Approved && _targetState == ContractState.Active) return true;

        // Active → Suspended：暂停
        if (state == ContractState.Active && _targetState == ContractState.Suspended) return true;

        // Suspended → Active：恢复
        if (state == ContractState.Suspended && _targetState == ContractState.Active) return true;

        // Active/Suspended/Approved → Terminated：终止
        if ((state == ContractState.Active ||
             state == ContractState.Suspended ||
             state == ContractState.Approved) &&
            _targetState == ContractState.Terminated) return true;

        // 其他情况返回 false
        return false;
    }

    /**
     * @notice 获取所有可能的下一个状态
     * @dev 返回当前状态下可以转换到的所有状态数组
     *
     * 用途：
     * - 前端动态显示可用的操作按钮
     * - 让用户知道当前可以做什么
     *
     * @return 可能的状态数组
     */
    function getPossibleNextStates() public view returns (ContractState[] memory) {
        uint8 count = 0;
        ContractState[6] memory possibleStates;  // 最多 6 种状态

        // 遍历所有可能的状态
        for (uint8 i = 0; i <= uint8(ContractState.Terminated); i++) {
            // 将整数转换为枚举
            ContractState candidateState = ContractState(i);

            // 检查是否可以转换到该状态
            if (canTransitionTo(candidateState)) {
                possibleStates[count] = candidateState;
                count++;
            }
        }

        // 创建返回数组
        ContractState[] memory result = new ContractState[](count);
        for (uint8 i = 0; i < count; i++) {
            result[i] = possibleStates[i];
        }

        return result;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * 学习要点总结
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. 状态机设计模式
 *    - 定义：一种管理状态转换的设计模式
 *    - 核心要素：
 *      * 状态枚举：定义所有可能的状态
 *      * 状态变量：存储当前状态
 *      * 转换规则：定义哪些转换是允许的
 *      * 转换函数：执行状态转换的函数
 *
 *    - 优势：
 *      * 代码结构清晰
 *      * 状态流转一目了然
 *      * 易于审计和调试
 *
 * 2. 状态转换规则
 *    - 转换方式：
 *      * 使用 require 验证前置条件
 *      * 使用修饰符（modifier）简化验证
 *      * 使用内部函数执行转换
 *
 *    - 规则设计：
 *      * 明确定义每种状态下可以执行的操作
 *      * 使用 if 语句或 require 检查转换合法性
 *      * canTransitionTo() 函数可以查询可转换性
 *
 *    状态转换表：
 *    ┌─────────────┬────────────────────┬─────────────────┐
 *    │  当前状态   │     可转换到        │    触发角色     │
 *    ├─────────────┼────────────────────┼─────────────────┤
 *    │   Draft     │     Review         │     Owner       │
 *    │   Review    │  Approved, Draft   │    Reviewer     │
 *    │  Approved   │   Active, Terminated│    Owner       │
 *    │   Active    │ Suspended, Terminated│   Owner       │
 *    │  Suspended  │   Active, Terminated│   Owner       │
 *    │  Terminated │       无            │      无        │
 *    └─────────────┴────────────────────┴─────────────────┘
 *
 * 3. 状态验证
 *    - 修饰符验证：使用 inState 修饰符
 *      modifier inState(ContractState _state) {
 *          require(state == _state, "Invalid state");
 *          _;
 *      }
 *
 *    - require 验证：直接使用 require 语句
 *      require(state == ContractState.Active, "Not active");
 *
 *    - 查询验证：使用 canTransitionTo() 检查
 *      if (canTransitionTo(ContractState.Active)) { ... }
 *
 * 4. 枚举在复杂流程控制中的应用
 *    - 枚举优势：
 *      * 可读性强：ContractState.Active 比数字 3 更清晰
 *      * 类型安全：编译器检查状态值的有效性
 *      * IDE 支持：自动补全和类型检查
 *
 *    - 枚举转整数：
 *      uint8(ContractState.Active)  // 3
 *
 *    - 整数转枚举：
 *      ContractState(3)  // Active
 *
 * ═══════════════════════════════════════════════════════════════════
 * 修饰符（Modifiers）详解
 * ═══════════════════════════════════════════════════════════════════
 *
 * 什么是修饰符？
 * 修饰符是 Solidity 中用于修改函数行为的特殊函数。
 * 常用于：
 * - 访问控制（onlyOwner, onlyReviewer）
 * - 条件检查（inState）
 * - 参数验证
 *
 * 修饰符的组成：
 * 1. 条件检查：require(...) 在函数执行前检查条件
 * 2. 占位符：下划线 _; 表示函数体的位置
 *
 * 多个修饰符的执行顺序：
 * function foo() public onlyOwner inState(ContractState.Active) { ... }
 * 执行顺序：
 * 1. onlyOwner 检查
 * 2. inState 检查
 * 3. 函数体执行
 *
 * ═══════════════════════════════════════════════════════════════════
 * 状态机的最佳实践
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. 明确定义所有状态
 *    - 使用枚举列出所有可能状态
 *    - 注释每个状态的含义
 *    - 标记终态（如 Terminated）
 *
 * 2. 设计清晰的转换规则
 *    - 绘制状态转换图
 *    - 明确每个状态的权限
 *    - 定义哪些转换是允许的
 *
 * 3. 使用修饰符简化代码
 *    - 将重复的检查提取为修饰符
 *    - 提高代码可读性
 *    - 便于维护
 *
 * 4. 记录转换历史
 *    - 使用事件记录每次转换
 *    - 存储历史记录供查询
 *    - 便于审计和调试
 *
 * 5. 提供查询接口
 *    - getCurrentState() 查询当前状态
 *    - canTransitionTo() 查询可转换性
 *    - getPossibleNextStates() 获取可用操作
 *
 * 6. 考虑终态
 *    - 明确哪些是终态
 *    - 终态不可逆
 *    - 防止从终态转换到其他状态
 *
 * ═══════════════════════════════════════════════════════════════════
 */
