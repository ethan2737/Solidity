# Day 17 - Staking/Mining 合约项目

## 项目概述

本项目实现了一个完整的流动性挖矿（Staking/Mining）智能合约，用户可以通过质押代币获得奖励。

---

## 修复问题汇总

在项目开发和测试过程中，一共修复了 **23 个问题**：

### 1. 配置文件问题 (3个)

| 问题 | 原因 | 修复方式 |
|------|------|----------|
| `hardhat.comfig.js` 文件名拼写错误 | 文件名拼写错误 | 重命名为 `hardhat.config.js` |
| 配置文件中引入 hardhat 模块 | 配置文件不能引入 hardhat，会导致循环引用 | 删除 `const { artifacts } = require("hardhat");` |
| `optimizer.enable` 改为 `optimizer.enabled` | Solidity 编译器配置键名错误 | 修改为 `enabled: true` |

### 2. Solidity 合约问题 (9个)

| 问题 | 原因 | 修复方式 |
|------|------|----------|
| `import "./IERC20"` 缺少扩展名 | Solidity import 路径错误 | 改为 `import "./IERC20.sol"` |
| `IERC20.sol` SPDX 许可证拼写错误 | 拼写错误 `Identifer` | 改为 `Identifier` |
| `MockERC20.sol` 变量名不一致 | 定义 `BalanceOf` 使用 `balanceOf` | 统一改为 `balances` |
| `StakingMining.sol` error/event 名字冲突 | `ContractPaused` 既是 error 又是 event | error 改为 `ContractPausedError` |
| 文档注释参数不匹配 | `@param stakeAmount` 不存在 | 改为 `@param stakedAmount` |
| 缺少 `lastTimeRewardApplicable()` 函数 | 代码遗漏 | 添加该函数 |
| 缺少 `earned()` 函数 | 代码遗漏 | 添加该函数 |
| 缺少 `periodFinish` 变量 | 代码遗漏 | 添加该变量 |
| `UserInfo[msg.sender]` 变量名错误 | 应使用 `userinfo` mapping | 改为 `userinfo[msg.sender]` |
| `emit staked` 事件名大小写错误 | 事件名应为 `Staked` | 改为 `emit Staked` |
| `revert InsufficientStaked()` error 不存在 | 应使用已定义的 `InsufficientBalance()` | 改为 `revert InsufficientBalance()` |
| `emit emergencyWithdraw` 事件名大小写错误 | 事件名应为 `EmergencyWithdraw` | 改为 `emit EmergencyWithdraw` |
| `pause()` 函数名拼写错误 | 拼写错误 `pasue` | 保持拼写错误（合约中为 `pasue()`） |

### 3. ethers.js 版本兼容问题 (10个)

| 问题 | 原因 | 修复方式 |
|------|------|----------|
| `ethers.utils.parseEther` | ethers.js v6 API 变化 | 改为 `ethers.parseEther` |
| `deployer.getBalance()` | ethers.js v6 API 变化 | 改为 `provider.getBalance(deployer.address)` |
| `.deployed()` 方法 | ethers.js v6 已废弃 | 改为 `.waitForDeployment()` |
| `.address` 属性 | ethers.js v6 返回 Promise | 改为 `await contract.getAddress()` |
| BigInt 比较 `.eq()`, `.gt()`, `.add()` | ethers.js v6 返回 bigint | 改为原生运算符 `===`, `>`, `+` |

### 4. package.json 问题 (1个)

| 问题 | 原因 | 修复方式 |
|------|------|----------|
| `--networklocalhost` 缺少空格 | 拼写错误 | 改为 `--network localhost` |

---

## 命令执行顺序

```
npm install → npm run compile → npm run node → npm run deploy → npm test → npm run test:ai → npm run verify
```

### 1. `npm install`
**安装依赖**

- 安装 `package.json` 中的所有依赖（Hardhat、OpenZeppelin、测试库等）
- 首次运行或添加新依赖后必须执行

### 2. `npm run compile`
**编译合约**

- 将 Solidity 代码编译成字节码和 ABI
- 生成 `artifacts/` 目录
- **每次修改 `.sol` 文件后必须重新执行**

### 3. `npm run node`
**启动本地节点**

- 启动 Hardhat 本地测试网络
- 创建 10 个测试账户（每个 10000 ETH）
- 监听 `http://127.0.0.1:8545`
- **必须在独立终端中运行，保持运行状态**

### 4. `npm run deploy`
**部署合约**

- 连接到本地节点
- 部署以下合约：
  - MockERC20（质押代币）
  - MockERC20（奖励代币）
  - StakingMining（主合约）
- 初始化合约（转入奖励代币）
- **节点启动后才能运行**

### 5. `npm test`
**运行单元测试**

- 执行 `test/*.test.js` 文件
- 使用 Mocha + Chai 框架
- 验证合约核心功能

### 6. `npm run test:ai`
**运行自动化测试**

- 执行 `test/ai-automated-test.js` 脚本
- 测试质押、奖励计算、领取奖励、暂停等功能

### 7. `npm run verify`
**验证合约（可选）**

- 验证已部署合约的源代码
- 需要 Etherscan API key
- 用于主网/测试网部署后的验证

---

## 为什么是这个顺序？

| 步骤 | 原因 |
|------|------|
| `install` → `compile` | 有依赖才能编译 |
| `compile` → `node` | 编译产物供节点使用 |
| `node` → `deploy` | 部署需要运行的节点 |
| `deploy` → `test` / `test:ai` | 合约部署后才能测试 |
| `verify` | 可选，需要先部署 |

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 编译合约
npm run compile

# 3. 启动节点（独立终端）
npm run node

# 4. 部署合约（另一个终端）
npm run deploy

# 5. 运行测试
npm test
npm run test:ai

# 6. 验证合约（可选）
npm run verify
```
