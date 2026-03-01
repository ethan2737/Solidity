# Day 2 - 以太坊账户模型 + Gas 机制 + ERC20 代币

> **学习目标**: 理解以太坊账户类型、Gas 机制，掌握 ERC20 代币标准
> **学习时长**: 2-3 小时
> **难度**: ⭐⭐
> **开发环境**: VSCode + Hardhat

---

## 📚 今天要学习的内容

完成今天的学习后，你将能够：

- [ ] 理解 EOA（外部账户）和合约账户的区别
- [ ] 理解 EVM（以太坊虚拟机）工作原理
- [ ] 掌握 Gas、Gas Price、Gas Limit 的概念和计算
- [ ] 理解 Storage vs Memory vs Calldata 的 Gas 差异
- [ ] 掌握 ERC20 代币标准的核心接口
- [ ] 理解 approve/transferFrom 授权机制
- [ ] 部署并测试 SimpleToken 代币合约

---

## 🌐 行业知识点

### 1. 以太坊账户模型

#### 两种账户类型

以太坊有两种账户类型：

| 特性 | EOA（外部账户） | 合约账户 |
|------|----------------|----------|
| **控制者** | 私钥持有者 | 合约代码 |
| **能否发起交易** | ✅ 可以 | ❌ 不能（只能响应调用） |
| **是否有代码** | ❌ 没有 | ✅ 有 |
| **是否有余额** | ✅ 有 | ✅ 有 |
| **创建方式** | 生成私钥 | 部署合约 |

#### 账户数据结构

每个账户包含以下信息：

```
账户
├── Nonce：交易计数器（防止重放攻击）
├── Balance：ETH 余额（单位：wei）
├── Storage：存储数据（合约账户特有）
└── Code：合约代码（合约账户特有）
```

#### 地址格式

- **EOA 地址**: 由公钥推导而来（公钥哈希的后 20 字节）
- **合约地址**: 由部署者地址和 Nonce 计算而来
- **格式**: 0x 开头 + 40 个十六进制字符（如 0x742d35Cc6634C0532925a3b844Bc454e4438f44e）

---

### 2. EVM 与 Gas 机制

#### 什么是 EVM？

**EVM（Ethereum Virtual Machine）** 是以太坊的虚拟机，负责执行智能合约。

- 每个以太坊节点都运行 EVM
- 合约代码在 EVM 上执行
- 所有节点执行相同的代码，得到相同的结果

#### Gas 是什么？

**Gas** 是以太坊中计算工作量的单位。

```
交易费用 = Gas Used × Gas Price
```

| 术语 | 说明 | 单位 |
|------|------|------|
| **Gas** | 计算工作量 | gas |
| **Gas Price** | 每单位 Gas 的价格 | Gwei（1 Gwei = 10^-9 ETH） |
| **Gas Limit** | 交易允许的最大 Gas | gas |
| **Gas Fee** | 总费用 | ETH |

#### 为什么需要 Gas？

1. **防止滥用**: 每次操作都有成本，防止无限循环
2. **激励矿工**: Gas 费作为矿工的奖励
3. **资源分配**: 网络拥堵时，价高者得

#### 常见操作的 Gas 成本

| 操作 | Gas 成本 |
|------|---------|
| 基础交易（ETH 转账） | 21,000 |
| Storage 写入（0→非 0） | ~20,000 |
| Storage 修改（非 0→非 0） | ~5,000 |
| Storage 读取 | ~2,100 |
| Memory 操作 | 3-16 |
| 事件日志 | ~375 + 375/topic + 8/byte |

#### Storage vs Memory vs Calldata

| 数据位置 | 说明 | Gas 成本 | 生命周期 |
|----------|------|----------|----------|
| **Storage** | 永久存储 | 最昂贵 | 永久 |
| **Memory** | 临时内存 | 中等 | 函数执行期间 |
| **Calldata** | 调用数据 | 最便宜 | 只读，不可修改 |

---

### 3. ERC20 代币标准

#### 什么是 ERC20？

**ERC20**（Ethereum Request for Comments 20）是以太坊的代币标准。

- 定义了代币合约的基本接口
- 确保不同代币可以互操作
- 99% 的代币项目都遵循此标准

#### ERC20 核心接口

```solidity
// 查询接口
function totalSupply() public view returns (uint256);
function balanceOf(address account) public view returns (uint256);
function allowance(address owner, address spender) public view returns (uint256);

// 操作接口
function transfer(address to, uint256 amount) public returns (bool);
function approve(address spender, uint256 amount) public returns (bool);
function transferFrom(address from, address to, uint256 amount) public returns (bool);
```

#### ERC20 事件

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

#### approve/transferFrom 机制

这是 ERC20 的核心设计，用于授权第三方代为转账：

```
步骤 1: 用户授权 DEX
User.approve(DEX, 1000)  // 授权 DEX 使用 1000 个代币

步骤 2: DEX 执行交易
DEX.transferFrom(User, LiquidityPool, 500)  // 从用户转 500 个代币到流动性池
```

**应用场景**:
- DEX 交易（Uniswap 等）
- DeFi 协议（借贷、质押）
- 自动化支付

---

## 💻 编程知识点

### 1. mapping 数据类型

```solidity
// 基本映射：地址 → 余额
mapping(address => uint256) public balanceOf;

// 嵌套映射：拥有者 → (被授权人 → 金额)
mapping(address => mapping(address => uint256)) public allowance;
```

**特点**:
- 类似哈希表/字典
- 只能通过键访问值
- 不能遍历（需要额外数组）
- 默认值为 0

### 2. require 语句

```solidity
// 检查条件，不满足则回滚并返回错误信息
require(balanceOf[msg.sender] >= _value, "Insufficient balance");
```

**用途**:
- 输入验证
- 权限检查
- 状态验证

### 3. 事件（Event）

```solidity
// 定义事件
event Transfer(address indexed from, address indexed to, uint256 value);

// 触发事件
emit Transfer(msg.sender, _to, _value);
```

**用途**:
- 链下监听（前端更新 UI）
- 历史查询（区块浏览器）
- Gas 优化（比 Storage 便宜）

### 4. address 类型操作

```solidity
// 查询余额
uint256 balance = address(account).balance;

// 转账 ETH（不推荐，可能触发重入）
payable(account).transfer(amount);

// 转账 ETH（推荐）
payable(account).call{value: amount}("");

// 零地址检查
require(_to != address(0), "Invalid address");
```

---

## 📝 记忆/理解要点

| 类型 | 内容 |
|------|------|
| **记忆** | EOA vs 合约账户的区别 |
| **记忆** | Gas Fee = Gas Used × Gas Price |
| **记忆** | Storage(永久) > Memory(临时) > Calldata(只读) 的 Gas 成本 |
| **记忆** | ERC20 六个核心接口：totalSupply, balanceOf, allowance, transfer, approve, transferFrom |
| **理解** | mapping 数据结构的存储原理 |
| **理解** | approve/transferFrom 授权机制的工作流程 |
| **理解** | require 的作用和错误处理机制 |

---

## 🔗 延伸文档

- [以太坊账户文档](https://ethereum.org/zh/developers/docs/accounts/)
- [Gas 和费用](https://ethereum.org/zh/developers/docs/gas/)
- [ERC20 标准](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin ERC20 实现](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol)
- [Solidity 数据位置](https://docs.soliditylang.org/en/latest/types.html#data-locations)

---

## 🚀 快速开始（VSCode + Hardhat）

### 前置要求

- 完成 Day 1 的学习
- Node.js >= 16
- VSCode + Solidity 插件

### 5 分钟部署指南

```bash
# 步骤 1: 进入项目目录
cd day02

# 步骤 2: 安装依赖
npm install

# 步骤 3: 编译合约
npm run compile

# 步骤 4: 启动本地节点（新终端）
npm run node

# 步骤 5: 部署合约（原终端）
npm run deploy

# 步骤 6: 运行测试
npm test
```

### 预期输出

```
🚀 开始部署 Day 2 合约...

📍 部署者地址：0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

📦 部署 SimpleToken (ERC20 代币)...
✅ SimpleToken 部署成功!
   ├─ 合约地址：0x5FbDB2315678afecb367f032d93F642f64180aa3
   └─ 总供应量：1000000000000000000000000

📦 部署 GasDemo (Gas 消耗演示)...
✅ GasDemo 部署成功!

📦 部署 AccountInfo (账户信息演示)...
✅ AccountInfo 部署成功!

🎉 Day 2 部署完成！
```

---

## 📁 项目代码结构

```
day02/
├── contracts/
│   ├── SimpleToken.sol      # ERC20 代币合约
│   ├── GasDemo.sol          # Gas 消耗演示合约
│   └── AccountInfo.sol      # 账户信息演示合约
├── scripts/
│   └── deploy.js            # 部署脚本
├── test/
│   └── Day02.test.js        # 测试文件
├── hardhat.config.js        # Hardhat 配置
├── package.json             # 项目依赖
└── README.md                # 本文件
```

---

## 💡 代码详解

### SimpleToken.sol 实现步骤

#### 步骤 1：声明代币基本信息

```solidity
string public name;           // 代币名称
string public symbol;         // 代币符号
uint8 public decimals;        // 小数位数（通常 18）
uint256 public totalSupply;   // 总供应量
```

#### 步骤 2：声明余额映射

```solidity
// 地址 → 余额
mapping(address => uint256) public balanceOf;

// 拥有者 → (被授权人 → 金额)
mapping(address => mapping(address => uint256)) public allowance;
```

#### 步骤 3：构造函数初始化

```solidity
constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals,
    uint256 _initialSupply
) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    totalSupply = _initialSupply;

    // 将所有代币分配给部署者
    balanceOf[msg.sender] = _initialSupply;
    emit Transfer(address(0), msg.sender, _initialSupply);
}
```

#### 步骤 4：实现转账函数

```solidity
function transfer(address _to, uint256 _value) public returns (bool) {
    // Checks: 检查余额和地址
    require(balanceOf[msg.sender] >= _value, "Insufficient balance");
    require(_to != address(0), "Invalid address");

    // Effects: 更新余额
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    // Interactions: 触发事件
    emit Transfer(msg.sender, _to, _value);
    return true;
}
```

#### 步骤 5：实现授权机制

```solidity
// 授权
function approve(address _spender, uint256 _value) public returns (bool) {
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
}

// 授权转账
function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    // Checks: 检查余额、授权额度、地址
    require(balanceOf[_from] >= _value, "Insufficient balance");
    require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
    require(_to != address(0), "Invalid address");

    // Effects: 更新余额和授权额度
    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    allowance[_from][msg.sender] -= _value;

    // Interactions: 触发事件
    emit Transfer(_from, _to, _value);
    return true;
}
```

---

## ✅ 学习检查清单

### 概念理解
- [ ] 能解释 EOA 和合约账户的区别
- [ ] 理解 Gas、Gas Price、Gas Limit 的关系
- [ ] 知道 Storage vs Memory vs Calldata 的差异
- [ ] 理解 ERC20 标准的六个核心接口

### 实践能力
- [ ] 成功部署 SimpleToken 合约
- [ ] 成功部署 GasDemo 合约
- [ ] 测试转账功能
- [ ] 测试授权和 transferFrom 功能
- [ ] 所有测试用例通过

### 代码理解
- [ ] 理解 mapping 数据结构的用法
- [ ] 理解 require 的作用
- [ ] 理解 approve/transferFrom 的工作流程
- [ ] 理解事件的用途

---

## 🎯 下一步

**Day 3**: Solidity 变量类型详解

学习内容预告：
- 布尔类型（bool）
- 整型（uint/int）
- 可见性修饰符（public/private/internal/external）
- constant 和 immutable
- 类型转换

---

## 💪 学习鼓励

恭喜你完成了 ERC20 代币合约的学习！

**核心收获**:
- ERC20 是所有 DeFi 协议的基础
- approve/transferFrom 是 DEX 的核心机制
- Gas 理解是优化合约成本的关键

**实践建议**:
1. 尝试修改代币参数（名称、符号、供应量）
2. 在测试网部署你的代币
3. 用 MetaMask 与合约交互

继续加油！🚀
