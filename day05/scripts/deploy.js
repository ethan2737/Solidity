const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 5 合约...\n");

  // 获取部署者账户
  const [deployer, reviewer] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 Reviewer 地址:", reviewer.address);
  
  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(balance), "ETH\n");

  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    reviewer: reviewer.address,
    contracts: {}
  };

  // ═══════════════════════════════════════════════════════════
  // 步骤 1: 编译合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 1: 编译合约...");
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 2: 部署 EnumDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 EnumDemo...");
  try {
    const EnumDemo = await ethers.getContractFactory("EnumDemo");
    const enumDemo = await EnumDemo.deploy();
    await enumDemo.waitForDeployment();
    
    console.log("✅ EnumDemo 部署成功!");
    console.log("   ├─ 合约地址:", enumDemo.target);
    
    // 测试枚举值
    const currentState = await enumDemo.getCurrentState();
    const stateValues = await enumDemo.getAllStateValues();
    
    console.log("   ├─ 当前状态:", currentState);
    console.log("   └─ 状态值:", {
      Created: stateValues.created.toString(),
      Locked: stateValues.locked.toString(),
      Inactive: stateValues.inactive.toString()
    });
    
    deploymentInfo.contracts.EnumDemo = {
      address: enumDemo.target,
      initialState: currentState.toString()
    };
  } catch (error) {
    console.log("❌ EnumDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 CustomValueType
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 CustomValueType...");
  try {
    const CustomValueType = await ethers.getContractFactory("CustomValueType");
    const customValueType = await CustomValueType.deploy();
    await customValueType.waitForDeployment();
    
    console.log("✅ CustomValueType 部署成功!");
    console.log("   └─ 合约地址:", customValueType.target);
    
    // 测试自定义值类型
    const currentUserId = await customValueType.getCurrentUserId();
    console.log("   └─ 当前用户ID:", currentUserId.toString());
    
    deploymentInfo.contracts.CustomValueType = {
      address: customValueType.target
    };
  } catch (error) {
    console.log("❌ CustomValueType 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 StateMachine
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 StateMachine...");
  try {
    const StateMachine = await ethers.getContractFactory("StateMachine");
    const stateMachine = await StateMachine.deploy(reviewer.address);
    await stateMachine.waitForDeployment();
    
    console.log("✅ StateMachine 部署成功!");
    console.log("   ├─ 合约地址:", stateMachine.target);
    console.log("   ├─ Owner:", await stateMachine.owner());
    console.log("   ├─ Reviewer:", await stateMachine.reviewer());
    
    const currentState = await stateMachine.getCurrentState();
    console.log("   └─ 当前状态:", currentState.toString());
    
    deploymentInfo.contracts.StateMachine = {
      address: stateMachine.target,
      owner: await stateMachine.owner(),
      reviewer: await stateMachine.reviewer(),
      initialState: currentState.toString()
    };
  } catch (error) {
    console.log("❌ StateMachine 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试枚举操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.EnumDemo) {
    console.log("📦 步骤 5: 测试枚举操作...");
    try {
      const enumDemo = await ethers.getContractAt(
        "EnumDemo",
        deploymentInfo.contracts.EnumDemo.address
      );
      
      // 测试状态转换
      console.log("   测试状态转换...");
      await enumDemo.lock();
      const lockedState = await enumDemo.getCurrentState();
      console.log("   ✅ 状态已锁定:", lockedState.toString());
      
      // 测试订单状态
      console.log("   测试订单状态...");
      await enumDemo.createOrder(1);
      await enumDemo.confirmOrder(1);
      const orderStatus = await enumDemo.getOrderStatus(1);
      console.log("   ✅ 订单状态:", orderStatus.toString());
      
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
  if (deploymentInfo.contracts.EnumDemo) {
    console.log("   • EnumDemo:", deploymentInfo.contracts.EnumDemo.address);
  }
  if (deploymentInfo.contracts.CustomValueType) {
    console.log("   • CustomValueType:", deploymentInfo.contracts.CustomValueType.address);
  }
  if (deploymentInfo.contracts.StateMachine) {
    console.log("   • StateMachine:", deploymentInfo.contracts.StateMachine.address);
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

