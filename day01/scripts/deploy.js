const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * HelloWorld 合约部署脚本
 *
 * 使用方法：
 * npx hardhat run scripts/deploy.js --network localhost
 *
 * 部署流程：
 * 1. 获取部署者账户
 * 2. 编译合约
 * 3. 部署合约
 * 4. 验证合约功能
 * 5. 输出部署信息
 */

async function main() {
  console.log("🚀 开始部署 HelloWorld 合约...\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 1: 获取部署者账户信息
  // ═══════════════════════════════════════════════════════════

  // 获取所有可用账户（由 Hardhat 提供）
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);

  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(balance), "ETH\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 2: 编译合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 1/4: 编译合约...");
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2/4: 部署 HelloWorld 合约...");

  // 获取合约工厂（用于创建合约实例）
  const HelloWorld = await ethers.getContractFactory("HelloWorld");

  // 设置初始消息
  const initialMessage = "Hello, Web3 World! 🌍";
  console.log("   初始消息:", initialMessage);

  // 部署合约并等待交易确认
  const helloWorld = await HelloWorld.deploy(initialMessage);
  await helloWorld.waitForDeployment();

  // 获取合约地址
  const contractAddress = await helloWorld.getAddress();

  console.log("✅ 合约部署成功!");
  console.log("   ├─ 合约地址:", contractAddress);
  console.log("   ├─ 部署者:", deployer.address);

  // 验证初始状态
  const deployedMessage = await helloWorld.getMessage();
  console.log("   └─ 当前消息:", deployedMessage);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 测试合约功能
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3/4: 测试合约功能...");

  // 设置新消息
  const newMessage = "Welcome to Solidity! 🎉";
  console.log("   设置新消息:", newMessage);

  // 调用 setMessage 函数
  const tx = await helloWorld.setMessage(newMessage);
  await tx.wait();  // 等待交易确认

  // 验证消息已更新
  const updatedMessage = await helloWorld.getMessage();
  console.log("   ✅ 消息更新成功!");
  console.log("   └─ 更新后消息:", updatedMessage);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 输出部署摘要
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4/4: 部署摘要");
  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║            🎉 部署完成！                              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📋 部署信息:");
  console.log("   • 网络:", hre.network.name);
  console.log("   • Chain ID:", hre.network.config.chainId || 31337);
  console.log("   • 合约地址:", contractAddress);
  console.log("   • 部署者:", deployer.address);
  console.log("   • 当前消息:", updatedMessage);
  console.log("");
  console.log("🎯 下一步操作:");
  console.log("   1. 运行测试：npx hardhat test");
  console.log("   2. 启动本地节点：npx hardhat node");
  console.log("   3. 在 Remix IDE 中与合约交互");
  console.log("");
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });
