# 🚀 快速开始指南 - Day 7

> 5 分钟快速部署和测试多维数组、bytes、string、切片

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day07

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
🚀 开始部署 Day 7 合约...

📦 步骤 2: 部署 MultiDimensionalArray...
✅ MultiDimensionalArray 部署成功!

📦 步骤 3: 部署 BytesStringDemo...
✅ BytesStringDemo 部署成功!

📦 步骤 4: 部署 SliceDemo...
✅ SliceDemo 部署成功!

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

#### 测试多维数组

```javascript
// 获取合约
const multiDimensionalArray = await ethers.getContractAt(
  "MultiDimensionalArray",
  "0x5FbDB..." // 你的合约地址
);

// 添加行到二维数组
await multiDimensionalArray.addRow([1, 2, 3]);
await multiDimensionalArray.addRow([4, 5, 6]);

// 获取行数
const rowCount = await multiDimensionalArray.getDynamic2DRowCount();
console.log("行数:", rowCount.toString());

// 获取元素
const element = await multiDimensionalArray.getDynamic2DElement(0, 0);
console.log("元素 [0][0]:", element.toString());

// 获取整行
const row = await multiDimensionalArray.getDynamic2DRow(0);
console.log("第一行:", row.map(e => e.toString()));

// 测试固定二维数组
await multiDimensionalArray.setFixed2DElement(0, 0, 100);
const fixedValue = await multiDimensionalArray.getFixed2DElement(0, 0);
console.log("固定数组元素:", fixedValue.toString());
```

#### 测试 bytes 和 string

```javascript
// 获取合约
const bytesStringDemo = await ethers.getContractAt(
  "BytesStringDemo",
  "0xe7f17..." // 你的合约地址
);

// 测试 bytes
await bytesStringDemo.setDynamicBytes("0x48656c6c6f"); // "Hello"
const bytesLength = await bytesStringDemo.getDynamicBytesLength();
console.log("Bytes 长度:", bytesLength.toString());

// 测试 push
await bytesStringDemo.pushByte(0x21); // '!'
const newLength = await bytesStringDemo.getDynamicBytesLength();
console.log("Push 后长度:", newLength.toString());

// 测试 string
await bytesStringDemo.setString("Hello, Solidity!");
const stringLength = await bytesStringDemo.getStringLength();
console.log("String 长度:", stringLength.toString());

// 测试转换
const bytes = await bytesStringDemo.stringToBytes("Hello");
console.log("String 转 Bytes:", bytes);

const str = await bytesStringDemo.bytesToString(bytes);
console.log("Bytes 转 String:", str);
```

#### 测试切片操作

```javascript
// 获取合约
const sliceDemo = await ethers.getContractAt(
  "SliceDemo",
  "0x9fE46..." // 你的合约地址
);

// 测试 bytes 切片
const bytesSlice = await sliceDemo.getBytesSlice(0, 5);
console.log("Bytes 切片:", bytesSlice);

// 测试 string 切片
const stringSlice = await sliceDemo.getStringSlice(0, 5);
console.log("String 切片:", stringSlice);

// 测试前缀
const prefix = await sliceDemo.getStringPrefix(5);
console.log("String 前缀:", prefix);

// 测试后缀
const suffix = await sliceDemo.getStringSuffix(5);
console.log("String 后缀:", suffix);

// 测试反转
const reversed = await sliceDemo.reverseString();
console.log("反转字符串:", reversed);
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "MultiDimensionalArray": {
      "address": "0x5FbDB..."
    },
    "BytesStringDemo": {
      "address": "0xe7f17..."
    },
    "SliceDemo": {
      "address": "0x9fE46..."
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 创建自己的多维数组

1. 声明一个二维数组存储矩阵
2. 实现矩阵加法函数
3. 实现矩阵转置函数
4. 测试所有功能

### 任务 2: 操作 bytes 和 string

1. 创建一个函数，接收 string 参数
2. 将 string 转换为 bytes
3. 对 bytes 进行操作（添加、删除字节）
4. 转换回 string

### 任务 3: 实现字符串工具函数

1. 实现字符串反转函数
2. 实现字符串查找函数
3. 实现字符串替换函数
4. 测试所有功能

---

## 🚨 故障排除

### 问题 1: 多维数组索引越界

```
Error: Row out of bounds
```

**解决**: 检查索引是否在有效范围内

### 问题 2: string 不能直接索引

```
Error: Member "push" not found
```

**解决**: string 不能直接操作，需要先转换为 bytes

### 问题 3: 切片操作失败

```
Error: Slice out of bounds
```

**解决**: 检查起始索引和长度是否在有效范围内

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

1. **注意 Storage vs Memory**: bytes 和 string 在 Storage 和 Memory 中的行为不同

2. **string 限制**: string 不能直接索引，需要通过 bytes 转换

3. **多维数组**: 注意索引的顺序和范围

4. **切片操作**: Solidity 没有内置切片，需要手动实现

5. **Gas 优化**: 避免在循环中进行大量字符串操作

---

**准备好了吗？开始学习多维数组、bytes、string 和切片！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

