const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 10 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);
  
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
  // 步骤 2: 部署 ModifierDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 ModifierDemo...");
  try {
    const ModifierDemo = await ethers.getContractFactory("ModifierDemo");
    const modifierDemo = await ModifierDemo.deploy();
    await modifierDemo.waitForDeployment();
    
    console.log("✅ ModifierDemo 部署成功!");
    console.log("   └─ 合约地址:", modifierDemo.target);

    deploymentInfo.contracts.ModifierDemo = {
      address: modifierDemo.target
    };
  } catch (error) {
    console.log("❌ ModifierDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 ModifierInheritance
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 ModifierInheritance...");
  try {
    const InheritedContract = await ethers.getContractFactory("InheritedContract");
    const inheritedContract = await InheritedContract.deploy();
    await inheritedContract.waitForDeployment();
    
    console.log("✅ InheritedContract 部署成功!");
    console.log("   └─ 合约地址:", inheritedContract.target);

    deploymentInfo.contracts.InheritedContract = {
      address: inheritedContract.target
    };
  } catch (error) {
    console.log("❌ InheritedContract 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 ModifierAdvanced
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 ModifierAdvanced...");
  try {
    const ModifierAdvanced = await ethers.getContractFactory("ModifierAdvanced");
    const modifierAdvanced = await ModifierAdvanced.deploy();
    await modifierAdvanced.waitForDeployment();
    
    console.log("✅ ModifierAdvanced 部署成功!");
    console.log("   └─ 合约地址:", modifierAdvanced.target);

    deploymentInfo.contracts.ModifierAdvanced = {
      address: modifierAdvanced.target
    };
  } catch (error) {
    console.log("❌ ModifierAdvanced 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试 modifier（如题目要求）
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ModifierDemo) {
    console.log("📦 步骤 5: 测试 modifier（如题目要求）...");
    try {
      const modifierDemo = await ethers.getContractAt(
        "ModifierDemo",
        deploymentInfo.contracts.ModifierDemo.address
      );
      
      // 测试 onlyOwner modifier（如题目要求）
      console.log("   测试 onlyOwner modifier（如题目要求）...");
      await modifierDemo.setValue(100);
      const value = await modifierDemo.getValue();
      console.log("   ✅ OnlyOwner modifier 测试成功，值:", value.toString());
      
      // 测试非 owner 调用（应该失败）
      try {
        await modifierDemo.connect(addr1).setValue(200);
        console.log("   ⚠️  非 owner 调用成功（不应该）");
      } catch (error) {
        console.log("   ✅ 非 owner 调用被拒绝（预期）");
      }
      
      // 测试带参数的 modifier
      await modifierDemo.setValueWithValidation(500);
      const validatedValue = await modifierDemo.getValue();
      console.log("   ✅ 带参数 modifier 测试成功，值:", validatedValue.toString());
      
      // 测试多个 modifier 组合
      await modifierDemo.setValueWithMultipleModifiers(300);
      const multiModifierValue = await modifierDemo.getValue();
      console.log("   ✅ 多个 modifier 组合测试成功，值:", multiModifierValue.toString());
      
    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 步骤 6: 测试 modifier 继承
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.InheritedContract) {
    console.log("📦 步骤 6: 测试 modifier 继承...");
    try {
      const inheritedContract = await ethers.getContractAt(
        "InheritedContract",
        deploymentInfo.contracts.InheritedContract.address
      );
      
      // 测试继承的 modifier
      await inheritedContract.setValue(100);
      const value = await inheritedContract.value();
      console.log("   ✅ 继承的 modifier 测试成功，值:", value.toString());
      
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
  if (deploymentInfo.contracts.ModifierDemo) {
    console.log("   • ModifierDemo:", deploymentInfo.contracts.ModifierDemo.address);
  }
  if (deploymentInfo.contracts.InheritedContract) {
    console.log("   • InheritedContract:", deploymentInfo.contracts.InheritedContract.address);
  }
  if (deploymentInfo.contracts.ModifierAdvanced) {
    console.log("   • ModifierAdvanced:", deploymentInfo.contracts.ModifierAdvanced.address);
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

