# Day 4 — Solidity 变量：地址类型、合约类型

> **学习目标**: 掌握 Solidity 地址类型和合约类型的使用，理解 msg.sender、msg.value 等预定义变量  
> **学习时长**: 1-3 小时  
> **难度**: ⭐⭐

---

## 📚 学习资料

- **课程视频**: [xiucai-web3-develop-guide.vercel.app](https://xiucai-web3-develop-guide.vercel.app/)
  - "Solidity 变量 —— 地址类型、合约类型"
- **推荐阅读**: 
  - [地址类型文档](https://docs.soliditylang.org/en/latest/types.html#address)
  - [合约类型文档](https://docs.soliditylang.org/en/latest/types.html#contract-types)
  - [全局变量文档](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)

---

## 🚀 快速开始

### 前置要求

- 完成 Day 1-3 的学习
- Node.js >= 16
- npm 或 yarn

### 使用 Hardhat

```bash
# 1. 进入项目目录
cd day04

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
day04/
├── contracts/
│   ├── AddressDemo.sol          # 地址类型演示
│   ├── SimpleToken.sol          # 简单代币（用于合约类型演示）
│   ├── ContractTypeDemo.sol     # 合约类型演示
│   └── GlobalVariablesDemo.sol  # 全局变量演示
├── scripts/
│   ├── deploy.js                # 部署脚本
│   └── verify.js                # 验证脚本
├── test/
│   ├── AddressDemo.test.js      # AddressDemo 测试套件
│   ├── ContractTypeDemo.test.js  # ContractTypeDemo 测试套件
│   ├── GlobalVariablesDemo.test.js # GlobalVariablesDemo 测试套件
│   └── ai-automated-test.js     # AI 自动化测试
├── hardhat.config.js            # Hardhat 配置
├── package.json                 # 项目依赖
├── README.md                    # 本文件
└── QUICKSTART.md                # 快速开始指南
```

---

## 🎯 学习路径

### 第 1 小时：理解地址类型

**目标**: 理解 Solidity 地址类型的使用

**任务**:
- [ ] 观看课程视频 "地址类型、合约类型"
- [ ] 理解以下概念：
  - **address**: 20 字节的地址类型
  - **address payable**: 可以接收 ETH 的地址
  - **地址比较**: == 和 !=
  - **地址转换**: address() 和 payable()
  - **零地址**: address(0)
- [ ] 阅读 AddressDemo.sol 合约
- [ ] 理解 msg.sender 的用法

**关键点**:
- address 是 Solidity 特有的类型
- address payable 可以接收 ETH
- 地址比较是字节级别的比较

### 第 2 小时：理解合约类型

**目标**: 理解如何引用和交互其他合约

**任务**:
- [ ] 理解合约类型变量：
  - **合约类型变量**: `SimpleToken public token;`
  - **通过地址引用**: `token = SimpleToken(_address);`
  - **调用其他合约函数**: `token.name()`
- [ ] 阅读 ContractTypeDemo.sol 合约
- [ ] 理解如何部署新合约
- [ ] 理解如何设置合约引用

**关键点**:
- 合约类型是特殊的地址类型
- 可以通过地址转换为合约类型
- 调用其他合约需要知道接口

### 第 3 小时：理解全局变量

**目标**: 理解 msg、block、tx 等全局变量

**任务**:
- [ ] 理解 msg 变量：
  - **msg.sender**: 交易发送者
  - **msg.value**: 发送的 ETH 数量
  - **msg.data**: 完整的调用数据
- [ ] 理解 block 变量：
  - **block.timestamp**: 区块时间戳
  - **block.number**: 区块号
  - **block.coinbase**: 矿工地址
- [ ] 理解 tx 变量：
  - **tx.origin**: 交易发起者（注意安全风险）
  - **tx.gasprice**: Gas 价格
- [ ] 阅读 GlobalVariablesDemo.sol 合约
- [ ] 实践使用这些变量

**关键点**:
- msg.sender 是最常用的全局变量
- msg.value 只在 payable 函数中有效
- tx.origin 有安全风险，通常应该使用 msg.sender

---

## 📖 核心概念详解

### 1. 地址类型 (address)

```solidity
address public owner;              // 普通地址
address payable public treasury;   // payable 地址
```

**特点**:
- 20 字节（160 位）
- 可以比较（==, !=）
- 可以转换为 payable
- 零地址是 `address(0)`

**转换**:
```solidity
address payable payableAddr = payable(normalAddr);  // address -> payable
address normalAddr = address(payableAddr);          // payable -> address
```

### 2. msg.sender

```solidity
address public owner = msg.sender;  // 部署者地址
```

**特点**:
- 总是当前交易的发送者
- 在构造函数中是部署者
- 在函数调用中是调用者
- 最常用的全局变量

### 3. msg.value

```solidity
function deposit() public payable {
    balances[msg.sender] += msg.value;  // 发送的 ETH 数量
}
```

**特点**:
- 只在 payable 函数中有效
- 单位是 wei（1 ETH = 10^18 wei）
- 如果没有发送 ETH，值为 0

### 4. 合约类型

```solidity
SimpleToken public token;  // 合约类型变量

// 通过地址设置
function setToken(address _address) public {
    token = SimpleToken(_address);
}

// 调用合约函数
function getTokenName() public view returns (string memory) {
    return token.name();
}
```

**特点**:
- 合约类型是特殊的地址类型
- 可以通过地址转换为合约类型
- 需要知道合约的接口才能调用

### 5. 全局变量总结

| 变量 | 类型 | 说明 |
|------|------|------|
| msg.sender | address | 交易发送者 |
| msg.value | uint256 | 发送的 ETH（wei） |
| msg.data | bytes | 完整的调用数据 |
| block.timestamp | uint256 | 区块时间戳 |
| block.number | uint256 | 区块号 |
| block.coinbase | address | 矿工地址 |
| tx.origin | address | 交易发起者 |
| tx.gasprice | uint256 | Gas 价格 |

---

## 🔧 合约详解

### AddressDemo.sol

演示地址类型的使用：
- 地址变量声明
- msg.sender 的使用
- msg.value 的使用
- 地址比较和转换
- ETH 接收和转账

**关键学习点**:
- address vs address payable
- 如何接收和发送 ETH
- 地址操作函数

### ContractTypeDemo.sol

演示合约类型的使用：
- 合约类型变量声明
- 通过地址引用合约
- 调用其他合约的函数
- 部署新合约

**关键学习点**:
- 如何引用其他合约
- 如何调用其他合约的函数
- 如何部署新合约

### GlobalVariablesDemo.sol

演示全局变量的使用：
- msg 变量
- block 变量
- tx 变量
- 综合使用

**关键学习点**:
- 各种全局变量的用途
- 何时使用哪个变量
- 安全注意事项

---

## 🧪 测试

### 运行所有测试

```bash
npm test
```

测试覆盖：
- ✅ 地址类型操作
- ✅ msg.sender 使用
- ✅ msg.value 使用
- ✅ 合约类型引用
- ✅ 调用其他合约
- ✅ 全局变量访问

### 运行 AI 自动化测试

```bash
npm run test:ai
```

AI 测试会：
1. 自动部署所有合约
2. 测试地址和合约类型
3. 验证全局变量
4. 生成分析报告

---

## 🚨 常见问题

### Q1: address 和 address payable 的区别？

**答**: 
- `address`: 普通地址，不能直接接收 ETH
- `address payable`: 可以接收 ETH 的地址
- 可以通过 `payable()` 转换

### Q2: msg.sender 和 tx.origin 的区别？

**答**:
- `msg.sender`: 当前交易的直接发送者
- `tx.origin`: 交易的原始发起者（可能是中间合约）
- 通常应该使用 `msg.sender`，`tx.origin` 有安全风险

### Q3: 如何引用其他合约？

**答**:
1. 声明合约类型变量：`SimpleToken public token;`
2. 通过地址设置：`token = SimpleToken(_address);`
3. 调用函数：`token.name()`

### Q4: 如何接收 ETH？

**答**:
- 使用 `receive()` 或 `fallback()` 函数
- 函数必须是 `payable`
- 使用 `msg.value` 获取发送的数量

### Q5: 如何发送 ETH？

**答**:
- 使用 `transfer()`: `payable(addr).transfer(amount)`
- 使用 `send()`: `payable(addr).send(amount)`
- 使用 `call()`: `addr.call{value: amount}("")`

---

## ✅ 学习检查清单

完成后，你应该能够：

### 地址类型理解
- [ ] 理解 address 和 address payable 的区别
- [ ] 知道如何转换地址类型
- [ ] 理解 msg.sender 的用法
- [ ] 理解 msg.value 的用法
- [ ] 能够接收和发送 ETH

### 合约类型理解
- [ ] 理解如何声明合约类型变量
- [ ] 知道如何通过地址引用合约
- [ ] 能够调用其他合约的函数
- [ ] 能够部署新合约

### 全局变量理解
- [ ] 理解 msg.sender、msg.value 等
- [ ] 理解 block.timestamp、block.number 等
- [ ] 理解 tx.origin 的安全风险
- [ ] 知道何时使用哪个变量

### 实践能力
- [ ] 能够声明 address 变量
- [ ] 能够使用 msg.sender
- [ ] 能够引用其他合约
- [ ] 能够调用其他合约的函数

---

## 🎯 下一步

**Day 5**: Solidity 变量 —— 枚举/自定义值类型
- 学习枚举类型
- 学习自定义值类型
- 理解状态机模式

---

## 📚 相关资源

- [地址类型文档](https://docs.soliditylang.org/en/latest/types.html#address)
- [合约类型文档](https://docs.soliditylang.org/en/latest/types.html#contract-types)
- [全局变量文档](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)
- [Hardhat 文档](https://hardhat.org/docs)

---

## 💡 提示

1. **地址类型很重要**: 地址类型是 Solidity 最常用的类型之一

2. **理解 msg.sender**: msg.sender 是最重要的全局变量，要深入理解

3. **注意安全**: tx.origin 有安全风险，通常应该使用 msg.sender

4. **合约引用**: 引用其他合约需要知道接口，可以使用 interface

5. **实践为主**: 多写代码，多测试，加深理解

---

**继续你的 Solidity 学习之旅！** 🚀

有问题？查看 [QUICKSTART.md](./QUICKSTART.md) 获取快速开始指南

