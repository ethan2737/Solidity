# Day 3 — Solidity 变量：变量声明、布尔、整型

> **学习目标**: 掌握 Solidity 变量类型、布尔和整型的使用，理解可见性修饰符  
> **学习时长**: 1-3 小时  
> **难度**: ⭐⭐

---

## 📚 学习资料

- **课程视频**: [xiucai-web3-develop-guide.vercel.app](https://xiucai-web3-develop-guide.vercel.app/)
  - "Solidity 语言 —— 变量：变量声明／布尔／整型"
- **推荐阅读**: 
  - [Solidity 类型系统](https://docs.soliditylang.org/en/latest/types.html)
  - [可见性修饰符](https://docs.soliditylang.org/en/latest/contracts.html#visibility-and-getters)

---

## 🚀 快速开始

### 前置要求

- 完成 Day 1 和 Day 2 的学习
- Node.js >= 16
- npm 或 yarn

### 使用 Hardhat

```bash
# 1. 进入项目目录
cd day03

# 2. 安装依赖
npm install

# 3. 编译合约
npm run compile

# 4. 启动本地 Hardhat 节点（新终端）
npm run node

# 5. 部署合约（另一个终端）
npm run deploy

# 6. 运行测试
npm test

# 7. 运行 AI 自动化测试
npm run test:ai

# 8. 验证部署
npm run verify
```

---

## 📁 项目结构

```
day03/
├── contracts/
│   ├── VariableTypes.sol        # 变量类型演示（布尔、整型）
│   ├── VisibilityDemo.sol       # 可见性修饰符演示
│   └── TypeComparison.sol       # 与其他语言的对比
├── scripts/
│   ├── deploy.js                # 部署脚本
│   └── verify.js                # 验证脚本
├── test/
│   ├── VariableTypes.test.js     # VariableTypes 测试套件
│   ├── VisibilityDemo.test.js    # VisibilityDemo 测试套件
│   ├── TypeComparison.test.js    # TypeComparison 测试套件
│   └── ai-automated-test.js      # AI 自动化测试
├── hardhat.config.js            # Hardhat 配置
├── package.json                 # 项目依赖
├── README.md                    # 本文件
└── QUICKSTART.md                # 快速开始指南
```

---

## 🎯 学习路径

### 第 1 小时：理解 Solidity 变量类型

**目标**: 理解 Solidity 的类型系统和变量声明

**任务**:
- [ ] 观看课程视频 "变量声明／布尔／整型"
- [ ] 理解以下概念：
  - **静态类型**: Solidity 是静态类型语言，必须声明类型
  - **布尔类型 (bool)**: true 或 false
  - **无符号整型 (uint)**: uint8, uint16, ..., uint256
  - **有符号整型 (int)**: int8, int16, ..., int256
  - **默认值**: bool 默认 false，uint/int 默认 0
- [ ] 阅读 VariableTypes.sol 合约
- [ ] 理解类型范围和溢出检查

**关键点**:
- Solidity 0.8+ 有自动溢出检查
- uint 等同于 uint256，int 等同于 int256
- 选择合适的类型大小可以节省 Gas

### 第 2 小时：理解可见性修饰符

**目标**: 理解 Solidity 的可见性修饰符

**任务**:
- [ ] 理解四种可见性：
  - **public**: 外部和内部都可访问，自动生成 getter
  - **private**: 只能在同一合约内访问
  - **internal**: 合约内部和继承合约可访问（默认）
  - **external**: 只能从外部调用
- [ ] 阅读 VisibilityDemo.sol 合约
- [ ] 测试不同可见性的访问
- [ ] 理解继承中的可见性

**关键点**:
- public 变量会自动生成 getter 函数
- private 变量不能被子合约访问
- internal 是默认可见性
- external 函数不能从合约内部直接调用（需要通过 this）

### 第 3 小时：实践和对比

**目标**: 编写合约并理解与其他语言的差异

**任务**:
- [ ] 编写一个简单合约，声明几种基本类型变量
- [ ] 尝试 public/private 修饰符
- [ ] 阅读 TypeComparison.sol，理解与 JavaScript/Java 的差异
- [ ] 运行测试，验证理解
- [ ] 记录学习笔记

**关键点**:
- Solidity 是静态类型，JavaScript 是动态类型
- Solidity 有明确的可见性，JavaScript 没有
- Solidity 有数值范围限制，JavaScript 使用 Number

---

## 📖 核心概念详解

### 1. 布尔类型 (bool)

```solidity
bool public isActive = true;   // public，自动生成 getter
bool private isLocked = false; // private，只能合约内部访问
bool internal isPaused = false; // internal，默认可见性
```

**特点**:
- 只有 `true` 和 `false` 两个值
- 没有 truthy/falsy 概念（不像 JavaScript）
- 默认值是 `false`

### 2. 无符号整型 (uint)

```solidity
uint8 public smallNumber = 100;      // 0 到 255
uint256 public largeNumber = 1000000; // 0 到 2^256 - 1
uint public defaultUint = 42;        // uint 等同于 uint256
```

**类型范围**:
| 类型 | 范围 |
|------|------|
| uint8 | 0 到 255 |
| uint16 | 0 到 65,535 |
| uint256 | 0 到 2^256 - 1 |
| uint | 等同于 uint256 |

**特点**:
- 不能为负数
- 默认值是 `0`
- Solidity 0.8+ 自动检查溢出

### 3. 有符号整型 (int)

```solidity
int8 public smallInt = -50;      // -128 到 127
int256 public largeInt = -1000000; // -2^255 到 2^255 - 1
int public defaultInt = -42;     // int 等同于 int256
```

**类型范围**:
| 类型 | 范围 |
|------|------|
| int8 | -128 到 127 |
| int16 | -32,768 到 32,767 |
| int256 | -2^255 到 2^255 - 1 |
| int | 等同于 int256 |

**特点**:
- 可以为负数
- 默认值是 `0`
- Solidity 0.8+ 自动检查溢出和下溢

### 4. 可见性修饰符

#### Public
```solidity
uint256 public publicVar = 100; // 外部可访问，自动生成 getter
function publicFunction() public { } // 外部和内部都可调用
```

#### Private
```solidity
uint256 private privateVar = 200; // 只能合约内部访问
function privateFunction() private { } // 只能合约内部调用
```

#### Internal
```solidity
uint256 internal internalVar = 300; // 合约内部和继承合约可访问
function internalFunction() internal { } // 合约内部和继承合约可调用
```

#### External
```solidity
function externalFunction() external { } // 只能从外部调用
// 注意：不能从合约内部直接调用，需要通过 this.externalFunction()
```

### 5. 常量 (constant) 和不可变变量 (immutable)

```solidity
uint256 public constant MAX_VALUE = 1000000; // 编译时常量
uint256 public immutable INITIAL_VALUE;      // 构造函数中设置一次
```

**区别**:
- `constant`: 编译时确定，不占用存储，不能修改
- `immutable`: 构造函数中设置，不占用存储，之后不能修改

---

## 🔧 合约详解

### VariableTypes.sol

演示所有变量类型和操作：
- 布尔类型的使用
- 无符号和有符号整型
- 常量和 immutable
- 类型转换
- 纯函数和视图函数

**关键学习点**:
- 变量声明和初始化
- 类型范围和限制
- 类型转换方法

### VisibilityDemo.sol

演示可见性修饰符：
- public、private、internal、external
- 继承中的可见性
- 通过 this 调用 external 函数

**关键学习点**:
- 四种可见性的区别
- 何时使用哪种可见性
- 继承中的可见性规则

### TypeComparison.sol

对比 Solidity 与其他语言：
- 静态类型 vs 动态类型
- 数值范围限制
- 可见性对比
- 默认值

**关键学习点**:
- Solidity 的类型系统特点
- 与其他语言的差异
- 为什么需要这些限制

---

## 🧪 测试

### 运行所有测试

```bash
npm test
```

测试覆盖：
- ✅ 布尔类型操作
- ✅ 无符号整型操作
- ✅ 有符号整型操作
- ✅ 常量读取
- ✅ Immutable 读取
- ✅ 可见性访问
- ✅ 类型转换
- ✅ 默认值验证

### 运行 AI 自动化测试

```bash
npm run test:ai
```

AI 测试会：
1. 自动部署所有合约
2. 测试所有变量类型
3. 验证可见性
4. 生成类型分析报告

---

## 🚨 常见问题

### Q1: uint 和 uint256 有什么区别？

**答**: 没有区别，`uint` 是 `uint256` 的简写。同样，`int` 是 `int256` 的简写。

### Q2: 什么时候使用 uint8 而不是 uint256？

**答**: 
- 当值范围确定在 0-255 时，使用 uint8 可以节省 Gas
- Storage 槽是 256 位，但使用更小的类型可以打包多个变量到一个槽中

### Q3: public 和 external 的区别？

**答**:
- `public`: 外部和内部都可调用
- `external`: 只能从外部调用，不能从合约内部直接调用（需要通过 `this`）

### Q4: private 和 internal 的区别？

**答**:
- `private`: 只能在同一合约内访问
- `internal`: 合约内部和继承合约都可访问

### Q5: constant 和 immutable 的区别？

**答**:
- `constant`: 编译时确定，值写在代码中
- `immutable`: 构造函数中设置，值可以是部署时的参数

---

## ✅ 学习检查清单

完成后，你应该能够：

### 变量类型理解
- [ ] 理解布尔类型的使用
- [ ] 理解无符号整型 (uint) 的范围
- [ ] 理解有符号整型 (int) 的范围
- [ ] 知道如何选择合适的类型大小
- [ ] 理解类型转换方法

### 可见性理解
- [ ] 理解 public、private、internal、external 的区别
- [ ] 知道何时使用哪种可见性
- [ ] 理解继承中的可见性规则
- [ ] 知道如何访问 private 变量

### 实践能力
- [ ] 能够声明不同类型的变量
- [ ] 能够使用 public/private 修饰符
- [ ] 能够编写简单的类型转换函数
- [ ] 能够理解 Solidity 与其他语言的差异

---

## 🎯 下一步

**Day 4**: Solidity 变量 —— 地址类型、合约类型
- 学习 address 类型
- 学习合约类型
- 理解 msg.sender 的用法
- 学习如何引用其他合约

---

## 📚 相关资源

- [Solidity 类型文档](https://docs.soliditylang.org/en/latest/types.html)
- [可见性修饰符文档](https://docs.soliditylang.org/en/latest/contracts.html#visibility-and-getters)
- [Hardhat 文档](https://hardhat.org/docs)

---

## 💡 提示

1. **注意类型差异**: Solidity 是静态类型，必须声明类型

2. **选择合适的类型**: 使用合适的类型大小可以节省 Gas

3. **理解可见性**: 可见性直接影响合约的安全性和可访问性

4. **记录对比**: 注意 Solidity 与你熟悉语言的异同

5. **实践为主**: 多写代码，多测试，加深理解

---

## 🎓 学习笔记模板

```markdown
# Day 3 学习笔记

## 日期: [填写日期]

## 学习内容
- [ ] 变量类型：布尔、整型
- [ ] 可见性修饰符
- [ ] 类型转换

## 关键概念

### 布尔类型
- 特点: [你的理解]
- 默认值: [你的理解]

### 整型
- uint8 范围: [你的理解]
- uint256 范围: [你的理解]
- int8 范围: [你的理解]

### 可见性
- public: [你的理解]
- private: [你的理解]
- internal: [你的理解]
- external: [你的理解]

## 与其他语言的对比
| 特性 | Solidity | JavaScript | Java |
|------|----------|------------|------|
| 类型系统 | [填写] | [填写] | [填写] |
| 可见性 | [填写] | [填写] | [填写] |

## 遇到的问题
1. [问题描述]
   - 解决方案: [解决方案]

## 代码示例
\`\`\`solidity
[重要代码]
\`\`\`

## 下一步计划
- [ ] [计划1]
- [ ] [计划2]
```

---

**继续你的 Solidity 学习之旅！** 🚀

有问题？查看 [QUICKSTART.md](./QUICKSTART.md) 获取快速开始指南

