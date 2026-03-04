# Solidity Day 6: 数组、存储与映射 - 引用类型详解

> 本文档基于 `day06` 合约代码整理，涵盖 Solidity 中数组、Storage/Memory/Calldata、映射等核心概念。

---

## 目录

1. [数组（Array）](#1-数组array)
2. [Storage vs Memory vs Calldata](#2-storage-vs-memory-vs-calldata)
3. [映射（Mapping）](#3-映射mapping)
4. [结构体（Struct）与引用类型](#4-结构体struct与引用类型)
5. [最佳实践与注意事项](#5-最佳实践与注意事项)

---

## 1. 数组（Array）

### 1.1 概念解释

数组是 Solidity 中用于存储**相同类型元素**的集合。Solidity 支持两种数组类型：

| 类型 | 特点 | 示例 |
|------|------|------|
| **固定长度数组** | 长度在编译时确定，不可改变 | `uint[5]`, `address[10]` |
| **动态数组** | 长度在运行时确定，可动态增长 | `uint[]`, `address[]` |

### 1.2 声明方式

```solidity
// 固定长度数组
uint[5] public fixedArray;        // 5个 uint256
address[10] public addressArray;  // 10个地址
bool[3] public boolArray;         // 3个布尔值

// 动态数组
uint[] public dynamicUintArray;      // uint256 动态数组
address[] public dynamicAddressArray; // 地址动态数组
string[] public dynamicStringArray;  // 字符串动态数组
```

### 1.3 常用操作方法

#### 1.3.1 添加元素（push）

```solidity
// 添加元素到动态数组
function pushToDynamicArray(uint256 _value) public {
    dynamicUintArray.push(_value);
}

// 添加地址
function pushAddress(address _address) public {
    require(_address != address(0), "Invalid address");
    dynamicAddressArray.push(_address);
}

// 添加字符串
function pushString(string memory _str) public {
    dynamicStringArray.push(_str);
}
```

#### 1.3.2 移除元素（pop）

```solidity
// 移除最后一个元素
function popFromDynamicArray() public {
    require(dynamicUintArray.length > 0, "Array is empty");
    dynamicUintArray.pop();
}
```

#### 1.3.3 获取长度

```solidity
// 获取固定数组长度
function getFixedArrayLength() public view returns (uint256) {
    return fixedArray.length;
}

// 获取动态数组长度
function getDynamicArrayLength() public view returns (uint256) {
    return dynamicUintArray.length;
}
```

#### 1.3.4 访问和修改元素

```solidity
// 设置固定数组元素
function setFixedArrayElement(uint256 _index, uint256 _value) public {
    require(_index < fixedArray.length, "Index out of bounds");
    fixedArray[_index] = _value;
}

// 获取数组元素
function getDynamicArrayElement(uint256 _index) public view returns (uint256) {
    require(_index < dynamicUintArray.length, "Index out of bounds");
    return dynamicUintArray[_index];
}

// 更新数组元素
function updateElement(uint256 _index, uint256 _value) public {
    require(_index < dynamicUintArray.length, "Index out of bounds");
    dynamicUintArray[_index] = _value;
}
```

#### 1.3.5 删除元素

```solidity
// 删除元素（设置为默认值，不改变数组长度）
function deleteElement(uint256 _index) public {
    require(_index < dynamicUintArray.length, "Index out of bounds");
    delete dynamicUintArray[_index];  // 相当于设置为 0
}

// 清空数组
function clearArray() public {
    delete dynamicUintArray;  // 重置为空数组
}
```

### 1.4 完整示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ArrayDemo {
    uint[] public dynamicUintArray;
    address[] public addressArray;

    // 添加元素
    function pushToDynamicArray(uint256 _value) public {
        dynamicUintArray.push(_value);
    }

    // 移除最后一个元素
    function popFromDynamicArray() public {
        require(dynamicUintArray.length > 0, "Array is empty");
        dynamicUintArray.pop();
    }

    // 获取长度
    function getLength() public view returns (uint256) {
        return dynamicUintArray.length;
    }

    // 数组求和
    function sumArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamicUintArray.length; i++) {
            sum += dynamicUintArray[i];
        }
        return sum;
    }

    // 查找最大值
    function findMax() public view returns (uint256) {
        require(dynamicUintArray.length > 0, "Array is empty");
        uint256 max = dynamicUintArray[0];
        for (uint256 i = 1; i < dynamicUintArray.length; i++) {
            if (dynamicUintArray[i] > max) {
                max = dynamicUintArray[i];
            }
        }
        return max;
    }
}
```

---

## 2. Storage vs Memory vs Calldata

### 2.1 概念解释

这是 Solidity 中三种数据位置，理解它们对于编写高效、安全的合约至关重要：

| 位置 | 特点 | 生命周期 | 费用 |
|------|------|----------|------|
| **Storage** | 永久存储在区块链上 | 合约生命周期 | 最昂贵（写入） |
| **Memory** | 临时存储，函数调用期间存在 | 函数调用期间 | 相对便宜 |
| **Calldata** | 只读的特殊数据位置 | 函数调用期间 | 最便宜 |

### 2.2 使用方法

#### 2.2.1 Storage（存储）

```solidity
contract StorageDemo {
    // 状态变量默认是 storage
    uint[] public storageArray;
    mapping(address => uint256) public balances;

    function addToStorageArray(uint256 _value) public {
        // 直接修改 storage 变量
        storageArray.push(_value);
    }

    function updateStorageArray(uint256 _index, uint256 _value) public {
        // storage 引用修改
        storageArray[_index] = _value;
    }

    // 使用 storage 引用（避免重复读取）
    function modifyViaStorageReference(uint256 _index, uint256 _value) public {
        uint256[] storage arr = storageArray;  // storage 引用
        arr[_index] = _value;  // 修改会影响原始数组
    }
}
```

#### 2.2.2 Memory（内存）

```solidity
contract MemoryDemo {
    // 处理 memory 数组（临时变量）
    function processMemoryArray(uint256[] memory _values) public pure returns (uint256[] memory) {
        // _values 是 memory 副本，修改不会影响原始数据
        for (uint256 i = 0; i < _values.length; i++) {
            _values[i] = _values[i] * 2;
        }
        return _values;
    }

    // 创建 memory 数组
    function createMemoryArray(uint256 _size) public pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](_size);
        for (uint256 i = 0; i < _size; i++) {
            newArray[i] = i * 10;
        }
        return newArray;
    }

    // 从 storage 复制到 memory
    function copyStorageToMemory() public view returns (uint256[] memory) {
        uint256[] memory memoryArray = new uint256[](storageArray.length);
        for (uint256 i = 0; i < storageArray.length; i++) {
            memoryArray[i] = storageArray[i];
        }
        return memoryArray;
    }
}
```

#### 2.2.3 Calldata（仅外部函数参数）

```solidity
contract CalldataDemo {
    // calldata 数组（只读，不可修改，节省 Gas）
    function sumCalldataArray(uint256[] calldata _values) public pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < _values.length; i++) {
            sum += _values[i];
        }
        return sum;
    }

    // calldata 字符串
    function getStringLength(string calldata _str) public pure returns (uint256) {
        return bytes(_str).length;
    }
}
```

> **💡 补充说明：calldata 与 external 函数的关系**
>
> `calldata` 只能用于 **external 函数**，它是 external 函数的**默认数据位置**：
>
> | 函数类型 | 引用类型参数的默认数据位置 |
> |----------|--------------------------|
> | **external** | `calldata`（可省略） |
> | **internal / private** | `memory`（可省略） |
>
> ```solidity
> contract Demo {
>     // external 函数 - calldata 可省略（默认就是 calldata）
>     function foo(uint256[] calldata _data) external pure { }
>     function foo(uint256[] _data) external pure { }  // 等价！
>
>     // internal 函数 - memory 可省略（默认就是 memory）
>     function bar(uint256[] _data) internal pure { }  // 默认就是 memory
>
>     // ❌ 错误：internal 函数不能使用 calldata
>     function bad(uint256[] calldata _data) internal pure { }  // 编译错误
> }
> ```
>
> **为什么要区分？**
> - `calldata` 是**只读**的（来自交易调用数据），Gas 成本最低
> - `external` 函数的参数来自外部调用，自然使用 calldata
> - `internal` 函数在合约内部调用，无法访问 calldata 区域

### 2.3 关键区别示例

```solidity
contract DataLocationDemo {
    uint[] public storageArray;

    function demonstrateStorageReference() public {
        storageArray.push(100);
        storageArray.push(200);

        // storage 引用 - 修改会影响原始数据
        uint256[] storage ref = storageArray;
        ref[0] = 999;  // storageArray[0] 变成 999
    }

    function demonstrateMemoryCopy(uint256[] memory _values) public pure returns (uint256[] memory) {
        // memory 副本 - 修改不会影响原始数据
        uint256[] memory copy = _values;
        copy[0] = 999;  // _values 不变
        return copy;
    }
}
```

---

## 3. 映射（Mapping）

### 3.1 概念解释

**映射（Mapping）** 是一种键值对数据结构，类似于哈希表或字典。

```solidity
mapping(keyType => valueType) public mappingName;
```

- **keyType**：只能是 Solidity 支持的值类型（如 `address`、`uint256`、`bytes32`、`bool`）
- **valueType**：可以是任何类型（包括映射、结构体、数组）

### 3.2 声明方式

```solidity
// 基本映射
mapping(address => uint256) public balances;      // 地址 -> 余额
mapping(uint256 => address) public idToAddress;  // ID -> 地址
mapping(address => bool) public isMember;         // 地址 -> 是否成员
mapping(string => uint256) public nameToId;      // 名称 -> ID

// 嵌套映射
mapping(address => mapping(address => uint256)) public allowances;  // owner -> spender -> amount
mapping(uint256 => mapping(string => bool)) public permissions;     // userId -> permission -> allowed
```

### 3.3 常用操作方法

#### 3.3.1 基本操作

```solidity
contract MappingDemo {
    mapping(address => uint256) public balances;

    // 设置值
    function setBalance(address _account, uint256 _amount) public {
        balances[_account] = _amount;
    }

    // 读取值
    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }

    // 增加余额
    function increaseBalance(address _account, uint256 _amount) public {
        balances[_account] += _amount;
    }

    // 减少余额
    function decreaseBalance(address _account, uint256 _amount) public {
        require(balances[_account] >= _amount, "Insufficient balance");
        balances[_account] -= _amount;
    }
}
```

#### 3.3.2 嵌套映射

```solidity
contract NestedMappingDemo {
    // owner -> spender -> amount
    mapping(address => mapping(address => uint256)) public allowances;

    // 设置授权额度
    function setAllowance(address _owner, address _spender, uint256 _amount) public {
        allowances[_owner][_spender] = _amount;
    }

    // 获取授权额度
    function getAllowance(address _owner, address _spender) public view returns (uint256) {
        return allowances[_owner][_spender];
    }

    // 增加授权额度
    function increaseAllowance(address _spender, uint256 _amount) public {
        allowances[msg.sender][_spender] += _amount;
    }
}
```

### 3.4 映射的遍历

映射本身**不能直接遍历**，需要结合数组来实现：

```solidity
contract MappingWithIteration {
    mapping(address => uint256) public balances;
    address[] public allAddresses;           // 用于遍历
    mapping(address => bool) public addressExists;  // 检查是否已存在

    function setBalance(address _account, uint256 _amount) public {
        uint256 oldBalance = balances[_account];
        balances[_account] = _amount;

        // 添加到地址列表（如果不存在）
        if (!addressExists[_account]) {
            allAddresses.push(_account);
            addressExists[_account] = true;
        }
    }

    // 获取所有地址
    function getAllAddresses() public view returns (address[] memory) {
        return allAddresses;
    }

    // 计算总余额
    function getTotalBalance() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            total += balances[allAddresses[i]];
        }
        return total;
    }

    // 查找符合条件的地址
    function findAddressesWithBalance(uint256 _minBalance) public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (balances[allAddresses[i]] >= _minBalance) {
                count++;
            }
        }

        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allAddresses.length; i++) {
            if (balances[allAddresses[i]] >= _minBalance) {
                result[index] = allAddresses[i];
                index++;
            }
        }
        return result;
    }
}
```

### 3.5 完整示例代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MappingDemo {
    // 基本映射
    mapping(address => uint256) public balances;
    mapping(address => bool) public isMember;

    // 嵌套映射（授权机制）
    mapping(address => mapping(address => uint256)) public allowances;

    // 用于遍历
    address[] public allAddresses;
    mapping(address => bool) public addressExists;

    // 设置余额
    function setBalance(address _account, uint256 _amount) public {
        if (!addressExists[_account]) {
            allAddresses.push(_account);
            addressExists[_account] = true;
        }
        balances[_account] = _amount;
    }

    // 成员管理
    function addMember(address _member) public {
        require(!isMember[_member], "Already a member");
        isMember[_member] = true;

        if (!addressExists[_member]) {
            allAddresses.push(_member);
            addressExists[_member] = true;
        }
    }

    function removeMember(address _member) public {
        require(isMember[_member], "Not a member");
        isMember[_member] = false;
    }

    // 嵌套映射 - 授权
    function setAllowance(address _owner, address _spender, uint256 _amount) public {
        allowances[_owner][_spender] = _amount;
    }

    function getAllowance(address _owner, address _spender) public view returns (uint256) {
        return allowances[_owner][_spender];
    }

    // 获取地址数量
    function getAddressCount() public view returns (uint256) {
        return allAddresses.length;
    }
}
```

---

## 4. 结构体（Struct）与引用类型

### 4.1 概念解释

**结构体（Struct）** 是一种自定义类型，可以将多个相关变量组合在一起。结构体是**引用类型**，需要指定数据位置。

### 4.2 声明和使用

```solidity
contract StructDemo {
    // 定义结构体
    struct User {
        uint256 id;
        address addr;
        string name;
    }

    // 结构体数组（storage）
    User[] public users;

    // 结构体映射
    mapping(address => User) public userMap;

    // 添加用户
    function addUser(uint256 _id, address _addr, string memory _name) public {
        users.push(User({
            id: _id,
            addr: _addr,
            name: _name
        }));
    }

    // 获取用户（返回 memory 副本）
    function getUser(uint256 _index) public view returns (User memory) {
        return users[_index];
    }

    // 使用 storage 引用修改
    function updateUserName(uint256 _index, string memory _name) public {
        User storage user = users[_index];  // storage 引用
        user.name = _name;  // 修改会影响原始数据
    }

    // 使用 memory 副本
    function processMemoryUser(User memory _user) public pure returns (User memory) {
        _user.id = _user.id * 2;  // 修改 memory 副本，不影响原始数据
        return _user;
    }
}
```

> **💡 补充说明：结构体赋值的 `User({})` 语法**
>
> 在 Solidity 中，创建结构体实例需要调用"结构体构造函数"，语法为 `Type({...})`。其中：
> - `User(...)` 是**位置参数**赋值
> - `User({key: value})` 是**命名参数**赋值
> - `{}` 中的 `()` 是**必需的语法**，不能省略
>
> ```solidity
> // 方式一：命名参数（推荐，清晰）
> User memory user = User({
>     id: _id,
>     addr: _addr,
>     name: _name
> });
>
> // 方式二：位置参数
> User memory user = User(_id, _addr, _name);
>
> // ❌ 错误 - 缺少括号
> User memory user = User { id: 1, name: "Alice" };
> ```

---

## 5. 最佳实践与注意事项

### 5.1 数组最佳实践

| 最佳实践 | 说明 |
|----------|------|
| **使用固定长度数组** | 如果大小已知，优先使用固定长度数组，节省 Gas |
| **边界检查** | 访问数组元素前必须检查索引边界 |
| **避免在循环中删除** | 删除操作代价高，尽量避免 |
| **返回数组要谨慎** | 大数组返回会消耗大量 Gas，考虑分批返回 |

### 5.2 Storage/Memory 注意事项

| 注意事项 | 说明 |
|----------|------|
| **状态变量是 Storage** | 合约状态变量默认存储在 Storage |
| **函数参数需要指定位置** | 引用类型（数组、结构体、映射）作为函数参数必须指定 `memory` 或 `calldata` |
| **外部函数用 calldata** | 对于不需要修改的外部函数参数，使用 `calldata` 可节省 Gas |
| **避免不必要的复制** | 大数据复制会消耗 Gas，适当使用 storage 引用 |

```solidity
// ✅ 好实践：外部函数参数使用 calldata
function processData(uint256[] calldata _data) external pure returns (uint256) {
    // calldata 不可修改，省 Gas
}

// ✅ 好实践：内部函数使用 storage 引用
function updateUser(uint256 _index, string memory _name) internal {
    User storage user = users[_index];  // 避免复制
    user.name = _name;
}

// ❌ 不好：memory 参数在内部函数中不必要的复制
function badExample(uint256[] memory _data) internal pure {
    // 内部函数中 memory 参数已经是副本
}
```

### 5.3 映射注意事项

| 注意事项 | 说明 |
|----------|------|
| **映射无法遍历** | 必须配合数组才能遍历 |
| **访问不存在的键** | 访问不存在的映射键返回默认值（0、false、address(0)） |
| **无法获取映射长度** | 映射没有 length 属性 |
| **键类型有限制** | 只能是值类型，不支持数组和结构体 |

```solidity
// ✅ 好实践：记录所有键以便遍历
mapping(address => uint256) public balances;
address[] public allAccounts;

function setBalance(address _account, uint256 _amount) public {
    if (balances[_account] == 0 && _amount > 0) {
        allAccounts.push(_account);  // 首次设置时添加
    }
    balances[_account] = _amount;
}

// ❌ 不好：无法直接遍历映射
function badExample() public view {
    for (uint i = 0; i < balances.length; i++) {  // 编译错误！映射没有 length
        // ...
    }
}
```

### 5.4 Gas 优化技巧

1. **使用 calldata 而非 memory** - 对于外部函数的只读参数
2. **使用 storage 引用** - 在函数内部修改状态变量时
3. **批量操作** - 减少循环中的 SSTORE 操作
4. **避免动态大小的 memory 数组** - 在函数开始时确定大小

---

## 总结

| 概念 | 关键点 |
|------|--------|
| **数组** | 固定长度 vs 动态长度；push/pop 操作；边界检查 |
| **Storage** | 永久存储，昂贵，最常用作状态变量 |
| **Memory** | 临时存储，函数调用期间存在 |
| **Calldata** | 只读，外部函数参数最优选择 |
| **映射** | 键值对，无法遍历，需配合数组 |
| **结构体** | 自定义类型，引用类型，需指定数据位置 |

---

*文档生成时间: 2026-03-04*
*基于 day06 合约代码整理*
