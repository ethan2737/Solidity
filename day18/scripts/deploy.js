const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署闪电贷合约...\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  
  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(balance), "ETH\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 1: 编译合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 1: 编译合约...");
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 2: 部署 MockERC20 代币（用于测试）
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署测试代币...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy(
    "Test Token",
    "TEST",
    ethers.parseEther("1000000") // 1,000,000 tokens
  );
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ MockERC20 部署成功!");
  console.log("   ├─ 代币地址:", tokenAddress);
  console.log("   ├─ 名称: Test Token");
  console.log("   └─ 符号: TEST\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署闪电贷池子
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署闪电贷池子...");
  
  const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
  const flashLoanPool = await SimpleFlashLoan.deploy();
  await flashLoanPool.waitForDeployment();
  
  const poolAddress = await flashLoanPool.getAddress();
  console.log("✅ SimpleFlashLoan 部署成功!");
  console.log("   ├─ 池子地址:", poolAddress);
  
  const feeBps = await flashLoanPool.FLASH_LOAN_FEE_BPS();
  console.log("   └─ 手续费率:", feeBps.toString(), "基点 (0.09%)\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署闪电贷接收者
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署闪电贷接收者...");
  
  const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver");
  const flashLoanReceiver = await FlashLoanReceiver.deploy(poolAddress);
  await flashLoanReceiver.waitForDeployment();
  
  const receiverAddress = await flashLoanReceiver.getAddress();
  console.log("✅ FlashLoanReceiver 部署成功!");
  console.log("   └─ 接收者地址:", receiverAddress, "\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 向池子存入资金
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 5: 向池子存入资金...");
  
  const depositAmount = ethers.parseEther("50000"); // 50,000 tokens
  await token.transfer(poolAddress, depositAmount);
  
  const poolBalance = await flashLoanPool.getBalance(tokenAddress);
  console.log("✅ 资金存入成功!");
  console.log("   ├─ 存入金额:", ethers.formatEther(depositAmount), "TEST");
  console.log("   └─ 池子余额:", ethers.formatEther(poolBalance), "TEST\n");

  // ═══════════════════════════════════════════════════════════
  // 保存部署信息
  // ═══════════════════════════════════════════════════════════
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MockERC20: {
        address: tokenAddress,
        name: "Test Token",
        symbol: "TEST",
        totalSupply: ethers.formatEther(ethers.parseEther("1000000"))
      },
      SimpleFlashLoan: {
        address: poolAddress,
        feeBps: feeBps.toString()
      },
      FlashLoanReceiver: {
        address: receiverAddress
      }
    },
    poolBalance: ethers.formatEther(poolBalance)
  };

  // 保存到文件
  const outputPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 部署信息已保存到 deployment-info.json\n");

  // ═══════════════════════════════════════════════════════════
  // 摘要
  // ═══════════════════════════════════════════════════════════
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║            🎉 部署完成！                              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📋 部署摘要:");
  console.log("   • 网络:", deploymentInfo.network);
  console.log("   • Chain ID:", deploymentInfo.chainId);
  console.log("   • 代币地址:", tokenAddress);
  console.log("   • 闪电贷池子:", poolAddress);
  console.log("   • 闪电贷接收者:", receiverAddress);
  console.log("   • 池子余额:", ethers.formatEther(poolBalance), "TEST");
  console.log("");
  console.log("🎯 下一步:");
  console.log("   1. 运行测试: npm test");
  console.log("   2. 阅读 README.md 了解闪电贷原理");
  console.log("   3. 分析 bZX 和 dYdX 攻击案例");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });

