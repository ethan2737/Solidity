# 🚀 快速开始指南 - Day 8

> 5 分钟快速部署和测试结构体与映射

---

## ⚡ 超快速模式

```bash
# 1. 进入项目目录
cd day08

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
🚀 开始部署 Day 8 合约...

📦 步骤 2: 部署 StructMappingDemo...
✅ StructMappingDemo 部署成功!

📦 步骤 3: 部署 StructOperations...
✅ StructOperations 部署成功!

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

#### 测试结构体和映射（如题目要求）

```javascript
// 获取合约
const structMappingDemo = await ethers.getContractAt(
  "StructMappingDemo",
  "0x5FbDB..." // 你的合约地址
);

// 创建用户（如题目要求）
const [deployer, addr1, addr2] = await ethers.getSigners();
await structMappingDemo.createUser(addr1.address, ethers.utils.parseEther("100"));
await structMappingDemo.createUser(addr2.address, ethers.utils.parseEther("200"));

// 获取用户信息
const user1 = await structMappingDemo.getUser(addr1.address);
console.log("用户1地址:", user1.addr);
console.log("用户1余额:", ethers.utils.formatEther(user1.balance), "ETH");
console.log("用户1是否激活:", user1.isActive);

// 更新用户余额
await structMappingDemo.updateUserBalance(addr1.address, ethers.utils.parseEther("150"));
const newBalance = await structMappingDemo.getUserBalance(addr1.address);
console.log("更新后余额:", ethers.utils.formatEther(newBalance), "ETH");

// 增加用户余额
await structMappingDemo.increaseUserBalance(addr1.address, ethers.utils.parseEther("50"));
const increasedBalance = await structMappingDemo.getUserBalance(addr1.address);
console.log("增加后余额:", ethers.utils.formatEther(increasedBalance), "ETH");

// 获取所有用户
const allUsers = await structMappingDemo.getAllUsers();
console.log("所有用户:", allUsers);

// 计算总余额
const totalBalance = await structMappingDemo.getTotalBalance();
console.log("总余额:", ethers.utils.formatEther(totalBalance), "ETH");
```

#### 测试结构体操作

```javascript
// 获取合约
const structOperations = await ethers.getContractAt(
  "StructOperations",
  "0xe7f17..." // 你的合约地址
);

// 创建并存储 Person
await structOperations.createAndStorePerson("Alice", 25, addr1.address);
const person = await structOperations.getPersonFromMapping(addr1.address);
console.log("Person 姓名:", person.name);
console.log("Person 年龄:", person.age.toString());
console.log("Person 地址:", person.addr);

// 修改 Person
await structOperations.updatePersonInMapping(addr1.address, "Alice Updated", 26);
const updatedPerson = await structOperations.getPersonFromMapping(addr1.address);
console.log("更新后姓名:", updatedPerson.name);
console.log("更新后年龄:", updatedPerson.age.toString());
```

#### 测试嵌套映射

```javascript
// 创建产品
const productId = await structMappingDemo.createProduct("Product", ethers.utils.parseEther("10"), 100);
console.log("产品ID:", productId.toString());

// 设置用户拥有的产品数量
await structMappingDemo.setUserProduct(addr1.address, productId, 5);
const quantity = await structMappingDemo.getUserProduct(addr1.address, productId);
console.log("用户拥有的产品数量:", quantity.toString());
```

---

## 📋 检查部署结果

查看 `deployment-info.json`:

```json
{
  "network": "localhost",
  "contracts": {
    "StructMappingDemo": {
      "address": "0x5FbDB..."
    },
    "StructOperations": {
      "address": "0xe7f17..."
    }
  }
}
```

---

## 🎯 实践任务

### 任务 1: 创建自己的用户管理系统（如题目要求）

1. 定义一个 User 结构体（包含 address 和 balance）
2. 使用 `mapping(address => User)` 管理用户
3. 实现创建用户函数
4. 实现更新用户余额函数
5. 实现查询用户信息函数

### 任务 2: 实现订单管理系统

1. 定义一个 Order 结构体
2. 使用 `mapping(uint => Order)` 管理订单
3. 实现创建订单函数
4. 实现更新订单状态函数
5. 实现查询订单函数

### 任务 3: 实现映射遍历

1. 维护一个数组存储所有用户地址
2. 实现遍历所有用户余额的函数
3. 实现查找余额大于指定值的用户函数
4. 实现计算总余额的函数

---

## 🚨 故障排除

### 问题 1: 映射值未初始化

```
Error: User does not exist
```

**解决**: 检查映射值是否存在，使用 `require` 验证

### 问题 2: 结构体修改失败

```
Error: Member "balance" not found
```

**解决**: 确保结构体定义正确，使用正确的成员名称

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

1. **映射很高效**: 映射是合约中非常高效的数据存储形式

2. **结构体定义**: 结构体可以包含多种类型，定义复杂数据结构

3. **映射遍历**: 映射不能直接遍历，需要数组辅助

4. **Storage vs Memory**: 理解结构体在 Storage 和 Memory 中的区别

5. **多实践**: 多写代码，多实现用户管理系统

---

**准备好了吗？开始学习结构体与映射！** 🚀

有问题？查看 [README.md](./README.md) 获取完整文档

