const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 7 合约部署...\n");

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
  console.log("║           验证 Day 7 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 MultiDimensionalArray
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.MultiDimensionalArray) {
    console.log("1️⃣ 验证 MultiDimensionalArray 合约...");
    try {
      const multiDimensionalArray = await ethers.getContractAt(
        "MultiDimensionalArray",
        deploymentInfo.contracts.MultiDimensionalArray.address
      );
      
      const rowCount = await multiDimensionalArray.getDynamic2DRowCount();
      
      console.log("   ✅ MultiDimensionalArray 验证通过");
      console.log("      ├─ 合约地址:", multiDimensionalArray.address);
      console.log("      └─ 二维数组行数:", rowCount.toString());
    } catch (error) {
      console.log("   ❌ MultiDimensionalArray 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 BytesStringDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.BytesStringDemo) {
    console.log("2️⃣ 验证 BytesStringDemo 合约...");
    try {
      const bytesStringDemo = await ethers.getContractAt(
        "BytesStringDemo",
        deploymentInfo.contracts.BytesStringDemo.address
      );
      
      const bytesLength = await bytesStringDemo.getDynamicBytesLength();
      const stringLength = await bytesStringDemo.getStringLength();
      
      console.log("   ✅ BytesStringDemo 验证通过");
      console.log("      ├─ 合约地址:", bytesStringDemo.address);
      console.log("      ├─ Bytes 长度:", bytesLength.toString());
      console.log("      └─ String 长度:", stringLength.toString());
    } catch (error) {
      console.log("   ❌ BytesStringDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 SliceDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.SliceDemo) {
    console.log("3️⃣ 验证 SliceDemo 合约...");
    try {
      const sliceDemo = await ethers.getContractAt(
        "SliceDemo",
        deploymentInfo.contracts.SliceDemo.address
      );
      
      const bytesLength = await sliceDemo.getDataBytesLength();
      const stringLength = await sliceDemo.getDataStringLength();
      
      console.log("   ✅ SliceDemo 验证通过");
      console.log("      ├─ 合约地址:", sliceDemo.address);
      console.log("      ├─ Bytes 数据长度:", bytesLength.toString());
      console.log("      └─ String 数据长度:", stringLength.toString());
    } catch (error) {
      console.log("   ❌ SliceDemo 验证失败:", error.message);
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

