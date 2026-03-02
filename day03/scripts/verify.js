const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 3 合约部署...\n");

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
  console.log("║           验证 Day 3 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 VariableTypes
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.VariableTypes) {
    console.log("1️⃣ 验证 VariableTypes 合约...");
    try {
      const variableTypes = await ethers.getContractAt(
        "VariableTypes",
        deploymentInfo.contracts.VariableTypes.address
      );
      
      // 验证布尔值
      const isActive = await variableTypes.isActive();
      console.log("   ✅ 布尔值验证:");
      console.log("      ├─ isActive:", isActive);
      
      // 验证整型
      const smallNumber = await variableTypes.smallNumber();
      const largeNumber = await variableTypes.largeNumber();
      console.log("   ✅ 整型验证:");
      console.log("      ├─ smallNumber (uint8):", smallNumber.toString());
      console.log("      └─ largeNumber (uint256):", largeNumber.toString());
      
      // 验证常量
      const maxValue = await variableTypes.MAX_VALUE();
      const isEnabled = await variableTypes.IS_ENABLED();
      console.log("   ✅ 常量验证:");
      console.log("      ├─ MAX_VALUE:", maxValue.toString());
      console.log("      └─ IS_ENABLED:", isEnabled);
      
      // 验证 immutable
      const initialValue = await variableTypes.INITIAL_VALUE();
      console.log("   ✅ Immutable 验证:");
      console.log("      └─ INITIAL_VALUE:", initialValue.toString());
      
      console.log("   ✅ VariableTypes 验证通过");
    } catch (error) {
      console.log("   ❌ VariableTypes 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 VisibilityDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.VisibilityDemo) {
    console.log("2️⃣ 验证 VisibilityDemo 合约...");
    try {
      const visibilityDemo = await ethers.getContractAt(
        "VisibilityDemo",
        deploymentInfo.contracts.VisibilityDemo.address
      );
      
      // 验证 public 变量
      const publicVar = await visibilityDemo.publicVar();
      console.log("   ✅ Public 变量验证:");
      console.log("      └─ publicVar:", publicVar.toString());
      
      // 验证 public 函数
      const publicFuncResult = await visibilityDemo.publicFunction();
      console.log("   ✅ Public 函数验证:");
      console.log("      └─ publicFunction:", publicFuncResult);
      
      // 验证 private 变量（通过 getter）
      const privateVar = await visibilityDemo.getPrivateVar();
      console.log("   ✅ Private 变量验证:");
      console.log("      └─ privateVar:", privateVar.toString());
      
      // 验证 external 函数
      const externalFuncResult = await visibilityDemo.externalFunction();
      console.log("   ✅ External 函数验证:");
      console.log("      └─ externalFunction:", externalFuncResult);
      
      console.log("   ✅ VisibilityDemo 验证通过");
    } catch (error) {
      console.log("   ❌ VisibilityDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 TypeComparison
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.TypeComparison) {
    console.log("3️⃣ 验证 TypeComparison 合约...");
    try {
      const typeComparison = await ethers.getContractAt(
        "TypeComparison",
        deploymentInfo.contracts.TypeComparison.address
      );
      
      // 验证类型最大值
      const uint8Max = await typeComparison.uint8Max();
      const uint256Max = await typeComparison.uint256Max();
      console.log("   ✅ 类型最大值验证:");
      console.log("      ├─ uint8Max:", uint8Max.toString());
      console.log("      └─ uint256Max:", uint256Max.toString());
      
      // 验证默认值
      const defaults = await typeComparison.getDefaults();
      console.log("   ✅ 默认值验证:");
      console.log("      ├─ defaultBool:", defaults._bool);
      console.log("      ├─ defaultUint:", defaults._uint.toString());
      console.log("      └─ defaultInt:", defaults._int.toString());
      
      console.log("   ✅ TypeComparison 验证通过");
    } catch (error) {
      console.log("   ❌ TypeComparison 验证失败:", error.message);
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

