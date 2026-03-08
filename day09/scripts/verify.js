const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 10 合约部署...\n");

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
  console.log("║           验证 Day 10 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 ModifierDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ModifierDemo) {
    console.log("1️⃣ 验证 ModifierDemo 合约...");
    try {
      const modifierDemo = await ethers.getContractAt(
        "ModifierDemo",
        deploymentInfo.contracts.ModifierDemo.address
      );
      
      const value = await modifierDemo.getValue();
      const owner = await modifierDemo.owner();
      const paused = await modifierDemo.paused();
      
      console.log("   ✅ ModifierDemo 验证通过");
      console.log("      ├─ 合约地址:", modifierDemo.target);
      console.log("      ├─ 值:", value.toString());
      console.log("      ├─ Owner:", owner);
      console.log("      └─ 是否暂停:", paused);
    } catch (error) {
      console.log("   ❌ ModifierDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 InheritedContract
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.InheritedContract) {
    console.log("2️⃣ 验证 InheritedContract 合约...");
    try {
      const inheritedContract = await ethers.getContractAt(
        "InheritedContract",
        deploymentInfo.contracts.InheritedContract.address
      );
      
      const value = await inheritedContract.value();
      const owner = await inheritedContract.owner();
      
      console.log("   ✅ InheritedContract 验证通过");
      console.log("      ├─ 合约地址:", inheritedContract.target);
      console.log("      ├─ 值:", value.toString());
      console.log("      └─ Owner:", owner);
    } catch (error) {
      console.log("   ❌ InheritedContract 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 ModifierAdvanced
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ModifierAdvanced) {
    console.log("3️⃣ 验证 ModifierAdvanced 合约...");
    try {
      const modifierAdvanced = await ethers.getContractAt(
        "ModifierAdvanced",
        deploymentInfo.contracts.ModifierAdvanced.address
      );
      
      const value = await modifierAdvanced.value();
      const owner = await modifierAdvanced.owner();
      
      console.log("   ✅ ModifierAdvanced 验证通过");
      console.log("      ├─ 合约地址:", modifierAdvanced.target);
      console.log("      ├─ 值:", value.toString());
      console.log("      └─ Owner:", owner);
    } catch (error) {
      console.log("   ❌ ModifierAdvanced 验证失败:", error.message);
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

