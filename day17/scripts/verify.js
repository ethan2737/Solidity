const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 开始验证 Day 17 合约...\n");

  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  
  if (!fs.existsSync(deploymentInfoPath)) {
    console.log("❌ 未找到 deployment-info.json，请先运行部署脚本");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  
  console.log("📋 部署信息:");
  console.log("   • 网络:", deploymentInfo.network);
  console.log("   • Chain ID:", deploymentInfo.chainId);
  console.log("   • 部署者:", deploymentInfo.deployer);
  console.log("");

  if (deploymentInfo.contracts.StakingMining) {
    console.log("✅ StakingMining 合约地址:", deploymentInfo.contracts.StakingMining.address);
  }

  console.log("\n💡 提示: 在测试网上可以使用 Hardhat 验证插件进行合约验证");
  console.log("   示例: npx hardhat verify --network <network> <contract-address> <constructor-args>");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 验证失败:");
    console.error(error);
    process.exit(1);
  });

