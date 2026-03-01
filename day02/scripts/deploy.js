const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Day 2 合约部署脚本
 * 部署 SimpleToken、GasDemo、AccountInfo 三个合约
 *
 * 使用方法：
 * npx hardhat run scripts/deploy.js --network localhost
 */

async function main() {
  console.log("🚀 开始部署 Day 2 合约...\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);

  // ═══════════════════════════════════════════════════════════
  // 部署 SimpleToken (ERC20 代币)
  // ═══════════════════════════════════════════════════════════
  console.log("\n📦 部署 SimpleToken (ERC20 代币)...");

  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(
    "Simple Token",      // 代币名称
    "STK",               // 代币符号
    18,                  // 小数位数
    ethers.parseEther("1000000")  // 初始供应量 100 万
  );
  await simpleToken.waitForDeployment();

  const tokenAddress = await simpleToken.getAddress();
  console.log("✅ SimpleToken 部署成功!");
  console.log("   ├─ 合约地址:", tokenAddress);
  console.log("   ├─ 代币名称：Simple Token");
  console.log("   ├─ 代币符号：STK");
  console.log("   └─ 总供应量:", (await simpleToken.totalSupply()).toString());

  // ═══════════════════════════════════════════════════════════
  // 部署 GasDemo (Gas 消耗演示)
  // ═══════════════════════════════════════════════════════════
  console.log("\n📦 部署 GasDemo (Gas 消耗演示)...");

  const GasDemo = await ethers.getContractFactory("GasDemo");
  const gasDemo = await GasDemo.deploy();
  await gasDemo.waitForDeployment();

  const gasDemoAddress = await gasDemo.getAddress();
  console.log("✅ GasDemo 部署成功!");
  console.log("   └─ 合约地址:", gasDemoAddress);

  // ═══════════════════════════════════════════════════════════
  // 部署 AccountInfo (账户信息演示)
  // ═══════════════════════════════════════════════════════════
  console.log("\n📦 部署 AccountInfo (账户信息演示)...");

  const AccountInfo = await ethers.getContractFactory("AccountInfo");
  const accountInfo = await AccountInfo.deploy();
  await accountInfo.waitForDeployment();

  const accountInfoAddress = await accountInfo.getAddress();
  console.log("✅ AccountInfo 部署成功!");
  console.log("   └─ 合约地址:", accountInfoAddress);

  // ═══════════════════════════════════════════════════════════
  // 部署摘要
  // ═══════════════════════════════════════════════════════════
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║            🎉 Day 2 部署完成！                        ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📋 部署摘要:");
  console.log("   • 网络:", hre.network.name);
  console.log("   • Chain ID:", hre.network.config.chainId || 31337);
  console.log("   • 部署者:", deployer.address);
  console.log("");
  console.log("📜 部署的合约:");
  console.log("   1. SimpleToken (ERC20 代币):", tokenAddress);
  console.log("   2. GasDemo (Gas 演示):", gasDemoAddress);
  console.log("   3. AccountInfo (账户信息):", accountInfoAddress);
  console.log("");
  console.log("🎯 下一步操作:");
  console.log("   1. 运行测试：npx hardhat test");
  console.log("   2. 与 SimpleToken 交互：transfer, approve, transferFrom");
  console.log("   3. 测试 GasDemo 的 Gas 消耗");
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
