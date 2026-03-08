# Day 11 - Solidity API: 全局变量与错误处理

> 合并内容：Day13 (全局函数与变量) + Day14 (错误处理)
> 学习目标：掌握 Solidity 全局变量和错误处理机制

---

## 📚 学习资料

- **课程视频**: [xiucai-web3-develop-guide.vercel.app](https://xiucai-web3-develop-guide.vercel.app/)
- **推荐阅读**:
  - [全局变量文档](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)
  - [错误处理文档](https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions)
  - [tx.origin 攻击](https://swcregistry.io/docs/SWC-115)

---

## 🚀 快速开始

### 前置要求

- 完成 Day 1-10 的学习
- Node.js >= 16
- npm 或 yarn

### 使用 Hardhat

```bash
# 1. 进入项目目录
cd day11

# 2. 安装依赖
npm install

# 3. 编译合约
npm run compile

# 4. 启动本地 Hardhat 节点（新终端）
npm run node

# 5. 部署合约（另一个终端）
npm run deploy

# 6. 运行测试
npm test
```

---

## 📁 项目结构

```
day11/
├── contracts/
│   └── SolidityAPIDemo.sol    # 合并后的主合约（含演示）
├── scripts/
│   └── deploy.js              # 部署脚本
├── test/
│   └── SolidityAPIDemo.test.js  # 测试套件
├── hardhat.config.js          # Hardhat 配置
├── package.json               # 项目依赖
└── README.md                 # 本文件
```

---

## 🎯 学习内容

### 第一部分：全局变量

- **msg.sender / msg.value**: 调用者信息
- **tx.origin**: 交易原始发起者（注意安全风险）
- **block.timestamp / block.number**: 区块信息
- **address(this) / address(this).balance**: 合约地址与余额
- **gasleft()**: 剩余 Gas

### 第二部分：全局函数

- **abi.encode / abi.encodePacked**: ABI 编码
- **keccak256**: 哈希函数
- **ecrecover**: 签名恢复

### 第三部分：错误处理

- **require**: 输入验证和条件检查
- **revert**: 无条件回滚
- **assert**: 内部错误检查
- **try/catch**: 外部调用错误处理（Solidity 0.6+）
- **自定义错误**: Gas 优化

### 第四部分：安全实践

- **tx.origin 攻击演示**: 理解为什么不要使用 tx.origin 进行权限检查
- **SafeWallet vs VulnerableWallet**: 展示安全与不安全实现的对比

---

## ✅ 学习检查清单

完成后，你应该能够：

- [ ] 理解 msg.sender, msg.value, tx.origin 的区别
- [ ] 理解 block.* 区块相关全局变量的使用和限制
- [ ] 掌握 abi.encode, keccak256, ecrecover 的使用
- [ ] 掌握 require, revert, assert 的使用场景
- [ ] 掌握 try/catch 处理外部调用错误
- [ ] 理解 tx.origin 攻击的原理和防护方法
- [ ] 能够编写安全的合约

---

## 📚 相关资源

- [全局变量文档](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)
- [错误处理文档](https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions)
- [tx.origin 攻击](https://swcregistry.io/docs/SWC-115)
- [Hardhat 文档](https://hardhat.org/docs)

---

## 💡 提示

1. **永远不要使用 tx.origin 进行权限检查** - 使用 msg.sender 更安全
2. **block.timestamp 可以被矿工操纵** - 不要用于精确时间判断
3. **自定义错误比字符串更省 Gas** - 生产环境推荐使用
4. **try/catch 只捕获外部调用错误** - 内部错误无法捕获
5. **assert 用于检查合约 bug** - 不应该失败

---

**继续你的 Solidity 学习之旅！** 🚀
