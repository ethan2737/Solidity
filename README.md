# Solidity 学习项目

> 18 天 Solidity 智能合约开发学习笔记与代码示例

## 项目概述

本项目记录了从零开始学习 Solidity 智能合约开发的完整过程，共历时 18 天。涵盖了以太坊智能合约开发的基础知识、核心概念、进阶技术以及实战项目。

## 学习路线

| 天数 | 主题 | 核心内容 |
|------|------|----------|
| Day 00 | 准备工作 | 开发环境搭建 |
| Day 01 | 区块链基础 + HelloWorld | 区块链原理、以太坊概念、智能合约基础、第一个合约 |
| Day 02 | 账户模型 + Gas 机制 + ERC20 | EOA/合约账户、Gas 机制、ERC20 代币标准 |
| Day 03 | 变量类型 | 布尔、整型、可见性修饰符、constant/immutable |
| Day 04 | 地址类型 + 合约类型 | address/address payable、msg.sender、合约引用 |
| Day 05 | 枚举 + 自定义值类型 | 枚举类型、自定义值类型、状态机 |
| Day 06 | 数组 + Mapping | 动态/静态数组、mapping、storage/memory |
| Day 07 | 高级数组 | 多维数组、bytes/string、数组切片 |
| Day 08 | Struct + 错误处理 | 结构体、函数调用、可见性 |
| Day 09 | 函数修饰符 | 修饰符使用、参数修饰 |
| Day 10 | 综合合约 | 构造函数、constant/immutable、receive/fallback |
| Day 11 | 全局变量 + 错误处理 | msg/block/tx 全局变量、require/revert/assert、try/catch |
| Day 12 | 事件 + 日志 | Event 定义、触发、索引 |
| Day 13 | 进阶特性 | 库(Library)、接口(Interface)、继承、事件 |
| Day 14 | 合约模式 | 可升级合约、Access Control |
| Day 15 | ERC20 代币 | OpenZeppelin ERC20、扩展实现 |
| Day 16 | AMM 交易所 | x·y=k 恒定乘积模型、自动做市商 |
| Day 17 | 流动性挖矿 | Staking 合约、奖励分发 |
| Day 18 | 闪电贷 | Flash Loan 原理与实现 |

## 技术栈

- **智能合约语言**: Solidity ^0.8.24
- **开发框架**: Hardhat
- **测试框架**: Mocha + Chai
- **JavaScript SDK**: Ethers.js v6

## 项目结构

```
Solidity/
├── day00/          # 环境准备
├── day01/          # HelloWorld 合约
├── day02/          # ERC20 代币 + Gas 机制
├── day03/          # 变量类型
├── day04/          # 地址与合约类型
├── day05/          # 枚举与自定义类型
├── day06/          # 数组与 Mapping
├── day07/          # 高级数组
├── day08/          # Struct 与错误处理
├── day09/          # 函数修饰符
├── day10/          # 综合演示合约
├── day11/          # 全局变量与错误处理
├── day12/          # 事件与日志
├── day13/          # 库、接口、继承
├── day14/          # 合约安全模式
├── day15/          # ERC20 代币项目
├── day16/          # AMM 交易所
├── day17/          # 流动性挖矿
└── day18/          # 闪电贷
```

每个 day 目录结构:

```
dayXX/
├── contracts/     # Solidity 合约
├── scripts/        # 部署脚本
├── test/           # 测试文件
├── hardhat.config.js
├── package.json
└── README.md
```

## 快速开始

### 进入任意一天的项目

```bash
cd day01  # 例如进入第一天

# 安装依赖
npm install

# 编译合约
npm run compile

# 启动本地节点（新终端）
npm run node

# 部署合约（另一终端）
npm run deploy

# 运行测试
npm test

# 运行 AI 自动化测试
npm run test:ai
```

## 核心概念总结

### 数据类型
- **值类型**: bool, uint/int (8-256), address, bytes
- **引用类型**: string, bytes, array, struct, mapping

### 存储位置
- **storage**: 永久存储，Gas 成本高
- **memory**: 函数内临时使用
- **calldata**: 函数参数专用，只读

### 可见性
- `public`: 内外都可访问，自动生成 getter
- `external`: 只能外部调用
- `internal`: 合约内和子合约可访问
- `private`: 仅当前合约可访问

### 错误处理
- `require`: 输入验证，返回剩余 Gas
- `revert`: 无条件回滚
- `assert`: 内部错误检查，耗尽 Gas

### 全局变量
- `msg.sender`: 调用者地址
- `msg.value`: 发送的 ETH 数量
- `block.timestamp`: 区块时间戳
- `block.number`: 区块号

## 学习资源

- [Solidity 官方文档](https://docs.soliditylang.org/)
- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js 文档](https://docs.ethers.io/)

## 常见命令

```bash
# 编译所有合约
npm run compile

# 启动本地测试网络
npm run node

# 部署合约
npm run deploy

# 运行测试
npm test
npm run test:ai  # AI 自动化测试

# 验证合约
npm run verify
```

## 学习笔记亮点

1. **循序渐进**: 从 HelloWorld 到复杂的 DeFi 项目
2. **代码驱动**: 每个概念都有对应的可运行代码
3. **测试完善**: 每个合约都有对应的测试用例
4. **错误汇总**: Day16/17 包含常见错误分析与解决方案
5. **实战项目**: AMM、Staking、Flash Loan 等真实场景

## License

MIT
