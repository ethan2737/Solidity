const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 5 合约部署...\n");

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
  console.log("║           验证 Day 5 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 EnumDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.EnumDemo) {
    console.log("1️⃣ 验证 EnumDemo 合约...");
    try {
      const enumDemo = await ethers.getContractAt(
        "EnumDemo",
        deploymentInfo.contracts.EnumDemo.address
      );
      
      const currentState = await enumDemo.getCurrentState();
      const stateValues = await enumDemo.getAllStateValues();
      
      console.log("   ✅ EnumDemo 验证通过");
      console.log("      ├─ 合约地址:", enumDemo.address);
      console.log("      ├─ 当前状态:", currentState.toString());
      console.log("      └─ 状态值:", {
        Created: stateValues.created.toString(),
        Locked: stateValues.locked.toString(),
        Inactive: stateValues.inactive.toString()
      });
    } catch (error) {
      console.log("   ❌ EnumDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 CustomValueType
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.CustomValueType) {
    console.log("2️⃣ 验证 CustomValueType 合约...");
    try {
      const customValueType = await ethers.getContractAt(
        "CustomValueType",
        deploymentInfo.contracts.CustomValueType.address
      );
      
      const currentUserId = await customValueType.getCurrentUserId();
      const discount = await customValueType.getDiscount();
      
      console.log("   ✅ CustomValueType 验证通过");
      console.log("      ├─ 合约地址:", customValueType.address);
      console.log("      ├─ 当前用户ID:", currentUserId.toString());
      console.log("      └─ 折扣:", discount.toString(), "%");
    } catch (error) {
      console.log("   ❌ CustomValueType 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 StateMachine
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StateMachine) {
    console.log("3️⃣ 验证 StateMachine 合约...");
    try {
      const stateMachine = await ethers.getContractAt(
        "StateMachine",
        deploymentInfo.contracts.StateMachine.address
      );
      
      const currentState = await stateMachine.getCurrentState();
      const owner = await stateMachine.owner();
      const reviewer = await stateMachine.reviewer();
      const transitionCount = await stateMachine.getTransitionCount();
      
      console.log("   ✅ StateMachine 验证通过");
      console.log("      ├─ 合约地址:", stateMachine.address);
      console.log("      ├─ 当前状态:", currentState.toString());
      console.log("      ├─ Owner:", owner);
      console.log("      ├─ Reviewer:", reviewer);
      console.log("      └─ 状态转换次数:", transitionCount.toString());
    } catch (error) {
      console.log("   ❌ StateMachine 验证失败:", error.message);
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

