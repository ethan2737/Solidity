# 🚀 快速开始指南 - Day 10

> 5 分钟快速部署和测试函数修改器（modifier）

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day10

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
🚀 开始部署 Day 10 合约...

📦 步骤 2: 部署 ModifierDemo...
✅ ModifierDemo 部署成功!

📦 步骤 3: 部署 InheritedContract...
✅ InheritedContract 部署成功!

📦 步骤 4: 部署 ModifierAdvanced...
✅ ModifierAdvanced 部署成功!

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

#### 测试 onlyOwner modifier（如题目要求）

```javascript
// 获取合约
const modifierDemo = await ethers.getContractAt(
  "ModifierDemo",
  "0x5FbDB..." // 你的合约地址
);

// 测试 owner 调用（如题目要求）
const [deployer, addr1] = await ethers.getSigners();
await modifierDemo.setValue(100);
const value = await modifierDemo.getValue();
console.log("Owner 设置的值:", value.toString());

// 测试非 owner 调用（应该失败）
try {
  await modifierDemo.connect(addr1).setValue(200);
} catch (error) {
  console.log("非 owner 调用被拒绝（预期）:", error.message);
}

// 获取 owner
const owner = await modifierDemo.owner();
console.log("合约 Owner:", owner);
```

#### 测试带参数的 modifier

```javascript
// 测试 validValue modifier
await modifierDemo.setValueWithValidation(500);
const validatedValue = await modifierDemo.getValue();
console.log("验证后的值:", validatedValue.toString());

// 测试超出范围的值（应该失败）
try {
  await modifierDemo.setValueWithValidation(5);
} catch (error) {
  console.log("超出范围的值被拒绝（预期）:", error.message);
}
```

#### 测试多个 modifier 组合

```javascript
// 测试多个 modifier 组合
await modifierDemo.setValueWithMultipleModifiers(300);
const multiModifierValue = await modifierDemo.getValue();
console.log("多个 modifier 设置的值:", multiModifierValue.toString());

// 测试暂停功能
await modifierDemo.pause();
const paused = await modifierDemo.paused();
console.log("合约是否暂停:", paused);

// 测试在暂停时调用（应该失败）
try {
  await modifierDemo.setValueWhenNotPaused(400);
} catch (error) {
  console.log("暂停时调用被拒绝（预期）:", error.message);
}

// 恢复合约
await modifierDemo.unpause();
```

#### 测试 modifier 继承

```javascript
// 获取继承合约
const inheritedContract = await ethers.getContractAt(
  "InheritedContract",
  "0xe7f17..." // 你的合约地址
);

// 测试继承的 modifier
await inheritedContract.setValue(100);
const inheritedValue = await inheritedContract.value();
console.log("继承合约的值:", inheritedValue.toString());
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "ModifierDemo": {
      "address": "0x5FbDB..."
    },
    "InheritedContract": {
      "address": "0xe7f17..."
    },
    "ModifierAdvanced": {
      "address": "0x9fE46..."
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 创建自己的 modifier（如题目要求）

1. 定义一个 onlyOwner modifier（如题目要求）
2. 定义一个 onlyAdmin modifier
3. 定义一个 whenNotPaused modifier
4. 在函数中使用这些 modifier
5. 测试访问控制

### 任务 2: 实现带参数的 modifier

1. 定义一个 validValue modifier（带参数）
2. 定义一个 hasBalance modifier（带参数）
3. 在函数中使用这些 modifier
4. 测试参数验证

### 任务 3: 实现多个 modifier 组合

1. 创建一个函数，使用多个 modifier
2. 测试 modifier 的执行顺序
3. 理解前置和后置逻辑

---

## 🚨 故障排除

### 问题 1: Modifier 执行失败

```
Error: Only owner
```

**解决**: 确保调用者是 owner，或使用正确的账户

### 问题 2: Modifier 参数错误

```
Error: Value out of range
```

**解决**: 检查参数是否在有效范围内

### 问题 3: Modifier 执行顺序问题

```
Error: Contract is paused
```

**解决**: 检查 modifier 的执行顺序，确保前置条件满足

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

1. **Modifier 很重要**: Modifier 是控制合约逻辑复用的重要设计模式

2. **_; 的位置**: `_;` 的位置决定函数体执行时机

3. **执行顺序**: 理解多个 modifier 的执行顺序很重要

4. **访问控制**: Modifier 是实现访问控制的标准方式

5. **多实践**: 多写代码，多实现访问控制

---

**准备好了吗？开始学习函数修改器（modifier）！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

