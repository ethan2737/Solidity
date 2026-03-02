const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 3 合约...\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  
  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  // 兼容 ethers v5 和 v6
  const formatEther = ethers.utils ? ethers.utils.formatEther : ethers.formatEther;
  console.log("💰 部署者余额:", formatEther(balance), "ETH\n");

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
  // 步骤 2: 部署 VariableTypes
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 VariableTypes...");
  try {
    const VariableTypes = await ethers.getContractFactory("VariableTypes");
    const initialValue = 1000;
    
    const variableTypes = await VariableTypes.deploy(initialValue);
    await variableTypes.waitForDeployment();
    const variableTypesAddress = await variableTypes.getAddress();
    
    console.log("✅ VariableTypes 部署成功!");
    console.log("   ├─ 合约地址:", variableTypesAddress);
    console.log("   ├─ 初始值:", initialValue);
    
    // 测试一些值
    const isActive = await variableTypes.isActive();
    const smallNumber = await variableTypes.smallNumber();
    const largeNumber = await variableTypes.largeNumber();
    
    console.log("   ├─ isActive:", isActive);
    console.log("   ├─ smallNumber:", smallNumber.toString());
    console.log("   └─ largeNumber:", largeNumber.toString());
    
    deploymentInfo.contracts.VariableTypes = {
      address: variableTypesAddress,
      initialValue: initialValue
    };
  } catch (error) {
    console.log("❌ VariableTypes 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 VisibilityDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 VisibilityDemo...");
  try {
    const VisibilityDemo = await ethers.getContractFactory("VisibilityDemo");
    const visibilityDemo = await VisibilityDemo.deploy();
    await visibilityDemo.waitForDeployment();
    const visibilityDemoAddress = await visibilityDemo.getAddress();
    
    console.log("✅ VisibilityDemo 部署成功!");
    console.log("   └─ 合约地址:", visibilityDemoAddress);
    
    // 测试可见性
    const publicVar = await visibilityDemo.publicVar();
    const publicFuncResult = await visibilityDemo.publicFunction();
    
    console.log("   ├─ publicVar:", publicVar.toString());
    console.log("   └─ publicFunction:", publicFuncResult);
    
    deploymentInfo.contracts.VisibilityDemo = {
      address: visibilityDemoAddress
    };
  } catch (error) {
    console.log("❌ VisibilityDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 TypeComparison
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 TypeComparison...");
  try {
    const TypeComparison = await ethers.getContractFactory("TypeComparison");
    const typeComparison = await TypeComparison.deploy();
    await typeComparison.waitForDeployment();
    const typeComparisonAddress = await typeComparison.getAddress();
    
    console.log("✅ TypeComparison 部署成功!");
    console.log("   └─ 合约地址:", typeComparisonAddress);
    
    // 测试类型值
    const uint8Max = await typeComparison.uint8Max();
    const uint256Max = await typeComparison.uint256Max();
    
    console.log("   ├─ uint8Max:", uint8Max.toString());
    console.log("   └─ uint256Max:", uint256Max.toString());
    
    deploymentInfo.contracts.TypeComparison = {
      address: typeComparisonAddress
    };
  } catch (error) {
    console.log("❌ TypeComparison 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试变量操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.VariableTypes) {
    console.log("📦 步骤 5: 测试变量操作...");
    try {
      const variableTypes = await ethers.getContractAt(
        "VariableTypes",
        deploymentInfo.contracts.VariableTypes.address
      );
      
      // 测试设置布尔值
      console.log("   测试设置布尔值...");
      const tx1 = await variableTypes.setIsActive(false);
      await tx1.wait();
      const newIsActive = await variableTypes.isActive();
      console.log("   ✅ isActive 更新为:", newIsActive);
      
      // 测试设置数字
      console.log("   测试设置数字...");
      const tx2 = await variableTypes.setSmallNumber(200);
      await tx2.wait();
      const newSmallNumber = await variableTypes.smallNumber();
      console.log("   ✅ smallNumber 更新为:", newSmallNumber.toString());
      
      // 测试获取所有值
      const allBooleans = await variableTypes.getAllBooleans();
      console.log("   ✅ 所有布尔值:", allBooleans);
      
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
  if (deploymentInfo.contracts.VariableTypes) {
    console.log("   • VariableTypes:", deploymentInfo.contracts.VariableTypes.address);
  }
  if (deploymentInfo.contracts.VisibilityDemo) {
    console.log("   • VisibilityDemo:", deploymentInfo.contracts.VisibilityDemo.address);
  }
  if (deploymentInfo.contracts.TypeComparison) {
    console.log("   • TypeComparison:", deploymentInfo.contracts.TypeComparison.address);
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

