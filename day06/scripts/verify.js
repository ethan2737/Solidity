const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 6 合约部署...\n");

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
  console.log("║           验证 Day 6 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 ArrayDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ArrayDemo) {
    console.log("1️⃣ 验证 ArrayDemo 合约...");
    try {
      const arrayDemo = await ethers.getContractAt(
        "ArrayDemo",
        deploymentInfo.contracts.ArrayDemo.address
      );
      
      const fixedLength = await arrayDemo.getFixedArrayLength();
      const dynamicLength = await arrayDemo.getDynamicArrayLength();
      
      console.log("   ✅ ArrayDemo 验证通过");
      console.log("      ├─ 合约地址:", arrayDemo.address);
      console.log("      ├─ 固定数组长度:", fixedLength.toString());
      console.log("      └─ 动态数组长度:", dynamicLength.toString());
    } catch (error) {
      console.log("   ❌ ArrayDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 StorageMemoryDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StorageMemoryDemo) {
    console.log("2️⃣ 验证 StorageMemoryDemo 合约...");
    try {
      const storageMemoryDemo = await ethers.getContractAt(
        "StorageMemoryDemo",
        deploymentInfo.contracts.StorageMemoryDemo.address
      );
      
      const storageArray = await storageMemoryDemo.getStorageArray();
      
      console.log("   ✅ StorageMemoryDemo 验证通过");
      console.log("      ├─ 合约地址:", storageMemoryDemo.address);
      console.log("      └─ Storage 数组长度:", storageArray.length.toString());
    } catch (error) {
      console.log("   ❌ StorageMemoryDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 MappingDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.MappingDemo) {
    console.log("3️⃣ 验证 MappingDemo 合约...");
    try {
      const mappingDemo = await ethers.getContractAt(
        "MappingDemo",
        deploymentInfo.contracts.MappingDemo.address
      );
      
      const addressCount = await mappingDemo.getAddressCount();
      const memberCount = await mappingDemo.getMemberCount();
      
      console.log("   ✅ MappingDemo 验证通过");
      console.log("      ├─ 合约地址:", mappingDemo.address);
      console.log("      ├─ 地址数量:", addressCount.toString());
      console.log("      └─ 成员数量:", memberCount.toString());
    } catch (error) {
      console.log("   ❌ MappingDemo 验证失败:", error.message);
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

