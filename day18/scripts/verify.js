const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 开始验证部署信息...\n");

  // 读取部署信息
  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  
  if (!fs.existsSync(deploymentInfoPath)) {
    console.error("❌ 未找到 deployment-info.json 文件");
    console.error("   请先运行部署脚本: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));

  console.log("📋 部署信息:");
  console.log("   • 网络:", deploymentInfo.network);
  console.log("   • Chain ID:", deploymentInfo.chainId);
  console.log("   • 部署时间:", deploymentInfo.timestamp);
  console.log("   • 部署者:", deploymentInfo.deployer);
  console.log("");

  // 验证合约
  const { ethers } = require("hardhat");

  console.log("🔍 验证合约...\n");

  // 验证 MockERC20
  if (deploymentInfo.contracts.MockERC20) {
    const tokenAddress = deploymentInfo.contracts.MockERC20.address;
    console.log("📦 MockERC20:");
    console.log("   • 地址:", tokenAddress);
    
    try {
      const MockERC20 = await ethers.getContractAt("MockERC20", tokenAddress);
      const name = await MockERC20.name();
      const symbol = await MockERC20.symbol();
      const totalSupply = await MockERC20.totalSupply();
      
      console.log("   • 名称:", name);
      console.log("   • 符号:", symbol);
      console.log("   • 总供应量:", ethers.formatEther(totalSupply), "TEST");
      console.log("   ✅ 验证成功\n");
    } catch (error) {
      console.log("   ❌ 验证失败:", error.message, "\n");
    }
  }

  // 验证 SimpleFlashLoan
  if (deploymentInfo.contracts.SimpleFlashLoan) {
    const poolAddress = deploymentInfo.contracts.SimpleFlashLoan.address;
    console.log("📦 SimpleFlashLoan:");
    console.log("   • 地址:", poolAddress);
    
    try {
      const SimpleFlashLoan = await ethers.getContractAt("SimpleFlashLoan", poolAddress);
      const feeBps = await SimpleFlashLoan.FLASH_LOAN_FEE_BPS();
      
      console.log("   • 手续费率:", feeBps.toString(), "基点");
      console.log("   ✅ 验证成功\n");
    } catch (error) {
      console.log("   ❌ 验证失败:", error.message, "\n");
    }
  }

  // 验证 FlashLoanReceiver
  if (deploymentInfo.contracts.FlashLoanReceiver) {
    const receiverAddress = deploymentInfo.contracts.FlashLoanReceiver.address;
    console.log("📦 FlashLoanReceiver:");
    console.log("   • 地址:", receiverAddress);
    
    try {
      const FlashLoanReceiver = await ethers.getContractAt("FlashLoanReceiver", receiverAddress);
      const flashLoanPool = await FlashLoanReceiver.flashLoanPool();
      
      console.log("   • 闪电贷池子:", flashLoanPool);
      console.log("   ✅ 验证成功\n");
    } catch (error) {
      console.log("   ❌ 验证失败:", error.message, "\n");
    }
  }

  // 验证池子余额
  if (deploymentInfo.poolBalance) {
    console.log("💰 池子余额:", deploymentInfo.poolBalance, "TEST");
  }

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║            ✅ 验证完成！                              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 验证失败:");
    console.error(error);
    process.exit(1);
  });

