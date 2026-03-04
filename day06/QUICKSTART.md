# 🚀 快速开始指南 - Day 6

> 5 分钟快速部署和测试数组和引用类型

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day06

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
🚀 开始部署 Day 6 合约...

📦 步骤 2: 部署 ArrayDemo...
✅ ArrayDemo 部署成功!
   ├─ 固定数组长度: 5
   └─ 动态数组长度: 0

📦 步骤 3: 部署 StorageMemoryDemo...
✅ StorageMemoryDemo 部署成功!

📦 步骤 4: 部署 MappingDemo...
✅ MappingDemo 部署成功!

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

#### 测试数组操作

```javascript
// 获取合约
const arrayDemo = await ethers.getContractAt(
  "ArrayDemo",
  "0x5FbDB..." // 你的合约地址
);

// 测试 push
await arrayDemo.pushToDynamicArray(100);
await arrayDemo.pushToDynamicArray(200);
await arrayDemo.pushToDynamicArray(300);

// 获取数组长度
const length = await arrayDemo.getDynamicArrayLength();
console.log("数组长度:", length.toString());

// 获取所有元素
const allElements = await arrayDemo.getAllDynamicArrayElements();
console.log("所有元素:", allElements.map(e => e.toString()));

// 测试地址数组
const [deployer, addr1, addr2] = await ethers.getSigners();
await arrayDemo.pushAddress(addr1.address);
await arrayDemo.pushAddress(addr2.address);

const addresses = await arrayDemo.getAllAddresses();
console.log("所有地址:", addresses);

// 测试数组统计
const sum = await arrayDemo.sumArray();
const max = await arrayDemo.findMax();
const min = await arrayDemo.findMin();
console.log("总和:", sum.toString());
console.log("最大值:", max.toString());
console.log("最小值:", min.toString());
```

#### 测试 Storage vs Memory

```javascript
// 获取合约
const storageMemoryDemo = await ethers.getContractAt(
  "StorageMemoryDemo",
  "0xe7f17..." // 你的合约地址
);

// 测试 Storage 操作
await storageMemoryDemo.addToStorageArray(100);
await storageMemoryDemo.addToStorageArray(200);

const storageArray = await storageMemoryDemo.getStorageArray();
console.log("Storage 数组:", storageArray.map(e => e.toString()));

// 测试 Memory 操作
const memoryArray = await storageMemoryDemo.createMemoryArray(5);
console.log("Memory 数组:", memoryArray.map(e => e.toString()));

// 测试 Calldata
const sum = await storageMemoryDemo.sumCalldataArray([10, 20, 30]);
console.log("Calldata 数组总和:", sum.toString());
```

#### 测试映射操作

```javascript
// 获取合约
const mappingDemo = await ethers.getContractAt(
  "MappingDemo",
  "0x9fE46..." // 你的合约地址
);

// 设置余额
const [deployer, addr1, addr2] = await ethers.getSigners();
await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
await mappingDemo.setBalance(addr2.address, ethers.utils.parseEther("200"));

// 获取余额
const balance1 = await mappingDemo.balances(addr1.address);
const balance2 = await mappingDemo.balances(addr2.address);
console.log("地址1余额:", ethers.utils.formatEther(balance1), "ETH");
console.log("地址2余额:", ethers.utils.formatEther(balance2), "ETH");

// 测试嵌套映射
await mappingDemo.setAllowance(addr1.address, addr2.address, ethers.utils.parseEther("50"));
const allowance = await mappingDemo.getAllowance(addr1.address, addr2.address);
console.log("授权额度:", ethers.utils.formatEther(allowance), "ETH");

// 获取所有地址
const allAddresses = await mappingDemo.getAllAddresses();
console.log("所有地址:", allAddresses);

// 计算总余额
const totalBalance = await mappingDemo.getTotalBalance();
console.log("总余额:", ethers.utils.formatEther(totalBalance), "ETH");
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "ArrayDemo": {
      "address": "0x5FbDB..."
    },
    "StorageMemoryDemo": {
      "address": "0xe7f17..."
    },
    "MappingDemo": {
      "address": "0x9fE46..."
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 创建自己的数组合约

1. 声明一个 uint[] 动态数组
2. 实现 push、pop、update 函数
3. 实现查找和统计函数
4. 测试所有功能

### 任务 2: 理解 Storage vs Memory

1. 创建一个函数，接收 memory 数组参数
2. 修改 memory 数组，观察是否影响外部
3. 创建一个函数，使用 storage 引用
4. 修改 storage 引用，观察是否影响原始数据

### 任务 3: 实现映射遍历

1. 创建一个映射存储用户余额
2. 维护一个数组存储所有用户地址
3. 实现遍历所有用户余额的函数
4. 实现查找余额大于指定值的用户

---

## 🚨 故障排除

### 问题 1: 数组索引越界

```
Error: Index out of bounds
```

**解决**: 检查索引是否小于数组长度

### 问题 2: Storage vs Memory 混淆

```
Error: Member "push" not found
```

**解决**: Memory 数组不能使用 push，需要先创建固定大小的数组

### 问题 3: 映射遍历失败

```
Error: Cannot iterate over mapping
```

**解决**: 映射不能直接遍历，需要使用数组辅助

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

1. **注意数据位置**: Storage vs Memory vs Calldata 非常重要

2. **数组操作**: push/pop 是动态数组的主要操作

3. **映射遍历**: 需要数组辅助，记住这个模式

4. **Gas 优化**: Calldata 比 Memory 便宜

5. **多实践**: 多写代码加深理解

---

**准备好了吗？开始学习数组和引用类型！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

