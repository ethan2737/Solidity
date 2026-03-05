# Day07 - Solidity 高级数据类型学习文档

> 本文档基于 day07/contracts 目录下的三个合约源码编写，包含 bytes、string、多维数组和切片等核心知识点

---

## 目录

1. [bytes 类型](#1-bytes-类型)
2. [string 类型](#2-string-类型)
3. [固定长度字节数组 bytes1-bytes32](#3-固定长度字节数组-bytes1-bytes32)
4. [bytes 与 string 互转](#4-bytes-与-string-互转)
5. [多维数组](#5-多维数组)
6. [切片操作](#6-切片操作)
7. [字符串高级操作](#7-字符串高级操作)

---

## 1. bytes 类型

### 1.1 知识点介绍

`bytes` 是 Solidity 中的动态字节数组，可以存储任意数量的字节。与 `bytes1[]` 不同，`bytes` 是连续内存，更加节省 Gas。

### 1.2 需要掌握程度

**⭐⭐⭐ 必须掌握** - bytes 是智能合约中处理二进制数据的基础

### 1.3 代码案例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BytesDemo {
    // 动态字节数组 - 可变长度
    bytes public dynamicBytes;

    // 设置动态 bytes
    function setDynamicBytes(bytes memory _bytes) public {
        dynamicBytes = _bytes;
    }

    // 获取动态 bytes 长度
    function getLength() public view returns (uint256) {
        return dynamicBytes.length;  // 访问 length 属性
    }

    // 添加字节到末尾（push）
    function pushByte(uint8 _byte) public {
        dynamicBytes.push(bytes1(_byte));  // push 接收 bytes1 类型
    }

    // 移除最后一个字节（pop）
    function popByte() public {
        require(dynamicBytes.length > 0, "Array is empty");
        dynamicBytes.pop();
    }

    // 获取指定索引的字节
    function getByte(uint256 _index) public view returns (bytes1) {
        require(_index < dynamicBytes.length, "Index out of bounds");
        return dynamicBytes[_index];  // 通过索引访问
    }
}
```

### 1.4 使用技巧

- `bytes` 数组索引访问返回 `bytes1` 类型
- `push()` 和 `pop()` 可动态增删元素
- `length` 属性获取数组长度
- 尽量使用 `bytes` 而非 `bytes1[]`，Gas 效率更高

---

## 2. string 类型

### 2.1 知识点介绍

`string` 是 Solidity 中用于存储 UTF-8 编码文本的类型，本质上是 `bytes` 的封装。Solidity 不支持直接对 string 进行索引访问或修改，需要先转换为 bytes。

### 2.2 需要掌握程度

**⭐⭐⭐ 必须掌握** - 智能合约中最常用的数据类型

### 2.3 代码案例

```solidity
contract StringDemo {
    string public storageString;

    // 设置字符串
    function setString(string memory _str) public {
        storageString = _str;
    }

    // 获取字符串长度（字节数，非字符数）
    function getStringLength() public view returns (uint256) {
        // ⚠️ 为什么不能直接获取 string.length？
        // 因为 string 在 Solidity 中被设计为"只读"的 bytes
        // 需要先转换为 bytes 才能操作
        return bytes(storageString).length;
    }

    // 字符串数组 - 其实就是二维数组
    string[] public stringArray;

    // 添加字符串到数组
    function pushString(string memory _str) public {
        stringArray.push(_str);
    }

    // 获取字符串数组
    function getStringArray() public view returns (string[] memory) {
        return stringArray;
    }
}
```

### 2.4 ⚠️ 重要：为什么 string 不能直接获取长度？

**核心原因**：string 在 Solidity 中被设计为"只读"类型，没有直接暴露 length 属性。

#### 1. Solidity 的设计哲学

```solidity
string public str = "Hello";

// 错误 ❌ - string 没有 length 属性
str.length;

// 正确 ✅ - 需要先转成 bytes
bytes(str).length;
```

#### 2. 字节长度 vs 字符长度

```solidity
string public cn = "你好";

// 字节长度（实际存储）
bytes(cn).length  // 返回 6（字节数）

// 字符个数（需要手动计算）
bytes(cn).length / 3  // 返回 2（字符数）
// 因为 UTF-8 中每个中文占 3 字节
```

**不同语言对比**：

| 语言 | "你好" 的 length |
|------|------------------|
| JavaScript | 2（字符数） |
| Python | 2（字符数） |
| **Solidity** | **6（字节数）** |

#### 3. 计算字符个数的公式

```solidity
// ASCII 字符（1 字节）
"Hello".length  // 5 字节 = 5 字符

// 中文（3 字节/字符）
bytes("你好").length / 3  // 6 / 3 = 2 字符

// 混合内容需要按字节逐个判断（复杂）
```

#### 4. string 和 bytes 的本质关系

```
┌─────────────────────────────────────────────────────┐
│                    string (字符串)                    │
│              "你好" → UTF-8 编码 → 6 字节            │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ bytes() 转换
                      ▼
┌─────────────────────────────────────────────────────┐
│                    bytes (字节数组)                   │
│              [0xE4, 0xBD, 0xA0, 0xE5, 0xA5, 0xBD]   │
└─────────────────────────────────────────────────────┘
```

> **结论**：在 Solidity 中，所有字符串操作最终都是与 bytes 字节打交道。

### 2.5 string[] 和 bytes[] 就是二维数组

| 类型 | 维度 | 解释 |
|------|------|------|
| `string` | 一维 | 底层是 bytes（一串字节） |
| `string[]` | 二维 | string 的数组（数组的数组） |
| `bytes` | 一维 | 一串字节 |
| `bytes[]` | 二维 | bytes 的数组（数组的数组） |

```solidity
string[] public stringArray;  // 二维数组

stringArray.push("Hello");
stringArray.push("World");

stringArray[0];     // 第一个元素: "Hello"
stringArray[0][0];  // 第一个元素的第一个字节: 'H'
```

### 2.6 使用技巧

- `bytes(str).length` 获取字符串字节长度（不是字符数！）
- 中文字符在 UTF-8 中占 3 字节
- 字符串比较需要手动实现或使用库（如 OpenZeppelin 的 Strings 库）
- **所有 string 操作都要先转 bytes**

---

## 3. 固定长度字节数组 bytes1-bytes32

### 3.1 知识点介绍

`bytes1` 到 `bytes32` 是固定长度的字节数组类型，存储在 storage 时每个类型占用固定槽位。`bytes32` 可存储 32 字节（256 位），常用于存储哈希值、签名等。

### 3.2 需要掌握程度

**⭐⭐⭐ 必须掌握** - 理解固定长度与动态数组的区别

### 3.3 代码案例

```solidity
contract FixedBytesDemo {
    // 固定长度字节数组 - 声明时长度固定
    bytes32 public fixedBytes32;  // 32 字节
    bytes1 public fixedBytes1;    // 1 字节
    bytes4 public fixedBytes4;    // 4 字节

    // 设置 bytes32
    function setBytes32(bytes32 _data) public {
        fixedBytes32 = _data;
    }

    // 获取 bytes32
    function getBytes32() public view returns (bytes32) {
        return fixedBytes32;
    }

    // 设置 bytes1
    function setBytes1(bytes1 _byte) public {
        fixedBytes1 = _byte;
    }

    // bytes32 常用场景：存储哈希值
    bytes32 public lastHash;

    function storeHash(bytes32 _hash) public {
        lastHash = _hash;
    }
}
```

### 3.4 ⚠️ 重要：bytes32 的真正用途

**bytes32 不是用来存储字符串的！** 它主要用于存储本身就是 32 字节的数据。

#### bytes32 的正确用途

| 场景 | 数据类型 | 长度 |
|------|----------|------|
| 哈希值 | `keccak256()` | 32 字节 ✅ |
| Token ID | uint256 | 32 字节 ✅ |
| 加密密钥 | 固定密钥 | 32 字节 ✅ |
| 签名 | ECDSA签名 | 65字节（拆分存储） |

#### bytes → bytes32 转换（会丢失数据！）

```solidity
// ✅ 短字符串（<= 32 字节）可以无损转换
string short = "Hi";  // 2 字节
bytes32 b = bytes32(bytes(short));  // 不丢失

// ❌ 长字符串（> 32 字节）会丢失数据！
string long = "这是一段很长的文字...";  // 可能上百字节
bytes32 b = bytes32(bytes(long));  // 只保留前 32 字节，数据丢失！

// 正确做法：用 string 或 bytes 存储
bytes longBytes = bytes(long);  // ✅ 完整存储
```

#### 转换规则

| 转换方向 | 处理方式 |
|----------|----------|
| bytes32 → bytes | 直接复制 32 字节 |
| bytes → bytes32 | 长度 ≥ 32：截取前 32 字节<br>长度 < 32：剩余部分填充零 |

```solidity
// bytes "Hi" (2字节) 转 bytes32
bytes memory a = "Hi";           // 长度 2
bytes32 b = bytes32(a);           // 转换后: "Hi" + 30个零字节
// 结果: [0x48][0x65][0x00][0x00]...[0x00]
```

### 3.5 使用技巧

- `bytes32` 适合存储哈希值、签名、加密数据
- 固定长度类型 Gas 效率高（无需动态分配）
- `bytes32` 可直接与 `bytes`/`string` 互转（仅限短字符串）
- 索引访问：`fixedBytes32[0]` 返回 `bytes1`
- **长字符串不要用 bytes32 转换，会丢失数据！**

---

## 4. bytes 与 string 互转

### 4.1 知识点介绍

bytes 和 string 可以相互转换，这是处理字符串操作的基础。转换是零成本的视图操作，不复制数据。

### 4.2 需要掌握程度

**⭐⭐⭐ 必须掌握** - 字符串处理的核心技能

### 4.3 代码案例

```solidity
contract ConvertDemo {
    // string 转 bytes（零成本视图转换）
    function stringToBytes(string memory _str) public pure returns (bytes memory) {
        return bytes(_str);
    }

    // bytes 转 string（零成本视图转换）
    function bytesToString(bytes memory _bytes) public pure returns (string memory) {
        return string(_bytes);
    }

    // bytes32 转 string
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    // string 转 bytes32（截断或填充）
    function stringToBytes32(string memory _str) public pure returns (bytes32) {
        bytes memory tempBytes = bytes(_str);
        bytes32 result;

        if (tempBytes.length >= 32) {
            // 长度 >= 32，取前 32 字节
            assembly {
                result := mload(add(tempBytes, 32))
            }
        } else {
            // 长度 < 32，填充零
            for (uint256 i = 0; i < tempBytes.length; i++) {
                result |= bytes32(tempBytes[i]) >> (i * 8);
            }
        }
        return result;
    }

    // uint256 转 bytes
    function uintToBytes(uint256 _value) public pure returns (bytes memory) {
        bytes memory result = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            result[31 - i] = bytes1(uint8(_value >> (i * 8)));
        }
        return result;
    }

    // address 转 bytes（20 字节）
    function addressToBytes(address _addr) public pure returns (bytes memory) {
        bytes20 addrBytes = bytes20(_addr);
        bytes memory result = new bytes(20);
        for (uint256 i = 0; i < 20; i++) {
            result[i] = addrBytes[i];
        }
        return result;
    }
}
```

### 4.4 使用技巧

- `bytes(str)` 和 `string(b)` 转换是视图操作，不产生 Gas 费用
- string 到 bytes32 转换时注意长度处理
- 地址转换为 bytes 是 20 字节，不是 32 字节

---

## 5. 多维数组

### 5.1 知识点介绍

Solidity 支持多维数组，包括二维、三维甚至更高维度。分为动态多维数组（每维度长度可变）和固定多维数组（每维度长度固定）。

### 5.2 需要掌握程度

**⭐⭐⭐ 必须掌握** - 复杂数据结构处理的基础

### 5.3 代码案例

```solidity
contract MultiArrayDemo {
    // ═══════════════════════════════════════════════════════════
    // 声明各种多维数组
    // ═══════════════════════════════════════════════════════════

    // 动态二维数组：行数可变，每行长度也可变
    uint[][] public dynamic2DArray;

    // 固定长度二维数组：[5][3] 表示 5 行 3 列
    uint[3][5] public fixed2DArray;  // 注意：写法是反的，5 行每行 3 列

    // 混合：固定行数（3 行），每行动态长度
    uint[][3] public mixed2DArray;

    // 动态三维数组
    uint[][][] public dynamic3DArray;

    // 固定三维数组：[2][3][4] 表示 4 层，每层 3 行，每行 2 列
    uint[2][3][4] public fixed3DArray;

    // ═══════════════════════════════════════════════════════════
    // 动态二维数组操作
    // ═══════════════════════════════════════════════════════════

    // 添加一行
    function addRow(uint256[] memory _row) public {
        dynamic2DArray.push(_row);  // push 整个数组
        // 重点理解：length - 1 不是"长度减一"，而是"最后一行的索引"
        // 因为数组索引从 0 开始，所以最后一行的索引 = length - 1
        // 例如：添加第1行后 length=1，最后一行索引=0
        //      添加第2行后 length=2，最后一行索引=1
        emit RowAdded(dynamic2DArray.length - 1);
    }

    // 设置元素
    function setElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_row].length, "Column out of bounds");
        dynamic2DArray[_row][_col] = _value;
    }

    // 获取元素
    function getElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        require(_col < dynamic2DArray[_row].length, "Column out of bounds");
        return dynamic2DArray[_row][_col];
    }

    // 获取行数
    function getRowCount() public view returns (uint256) {
        return dynamic2DArray.length;
    }

    // 获取指定行列数
    function getColCount(uint256 _row) public view returns (uint256) {
        return dynamic2DArray[_row].length;
    }

    // ═══════════════════════════════════════════════════════════
    // 固定二维数组操作
    // ═══════════════════════════════════════════════════════════

    function setFixedElement(uint256 _row, uint256 _col, uint256 _value) public {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        fixed2DArray[_row][_col] = _value;
    }

    function getFixedElement(uint256 _row, uint256 _col) public view returns (uint256) {
        require(_row < 5, "Row out of bounds");
        require(_col < 3, "Column out of bounds");
        return fixed2DArray[_row][_col];
    }

    // ═══════════════════════════════════════════════════════════
    // 数组遍历
    // ═══════════════════════════════════════════════════════════

    // 计算二维数组所有元素总和
    function sum2DArray() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < dynamic2DArray.length; i++) {
            for (uint256 j = 0; j < dynamic2DArray[i].length; j++) {
                sum += dynamic2DArray[i][j];
            }
        }
        return sum;
    }

    // 计算指定行总和
    function sumRow(uint256 _row) public view returns (uint256) {
        require(_row < dynamic2DArray.length, "Row out of bounds");
        uint256 sum = 0;
        for (uint256 j = 0; j < dynamic2DArray[_row].length; j++) {
            sum += dynamic2DArray[_row][j];
        }
        return sum;
    }
}
```

### 5.4 使用技巧

- 固定长度数组 Gas 效率更高
- 多维数组访问越界会 revert，务必使用 require 检查
- `uint[3][5]` 表示 5 行 3 列（从内向外读）
- 动态数组可以用 `push()` 动态添加元素

### 5.5 ⚠️ 重要：多维数组声明与访问的顺序规则

> 这是一个容易混淆的知识点，必须掌握！

#### 声明规则：从右往左看维度

```solidity
uint[3][4][5] public demo;  // 5层 × 4行 × 3列
```

| 位置 | 维度 | 含义 |
|------|------|------|
| 最右 `3` | 列 (col) | 每行 3 列 |
| 中间 `4` | 行 (row) | 每层 4 行 |
| 最左 `5` | 层 (layer) | 共 5 层 |

**记忆方法：从右往左依次是 列 → 行 → 层**

#### 访问规则：从左往右写索引

```solidity
demo[layer][row][col]  // 第 layer 层，第 row 行，第 col 列
```

- 第1个索引 → 层 (layer)
- 第2个索引 → 行 (row)
- 第3个索引 → 列 (col)

#### 三维数组示例

```solidity
uint[2][3][4] public fixed3DArray;  // 4层 × 3行 × 2列

// 设置值时按 层→行→列 顺序
function set3DElement(uint256 _layer, uint256 _row, uint256 _col, uint256 _value) public {
    require(_layer < 4, "Layer out of bounds");   // 最外层维度是 4
    require(_row < 3, "Row out of bounds");       // 中间维度是 3
    require(_col < 2, "Column out of bounds");    // 最内层维度是 2
    fixed3DArray[_layer][_row][_col] = _value;
}
```

#### 简单记忆

```
声明: uint[A][B][C] → C列 × B行 × A层
访问: arr[x][y][z]  → 第 x 层，第 y 行，第 z 列
```

---

## 6. 切片操作

### 6.1 知识点介绍

Solidity **没有内置切片语法**，需要通过手动复制实现。切片即获取数组的一部分，创建新的数组。string 切片需要先转换为 bytes。

#### 为什么 Solidity 不能直接切片？

对比其他语言：

| 语言 | 切片语法 | 特点 |
|------|----------|------|
| Python | `arr[1:3]` | 返回视图，不复制 |
| JavaScript | `arr.slice(1,3)` | 返回新数组 |
| Go | `arr[1:3]` | 返回切片（引用） |
| **Solidity** | **无内置语法** | ❌ 需要手动复制 |

**原因**：Solidity 是为区块链设计的，核心考虑是**安全**和**确定性**：
- 切片引用可能导致意外的 storage 修改
- 内存切片会增加 Gas 消耗的复杂性

#### 实际做法：手动逐字节复制

```solidity
function getSlice(bytes memory _arr, uint256 _start, uint256 _len) pure returns (bytes memory) {
    // 1. 创建新数组
    bytes memory result = new bytes(_len);

    // 2. 逐字节复制
    for (uint256 i = 0; i < _len; i++) {
        result[i] = _arr[_start + i];
    }

    return result;
}
```

#### 图示理解

```
原始 bytes: [H][e][l][l][o]
                ↑  start=1

复制过程:
result[0] = arr[1] → e
result[1] = arr[2] → l
result[2] = arr[3] → l

返回新数组: [e][l][l]
```

### 6.2 需要掌握程度

**⭐⭐⭐⭐ 重点掌握** - 字符串处理的核心技能

### 6.3 代码案例

```solidity
contract SliceDemo {
    bytes public dataBytes = "Hello, World!";
    string public dataString = "Hello, Solidity!";

    // ═══════════════════════════════════════════════════════════
    // bytes 切片
    // ═══════════════════════════════════════════════════════════

    // 通用切片函数
    function getBytesSlice(uint256 _start, uint256 _length) public view returns (bytes memory) {
        require(_start + _length <= dataBytes.length, "Slice out of bounds");

        bytes memory slice = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            slice[i] = dataBytes[_start + i];  // 逐字节复制
        }
        return slice;
    }

    // 获取前缀（从 0 开始）
    function getBytesPrefix(uint256 _length) public view returns (bytes memory) {
        require(_length <= dataBytes.length, "Length exceeds");
        return getBytesSlice(0, _length);
    }

    // 获取后缀
    function getBytesSuffix(uint256 _length) public view returns (bytes memory) {
        require(_length <= dataBytes.length, "Length exceeds");
        uint256 start = dataBytes.length - _length;
        return getBytesSlice(start, _length);
    }

    // 获取中间部分
    function getBytesMiddle(uint256 _start, uint256 _end) public view returns (bytes memory) {
        require(_end <= dataBytes.length, "End index out of bounds");
        require(_start < _end, "Invalid range");
        return getBytesSlice(_start, _end - _start);
    }

    // ═══════════════════════════════════════════════════════════
    // string 切片
    // ═══════════════════════════════════════════════════════════

    // string 切片需要先转换为 bytes
    function getStringSlice(uint256 _start, uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        require(_start + _length <= strBytes.length, "Slice out of bounds");

        bytes memory slice = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            slice[i] = strBytes[_start + i];
        }
        return string(slice);
    }

    // string 前缀
    function getStringPrefix(uint256 _length) public view returns (string memory) {
        return getStringSlice(0, _length);
    }

    // string 后缀
    function getStringSuffix(uint256 _length) public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        require(_length <= strBytes.length, "Length exceeds");
        uint256 start = strBytes.length - _length;
        return getStringSlice(start, _length);
    }

    // ═══════════════════════════════════════════════════════════
    // 高级切片操作
    // ═══════════════════════════════════════════════════════════

    // 按分隔符分割 bytes
    function splitBytes(bytes1 _separator) public view returns (bytes[] memory) {
        uint256 count = 1;
        for (uint256 i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] == _separator) {
                count++;
            }
        }

        bytes[] memory parts = new bytes[](count);
        uint256 partIndex = 0;
        uint256 start = 0;

        for (uint256 i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] == _separator) {
                parts[partIndex] = getBytesSlice(start, i - start);
                start = i + 1;
                partIndex++;
            }
        }
        parts[partIndex] = getBytesSlice(start, dataBytes.length - start);

        return parts;
    }

    // 替换字节
    function replaceByte(bytes1 _oldByte, bytes1 _newByte) public view returns (bytes memory) {
        bytes memory result = new bytes(dataBytes.length);
        for (uint256 i = 0; i < dataBytes.length; i++) {
            result[i] = (dataBytes[i] == _oldByte) ? _newByte : dataBytes[i];
        }
        return result;
    }
}
```

### 6.4 使用技巧

- 切片是**复制操作**，Gas 消耗与切片长度成正比
- string 切片必须先转为 bytes
- 注意边界检查，防止越界 revert
- 切片不会修改原数组
- **Solidity 没有内置切片语法**（如 Python 的 `arr[1:3]`），必须手动创建新数组并逐元素复制
- 推荐使用 OpenZeppelin 的 Strings 库简化操作

### 6.5 常用切片操作方法汇总表

#### 一、基础切片操作（bytes）

| 操作 | 方法名 | 输入 | 输出 | 示例 ("Hello") |
|------|--------|------|------|----------------|
| 获取切片 | `getBytesSlice` | start, length | bytes | `getBytesSlice(1,2)` → "el" |
| 获取前缀 | `getBytesPrefix` | length | bytes | `getBytesPrefix(3)` → "Hel" |
| 获取后缀 | `getBytesSuffix` | length | bytes | `getBytesSuffix(3)` → "llo" |
| 获取中间 | `getBytesMiddle` | start, end | bytes | `getBytesMiddle(1,4)` → "ell" |

#### 二、基础切片操作（string）

| 操作 | 方法名 | 输入 | 输出 | 示例 ("Hello") |
|------|--------|------|------|----------------|
| 获取切片 | `getStringSlice` | start, length | string | `getStringSlice(1,2)` → "el" |
| 获取前缀 | `getStringPrefix` | length | string | `getStringPrefix(3)` → "Hel" |
| 获取后缀 | `getStringSuffix` | length | string | `getStringSuffix(3)` → "llo" |

#### 三、高级操作

| 操作 | 方法名 | 输入 | 输出 | 说明 |
|------|--------|------|------|------|
| 提取指定索引 | `extractBytes` | 索引数组 | bytes | 按指定位置提取字节 |
| 分割 | `splitBytes` | 分隔符 | bytes[] | 按分隔符拆分 |
| 替换字节 | `replaceByte` | 旧字节, 新字节 | bytes | 替换所有匹配字节 |
| 提取数字 | `extractNumbers` | 无 | string | 从字符串中提取数字 |
| 反转 | `reverseString` | 无 | string | 反转字符串 |
| 移除空格 | `removeSpaces` | 无 | string | 删除所有空格 |

#### 四、实现原理

```solidity
// 通用切片模板
function slice(bytes memory _data, uint256 _start, uint256 _len) pure returns (bytes memory) {
    require(_start + _len <= _data.length, "Out of bounds");

    bytes memory result = new bytes(_len);
    for (uint256 i = 0; i < _len; i++) {
        result[i] = _data[_start + i];  // 逐字节复制
    }
    return result;
}

// string 转 bytes 后同样适用
function stringSlice(string memory _str, uint256 _start, uint256 _len) pure returns (string memory) {
    bytes memory b = bytes(_str);
    return string(slice(b, _start, _len));
}
```

#### 五、关键注意事项

| 注意点 | 说明 |
|--------|------|
| 边界检查 | 务必使用 `require` 检查 `_start + _len <= data.length` |
| 索引从 0 开始 | 第一个字节索引是 0，不是 1 |
| 包含性 | `_start` 包含，`_end` 不包含（类似 Python） |
| 负数索引 | Solidity 不支持负数索引，后缀需用 `length - n` 计算 |
| Gas 消耗 | 切片是复制操作，长度越大 Gas 越高 |

---

## 7. 字符串高级操作

### 7.1 知识点介绍

Solidity 标准库不提供字符串操作，需要手动实现。包括字符串比较、连接、搜索、反转等。

### 7.2 需要掌握程度

**⭐⭐⭐⭐ 重要掌握** - 业务场景中的常见需求

### 7.3 代码案例

```solidity
contract StringOpsDemo {
    string public dataString = "Hello, Solidity!";

    // ═══════════════════════════════════════════════════════════
    // 字符串比较
    // ═══════════════════════════════════════════════════════════

    // 比较两个 bytes 是否相等
    function compareBytes(bytes memory _b1, bytes memory _b2) public pure returns (bool) {
        if (_b1.length != _b2.length) {
            return false;
        }
        for (uint256 i = 0; i < _b1.length; i++) {
            if (_b1[i] != _b2[i]) {
                return false;
            }
        }
        return true;
    }

    // 检查是否包含子字符串
    function containsSubstring(string memory _str, string memory _substr) public pure returns (bool) {
        bytes memory strBytes = bytes(_str);
        bytes memory substrBytes = bytes(_substr);

        if (substrBytes.length > strBytes.length) {
            return false;
        }

        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return true;
        }
        return false;
    }

    // 查找子字符串位置
    function findSubstring(string memory _str, string memory _substr) public pure returns (uint256) {
        bytes memory strBytes = bytes(_str);
        bytes memory substrBytes = bytes(_substr);

        if (substrBytes.length > strBytes.length) {
            return strBytes.length;  // 未找到
        }

        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return i;
        }
        return strBytes.length;
    }

    // ═══════════════════════════════════════════════════════════
    // 字符串连接
    // ═══════════════════════════════════════════════════════════

    // 连接两个 bytes
    function concatBytes(bytes memory _b1, bytes memory _b2) public pure returns (bytes memory) {
        bytes memory result = new bytes(_b1.length + _b2.length);
        uint256 k = 0;
        for (uint256 i = 0; i < _b1.length; i++) {
            result[k++] = _b1[i];
        }
        for (uint256 i = 0; i < _b2.length; i++) {
            result[k++] = _b2[i];
        }
        return result;
    }

    // 连接两个字符串
    function concatStrings(string memory _s1, string memory _s2) public pure returns (string memory) {
        bytes memory b1 = bytes(_s1);
        bytes memory b2 = bytes(_s2);
        bytes memory result = new bytes(b1.length + b2.length);

        uint256 k = 0;
        for (uint256 i = 0; i < b1.length; i++) {
            result[k++] = b1[i];
        }
        for (uint256 i = 0; i < b2.length; i++) {
            result[k++] = b2[i];
        }
        return string(result);
    }

    // ═══════════════════════════════════════════════════════════
    // 字符串转换
    // ═══════════════════════════════════════════════════════════

    // 反转字符串
    function reverseString() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory reversed = new bytes(strBytes.length);

        for (uint256 i = 0; i < strBytes.length; i++) {
            reversed[i] = strBytes[strBytes.length - 1 - i];
        }
        return string(reversed);
    }

    // 移除空格
    function removeSpaces() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory result = new bytes(strBytes.length);
        uint256 count = 0;

        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] != 0x20) {  // 0x20 是空格
                result[count++] = strBytes[i];
            }
        }

        bytes memory trimmed = new bytes(count);
        for (uint256 i = 0; i < count; i++) {
            trimmed[i] = result[i];
        }
        return string(trimmed);
    }

    // 提取数字
    function extractNumbers() public view returns (string memory) {
        bytes memory strBytes = bytes(dataString);
        bytes memory numbers = new bytes(strBytes.length);
        uint256 count = 0;

        for (uint256 i = 0; i < strBytes.length; i++) {
            bytes1 char = strBytes[i];
            // '0' = 0x30, '9' = 0x39
            if (char >= 0x30 && char <= 0x39) {
                numbers[count++] = char;
            }
        }

        bytes memory result = new bytes(count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = numbers[i];
        }
        return string(result);
    }
}
```

### 7.4 使用技巧

- 字符串操作 Gas 消耗较高，注意优化
- 推荐使用 OpenZeppelin 的 Strings 库
- 字符判断使用字节值比较（如空格 0x20）
- 中文字符 UTF-8 编码下占 3 字节

---

## 知识点掌握顺序建议

| 序号 | 知识点 | 重要程度 | 难度 |
|------|--------|----------|------|
| 1 | bytes 基础 | ⭐⭐⭐ | 基础 |
| 2 | string 基础 | ⭐⭐⭐ | 基础 |
| 3 | bytes1-bytes32 | ⭐⭐⭐ | 基础 |
| 4 | bytes/string 互转 | ⭐⭐⭐ | 基础 |
| 5 | 多维数组 | ⭐⭐⭐ | 中等 |
| 6 | 切片操作 | ⭐⭐⭐⭐ | 中等 |
| 7 | 字符串高级操作 | ⭐⭐⭐⭐ | 高级 |

---

## 总结

本章节涵盖了 Solidity 中三个重要的高级数据类型：

1. **bytes/string** - 处理文本和二进制数据的基础
2. **多维数组** - 复杂数据结构的组织方式
3. **切片操作** - 字符串处理的核心技能

### 核心要点回顾

| 知识点 | 关键点 |
|--------|--------|
| string 长度 | 必须先转 bytes 才能获取长度 |
| 字节 vs 字符 | `bytes(str).length` 返回字节数，中文需除以 3 |
| string 本质 | 就是只读的 bytes，需要转换才能操作 |
| string[]/bytes[] | 就是二维数组 |
| bytes32 用途 | 存哈希值/Token ID，不是用来存字符串 |
| 切片 | Solidity 没有内置语法，需要手动复制 |

> **最重要的原则**：在 Solidity 中，**所有字符串操作最终都是与 bytes 字节打交道**。

建议按照上述顺序学习，先掌握基础概念，再逐步深入高级操作。实际开发中可使用 OpenZeppelin 等成熟库来简化字符串操作。
