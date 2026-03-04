const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 6 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);
  
  // 获取账户余额 (ethers v6 API)
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
  // 步骤 2: 部署 ArrayDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 ArrayDemo...");
  try {
    const ArrayDemo = await ethers.getContractFactory("ArrayDemo");
    const arrayDemo = await ArrayDemo.deploy();
    await arrayDemo.waitForDeployment();
    const address = await arrayDemo.getAddress();

    console.log("✅ ArrayDemo 部署成功!");
    console.log("   ├─ 合约地址:", address);
    console.log("   ├─ 固定数组长度:", (await arrayDemo.getFixedArrayLength()).toString());
    console.log("   └─ 动态数组长度:", (await arrayDemo.getDynamicArrayLength()).toString());

    deploymentInfo.contracts.ArrayDemo = {
      address: address
    };
  } catch (error) {
    console.log("❌ ArrayDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 StorageMemoryDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 StorageMemoryDemo...");
  try {
    const StorageMemoryDemo = await ethers.getContractFactory("StorageMemoryDemo");
    const storageMemoryDemo = await StorageMemoryDemo.deploy();
    await storageMemoryDemo.waitForDeployment();
    const address = await storageMemoryDemo.getAddress();

    console.log("✅ StorageMemoryDemo 部署成功!");
    console.log("   └─ 合约地址:", address);

    deploymentInfo.contracts.StorageMemoryDemo = {
      address: address
    };
  } catch (error) {
    console.log("❌ StorageMemoryDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 MappingDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 MappingDemo...");
  try {
    const MappingDemo = await ethers.getContractFactory("MappingDemo");
    const mappingDemo = await MappingDemo.deploy();
    await mappingDemo.waitForDeployment();
    const address = await mappingDemo.getAddress();

    console.log("✅ MappingDemo 部署成功!");
    console.log("   └─ 合约地址:", address);

    deploymentInfo.contracts.MappingDemo = {
      address: address
    };
  } catch (error) {
    console.log("❌ MappingDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试数组操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ArrayDemo) {
    console.log("📦 步骤 5: 测试数组操作...");
    try {
      const arrayDemo = await ethers.getContractAt(
        "ArrayDemo",
        deploymentInfo.contracts.ArrayDemo.address
      );
      
      // 测试 push
      console.log("   测试 push 操作...");
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      await arrayDemo.pushToDynamicArray(300);
      
      const length = await arrayDemo.getDynamicArrayLength();
      console.log("   ✅ 动态数组长度:", length.toString());
      
      // 测试地址数组
      await arrayDemo.pushAddress(addr1.address);
      await arrayDemo.pushAddress(addr2.address);
      const addressLength = await arrayDemo.getAllAddresses();
      console.log("   ✅ 地址数组长度:", addressLength.length.toString());
      
      // 测试字符串数组
      await arrayDemo.pushString("Hello");
      await arrayDemo.pushString("World");
      const stringLength = await arrayDemo.getAllStrings();
      console.log("   ✅ 字符串数组长度:", stringLength.length.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 6: 测试 Storage vs Memory
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.StorageMemoryDemo) {
    console.log("📦 步骤 6: 测试 Storage vs Memory...");
    try {
      const storageMemoryDemo = await ethers.getContractAt(
        "StorageMemoryDemo",
        deploymentInfo.contracts.StorageMemoryDemo.address
      );
      
      // 测试 storage 操作
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.addToStorageArray(200);
      
      const storageArray = await storageMemoryDemo.getStorageArray();
      console.log("   ✅ Storage 数组长度:", storageArray.length.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 7: 测试映射操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.MappingDemo) {
    console.log("📦 步骤 7: 测试映射操作...");
    try {
      const mappingDemo = await ethers.getContractAt(
        "MappingDemo",
        deploymentInfo.contracts.MappingDemo.address
      );
      
      // 测试设置余额
      await mappingDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await mappingDemo.setBalance(addr2.address, ethers.parseEther("200"));
      
      const balance1 = await mappingDemo.balances(addr1.address);
      const balance2 = await mappingDemo.balances(addr2.address);
      
      console.log("   ✅ 地址1余额:", ethers.formatEther(balance1), "ETH");
      console.log("   ✅ 地址2余额:", ethers.formatEther(balance2), "ETH");
      
      // 测试成员管理
      await mappingDemo.addMember(addr1.address);
      const isMember = await mappingDemo.isMember(addr1.address);
      console.log("   ✅ 地址1是成员:", isMember);
      
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
  if (deploymentInfo.contracts.ArrayDemo) {
    console.log("   • ArrayDemo:", deploymentInfo.contracts.ArrayDemo.address);
  }
  if (deploymentInfo.contracts.StorageMemoryDemo) {
    console.log("   • StorageMemoryDemo:", deploymentInfo.contracts.StorageMemoryDemo.address);
  }
  if (deploymentInfo.contracts.MappingDemo) {
    console.log("   • MappingDemo:", deploymentInfo.contracts.MappingDemo.address);
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

