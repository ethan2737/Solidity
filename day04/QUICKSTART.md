# 🚀 快速开始指南 - Day 4

> 5 分钟快速部署和测试地址类型和合约类型

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day04

# 2. 安装依赖（1 分钟）
npm install

# 3. 编译合约（30 秒）
npm run compile

# 4. 启动节点（新终端，保持运行）
npm run node

# 5. 部署（另一个终端）
npm run deploy

# 6. 运行测试
npm test
```

✅ 完成！查看 `deployment-info.json` 获取合约地址。

---

## 📦 完整流程

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 编译合约

```bash
npm run compile
```

### 步骤 3: 启动 Hardhat 节点

```bash
npm run node
```

### 步骤 4: 部署合约

```bash
npm run deploy
```

成功输出：

```
🚀 开始部署 Day 4 合约...

📦 步骤 2: 部署 SimpleToken...
✅ SimpleToken 部署成功!

📦 步骤 3: 部署 AddressDemo...
✅ AddressDemo 部署成功!

📦 步骤 4: 部署 ContractTypeDemo...
✅ ContractTypeDemo 部署成功!

📦 步骤 5: 部署 GlobalVariablesDemo...
✅ GlobalVariablesDemo 部署成功!

🎉 部署完成！
```

### 步骤 5: 运行测试

```bash
npm test
```

---

## 🧪 手动测试

### 在 Hardhat Console 中测试

```bash
npx hardhat console --network localhost
```

#### 测试地址类型

```javascript
// 获取合约
const addressDemo = await ethers.getContractAt(
  "AddressDemo",
  "0x5FbDB..." // 你的合约地址
);

// 获取合约地址
const contractAddress = await addressDemo.getContractAddress();
console.log("合约地址:", contractAddress);

// 获取 msg.sender
const [deployer, addr1] = await ethers.getSigners();
const sender = await addressDemo.connect(addr1).getSender();
console.log("发送者:", sender);

// 测试存款（msg.value）
const amount = ethers.utils.parseEther("0.1");
await addressDemo.connect(addr1).deposit({ value: amount });
const balance = await addressDemo.getBalance(addr1.address);
console.log("余额:", ethers.utils.formatEther(balance), "ETH");
```

#### 测试合约类型

```javascript
// 获取合约
const contractTypeDemo = await ethers.getContractAt(
  "ContractTypeDemo",
  "0xe7f17..." // 你的合约地址
);

// 设置 token 引用
const tokenAddress = "0x9fE46..."; // SimpleToken 地址
await contractTypeDemo.setToken(tokenAddress);

// 调用其他合约的函数
const tokenName = await contractTypeDemo.getTokenName();
console.log("代币名称:", tokenName);

const tokenBalance = await contractTypeDemo.getTokenBalance(deployer.address);
console.log("代币余额:", ethers.utils.formatEther(tokenBalance));
```

#### 测试全局变量

```javascript
// 获取合约
const globalVariablesDemo = await ethers.getContractAt(
  "GlobalVariablesDemo",
  "0x9fE46..." // 你的合约地址
);

// 获取 msg.sender
const sender = await globalVariablesDemo.connect(addr1).getSender();
console.log("msg.sender:", sender);

// 获取 block 信息
const blockNumber = await globalVariablesDemo.getBlockNumber();
const timestamp = await globalVariablesDemo.getTimestamp();
console.log("区块号:", blockNumber.toString());
console.log("时间戳:", new Date(timestamp.toNumber() * 1000));
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "SimpleToken": {
      "address": "0x5FbDB...",
      "name": "Simple Token"
    },
    "AddressDemo": {
      "address": "0xe7f17...",
      "owner": "0xf39Fd..."
    },
    "ContractTypeDemo": {
      "address": "0x9fE46..."
    },
    "GlobalVariablesDemo": {
      "address": "0x..."
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 使用 msg.sender

1. 创建一个合约，使用 msg.sender 设置 owner
2. 编写函数，只有 owner 可以调用
3. 测试不同账户调用

### 任务 2: 接收和发送 ETH

1. 创建一个 payable 函数接收 ETH
2. 记录每个账户的存款
3. 实现提取功能

### 任务 3: 引用其他合约

1. 部署一个代币合约
2. 在另一个合约中引用它
3. 调用代币合约的函数

---

## 🚨 故障排除

### 问题 1: 地址转换失败

```
Error: Invalid address
```

**解决**: 确保地址不为零地址，使用 `require(_address != address(0))`

### 问题 2: 无法接收 ETH

```
Error: Function is not payable
```

**解决**: 函数必须标记为 `payable`

### 问题 3: 合约引用失败

```
Error: Member "name" not found
```

**解决**: 确保合约类型正确，接口匹配

---

## 📚 有用的命令

```bash
# 编译合约
npm run compile

# 部署合约
npm run deploy

# 运行测试
npm test

# 运行 AI 测试
npm run test:ai

# 验证部署
npm run verify

# 打开 console
npx hardhat console --network localhost
```

---

## 💡 小贴士

1. **地址类型很重要**: 地址是 Solidity 最常用的类型

2. **理解 msg.sender**: 这是最重要的全局变量

3. **注意安全**: tx.origin 有安全风险

4. **合约引用**: 需要知道接口才能调用

5. **多实践**: 多写代码加深理解

---

**准备好了吗？开始学习地址和合约类型！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

