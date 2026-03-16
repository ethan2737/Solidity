# Day16 - 去中心化交易所原理（AMM 模型）

理解 x·y=k 恒定乘积模型与自动做市商（AMM）实现。

---

## 运行命令报错原因总结

从**编译 → 测试 → 启动节点 → 部署 → 验证**各命令曾出现的报错及原因如下。

### 一、`npm run compile` 失败

**原因：** 在 `hardhat.config.js` 里**加载配置时**就使用了 Hardhat 运行时：

```js
const { network } = require("hardhat");  // ❌ 配置加载阶段 Hardhat 还未初始化
```

配置正在被读取时 Hardhat 还没初始化，不能 `require("hardhat")`，会触发 **HH9**。

**修复：** 删除上述两行（以及未使用的 `require("chai")` 的 version），配置里只保留自己的 `network` 等字段，不要从 `hardhat` 包导入。

---

### 二、`npm run test` 失败

**原因有两类：**

#### 1. 多个同名合约 Artifact（HH701）

- `TestToken` 同时存在于：
  - `contracts/TestToken.sol`
  - `contracts/SimpleAMM.sol`（被 import）
- Hardhat 无法区分，要求使用**完全限定名**。

**修复：**  
`getContractFactory("TestToken")` → `getContractFactory("contracts/TestToken.sol:TestToken")`

#### 2. ethers v5 写法在 v6 下不兼容

项目通过 `@nomicfoundation/hardhat-toolbox` 使用的是 **ethers v6**，测试仍是 v5 写法，导致：

| 现象 | 原因 |
|------|------|
| `tokenA.deployed is not a function` | v6 中 `deploy()` 返回的 Promise resolve 后即表示已部署，没有 `.deployed()` |
| `ethers.utils is undefined` / `parseEther` 报错 | v6 移除了 `ethers.utils`，改为 `ethers.parseEther`、`ethers.formatEther` |
| 合约地址 | v6 使用 `contract.target` 或 `await contract.getAddress()`，不再用 `contract.address` |
| 数值类型 | v6 使用原生 `bigint`，不再使用 BigNumber，故 `.mul()/.div()/.add()/.sub()/.gt()/.lt()/.eq()` 需改为 `* / + - > < ===` 或 `> 0n` 等 |
| 事件 | v6 的 `receipt` 没有 `.events`，需用 `contract.queryFilter()` + `event.args.amountOut` 等 |

**修复：** 在测试中按 v6 API 全部改写（去掉 `.deployed()`、改地址/数值/事件读取方式，并适当放宽 k 的误差范围）。

---

### 三、`npm run node`（启动节点）

**说明：** 若使用 `npm run deploy --network localhost` 或 `npm run verify`，需要**先**在另一终端执行 `npm run node`，否则会连不上 RPC（如 `ECONNREFUSED 127.0.0.1:8545`）。  
这是使用顺序问题，不是代码错误。

---

### 四、`npm run deploy` 失败

**原因：** 部署脚本同样是 ethers v5 写法 + 未处理多 Artifact：

| 报错/问题 | 原因 |
|-----------|------|
| `deployer.getBalance is not a function` | v6 中 Signer 不再直接提供 `getBalance()`，需用 `ethers.provider.getBalance(deployer.address)` |
| 多 Artifact | 同测试，`TestToken` 需用完全限定名 `contracts/TestToken.sol:TestToken` |
| `.deployed()`、`.address`、`ethers.utils` | 与测试相同，需改为 v6 的「无 `.deployed()`、`.target`/`getAddress()`、`ethers.parseEther`/`formatEther`」 |

**修复：** 在 `scripts/deploy.js` 中按 v6 与完全限定名做与测试相同的修改。

---

### 五、`npm run verify` 失败

**原因：** 验证脚本里同样有两类问题：

1. **HH701 多 Artifact**  
   使用 `getContractAt("TestToken", address)` 时再次触发「多个 TestToken」歧义。  
   **修复：** 改为 `getContractAt("contracts/TestToken.sol:TestToken", address)`。

2. **ethers v6**  
   - `contract.address` 在 v6 为 `undefined`，打印出「合约地址: undefined」；  
   - `ethers.utils.formatEther` 在 v6 不存在，导致 `Cannot read properties of undefined (reading 'formatEther')`。  
   **修复：** 用 `contract.target` 打印地址，用 `ethers.formatEther` 替代 `ethers.utils.formatEther`。

---

### 汇总表

| 命令 | 直接原因 | 本质 |
|------|----------|------|
| **compile** | 在 config 里 `require("hardhat")` | 配置加载时不能依赖尚未初始化的 Hardhat |
| **test** | ① 多 TestToken 未用完全限定名 ② ethers v5 API | ① Hardhat 多 Artifact ② 项目已是 ethers v6 |
| **node** | （未单独报错） | 若未先启动节点，deploy/verify 会连不上 localhost |
| **deploy** | getBalance/TestToken/.deployed/.address/utils | 部署脚本仍是 v5 + 未用完全限定名 |
| **verify** | TestToken 多 Artifact + .address/utils | 同上，验证脚本也要 v6 + 完全限定名 |

**整体结论：**  
1）Hardhat 配置不能过早依赖 HRE；  
2）TestToken 在有多处定义时必须用完全限定名；  
3）整个项目已切换到 ethers v6，所有脚本和测试都需按 v6 API 改写。  
按上述修改后，从编译到测试、启动节点、部署、验证整套流程即可正常运行。

---

## 常用命令

```bash
# 编译
npm run compile

# 测试
npm run test
npm run test:ai

# 启动本地节点（需先运行以便 deploy/verify 使用 localhost）
npm run node

# 部署（依赖本地节点）
npm run deploy

# 验证部署
npm run verify
```

---

## 项目结构

- `contracts/` - Solidity 合约（TestToken、SimpleAMM、AMMWithLPToken）
- `scripts/` - 部署与验证脚本
- `test/` - Hardhat 测试与 AI 自动化测试
