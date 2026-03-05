# Solidity 进阶：自定义类型与函数

> 本文档系统讲解 Solidity 中自定义类型（结构体、映射）和函数（可见性、调用方式、错误处理）的概念与实践。

---

## 前置知识：理解智能合约运行环境

在深入 Solidity 语法之前，需要先理解智能合约的运行环境和基础概念。

### 什么是 EVM

**EVM（Ethereum Virtual Machine，以太坊虚拟机）** 是运行智能合约的虚拟计算机。当我们"调用"一个智能合约的函数时，实际上是向以太坊网络发送一笔交易，EVM 执行该交易并记录结果。

关键点：
- EVM 是一个隔离的执行环境，智能合约在"沙箱"中运行
- 每次函数调用都会消耗 **Gas**（燃料），这是计算资源的计量单位
- Gas 费用由调用者支付，这激励开发者编写高效的代码

### 什么是 Gas

**Gas** 是执行智能合约操作所需的计算资源单位。类比：Gas 就像汽车的燃油，执行操作需要"加油"。

- 每个操作（如存储数据、计算哈希）都有固定的 Gas 成本
- Gas 价格由市场决定，但每个操作有最低消耗
- Gas 退还机制：`revert` 会退还剩余 Gas，但 `assert` 失败不退

---

## 第一章：自定义数据类型

在 Solidity 中，我们不仅可以使用基本类型（uint256、address、bool 等），还可以创建自定义类型来组织复杂数据。

---

## 1.1 结构体（Struct）

### 背景概念

现实世界中，很多数据是"复合"的。比如一个"用户"有地址、余额、状态等多个属性；一个"订单"有订单号、买家、卖家、金额、状态等多个字段。

如果我们只用基本类型来存储，需要为每个属性单独创建变量，管理起来非常麻烦。**结构体（Struct）** 就是为了解决这个问题——将多个相关的数据组合成一个逻辑单元。

### 定义语法

```solidity
// 使用 struct 关键字定义结构体，类似于其他语言的 struct 或 class
// 结构体把多个不同类型的变量"打包"在一起
struct User {
    address addr;      // 用户地址，存储用户的以太坊地址
    uint256 balance;  // 用户余额，存储用户的代币数量
    bool isActive;    // 是否激活，标记用户账户是否处于活跃状态
}
```

### 初始化方式

结构体创建实例时，有两种方式：

```solidity
// 方式一：命名参数（推荐）
// 明确指定每个字段的值，字段顺序无关，代码可读性好
User memory user1 = User({
    addr: msg.sender,      // 赋值为当前调用者地址
    balance: 100,          // 初始余额设为 100
    isActive: true        // 初始激活状态为 true
});

// 方式二：位置参数（不推荐）
// 按照结构体定义字段的顺序依次传入值
// 缺点：字段顺序必须完全匹配，容易因顺序错误导致赋值错误
User memory user2 = User(msg.sender, 100, true);
```

### 结构体比较：为什么需要 keccak256

在 Solidity 中，结构体不能直接用 `==` 或 `!=` 比较。这是因为结构体可能包含复杂数据（如字符串），"相等"的定义不明确。

```solidity
struct Person {
    string name;    // 姓名，字符串类型
    uint256 age;    // 年龄，数字类型
}

/**
 * @notice 比较两个 Person 是否相等
 * @dev 字符串比较不能用 ==，需要用 keccak256 哈希后比较
 * @param p1 第一个 Person
 * @param p2 第二个 Person
 * @return bool 是否相等
 */
function compare(Person calldata p1, Person calldata p2) public pure returns (bool) {
    // keccak256 是以太坊的哈希函数，将任意数据转换为固定长度的哈希值
    // 字符串比较：先转成 bytes，再用 keccak256 计算哈希值比较
    // 基本类型（uint256）直接用 == 比较即可
    return keccak256(bytes(p1.name)) == keccak256(bytes(p2.name))
        && p1.age == p2.age;
}
```

**为什么要用 keccak256 比较字符串？**
- 字符串长度不确定，无法直接比较
- 哈希将任意长度字符串转换为固定长度（32 字节）的"指纹"
- 如果两个字符串哈希值相同，则认为它们相等

### 结构体复制

```solidity
/**
 * @notice 复制 Person（创建副本）
 * @dev 结构体赋值默认是值拷贝（深拷贝），创建完全独立的副本
 * @param p 源 Person
 * @return 复制的 Person
 */
function copy(Person calldata p) public pure returns (Person memory) {
    // 创建一个新的结构体实例，将原字段值逐一复制
    return Person(p.name, p.age);
}

/**
 * @notice 复制并修改
 * @dev Memory 类型的变量是临时副本，修改不会影响原始数据
 * @param p 源 Person
 * @param _age 新年龄
 * @return 修改后的新 Person
 */
function copyAndModify(Person calldata p, uint256 _age) public pure returns (Person memory) {
    Person memory newPerson = p;  // 先复制一份到 Memory
    newPerson.age = _age;          // 修改副本
    return newPerson;              // 返回修改后的副本，原始数据不变
}
```

---

## 1.2 映射（Mapping）

### 背景概念

在传统数据库中，我们常用"表"来存储数据，每行有一个主键（如用户 ID），可以通过主键快速找到对应的记录。

**映射（Mapping）** 在 Solidity 中就是类似的键值对数据结构。它的核心优势是**查找效率极高**，无论数据量多大，查找速度几乎不变。

### 时间复杂度 O(1)

**O(1)** 是算法复杂度的表示方法，表示"常数时间"：
- O(1)：无论数据量多少，查找速度一样快（映射的特点）
- O(n)：数据量越大，查找越慢（需要遍历）

类比：
- 映射就像字典书后的索引页，直接翻到目标页 — O(1)
- 数组遍历就像从头逐页翻书 — O(n)

### 定义语法

```solidity
// 映射定义语法：mapping(键类型 => 值类型) 可见性 名称;
// 键类型（KeyType）：只能是值类型，如 address、uint256、bytes32
// 值类型（ValueType）：可以是任何类型，包括结构体、数组、甚至另一个映射

mapping(address => uint256) public balances;    // 地址 -> 余额，查找某个地址的余额
mapping(uint256 => string) public names;        // ID -> 名称，根据 ID 查找名称
mapping(address => bool) public isRegistered;   // 地址 -> 是否注册，检查是否已注册
```

### 键类型限制

映射的键类型有严格限制，**只能是值类型**，不能是复杂类型：

```solidity
// 合法：address, uint256, bytes32, bool, enum 等值类型
mapping(address => uint256) public a;
mapping(uint256 => bool) public b;

// 不合法：不能是 mapping、dynamic array、struct、contract、enum
// mapping(mapping => uint256) public c;  // 错误
```

### 访问行为

```solidity
mapping(address => uint256) public balances;

/**
 * @notice 获取余额
 * @dev 访问不存在的键时，返回该类型的默认值
 *      uint256 默认值是 0，address 默认是 address(0)
 */
function getBalance(address _addr) public view returns (uint256) {
    return balances[_addr];  // 如果 _addr 从未设置过，返回 0
}
```

**这带来了一个问题**：我们无法区分"值是 0"和"键不存在"的情况。

### 解决方案：存在性检查映射

通常配合一个额外的 `bool` 映射来检查数据是否存在：

```solidity
mapping(address => uint256) public balances;
mapping(address => bool) public hasBalance;  // 检查余额是否被设置过

function setBalance(address _addr, uint256 _amount) public {
    balances[_addr] = _amount;
    hasBalance[_addr] = true;  // 标记已设置
}

function getBalance(address _addr) public view returns (uint256, bool) {
    return (balances[_addr], hasBalance[_addr]);  // 返回余额和是否存在
}
```

### 映射遍历：为什么映射无法直接遍历

映射的底层实现是哈希表，**只存储键值对，不存储键的列表**。因此：
- 无法获取"所有键"
- 无法知道映射的大小
- 无法用 for 循环遍历

**解决方案**：使用辅助数组同步存储键列表：

```solidity
struct User {
    address addr;
    uint256 balance;
}

mapping(address => User) public users;      // 主映射：存储用户数据
address[] public allUsers;                   // 辅助数组：存储所有用户地址

/**
 * @notice 创建用户
 * @dev 存储到映射的同时，将地址添加到辅助数组（用于遍历）
 */
function createUser(address _addr, uint256 _balance) public {
    users[_addr] = User(_addr, _balance);
    allUsers.push(_addr);  // 同步添加到辅助数组
}

/**
 * @notice 获取所有用户地址
 */
function getAllUsers() public view returns (address[] memory) {
    return allUsers;
}

/**
 * @notice 计算所有用户的总余额
 * @dev 遍历辅助数组，而非映射
 */
function getTotalBalance() public view returns (uint256) {
    uint256 total = 0;
    for (uint256 i = 0; i < allUsers.length; i++) {
        total += users[allUsers[i]].balance;
    }
    return total;
}
```

---

## 1.3 嵌套结构与组合使用

### 嵌套映射

映射的值也可以是映射，实现"一对多"或"多对多"关系：

```solidity
// 嵌套映射：用户地址 -> 产品ID -> 数量
// 含义：某个用户购买了某个产品多少数量
mapping(address => mapping(uint256 => uint256)) public userProducts;

/**
 * @notice 设置用户拥有的产品数量
 */
function setProduct(address _user, uint256 _productId, uint256 _qty) public {
    // 访问嵌套映射需要两层索引
    userProducts[_user][_productId] = _qty;
}

function getProduct(address _user, uint256 _productId) public view returns (uint256) {
    return userProducts[_user][_productId];
}
```

### 映射 + 结构体组合

**为什么需要这种模式？**

- 映射提供 O(1) 的快速查找能力
- 结构体可以将多个相关数据打包
- 两者结合：以地址/ID 为键，快速查找复杂的用户信息

这是最常见的组合模式：

```solidity
// 定义用户结构体，包含地址和余额两个字段
struct User {
    address addr;      // 用户地址
    uint256 balance;  // 用户余额
}

// 主映射：地址 -> 用户结构体
// 用途：根据用户地址快速查询用户信息
mapping(address => User) public users;

// 辅助映射：地址 -> bool
// 用途：检查某个地址的用户是否已存在（解决映射"零值歧义"问题）
mapping(address => bool) public userExists;

/**
 * @notice 创建新用户
 * @dev 先检查用户是否已存在，再存储到映射
 * @param _addr 用户地址
 * @param _balance 初始余额
 */
function createUser(address _addr, uint256 _balance) public {
    // 检查用户是否已存在，防止重复创建
    // 如果 userExists[_addr] 为 true，说明用户已存在
    require(!userExists[_addr], "exists");

    // 创建 User 结构体并存储到映射
    // 语法：mapping[key] = struct(...)
    users[_addr] = User(_addr, _balance);

    // 标记该地址的用户已存在
    // 同步更新辅助映射
    userExists[_addr] = true;
}

/**
 * @notice 获取用户信息
 * @dev 先检查用户是否存在，再返回数据
 * @param _addr 用户地址
 * @return User 结构体（返回的是 Memory 副本）
 */
function getUser(address _addr) public view returns (User memory) {
    // 检查用户是否存在，避免返回默认值
    require(userExists[_addr], "not found");

    // 从映射读取并返回用户结构体
    // 注意：从映射读取返回的是 Memory 副本，不是引用
    return users[_addr];
}
```

### 结构体修改

```solidity
// 方式一：直接修改
function updateBalance(address _addr, uint256 _balance) public {
    users[_addr].balance = _balance;
}

// 方式二：使用 storage 引用（更清晰）
function updateBalanceRef(address _addr, uint256 _balance) public {
    User storage u = users[_addr];  // storage 关键字表示引用，而非拷贝
    u.balance = _balance;           // 修改直接影响原始数据
}
```

---

## 第二章：数据存储与函数基础

上一章介绍了自定义数据类型，这一章我们学习数据的存储位置，以及理解"函数"是什么。

---

## 2.1 数据存储位置

### 背景概念：智能合约的数据存在哪里

智能合约的状态（数据）需要持久化存储在区块链上。但区块链存储昂贵，所以 Solidity 区分了不同类型的存储位置，让开发者可以选择合适的方式来平衡成本和性能。

### 三种存储位置

| 位置 | 说明 | 生命周期 | Gas 成本 | 适用场景 |
|------|------|----------|----------|----------|
| **Storage** | 永久存储在区块链上 | 合约存活期间 | 高 | 状态变量（需要持久化的数据） |
| **Memory** | 临时存储在内存中 | 函数调用期间 | 低 | 函数内部变量、返回值 |
| **Calldata** | 不可修改的临时存储 | 函数调用期间 | 最低 | 函数参数（当参数不需要修改时） |

### 使用规则

```solidity
struct Person {
    string name;
    uint256 age;
}

// 状态变量（默认 storage）
Person public person;
Person[] public persons;
mapping(address => Person) public map;

// ═══════════════════════════════════════════════════════════
// 函数参数：Memory 或 Calldata
// ═══════════════════════════════════════════════════════════

/**
 * @notice 使用 Memory 参数（可修改）
 * @dev 函数参数默认不能是 storage，只能是 memory 或 calldata
 *      memory 表示创建一份拷贝，可以在函数内修改
 */
function foo(Person memory p) internal pure {
    p.age = 100;  // 修改的是副本，不影响原始数据
}

/**
 * @notice 使用 Calldata 参数（不可修改）
 * @dev calldata 是最优选择：不可修改，Gas 最省
 *      适用于只读取参数、不修改的场景
 */
function bar(Person calldata p) internal pure {
    // p.age = 100;  // 编译错误：calldata 不可修改
    uint256 a = p.age;  // 可以读取
}

// ═══════════════════════════════════════════════════════════
// 返回值：必须是 Memory
// ═══════════════════════════════════════════════════════════

function getPerson() public view returns (Person memory) {
    return persons[0];  // 从 storage 读取会自动复制到 memory
}
```

### 存储引用 vs 内存拷贝

```solidity
mapping(address => User) public users;

/**
 * @notice Storage 引用
 * @dev 使用 storage 关键字创建引用，指向原始数据位置
 *      修改会影响原始数据
 */
function updateViaRef(address _addr, uint256 _balance) public {
    User storage u = users[_addr];  // 引用，而非拷贝
    u.balance = _balance;           // 直接修改原始数据
}

/**
 * @notice Memory 拷贝
 * @dev 不使用 storage 关键字，默认是 memory（拷贝）
 *      修改副本，不影响原始数据
 */
function updateViaMemory(address _addr, uint256 _balance) public {
    User memory u = users[_addr];  // 拷贝一份到 memory
    u.balance = _balance;          // 修改的是副本，原始数据不变
}
```

---

## 2.2 理解函数

### 什么是函数

**函数（Function）** 是执行特定任务的代码块。在智能合约中，函数是暴露给外部的操作接口。

类比理解：
- 传统程序：函数就像 API 接口，提供某种服务
- 智能合约：函数是用户与合约交互的唯一方式

### 函数的基本结构

```solidity
//         函数名        参数          返回值
function setValue(uint256 _value) public returns (bool) {
    // 函数体：执行逻辑
    value = _value;
    return true;
}
```

### 函数的组成部分

```solidity
/**
 * @notice 函数的说明（给用户看）
 * @dev 函数的详细说明（给开发者看）
 * @param _value 输入参数说明
 * @return 返回值说明
 */
function functionName(uint256 _value) public view returns (uint256) {
    // 函数体
    return _value * 2;
}
```

---

## 第三章：函数进阶

这一章深入学习函数的三方面：可见性（谁能调用）、调用方式（怎么调用）、错误处理（调用失败怎么办）。

---

## 3.1 函数可见性

### 背景概念：为什么要限制函数可见性

智能合约部署在区块链上，默认情况下任何人都可以调用任何函数。但有时候：
- 某些函数只应该内部使用（如辅助计算）
- 某些数据不应该让外部直接读取
- 某些操作只应该管理员执行

**可见性修饰符** 就是用来控制"谁能调用这个函数"的。

### 四种可见性

| 可见性 | 调用范围 | 特点 |
|--------|----------|------|
| `public` | 内部 + 外部 | 可被任何人调用，也可被合约内部调用 |
| `external` | 仅外部 | 只能从合约外部调用，内部需用 `this` |
| `internal` | 仅内部 | 当前合约及继承合约可调用 |
| `private` | 仅当前合约 | 不能被继承合约访问 |

**记忆技巧**：
- `public`：公开，大家都能用
- `external`：对外，外部才能用
- `internal`：内部，自己人和继承的子类能用
- `private`：私有，只有自己能用

### 示例

```solidity
uint256 public publicValue = 100;   // 公开：任何人都能读取
uint256 private privateValue = 200; // 私有：仅当前合约可访问
uint256 internal internalValue = 300; // 内部：当前合约及子类可访问

/**
 * @notice Public 函数：内部和外部都可调用
 * @dev 最常用的可见性，可作为入口函数
 */
function publicFunc(uint256 _value) public {
    publicValue = _value;
}

/**
 * @notice External 函数：只能从外部调用
 * @dev 优点：Gas 效率更高（外部调用更便宜）
 *      缺点：内部不能直接调用
 */
function externalFunc(uint256 _value) external {
    publicValue = _value;
}

/**
 * @notice Internal 函数：只能内部调用
 * @dev 命名惯例：使用 _ 前缀（如 _helper）
 *      适合作为内部辅助函数
 */
function _internalFunc(uint256 _value) internal {
    internalValue = _value;
}

/**
 * @notice Private 函数：仅当前合约可调用
 * @dev 命名惯例：使用 _ 前缀
 *      即使继承的合约也无法访问
 */
function _privateFunc(uint256 _value) private {
    privateValue = _value;
}

/**
 * @notice Public 函数内部调用 Internal
 * @dev 直接调用，不需要任何前缀
 */
function callInternal() public {
    _internalFunc(100);  // 内部调用
}

/**
 * @notice Public 函数内部调用 External
 * @dev 必须使用 this 关键字，产生外部调用
 *      注意：这种方式会消耗更多 Gas
 */
function callExternal() public {
    this.externalFunc(200);  // 外部调用（通过 this）
}
```

### 可见性的 Gas 差异

```solidity
/**
 * @notice External 理论上比 public 更省 Gas
 * @dev 原因：external 函数不需要处理内部调用的情况
 *      但差异不大，现代编译器已经做了很多优化
 */
function externalOnly() external view { /* ... */ }
function publicOnly() public view { /* ... */ }
```

**最佳实践**：如果函数不需要内部调用，优先使用 `external`。

---

## 3.2 函数调用方式

### 背景概念：内部调用 vs 外部调用

EVM（以太坊虚拟机）支持两种函数调用方式：
- **内部调用（Internal Call）**：直接在当前合约代码中执行，不产生新的调用帧
- **外部调用（External Call）**：产生新的 EVM 调用帧，像调用另一个合约

### 对比

| 调用类型 | 语法 | EVM 调用 | Gas 消耗 | 栈深度限制 |
|----------|------|----------|----------|------------|
| 内部调用 | `_func()` / `func()` | 否 | 少 | 宽松（~1024） |
| 外部调用 | `this.func()` | 是 | 多 | 严格（约 16） |

### 示例

```solidity
uint256 public count;

/**
 * @notice Internal 函数：内部调用
 * @dev 命名带 _ 前缀是惯例，表示仅内部可调用
 */
function _helper(uint256 _value) internal {
    count += _value;
}

/**
 * @notice External 函数：外部调用
 * @dev 命名不带 _ 前缀，可外部调用
 */
function helperExternal(uint256 _value) external {
    count += _value;
}

/**
 * @notice 内部调用
 * @dev 直接调用，不产生 EVM 调用，Gas 消耗少
 */
function doInternal(uint256 _value) public {
    _helper(_value);  // 直接调用
}

/**
 * @notice 外部调用（通过 this）
 * @dev 产生 EVM 调用，需要创建新的调用帧
 *      会消耗更多 Gas
 */
function doExternal(uint256 _value) public {
    this.helperExternal(_value);  // 通过 this 调用
}
```

### 调用栈深度

EVM 对调用栈深度有限制，防止无限递归：
- **内部调用**：栈深度限制宽松（约 1024 层）
- **外部调用**：栈深度限制严格（约 16 层）

```solidity
/**
 * @notice 内部递归：可以递归更多层
 */
function recursiveInternal(uint256 _depth) public {
    if (_depth < 100) {
        recursiveInternal(_depth + 1);  // 内部调用
    }
}

/**
 * @notice 外部递归：更容易达到栈深度限制
 * @dev 约 16 层后就可能失败
 */
function recursiveExternal(uint256 _depth) public {
    if (_depth < 10) {
        this.recursiveExternal(_depth + 1);  // 外部调用
    }
}
```

### 调用其他合约

```solidity
/**
 * @notice 调用其他合约的函数
 * @dev 这也是"外部调用"的一种
 */
function callOtherContract(address _addr, uint256 _value) public {
    // 通过合约地址调用，产生外部调用
    OtherContract(_addr).setValue(_value);
}

/**
 * @notice 低级 call 调用
 * @dev 更加底层，可以调用任意合约的任意函数
 */
function lowLevelCall(address _addr, bytes calldata _data) public returns (bool) {
    (bool success, ) = _addr.call(_data);
    return success;
}
```

### 最佳实践

1. **优先内部调用**：减少 Gas 消耗
2. **避免不必要的 `this` 调用**：会产生额外开销
3. **注意栈深度**：外部调用更容易达到限制

---

## 3.3 错误处理

### 背景概念：为什么需要错误处理

智能合约一旦部署就无法修改，所以必须在执行过程中检查各种条件：
- 用户输入是否有效？
- 用户权限是否足够？
- 合约状态是否允许这个操作？

当检查失败时，需要"回滚"（Revert）——取消当前交易，恢复到执行前的状态。

### 三种错误处理方式

Solidity 提供了三种错误处理机制，适用于不同场景：

| 关键字 | 用途 | Gas 退还 | 典型场景 |
|--------|------|----------|----------|
| `require(condition, "msg")` | 条件验证 | 是 | 输入检查、权限检查 |
| `revert("msg")` | 主动回滚 | 是 | 条件分支回滚 |
| `assert(condition)` | 内部检查 | 否 | 不应该发生的错误 |

### Require：最常用的错误处理

`require` 用于验证条件，如果条件不满足则回滚并退还剩余 Gas。

```solidity
uint256 public value;
address public owner = msg.sender;

/**
 * @notice 使用 require 验证输入
 * @dev 条件为 false 时，回滚交易并显示错误消息
 */
function setValueRequire(uint256 _value) public {
    // 检查值大于 0
    require(_value > 0, "Value must be greater than 0");
    // 检查值小于等于 1000
    require(_value <= 1000, "Value must be less than or equal to 1000");
    // 验证通过，执行逻辑
    value = _value;
}

/**
 * @notice 使用 require 检查权限
 * @dev 权限检查是最常见的 require 用法
 */
function ownerOnly() public {
    require(msg.sender == owner, "Only owner can call");
    value = 999;
}
```

### Revert：条件分支回滚

`revert` 用于更复杂的条件分支，当满足某些条件时主动回滚。

```solidity
/**
 * @notice 使用 revert 条件回滚
 * @dev 适合有多层判断条件的场景
 */
function setValueRevert(uint256 _value) public {
    if (_value == 0) {
        revert("Value cannot be zero");
    }
    if (_value > 1000) {
        revert("Value exceeds maximum");
    }
    value = _value;
}
```

### Assert：内部错误检查

`assert` 用于检查"不应该发生"的情况。如果 assert 失败，说明合约代码有 bug。

**重要**：assert 失败会消耗所有 Gas，不会退还。

```solidity
/**
 * @notice 使用 assert 检查内部不变量
 * @dev 断言用于检查"不应该发生"的情况
 *      如果失败，说明合约有严重 bug
 */
function setValueAssert(uint256 _value) public {
    uint256 oldValue = value;
    value = _value;
    // 断言：新值应该大于等于旧值
    // 如果这个断言失败，说明代码逻辑有严重问题
    assert(value >= oldValue);
}
```

### 自定义错误（Solidity 0.8.4+）

**背景**：字符串错误消息会占用存储空间，增加 Gas 消耗。自定义错误只存储错误名称和参数，效率更高。

```solidity
// 在合约开头定义自定义错误
error InsufficientBalance(uint256 requested, uint256 available);
error Unauthorized(address caller);

/**
 * @notice 使用自定义错误回滚
 * @dev 更省 Gas，尤其在复杂合约中效果明显
 */
function withdraw(uint256 _amount) public {
    uint256 balance = balances[msg.sender];
    if (balance < _amount) {
        // revert InsufficientBalance(_amount, balance);
        // 效果等同于：revert("InsufficientBalance: requested X, available Y")
        // 但 Gas 消耗更少
        revert InsufficientBalance(_amount, balance);
    }
    balances[msg.sender] -= _amount;
}
```

### Try-Catch：捕获外部调用错误

**背景**：调用其他合约时，对方可能执行失败。如果不捕获错误，整个交易都会回滚。`try-catch` 让我们能够"优雅地"处理失败。

```solidity
/**
 * @notice 使用 try-catch 处理外部合约调用错误
 * @dev try-catch 用于捕获外部调用失败，而不是让整个交易失败
 */
function callWithTryCatch(address _contract, uint256 _value) public {
    // 尝试调用外部合约
    try SomeContract(_contract).setValue(_value) {
        // 调用成功时执行的代码
        value = _value;
    } catch Error(string memory reason) {
        // 捕获 require/revert 抛出的错误（带字符串消息）
        revert(string(abi.encodePacked("External call failed: ", reason)));
    } catch (bytes memory) {
        // 捕获低级错误（如 call 返回 false）
        revert("External call failed with low-level error");
    }
}
```

### 错误处理最佳实践

| 场景 | 推荐方式 |
|------|----------|
| 输入验证 | `require` |
| 权限检查 | `require` |
| 条件分支 | `revert` 或 `revert CustomError` |
| 检查不变量 | `assert` |
| 外部调用失败 | `try-catch` |
| Gas 优化 | 优先使用自定义错误 |

---

## 第四章：综合最佳实践

### 函数设计最佳实践

1. **可见性选择**：优先使用 `external`，减少 Gas 消耗
2. **调用方式**：优先内部调用，避免不必要的外部调用
3. **命名规范**：Internal/Private 函数使用 `_` 前缀

### 错误处理最佳实践

1. **require**：用于输入验证、权限检查（最常用）
2. **revert**：用于复杂条件分支回滚
3. **assert**：用于检查内部不变量（不应该发生的情况）
4. **自定义错误**：优先使用，Gas 效率更高

### 数据结构最佳实践

1. **结构体**：使用命名参数初始化
2. **映射**：配合存在性检查（如 `userExists`）
3. **遍历**：使用辅助数组，并同步维护

### 存储位置最佳实践

1. **状态变量**：默认 Storage
2. **函数参数**：不可修改时使用 Calldata 以节省 Gas
3. **修改结构体**：使用 Storage 引用更清晰

---

## 附录：核心概念速查

### 算法复杂度

| 符号 | 含义 | 映射 | 数组 |
|------|------|------|------|
| O(1) | 常数时间 | ✅ | 随机访问 |
| O(n) | 线性时间 | ❌ | 遍历 |

### EVM 调用相关

| 概念 | 说明 |
|------|------|
| Gas | 执行智能合约的计算资源单位 |
| Internal Call | 内部调用，不产生 EVM 调用帧 |
| External Call | 外部调用，产生新的 EVM 调用帧 |
| Stack Depth | 调用栈深度，影响递归上限 |

### 存储位置

| 位置 | 用途 | 生命周期 | 修改 |
|------|------|----------|------|
| Storage | 状态变量 | 永久 | 可修改 |
| Memory | 函数内变量 | 函数调用期间 | 可修改 |
| Calldata | 函数参数 | 函数调用期间 | 不可修改 |

---

*文档基于 day08、day09 合约代码整理*
