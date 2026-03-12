# Advanced Solidity Demo

本项目整合了 Solidity 进阶教程 day17 和 day18 的所有示例合约。

## 合约内容

### 第一部分：库 (Library)
- **SafeMath**: 安全数学运算库
- **ArrayUtils**: 数组工具库
- **StringUtils**: 字符串工具库
- **AddressUtils**: 地址工具库

### 第二部分：接口 (Interface)
- **IERC20Like**: 类似 ERC20 的接口
- **IStorable**: 存储接口
- **IWithdrawable**: 可提取接口
- **IToken**: 代币接口
- **IWallet**: 钱包接口

### 第三部分：继承 (Inheritance)
- **Ownable**: 所有权管理基础合约
- **Pausable**: 可暂停功能基础合约
- **StorageBase**: 存储基础合约
- 单继承示例
- 多继承示例
- 函数重写示例
- 抽象合约示例

### 第四部分：事件 (Event)
- 基础事件 (Transfer, Mint, Burn, Approval)
- 高级事件 (匿名事件, 复杂事件, 批量操作)

## 项目结构

```
day13/
├── contracts/
│   └── AdvancedSolidityDemo.sol   # 整合后的合约文件
├── scripts/
│   ├── deploy.js                  # 部署脚本
│   └── verify.js                  # 验证脚本
├── test/
│   └── AdvancedSolidityDemo.test.js # 测试文件
├── hardhat.config.js              # Hardhat 配置
├── package.json                   # 项目依赖
└── README.md                       # 说明文档
```

## 快速开始

### 1. 安装依赖

```bash
cd day13
npm install
```

### 2. 编译合约

```bash
npm run compile
# 或
npx hardhat compile
```

### 3. 运行测试

```bash
npm run test
# 或
npx hardhat test
```

### 4. 启动本地节点

```bash
npm run node
# 或
npx hardhat node
```

### 5. 部署合约

```bash
npm run deploy
# 或
npx hardhat run scripts/deploy.js --network localhost
```

### 6. 验证合约

```bash
npx hardhat run scripts/verify.js --network localhost
```

## 部署的合约列表

1. **SimpleToken** - 实现 IERC20Like 接口的代币
2. **StorageContract** - 实现 IStorable 接口的存储
3. **WalletContract** - 实现多接口的钱包
4. **MathContract** - 使用 SafeMath 库的数学合约
5. **ArrayContract** - 使用 ArrayUtils 库的数组合约
6. **StringContract** - 使用 StringUtils 库的字符串合约
7. **AddressContract** - 使用 AddressUtils 库的地址合约
8. **OwnableStorage** - 单继承示例
9. **OwnablePausableStorage** - 多继承示例
10. **AdvancedStorage** - 函数重写示例
11. **ConcreteToken** - 抽象合约实现
12. **EventDemo** - 基础事件示例
13. **EventAdvanced** - 高级事件示例
14. **AdvancedWallet** - 综合钱包合约
15. **TokenWallet** - 综合代币合约
16. **ContractFactory** - 合约工厂
17. **InterfaceUser** - 接口使用示例
18. **ComprehensiveContract** - 综合库使用示例

## 测试覆盖

- Library 测试 (SafeMath, ArrayUtils, StringUtils, AddressUtils)
- Interface 测试 (IERC20Like, IStorable, IWithdrawable)
- Inheritance 测试 (单继承, 多继承, 函数重写, 抽象合约)
- Event 测试 (基础事件, 高级事件, 匿名事件)
- Comprehensive 测试 (AdvancedWallet, TokenWallet, ContractFactory)

## 学习要点

1. **接口 (Interface)**: 定义合约必须实现的函数签名，实现代码解耦和标准化
2. **继承 (Inheritance)**: 通过继承复用代码，支持单继承、多继承和函数重写
3. **库 (Library)**: 代码复用、Gas 优化、提供安全辅助函数
4. **事件 (Event)**: 前端监听、日志审计、Gas 优化

## License

MIT
