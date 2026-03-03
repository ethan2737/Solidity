// SPDX-License-Identifier: MIT
// 许可证标识：MIT 是最常见的开源许可证，允许代码自由使用、修改和分发

pragma solidity ^0.8.24;
// Solidity 编译器版本要求：使用 0.8.24 及以上版本
// ^ 表示向上兼容，即 0.8.24 到 0.9.0 之间的版本都可以

/**
 * @title EnumDemo
 * @notice 演示 Solidity 枚举类型的使用
 * @dev 用于学习枚举在状态管理中的应用
 *
 * 学习要点：
 * 1. 枚举定义和声明
 * 2. 枚举值的比较
 * 3. 枚举在状态机中的应用
 * 4. 枚举与整型的转换
 *
 * ═══════════════════════════════════════════════════════════════════
 * 状态机 (State Machine) 概念详解
 * ═══════════════════════════════════════════════════════════════════
 *
 * 什么是状态机？
 * 状态机是一种抽象计算模型，表示一个系统只能处于有限数量的状态之一，
 * 并且在特定条件下可以从一个状态转换到另一个状态。
 *
 * 状态机的组成要素：
 * 1. 状态(States)：系统可能处于的所有状态的集合
 * 2. 初始状态(Initial State)：系统启动时的默认状态
 * 3. 转换规则(Transition Rules)：定义哪些状态可以转换到哪些状态
 * 4. 终止状态(Final States)：可选的最终状态
 *
 * 本合约中的状态机示例：
 *
 * 【状态机1：State 枚举】
 * ┌─────────┐    lock()     ┌─────────┐    deactivate()  ┌───────────┐
 * │ Created │ ─────────────> │ Locked  │ ───────────────> │ Inactive  │
 * └─────────┘                └─────────┘                  └───────────┘
 *      ↑                                                            │
 *      │                          reset()                           │
 *      └────────────────────────────────────────────────────────────┘
 *
 * 【状态机2：OrderStatus 枚举】
 *  ┌─────────┐ confirmOrder()  ┌──────────┐ shipOrder()  ┌─────────┐ deliverOrder() ┌──────────┐
 *  │ Pending │ ──────────────> │ Confirmed│ ────────────> │ Shipped │ ─────────────> │Delivered│
 *  └─────────┘                 └──────────┘               └─────────┘                 └──────────┘
 *       │                            │                           │
 *       │ cancelOrder()              │ cancelOrder()              │
 *       ▼                            ▼                           │
 *  ┌───────────┐                                                    │
 *  │ Cancelled │ ─────────────────────────────────────────────────┘
 *  └───────────┘
 *
 */
contract EnumDemo {
    // ═══════════════════════════════════════════════════════════
    // 枚举定义
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 状态枚举 - 演示基本枚举定义 + 状态机
     * @dev 枚举是一种用户自定义类型，用于表示有限数量的状态值
     *      枚举值从 0 开始自动编号，也可以显式指定值
     *
     * 枚举定义语法：
     * enum EnumName { Value1, Value2, Value3, ... }
     *
     * 学习要点：
     * - 枚举名：自定义名称（首字母大写）
     * - 枚举值：逗号分隔的标识符列表
     * - 默认值：第一个枚举值的整型值为 0
     *
     * ═══════════════════════════════════════════════════════════
     * 状态机应用：State 枚举
     * ═══════════════════════════════════════════════════════════
     *
     * 本枚举用于实现一个简单的三状态状态机：
     *
     * 允许的转换规则：
     * - Created  ──lock()──>  Locked
     * - Created  ─deactivate()>  Inactive
     * - Locked   ─deactivate()>  Inactive
     * - Inactive ──reset()──>  Created
     *
     * 不允许的转换（会被 revert）：
     * - Locked  ──> Created (必须先 deactivate)
     * - Inactive ─> Locked (必须先 reset)
     */
    enum State {
        Created,    // 0 - 初始状态，创建完成
        Locked,     // 1 - 锁定状态，已锁定
        Inactive    // 2 - 非活跃状态，已停用
    }

    /**
     * @notice 订单状态枚举 - 演示枚举在实际业务中的应用 + 状态机
     * @dev 模拟电商订单的完整生命周期
     *
     * 订单流程示例：
     * Pending(待确认) -> Confirmed(已确认) -> Shipped(已发货) -> Delivered(已送达)
     * 或者：Pending(待确认) -> Confirmed(已确认) -> Cancelled(已取消)
     *
     * ═══════════════════════════════════════════════════════════
     * 状态机应用：OrderStatus 枚举
     * ═══════════════════════════════════════════════════════════
     *
     * 本枚举用于实现订单状态机，允许的转换规则：
     *
     * 正常流程（成功）：
     * - Pending    ─confirmOrder()──>  Confirmed
     * - Confirmed  ──shipOrder()───>  Shipped
     * - Shipped    ─deliverOrder()>  Delivered  ✓ 终止状态
     *
     * 取消流程：
     * - Pending    ─cancelOrder()──>  Cancelled  ✓ 终止状态
     * - Confirmed  ─cancelOrder()──>  Cancelled  ✓ 终止状态
     *
     * 不允许的转换（会被 revert）：
     * - Shipped/Delivered/Cancelled ──> 任何状态（订单已结束）
     * - Pending ──> Shipped（必须先确认）
     */
    enum OrderStatus {
        Pending,    // 0 - 待确认，订单刚创建，等待卖家确认
        Confirmed,  // 1 - 已确认，卖家已接受订单
        Shipped,    // 2 - 已发货，商品已发出
        Delivered,  // 3 - 已送达，买家已收到商品
        Cancelled   // 4 - 已取消，订单被取消
    }

    /**
     * @notice 用户角色枚举 - 演示枚举在权限管理中的应用
     * @dev 用于区分不同用户的权限级别
     *
     * 权限级别（从低到高）：
     * Guest(访客) < Member(会员) < Admin(管理员) < Owner(所有者)
     */
    enum UserRole {
        Guest,      // 0 - 访客，未注册或未登录的用户，只有查看权限
        Member,     // 1 - 会员，普通注册用户，基本操作权限
        Admin,      // 2 - 管理员，管理内容和用户权限
        Owner       // 3 - 所有者合约所有者，最高权限
    }

    // ═══════════════════════════════════════════════════════════
    // 状态变量
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 当前状态变量
     * @dev 使用枚举类型声明状态变量，初始值为 State.Created
     *
     * 枚举作为状态变量的优势：
     * 1. 代码可读性：比使用整型（0/1/2）更易理解
     * 2. 类型安全：编译器会检查枚举值的有效性
     * 3. 语义明确：State.Created 比数字 0 更清楚意图
     */
    State public currentState = State.Created;  // 初始状态为 Created

    /**
     * @notice 通用订单状态变量
     * @dev 用于演示单个订单状态的管理
     */
    OrderStatus public orderStatus = OrderStatus.Pending;  // 初始为待确认

    /**
     * @notice 当前用户角色
     * @dev 演示角色的基本使用
     */
    UserRole public userRole = UserRole.Guest;  // 默认为访客

    /**
     * @notice 用户角色映射
     * @dev 存储每个地址对应的角色，支持多用户权限管理
     *
     * 映射语法：mapping(keyType => valueType) public mappingName
     * - keyType：地址类型，存储用户地址
     * - valueType：枚举类型，存储用户角色
     *
     * 访问方式：userRoles[0x123...] 返回 UserRole 枚举值
     */
    mapping(address => UserRole) public userRoles;  // 地址到角色的映射

    /**
     * @notice 订单状态映射
     * @dev 存储每个订单ID对应的状态，支持批量订单管理
     *
     * 场景：商家可能有多个订单，每个订单有不同状态
     * 访问方式：orders[1] 返回订单ID为1的状态
     */
    mapping(uint256 => OrderStatus) public orders;  // 订单ID到状态的映射

    // ═══════════════════════════════════════════════════════════
    // 事件
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 状态变更事件
     * @dev 当状态机状态改变时触发，用于前端监听和记录
     *
     * 事件参数：
     * - oldState：变更前的状态（State枚举类型）
     * - newState：变更后的状态（State枚举类型）
     *
     * 使用 indexed 参数可以方便前端按条件过滤事件
     * 但这里状态是枚举类型，不适合作为 indexed 参数
     */
    event StateChanged(State oldState, State newState);

    /**
     * @notice 订单状态变更事件
     * @dev 记录订单状态变化历史
     *
     * indexed 关键字：
     * - indexed 参数：可被 EVM 索引，用于快速搜索
     * - non-indexed 参数：存储在事件的 data 区域，需要解码
     *
     * 此处 orderId 使用 indexed，方便按订单ID搜索
     */
    event OrderStatusChanged(uint256 indexed orderId, OrderStatus oldStatus, OrderStatus newStatus);

    /**
     * @notice 用户角色变更事件
     * @dev 记录权限变更，用于审计和通知
     */
    event UserRoleChanged(address indexed user, UserRole oldRole, UserRole newRole);

    // ═══════════════════════════════════════════════════════════
    // 状态管理函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置状态（演示基本状态转换）
     * @dev 直接设置任意状态值，不做转换限制
     *
     * 注意：实际应用中应使用 require 进行状态转换验证
     *
     * @param _newState 新状态（State 枚举类型）
     *
     * 状态变量赋值语法：currentState = State.Locked
     * 枚举成员访问：EnumName.MemberName
     */
    function setState(State _newState) public {
        State oldState = currentState;  // 保存旧状态，用于事件记录
        currentState = _newState;       // 设置新状态
        emit StateChanged(oldState, _newState);  // 触发状态变更事件
    }

    /**
     * @notice 锁定状态（演示有条件的状态转换）
     * @dev 只能从 Created 状态转换到 Locked
     *
     * 状态转换规则：
     * - 条件：当前状态必须是 Created
     * - 转换：Created -> Locked
     * - 失败：如果不是 Created 状态，revert 并返回错误信息
     *
     * require 语句语法：
     * require(condition, "error message")
     * - condition 为 false 时，交易 revert
     * - 错误信息帮助调试
     */
    function lock() public {
        require(currentState == State.Created, "Can only lock from Created state");
        // 检查当前状态是否为 Created，不是则 revert

        currentState = State.Locked;  // 转换到 Locked 状态

        emit StateChanged(State.Created, State.Locked);  // 触发事件
    }

    /**
     * @notice 停用状态（演示多条件状态转换）
     * @dev 可以从 Created 或 Locked 转换到 Inactive
     *
     * 逻辑运算符：
     * - || 表示 OR（或）
     * - && 表示 AND（与）
     *
     * 允许的转换路径：
     * - Created -> Inactive
     * - Locked -> Inactive
     */
    function deactivate() public {
        require(
            currentState == State.Created || currentState == State.Locked,
            "Can only deactivate from Created or Locked state"
        );
        // 允许从 Created 或 Locked 状态停用

        State oldState = currentState;  // 保存旧状态
        currentState = State.Inactive;  // 转换到 Inactive

        emit StateChanged(oldState, State.Inactive);  // 触发事件
    }

    /**
     * @notice 重置状态（演示受限的状态转换）
     * @dev 只能从 Inactive 转换回 Created
     *
     * 状态循环：Created -> Locked -> Inactive -> Created
     * 这演示了完整的状态生命周期
     */
    function reset() public {
        require(currentState == State.Inactive, "Can only reset from Inactive state");
        // 只有 Inactive 状态才能重置

        currentState = State.Created;  // 重置回 Created

        emit StateChanged(State.Inactive, State.Created);  // 触发事件
    }

    // ═══════════════════════════════════════════════════════════
    // 订单状态管理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 创建订单
     * @dev 将订单状态设置为 Pending（待确认）
     *
     * 枚举作为映射值：
     * orders[_orderId] = OrderStatus.Pending
     * 等价于：orders[_orderId] = 0
     *
     * @param _orderId 订单ID（uint256 类型）
     */
    function createOrder(uint256 _orderId) public {
        orders[_orderId] = OrderStatus.Pending;  // 设置订单状态为 Pending

        // 触发事件：oldStatus 和 newStatus 相同（都是 Pending）
        emit OrderStatusChanged(_orderId, OrderStatus.Pending, OrderStatus.Pending);
    }

    /**
     * @notice 确认订单（Pending -> Confirmed）
     * @dev 只有 Pending 状态的订单才能被确认
     *
     * 状态转换验证：
     * require(orders[_orderId] == OrderStatus.Pending, ...)
     * 检查订单当前是否为 Pending 状态
     *
     * @param _orderId 订单ID
     */
    function confirmOrder(uint256 _orderId) public {
        require(orders[_orderId] == OrderStatus.Pending, "Order must be Pending");
        // 只有 Pending 状态可以确认

        orders[_orderId] = OrderStatus.Confirmed;  // 转换到 Confirmed
        emit OrderStatusChanged(_orderId, OrderStatus.Pending, OrderStatus.Confirmed);
    }

    /**
     * @notice 发货（Confirmed -> Shipped）
     * @dev 只有已确认的订单才能发货
     *
     * @param _orderId 订单ID
     */
    function shipOrder(uint256 _orderId) public {
        require(orders[_orderId] == OrderStatus.Confirmed, "Order must be Confirmed");
        // 只有 Confirmed 状态可以发货

        orders[_orderId] = OrderStatus.Shipped;  // 转换到 Shipped
        emit OrderStatusChanged(_orderId, OrderStatus.Confirmed, OrderStatus.Shipped);
    }

    /**
     * @notice 完成订单（Shipped -> Delivered）
     * @dev 只有已发货的订单才能标记为已送达
     *
     * @param _orderId 订单ID
     */
    function deliverOrder(uint256 _orderId) public {
        require(orders[_orderId] == OrderStatus.Shipped, "Order must be Shipped");
        // 只有 Shipped 状态可以确认送达

        orders[_orderId] = OrderStatus.Delivered;  // 转换到 Delivered
        emit OrderStatusChanged(_orderId, OrderStatus.Shipped, OrderStatus.Delivered);
    }

    /**
     * @notice 取消订单（Pending 或 Confirmed -> Cancelled）
     * @dev 订单在确认前或确认后都可以取消
     *
     * 多种状态可以转换到同一状态：
     * - Pending -> Cancelled
     * - Confirmed -> Cancelled
     *
     * 注意：Shipped 和 Delivered 状态不能取消（商品已在途中）
     *
     * @param _orderId 订单ID
     */
    function cancelOrder(uint256 _orderId) public {
        require(
            orders[_orderId] == OrderStatus.Pending || orders[_orderId] == OrderStatus.Confirmed,
            "Order can only be cancelled from Pending or Confirmed"
        );
        // 只有 Pending 或 Confirmed 可以取消

        OrderStatus oldStatus = orders[_orderId];  // 保存旧状态
        orders[_orderId] = OrderStatus.Cancelled;  // 转换到 Cancelled

        emit OrderStatusChanged(_orderId, oldStatus, OrderStatus.Cancelled);
    }

    // ═══════════════════════════════════════════════════════════
    // 用户角色管理
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 设置用户角色
     * @dev 将指定地址设置为特定角色
     *
     * 枚举作为映射值存储：
     * userRoles[_user] = _role
     *
     * @param _user 用户地址
     * @param _role 用户角色（UserRole 枚举）
     */
    function setUserRole(address _user, UserRole _role) public {
        require(_user != address(0), "Invalid address");
        // 检查地址是否有效（address(0) 是零地址）

        UserRole oldRole = userRoles[_user];  // 获取旧角色
        userRoles[_user] = _role;            // 设置新角色

        emit UserRoleChanged(_user, oldRole, _role);  // 触发事件
    }

    /**
     * @notice 检查用户是否是管理员
     * @dev 管理员包括 Admin 和 Owner 角色
     *
     * 枚举比较：
     * userRoles[_user] == UserRole.Admin
     * 返回布尔值表示比较结果
     *
     * @param _user 用户地址
     * @return 是否是管理员
     */
    function isAdmin(address _user) public view returns (bool) {
        // Admin 或 Owner 都被视为管理员
        return userRoles[_user] == UserRole.Admin || userRoles[_user] == UserRole.Owner;
    }

    /**
     * @notice 检查用户是否是所有者
     * @dev 只有 Owner 角色才是真正的所有者
     *
     * @param _user 用户地址
     * @return 是否是所有者
     */
    function isOwner(address _user) public view returns (bool) {
        return userRoles[_user] == UserRole.Owner;
    }

    // ═══════════════════════════════════════════════════════════
    // 枚举查询函数
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 获取当前状态
     * @dev view 函数，读取状态变量，不消耗 gas（如果外部调用）
     *
     * @return 当前状态（State 枚举类型）
     */
    function getCurrentState() public view returns (State) {
        return currentState;
    }

    /**
     * @notice 获取订单状态
     * @dev 通过订单ID查询对应的状态
     *
     * @param _orderId 订单ID
     * @return 订单状态（OrderStatus 枚举类型）
     */
    function getOrderStatus(uint256 _orderId) public view returns (OrderStatus) {
        return orders[_orderId];
    }

    /**
     * @notice 获取用户角色
     * @dev 通过地址查询用户的角色
     *
     * @param _user 用户地址
     * @return 用户角色（UserRole 枚举类型）
     */
    function getUserRole(address _user) public view returns (UserRole) {
        return userRoles[_user];
    }

    // ═══════════════════════════════════════════════════════════
    // 枚举与整型转换
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 将枚举转换为 uint8
     * @dev 显式转换：枚举值可以转换为整数
     *
     * 转换语法：uint8(enumValue)
     * - State.Created -> 0
     * - State.Locked -> 1
     * - State.Inactive -> 2
     *
     * @param _state 状态枚举
     * @return 对应的整型值
     */
    function stateToUint8(State _state) public pure returns (uint8) {
        return uint8(_state);
    }

    /**
     * @notice 将 uint8 转换为状态枚举
     * @dev 显式转换：整数可以转换为枚举值
     *
     * 重要：需要验证转换后的值是否有效！
     * 否则可能产生无效的枚举值
     *
     * 验证逻辑：
     * require(_value <= uint8(State.Inactive), "Invalid state value")
     * 确保值不超过最大枚举值（2）
     *
     * @param _value 整型值
     * @return 对应的状态枚举
     */
    function uint8ToState(uint8 _value) public pure returns (State) {
        require(_value <= uint8(State.Inactive), "Invalid state value");
        // 检查值是否在有效范围内（0-2）

        return State(_value);  // 整数转枚举
    }

    /**
     * @notice 获取枚举的最大值
     * @dev 返回 State 枚举中最大成员的整型值
     *
     * 用途：
     * - 验证用户输入的范围
     * - 计算枚举数组长度
     *
     * @return 最大枚举值（uint8 类型）
     */
    function getMaxStateValue() public pure returns (uint8) {
        return uint8(State.Inactive);  // Inactive = 2，是最大值
    }

    /**
     * @notice 获取枚举的所有值
     * @dev 返回多个枚举值的整型表示
     *
     * 返回值语法：
     * returns (type1 name1, type2 name2, ...)
     * 返回元组：(value1, value2, ...)
     *
     * @return created Created 状态值 (0)
     * @return locked Locked 状态值 (1)
     * @return inactive Inactive 状态值 (2)
     */
    function getAllStateValues() public pure returns (
        uint8 created,
        uint8 locked,
        uint8 inactive
    ) {
        // 将枚举显式转换为 uint8
        return (
            uint8(State.Created),    // 0
            uint8(State.Locked),     // 1
            uint8(State.Inactive)    // 2
        );
    }

    // ═══════════════════════════════════════════════════════════
    // 枚举比较
    // ═══════════════════════════════════════════════════════════

    /**
     * @notice 比较两个状态是否相等
     * @dev 枚举比较与整数比较语法相同
     *
     * 比较运算符：
     * - == 等于
     * - != 不等于
     *
     * @param _state1 状态1
     * @param _state2 状态2
     * @return 是否相等
     */
    function compareStates(State _state1, State _state2) public pure returns (bool) {
        return _state1 == _state2;
    }

    /**
     * @notice 检查状态是否是 Created
     * @dev 便捷函数，直接检查当前状态
     *
     * 用途：简化外部调用，无需了解枚举内部实现
     *
     * @return 是否是 Created
     */
    function isCreated() public view returns (bool) {
        return currentState == State.Created;
    }

    /**
     * @notice 检查状态是否是 Locked
     * @dev 便捷函数，直接检查当前状态
     *
     * @return 是否是 Locked
     */
    function isLocked() public view returns (bool) {
        return currentState == State.Locked;
    }

    /**
     * @notice 检查状态是否是 Inactive
     * @dev 便捷函数，直接检查当前状态
     *
     * @return 是否是 Inactive
     */
    function isInactive() public view returns (bool) {
        return currentState == State.Inactive;
    }
}

/**
 * ═══════════════════════════════════════════════════════════
 * 学习要点总结
 * ═══════════════════════════════════════════════════════════
 *
 * 1. 枚举的定义和声明
 *    - 定义：枚举是一种用户自定义类型，用于表示有限数量的状态值。枚举值从 0 开始自动编号，也可以显式指定值
 *    - 语法：enum EnumName { Value1, Value2, Value3, ... }
 *    - 位置：在合约内部、 contract 层级声明
 *    - 命名：首字母大写的驼峰命名
 *    - 成员：逗号分隔，成员名不能重复
 *    - 默认值：第一个成员的整型值为 0，后续依次递增
 *
 * 2. 枚举值的比较
 *    - 比较运算符：==, !=
 *    - 语法：enumVar == EnumName.Member
 *    - 示例：currentState == State.Created
 *    - 注意：枚举只能与同一枚举类型的成员比较
 *
 * 3. 枚举在状态机中的应用
 *    ═══════════════════════════════════════════════════════════════════════════
 *
 *    什么是状态机？
 *    状态机是一种抽象概念，表示一个系统只能处于有限数量的状态之一，
 *    并且在特定条件下可以从一个状态转换到另一个状态。
 *
 *    状态机的组成要素：
 *    - 状态(States)：使用枚举定义所有可能的状态
 *    - 初始状态：系统启动时的默认状态（如 Created, Pending）
 *    - 转换规则：通过 require 限制转换条件
 *    - 终止状态：可选的最终状态（如 Delivered, Cancelled）
 *
 *    本合约中的状态机示例：
 *
 *    【状态机1：State 枚举】
 *    ┌─────────┐    lock()     ┌─────────┐    deactivate()  ┌───────────┐
 *    │ Created │ ─────────────>│ Locked  │ ───────────────>│ Inactive  │
 *    └─────────┘                └─────────┘                  └───────────┘
 *         ↑                                                            │
 *         │                          reset()                           │
 *         └────────────────────────────────────────────────────────────┘
 *
 *    【状态机2：OrderStatus 枚举】
 *    ┌─────────┐ confirmOrder() ┌──────────┐ shipOrder() ┌─────────┐ deliverOrder()┌──────────┐
 *    │ Pending │ ──────────────>│ Confirmed│ ───────────>│ Shipped │ ────────────>│Delivered│
 *    └─────────┘                 └──────────┘              └─────────┘                 └──────────┘
 *         │                            │                         │
 *         │ cancelOrder()              │ cancelOrder()           │
 *         ▼                            ▼                         │
 *    ┌───────────┐                                                    │
 *    │ Cancelled │ ◄────────────────────────────────────────────────┘
 *    └───────────┘
 *
 *    状态转换的实现方式：
 *    - 使用 require() 函数验证转换条件
 *    - 使用事件记录状态转换（前端的回调通知）
 *    - 状态存储在 public 状态变量中供外部查询
 *    ═══════════════════════════════════════════════════════════════════════════
 *
 * 4. 枚举与整型的转换
 *    - 枚举转整数：uint8(enumValue) 或 uint256(enumValue)
 *    - 整数转枚举：EnumName(value)
 *    - 注意事项：
 *      * 整数转枚举时要验证值是否有效
 *      * 使用 require(value <= maxValue, "error") 防止无效值
 *      * 无效枚举值可能导致运行时错误
 *
 * ═══════════════════════════════════════════════════════════
 * 枚举的最佳实践
 * ═══════════════════════════════════════════════════════════
 *
 * 1. 优先使用枚举而不是魔法数字
 *    - 差：if (status == 1) ...
 *    - 好：if (status == OrderStatus.Confirmed) ...
 *
 * 2. 始终验证外部输入的整型值
 *    - 当将整数转换为枚举时，必须先验证范围
 *
 * 3. 使用事件记录状态转换
 *    - 便于前端监听和 DApp 交互
 *    - 有助于调试和审计
 *
 * 4. 合理设计状态机
 *    - 明确定义所有可能的状态
 *    - 清晰定义状态转换规则
 *    - 使用 require 强制转换条件
 *
 * 5. 使用 view 函数提供查询接口
 *    - 封装状态查询逻辑
 *    - 提供便捷的状态检查函数（如 isCreated()）
 *
 * ═══════════════════════════════════════════════════════════
 */
