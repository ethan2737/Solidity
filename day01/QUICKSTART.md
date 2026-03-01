# Day 1 - 快速开始指南

> 5 分钟快速部署你的第一个智能合约

---

## 🚀 快速部署流程

### 步骤 1: 打开 VSCode

```bash
# 在 VSCode 中打开终端
# 确保当前目录是 day01
```

### 步骤 2: 安装依赖

```bash
npm install
```

### 步骤 3: 编译合约

```bash
npm run compile
```

### 步骤 4: 启动本地节点

**打开新终端窗口**，运行：

```bash
npm run node
```

你会看到：
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

### 步骤 5: 部署合约

**回到原终端**，运行：

```bash
npm run deploy
```

### 步骤 6: 运行测试

```bash
npm test
```

---

## ✅ 验证成功

如果你看到以下输出，说明一切正常：

```
🎉 部署完成！

📋 部署信息:
   • 网络：localhost
   • Chain ID: 31337
   • 合约地址：0x5FbDB2315678afecb367f032d93F642f64180aa3

  passing (2s)
```

---

## 🛠️ 常见问题

### 问题 1: npm install 失败

```bash
# 清除缓存重试
npm cache clean --force
npm install
```

### 问题 2: 端口 8545 被占用

```bash
# Windows: 查找并结束占用端口的进程
netstat -ano | findstr :8545
taskkill /PID <进程 ID> /F

# Mac/Linux:
lsof -i :8545
kill -9 <进程 ID>
```

### 问题 3: 编译错误

```bash
# 清理缓存后重新编译
npm run clean
npm run compile
```

---

## 🎯 下一步

合约部署成功后：

1. **阅读完整文档**: 打开 [README.md](./README.md) 学习详细概念
2. **与合约交互**: 使用 Remix IDE 或编写脚本
3. **继续学习**: 进入 Day 2 的学习

---

## 📚 有用的命令

```bash
# 编译合约
npm run compile

# 运行测试
npm test

# 启动本地节点
npm run node

# 部署合约
npm run deploy

# 清理缓存
npm run clean
```
