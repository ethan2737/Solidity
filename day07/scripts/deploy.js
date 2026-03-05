const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 7 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  
  // 获取账户余额
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(balance), "ETH\n");

  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {}
  };

  // ═══════════════════════════════════════════════════════════
  // 步骤 1: 编译合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 1: 编译合约...");
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 2: 部署 MultiDimensionalArray
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 MultiDimensionalArray...");
  try {
    const MultiDimensionalArray = await ethers.getContractFactory("MultiDimensionalArray");
    const multiDimensionalArray = await MultiDimensionalArray.deploy();
    await multiDimensionalArray.waitForDeployment();
    
    console.log("✅ MultiDimensionalArray 部署成功!");
    console.log("   └─ 合约地址:", multiDimensionalArray.target);
    
    deploymentInfo.contracts.MultiDimensionalArray = {
      address: multiDimensionalArray.target
    };
  } catch (error) {
    console.log("❌ MultiDimensionalArray 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 BytesStringDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 BytesStringDemo...");
  try {
    const BytesStringDemo = await ethers.getContractFactory("BytesStringDemo");
    const bytesStringDemo = await BytesStringDemo.deploy();
    await bytesStringDemo.waitForDeployment();
    
    console.log("✅ BytesStringDemo 部署成功!");
    console.log("   └─ 合约地址:", bytesStringDemo.target);
    
    deploymentInfo.contracts.BytesStringDemo = {
      address: bytesStringDemo.target
    };
  } catch (error) {
    console.log("❌ BytesStringDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 SliceDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 SliceDemo...");
  try {
    const SliceDemo = await ethers.getContractFactory("SliceDemo");
    const sliceDemo = await SliceDemo.deploy();
    await sliceDemo.waitForDeployment();
    
    console.log("✅ SliceDemo 部署成功!");
    console.log("   └─ 合约地址:", sliceDemo.target);
    
    deploymentInfo.contracts.SliceDemo = {
      address: sliceDemo.target
    };
  } catch (error) {
    console.log("❌ SliceDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试多维数组操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.MultiDimensionalArray) {
    console.log("📦 步骤 5: 测试多维数组操作...");
    try {
      const multiDimensionalArray = await ethers.getContractAt(
        "MultiDimensionalArray",
        deploymentInfo.contracts.MultiDimensionalArray.address
      );
      
      // 测试添加行
      await multiDimensionalArray.addRow([1, 2, 3]);
      await multiDimensionalArray.addRow([4, 5, 6]);
      
      const rowCount = await multiDimensionalArray.getDynamic2DRowCount();
      console.log("   ✅ 二维数组行数:", rowCount.toString());
      
      // 测试固定二维数组
      await multiDimensionalArray.setFixed2DElement(0, 0, 100);
      const fixedValue = await multiDimensionalArray.getFixed2DElement(0, 0);
      console.log("   ✅ 固定二维数组元素:", fixedValue.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 6: 测试 bytes 和 string 操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.BytesStringDemo) {
    console.log("📦 步骤 6: 测试 bytes 和 string 操作...");
    try {
      const bytesStringDemo = await ethers.getContractAt(
        "BytesStringDemo",
        deploymentInfo.contracts.BytesStringDemo.address
      );
      
      // 测试 bytes
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f"); // "Hello" in hex
      const bytesLength = await bytesStringDemo.getDynamicBytesLength();
      console.log("   ✅ Bytes 长度:", bytesLength.toString());
      
      // 测试 string
      await bytesStringDemo.setString("Hello, Solidity!");
      const stringLength = await bytesStringDemo.getStringLength();
      console.log("   ✅ String 长度:", stringLength.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 7: 测试切片操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.SliceDemo) {
    console.log("📦 步骤 7: 测试切片操作...");
    try {
      const sliceDemo = await ethers.getContractAt(
        "SliceDemo",
        deploymentInfo.contracts.SliceDemo.address
      );
      
      const bytesLength = await sliceDemo.getDataBytesLength();
      const stringLength = await sliceDemo.getDataStringLength();
      
      console.log("   ✅ Bytes 数据长度:", bytesLength.toString());
      console.log("   ✅ String 数据长度:", stringLength.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 保存部署信息
  // ═══════════════════════════════════════════════════════════
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
  console.log("   • 部署者:", deployer.address);
  if (deploymentInfo.contracts.MultiDimensionalArray) {
    console.log("   • MultiDimensionalArray:", deploymentInfo.contracts.MultiDimensionalArray.address);
  }
  if (deploymentInfo.contracts.BytesStringDemo) {
    console.log("   • BytesStringDemo:", deploymentInfo.contracts.BytesStringDemo.address);
  }
  if (deploymentInfo.contracts.SliceDemo) {
    console.log("   • SliceDemo:", deploymentInfo.contracts.SliceDemo.address);
  }
  console.log("");
  console.log("🎯 下一步:");
  console.log("   1. 运行测试: npx hardhat test");
  console.log("   2. 验证部署: npx hardhat run scripts/verify.js --network", hre.network.name);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });

