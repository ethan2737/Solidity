const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 8 合约部署...\n");

  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  
  if (!fs.existsSync(deploymentInfoPath)) {
    console.error("❌ 找不到 deployment-info.json");
    console.log("💡 请先运行部署脚本: npx hardhat run scripts/deploy.js --network localhost");
    return;
  }

  const deploymentInfo = JSON.parse(
    fs.readFileSync(deploymentInfoPath, "utf8")
  );

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║           验证 Day 8 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 StructMappingDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StructMappingDemo) {
    console.log("1️⃣ 验证 StructMappingDemo 合约...");
    try {
      const structMappingDemo = await ethers.getContractAt(
        "StructMappingDemo",
        deploymentInfo.contracts.StructMappingDemo.address
      );
      
      const userCount = await structMappingDemo.getUserCount();
      const orderCount = await structMappingDemo.getAllOrderIds();
      
      console.log("   ✅ StructMappingDemo 验证通过");
      console.log("      ├─ 合约地址:", structMappingDemo.address);
      console.log("      ├─ 用户数量:", userCount.toString());
      console.log("      └─ 订单数量:", orderCount.length.toString());
    } catch (error) {
      console.log("   ❌ StructMappingDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 StructOperations
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StructOperations) {
    console.log("2️⃣ 验证 StructOperations 合约...");
    try {
      const structOperations = await ethers.getContractAt(
        "StructOperations",
        deploymentInfo.contracts.StructOperations.address
      );
      
      const personCount = await structOperations.getPersonCount();
      
      console.log("   ✅ StructOperations 验证通过");
      console.log("      ├─ 合约地址:", structOperations.address);
      console.log("      └─ Person 数量:", personCount.toString());
    } catch (error) {
      console.log("   ❌ StructOperations 验证失败:", error.message);
    }
    console.log("");
  }

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║              ✅ 验证完成！                             ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 验证过程出错:");
    console.error(error);
    process.exit(1);
  });

