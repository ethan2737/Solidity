# 🚀 快速开始指南 - Day 5

> 5 分钟快速部署和测试枚举和自定义值类型

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day05

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
🚀 开始部署 Day 5 合约...

📦 步骤 2: 部署 EnumDemo...
✅ EnumDemo 部署成功!
   ├─ 合约地址: 0x5FbDB...
   ├─ 当前状态: 0
   └─ 状态值: { Created: 0, Locked: 1, Inactive: 2 }

📦 步骤 3: 部署 CustomValueType...
✅ CustomValueType 部署成功!

📦 步骤 4: 部署 StateMachine...
✅ StateMachine 部署成功!

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

#### 测试枚举

```javascript
// 获取合约
const enumDemo = await ethers.getContractAt(
  "EnumDemo",
  "0x5FbDB..." // 你的合约地址
);

// 获取当前状态
const currentState = await enumDemo.getCurrentState();
console.log("当前状态:", currentState.toString()); // 0 = Created

// 获取所有状态值
const stateValues = await enumDemo.getAllStateValues();
console.log("状态值:", {
  Created: stateValues.created.toString(),
  Locked: stateValues.locked.toString(),
  Inactive: stateValues.inactive.toString()
});

// 测试状态转换
await enumDemo.lock();
const newState = await enumDemo.getCurrentState();
console.log("锁定后状态:", newState.toString()); // 1 = Locked

// 测试订单状态
await enumDemo.createOrder(1);
await enumDemo.confirmOrder(1);
const orderStatus = await enumDemo.getOrderStatus(1);
console.log("订单状态:", orderStatus.toString()); // 1 = Confirmed
```

#### 测试自定义值类型

```javascript
// 获取合约
const customValueType = await ethers.getContractAt(
  "CustomValueType",
  "0xe7f17..." // 你的合约地址
);

// 创建用户ID
const [deployer, addr1] = await ethers.getSigners();
const userId = await customValueType.createUserId(addr1.address);
console.log("用户ID:", userId.toString());

// 获取用户地址
const userAddress = await customValueType.getUserAddress(userId);
console.log("用户地址:", userAddress);

// 创建价格
const price = await customValueType.createPriceFromEther(100);
await customValueType.setPrice(price);
const priceInEther = await customValueType.getPriceInEther();
console.log("价格:", priceInEther.toString(), "ETH");
```

#### 测试状态机

```javascript
// 获取合约
const stateMachine = await ethers.getContractAt(
  "StateMachine",
  "0x9fE46..." // 你的合约地址
);

// 获取当前状态
const currentState = await stateMachine.getCurrentState();
console.log("当前状态:", currentState.toString()); // 0 = Draft

// 检查是否可以转换
const canTransition = await stateMachine.canTransitionTo(1);
console.log("可以转换到 Review:", canTransition);

// 执行状态转换
await stateMachine.submitForReview();
const newState = await stateMachine.getCurrentState();
console.log("新状态:", newState.toString()); // 1 = Review

// 获取状态转换历史
const transitionCount = await stateMachine.getTransitionCount();
console.log("转换次数:", transitionCount.toString());
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "EnumDemo": {
      "address": "0x5FbDB...",
      "initialState": "0"
    },
    "CustomValueType": {
      "address": "0xe7f17..."
    },
    "StateMachine": {
      "address": "0x9fE46...",
      "initialState": "0"
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 创建自己的枚举

1. 定义一个枚举，如 `enum Status {Pending, Active, Completed}`
2. 创建状态变量
3. 编写状态转换函数
4. 测试状态转换

### 任务 2: 实现状态机

1. 设计一个简单的状态机（如订单流程）
2. 定义状态枚举
3. 实现状态转换函数
4. 添加状态验证

### 任务 3: 使用自定义值类型

1. 定义自定义值类型（如 `type TokenId is uint256`）
2. 创建使用该类型的函数
3. 测试类型安全

---

## 🚨 故障排除

### 问题 1: 枚举值超出范围

```
Error: Invalid state value
```

**解决**: 确保枚举值在有效范围内（0 到 n-1）

### 问题 2: 状态转换失败

```
Error: Invalid state
```

**解决**: 检查当前状态是否允许转换到目标状态

### 问题 3: 自定义值类型转换失败

```
Error: Member "wrap" not found
```

**解决**: 确保使用 Solidity 0.8.0+ 版本

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

1. **枚举很实用**: 枚举在状态管理中非常实用

2. **状态机模式**: 状态机是合约中常用的设计模式

3. **自定义值类型**: 提供类型安全，不增加存储成本

4. **注意范围**: 枚举最多 256 个值

5. **多实践**: 多写代码，多实现状态机

---

**准备好了吗？开始学习枚举和自定义值类型！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

