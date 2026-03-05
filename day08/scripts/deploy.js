const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 8 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);
  
  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
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
  // 步骤 2: 部署 StructMappingDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 StructMappingDemo...");
  try {
    const StructMappingDemo = await ethers.getContractFactory("StructMappingDemo");
    const structMappingDemo = await StructMappingDemo.deploy();
    await structMappingDemo.waitForDeployment();
    
    console.log("✅ StructMappingDemo 部署成功!");
    console.log("   └─ 合约地址:", structMappingDemo.target);
    
    deploymentInfo.contracts.StructMappingDemo = {
      address: structMappingDemo.target
    };
  } catch (error) {
    console.log("❌ StructMappingDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 StructOperations
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 StructOperations...");
  try {
    const StructOperations = await ethers.getContractFactory("StructOperations");
    const structOperations = await StructOperations.deploy();
    await structOperations.waitForDeployment();
    
    console.log("✅ StructOperations 部署成功!");
    console.log("   └─ 合约地址:", structOperations.target);
    
    deploymentInfo.contracts.StructOperations = {
      address: structOperations.target
    };
  } catch (error) {
    console.log("❌ StructOperations 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 测试结构体和映射操作（如题目要求）
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StructMappingDemo) {
    console.log("📦 步骤 4: 测试结构体和映射操作...");
    try {
      const structMappingDemo = await ethers.getContractAt(
        "StructMappingDemo",
        deploymentInfo.contracts.StructMappingDemo.address
      );
      
      // 创建用户（如题目要求）
      console.log("   创建用户（如题目要求）...");
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.createUser(addr2.address, ethers.parseEther("200"));
      
      const userCount = await structMappingDemo.getUserCount();
      console.log("   ✅ 用户数量:", userCount.toString());
      
      // 获取用户信息
      const user1 = await structMappingDemo.getUser(addr1.address);
      console.log("   ✅ 用户1余额:", ethers.formatEther(user1.balance), "ETH");
      
      // 更新用户余额
      await structMappingDemo.updateUserBalance(addr1.address, ethers.parseEther("150"));
      const newBalance = await structMappingDemo.getUserBalance(addr1.address);
      console.log("   ✅ 更新后余额:", ethers.formatEther(newBalance), "ETH");
      
      // 测试订单创建
      const orderId = await structMappingDemo.createOrder.staticCall(addr1.address, addr2.address, ethers.parseEther("50"));
      await structMappingDemo.createOrder(addr1.address, addr2.address, ethers.parseEther("50"));
      console.log("   ✅ 订单ID:", orderId.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试结构体操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StructOperations) {
    console.log("📦 步骤 5: 测试结构体操作...");
    try {
      const structOperations = await ethers.getContractAt(
        "StructOperations",
        deploymentInfo.contracts.StructOperations.address
      );
      
      // 创建并存储 Person
      await structOperations.addPersonToArray("Alice", 25, addr1.address);
      await structOperations.addPersonToArray("Bob", 30, addr2.address);
      
      const personCount = await structOperations.getPersonCount();
      console.log("   ✅ Person 数量:", personCount.toString());
      
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
  if (deploymentInfo.contracts.StructMappingDemo) {
    console.log("   • StructMappingDemo:", deploymentInfo.contracts.StructMappingDemo.address);
  }
  if (deploymentInfo.contracts.StructOperations) {
    console.log("   • StructOperations:", deploymentInfo.contracts.StructOperations.address);
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

