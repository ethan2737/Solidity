# Solidity 进阶：枚举、自定义值类型与状态机

> 本文档基于 Solidity 0.8.24+

## 目录

1. [枚举（Enum）](#1-枚举enum)
2. [自定义值类型（Custom Value Type）](#2-自定义值类型custom-value-type)
3. [状态机（State Machine）](#3-状态机state-machine)

---

## 1. 枚举（Enum）

### 1.1 什么是枚举？

枚举（Enum）是一种用户**自定义类型**，用于表示**有限数量的状态值**。它允许我们用语义化的名称来代替魔法数字，让代码更易读、更安全。

**生活中的例子：**
- 星期几：Monday, Tuesday, Wednesday...
- 订单状态：Pending, Confirmed, Shipped, Delivered
- 用户角色：Guest, Member, Admin, Owner

### 1.2 枚举的定义语法

```solidity
// 语法：enum EnumName { Value1, Value2, Value3, ... }
enum State {
    Created,    // 0 - 初始状态
    Locked,     // 1 - 锁定状态
    Inactive    // 2 - 非活跃状态
}

enum OrderStatus {
    Pending,    // 0 - 待确认
    Confirmed,  // 1 - 已确认
    Shipped,    // 2 - 已发货
    Delivered,  // 3 - 已送达
    Cancelled   // 4 - 已取消
}
```

**关键点：**
- 枚举定义在合约内部
- 成员值从 0 开始自动编号
- 可以显式指定值：`Created = 0, Locked = 1`

### 1.3 枚举的使用

**作为状态变量：**

```solidity
contract EnumDemo {
    // 定义枚举
    enum State { Created, Locked, Inactive }

    // 使用枚举声明状态变量
    State public currentState = State.Created;  // 初始为 Created

    // 使用枚举作为映射的值类型
    mapping(uint256 => OrderStatus) public orders;
}
```

**在函数中使用：**

```solidity
function setState(State _newState) public {
    currentState = _newState;
}

function lock() public {
    require(currentState == State.Created, "Can only lock from Created state");
    currentState = State.Locked;
}
```

### 1.4 枚举值的比较

```solidity
// 比较枚举值
require(currentState == State.Created);  // 判断是否等于某个状态

// 使用 == 和 != 运算符
if (state == State.Locked) {
    // 执行某些操作
}
```

### 1.5 枚举与整型的转换

**枚举 → 整数：**

```solidity
State state = State.Locked;
uint8 value = uint8(state);  // Locked = 1
```

**整数 → 枚举：**

```solidity
uint8 value = 1;
State state = State(value);  // 等同于 State.Locked

// ⚠️ 注意：需要验证值的有效性！
function uint8ToState(uint8 _value) public pure returns (State) {
    require(_value <= uint8(State.Inactive), "Invalid state value");
    return State(_value);
}
```

### 1.6 枚举的最佳实践

```solidity
// ✅ 推荐：使用枚举
if (orderStatus == OrderStatus.Confirmed) { ... }

// ❌ 避免：使用魔法数字
if (orderStatus == 1) { ... }
```

**总结要点：**

| 概念 | 说明 |
|------|------|
| 定义语法 | `enum EnumName { Value1, Value2, ... }` |
| 默认值 | 第一个成员 = 0，后续递增 |
| 比较 | 使用 `==` 或 `!=` |
| 转整数 | `uint8(enumValue)` |
| 转枚举 | `EnumName(value)`，需验证有效性 |

---

## 2. 自定义值类型（Custom Value Type）

### 2.1 什么是自定义值类型？

自定义值类型是 **Solidity 0.8+** 引入的新特性。它允许我们基于内置类型创建新的类型，带来：
- **类型安全**：防止意外的类型混用
- **代码可读性**：用 `Price` 而非 `uint256` 表示价格
- **语义明确**：代码意图更清晰

### 2.2 自定义值类型的定义

```solidity
// 语法：type TypeName is UnderlyingType;
// 位置：在合约外部、pragma 之后定义

type UserId is uint128;      // 基于 uint128 的用户ID
type OrderId is uint256;     // 基于 uint256 的订单ID
type Price is uint256;        // 基于 uint256 的价格（单位 wei）
type Percentage is uint8;     // 基于 uint8 的百分比（0-100）
```

**底层类型只能是整数类型**：`uint8`, `uint256`, `int8` 等

### 2.3 包装（Wrap）与展开（Unwrap）

这是自定义值类型的**核心概念**：

| 操作 | 语法 | 作用 |
|------|------|------|
| 包装 (wrap) | `Price.wrap(value)` | 底层类型 → 自定义类型 |
| 展开 (unwrap) | `Price.unwrap(priceValue)` | 自定义类型 → 底层类型 |

**为什么需要包装/展开？**
- 自定义类型本质上还是底层类型
- 但编译器会阻止不同自定义类型之间的混用（类型安全）
- 需要计算时必须先展开为底层类型

### 2.4 代码示例

**创建和初始化：**

```solidity
contract CustomValueType {
    // 定义类型（在合约外部）
    type Price is uint256;

    // 使用类型
    Price public currentPrice;

    constructor() {
        // 包装初始化
        currentPrice = Price.wrap(0);
    }
}
```

**包装与展开的使用场景：**

```solidity
// 1. 创建新值（包装）
function setPrice(uint256 _value) public {
    currentPrice = Price.wrap(_value);  // uint256 → Price
}

// 2. 取出值计算（展开）
function applyDiscount(Price _price, uint8 _discount) public pure returns (Price) {
    // 展开为底层类型进行计算
    uint256 rawPrice = Price.unwrap(_price);
    uint256 discounted = rawPrice * (100 - _discount) / 100;

    // 包装返回
    return Price.wrap(discounted);
}

// 3. 直接使用（不需要展开）
function getPrice() public view returns (Price) {
    return currentPrice;  // 直接返回
}
```

**完整示例：**

```solidity
type Price is uint256;
type Percentage is uint8;

contract Shop {
    Price public currentPrice;
    Percentage public discount;

    // 从 wei 创建价格
    function createPriceFromWei(uint256 _value) public pure returns (Price) {
        return Price.wrap(_value);
    }

    // 从 ether 创建价格（自动转换为 wei）
    function createPriceFromEther(uint256 _etherValue) public pure returns (Price) {
        return Price.wrap(_etherValue * 1e18);
    }

    // 应用折扣
    function applyDiscount(Price _price, Percentage _percent) public pure returns (Price) {
        uint256 rawPrice = Price.unwrap(_price);
        uint8 percentValue = Percentage.unwrap(_percent);

        require(percentValue <= 100, "Discount cannot exceed 100%");

        uint256 result = rawPrice * (100 - percentValue) / 100;
        return Price.wrap(result);
    }
}
```

### 2.5 什么时候需要展开？

**需要展开的场景：**
- 数学运算：`Price.unwrap(p1) + Price.unwrap(p2)`
- 比较操作：`Price.unwrap(p1) == Price.unwrap(p2)`
- 转换为其他类型

**不需要展开的场景：**
- 作为映射的 key/value
- 函数参数传递
- 存储到状态变量

### 2.6 总结要点

| 概念 | 说明 |
|------|------|
| 定义语法 | `type TypeName is UnderlyingType;` |
| 包装 | `Type.wrap(value)` - 底层 → 自定义 |
| 展开 | `Type.unwrap(value)` - 自定义 → 底层 |
| 使用场景 | 价格、ID、百分比等有明确语义的场景 |
| 优势 | 类型安全、可读性好、IDE支持 |

---

## 3. 状态机（State Machine）

### 3.1 什么是状态机？

状态机是一种**设计模式**，用于管理系统只能处于**有限状态**之一，并在**特定条件**下进行状态转换。

**生活中的例子：**
- 电梯：停止 → 上升 → 停止 → 下降 → 停止
- 订单：待付款 → 已付款 → 已发货 → 已收货

### 3.2 状态机的组成要素

```
状态机 = 状态定义 + 状态变量 + 转换规则 + 转换函数
```

1. **状态**：用枚举定义所有可能的状态
2. **状态变量**：存储当前状态
3. **转换规则**：定义哪些状态可以转换到哪些状态
4. **转换函数**：执行状态转换的函数

### 3.3 状态机代码示例

```solidity
contract StateMachine {
    // 1. 定义状态枚举
    enum ContractState {
        Draft,      // 0 - 草稿
        Review,     // 1 - 审核中
        Approved,   // 2 - 已批准
        Active,     // 3 - 激活
        Suspended,  // 4 - 暂停
        Terminated  // 5 - 终止（终态）
    }

    // 2. 状态变量
    ContractState public state = ContractState.Draft;
    address public owner;
    address public reviewer;

    // 3. 修饰符：验证状态
    modifier inState(ContractState _requiredState) {
        require(state == _requiredState, "Invalid state");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // 4. 状态转换函数
    function submitForReview() public onlyOwner inState(ContractState.Draft) {
        state = ContractState.Review;
    }

    function approve() public onlyReviewer inState(ContractState.Review) {
        state = ContractState.Approved;
    }

    function activate() public onlyOwner inState(ContractState.Approved) {
        state = ContractState.Active;
    }

    function terminate() public onlyOwner {
        require(
            state == ContractState.Active ||
            state == ContractState.Approved,
            "Cannot terminate"
        );
        state = ContractState.Terminated;
    }
}
```

### 3.4 状态转换图

```
┌─────────┐  submitForReview()  ┌─────────┐  approve()  ┌──────────┐
│  Draft  │ ──────────────────>│ Review  │ ───────────>│ Approved │
└─────────┘                     └─────────┘              └──────────┘
      ▲                                │                         │
      │ reject()                       │                         │
      │                                ▼                         │
      │                          (reject返回)                    │
      │                                                         │
      │                                │                    activate()
      │                                │                         │
      │                                │                         ▼
      │                                │                   ┌─────────┐
      │                                │                   │ Active  │
      │                                │                   └─────────┘
      │                                │                         │
      │                                │                    suspend()
      │                                │                         │
      │                                │                         ▼
      │                                │                   ┌───────────┐
      │                                │                   │ Suspended │
      │                                │                   └───────────┘
      │                                │                         │
      │                                │                    resume()
      │                                │                         │
      └────────────────────────────────┘                         │
                                                               │
                    terminate() ─────────────────────────────────┘
                                                               ▼
                                                         ┌────────────┐
                                                         │ Terminated │ ← 终态
                                                         └────────────┘
```

### 3.5 状态验证方法

**方法1：使用修饰符**

```solidity
modifier inState(ContractState _state) {
    require(state == _state, "Invalid state");
    _;
}

function activate() public onlyOwner inState(ContractState.Approved) {
    state = ContractState.Active;
}
```

**方法2：使用 require**

```solidity
function terminate() public onlyOwner {
    require(
        state == ContractState.Active ||
        state == ContractState.Suspended,
        "Cannot terminate"
    );
    state = ContractState.Terminated;
}
```

**方法3：查询函数**

```solidity
function canTransitionTo(ContractState _targetState) public view returns (bool) {
    if (state == ContractState.Draft && _targetState == ContractState.Review) return true;
    if (state == ContractState.Review && _targetState == ContractState.Approved) return true;
    // ... 更多规则
    return false;
}
```

### 3.6 状态转换历史记录

```solidity
struct StateTransition {
    ContractState fromState;
    ContractState toState;
    uint256 timestamp;
    address triggeredBy;
}

StateTransition[] public transitionHistory;

function _transitionTo(ContractState _newState) internal {
    ContractState oldState = state;
    state = _newState;

    transitionHistory.push(StateTransition({
        fromState: oldState,
        toState: _newState,
        timestamp: block.timestamp,
        triggeredBy: msg.sender
    }));
}
```

### 3.7 状态机的最佳实践

```solidity
// ✅ 推荐：清晰的转换规则
function submitForReview() public onlyOwner inState(ContractState.Draft) {
    state = ContractState.Review;
}

// ❌ 避免：不做状态检查
function submitForReview() public onlyOwner {
    state = ContractState.Review;  // 任何状态都能提交！
}
```

**最佳实践清单：**

1. **明确定义所有状态** - 使用枚举
2. **设计清晰的转换规则** - 绘制转换图
3. **使用修饰符验证状态** - 简化代码
4. **记录转换历史** - 便于审计
5. **考虑终态** - 终态不可逆
6. **提供查询接口** - 方便前端调用

### 3.8 总结要点

| 概念 | 说明 |
|------|------|
| 状态定义 | 使用枚举列出所有可能状态 |
| 状态变量 | 存储当前状态 |
| 转换规则 | 使用 require 或 modifier 验证 |
| 转换函数 | 执行状态变更 |
| 终态 | Terminated 等不可逆状态 |
| 记录历史 | 使用事件 + 数组 |

---

## 知识点串联

这三个知识点是**递进关系**：

```
枚举 (Enum)
    ↓
自定义值类型 (基于枚举的进阶)
    ↓
状态机 (枚举的实战应用)
```

1. **枚举** 是基础 - 定义有限状态集合
2. **自定义值类型** 是增强 - 让类型更安全、语义更清晰
3. **状态机** 是应用 - 用枚举管理业务流程

**实际开发中：**
- 用枚举定义状态
- 用自定义值类型表示价格、ID等
- 用状态机模式控制业务流程

---

## 常见错误与避免

| 错误 | 解决方法 |
|------|----------|
| 整数转枚举未验证 | 使用 `require(value <= maxValue)` |
| 状态转换无检查 | 使用 `modifier inState()` |
| 包装/展开使用错误 | 需要计算时展开，否则直接使用 |
| 终态可逆 | 终态后不提供任何转换函数 |

