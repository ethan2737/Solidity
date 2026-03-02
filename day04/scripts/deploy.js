const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 4 合约...\n");

  // 获取部署者账户
  const [deployer, manager] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 Manager 地址:", manager.address);
  
  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 部署者余额:", ethers.formatEther(balance), "ETH\n");

  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    manager: manager.address,
    contracts: {}
  };

  // ═══════════════════════════════════════════════════════════
  // 步骤 1: 编译合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 1: 编译合约...");
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ═══════════════════════════════════════════════════════════
  // 步骤 2: 部署 SimpleToken（用于合约类型演示）
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 SimpleToken...");
  let tokenAddress;
  try {
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const initialSupply = ethers.parseEther("1000000"); // 100万代币
    
    const token = await SimpleToken.deploy(initialSupply);
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    
    console.log("✅ SimpleToken 部署成功!");
    console.log("   ├─ 合约地址:", tokenAddress);
    console.log("   ├─ 名称:", await token.name());
    console.log("   ├─ 符号:", await token.symbol());
    console.log("   └─ 总供应量:", ethers.formatEther(await token.totalSupply()), "ST");
    
    deploymentInfo.contracts.SimpleToken = {
      address: tokenAddress,
      name: await token.name(),
      symbol: await token.symbol(),
      totalSupply: (await token.totalSupply()).toString()
    };
  } catch (error) {
    console.log("❌ SimpleToken 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 AddressDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 AddressDemo...");
  try {
    const AddressDemo = await ethers.getContractFactory("AddressDemo");
    const addressDemo = await AddressDemo.deploy(manager.address);
    await addressDemo.waitForDeployment();
    const addressDemoAddress = await addressDemo.getAddress();
    
    console.log("✅ AddressDemo 部署成功!");
    console.log("   ├─ 合约地址:", addressDemoAddress);
    console.log("   ├─ Owner:", await addressDemo.owner());
    console.log("   ├─ Manager:", await addressDemo.manager());
    console.log("   └─ Treasury:", await addressDemo.treasury());
    
    deploymentInfo.contracts.AddressDemo = {
      address: addressDemoAddress,
      owner: await addressDemo.owner(),
      manager: await addressDemo.manager(),
      treasury: await addressDemo.treasury()
    };
  } catch (error) {
    console.log("❌ AddressDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 ContractTypeDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 ContractTypeDemo...");
  try {
    const ContractTypeDemo = await ethers.getContractFactory("ContractTypeDemo");
    const contractTypeDemo = await ContractTypeDemo.deploy();
    await contractTypeDemo.waitForDeployment();
    const contractTypeDemoAddress = await contractTypeDemo.getAddress();
    
    console.log("✅ ContractTypeDemo 部署成功!");
    console.log("   └─ 合约地址:", contractTypeDemoAddress);
    
    // 设置 token 引用
    if (tokenAddress) {
      console.log("   设置 token 引用...");
      await contractTypeDemo.setToken(tokenAddress);
      console.log("   ✅ Token 引用已设置");
      
      const tokenName = await contractTypeDemo.getTokenName();
      console.log("   └─ Token 名称:", tokenName);
    }
    
    deploymentInfo.contracts.ContractTypeDemo = {
      address: contractTypeDemoAddress,
      tokenAddress: tokenAddress || null
    };
  } catch (error) {
    console.log("❌ ContractTypeDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 部署 GlobalVariablesDemo
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 5: 部署 GlobalVariablesDemo...");
  try {
    const GlobalVariablesDemo = await ethers.getContractFactory("GlobalVariablesDemo");
    const globalVariablesDemo = await GlobalVariablesDemo.deploy();
    await globalVariablesDemo.waitForDeployment();
    const globalVariablesDemoAddress = await globalVariablesDemo.getAddress();
    
    console.log("✅ GlobalVariablesDemo 部署成功!");
    console.log("   └─ 合约地址:", globalVariablesDemoAddress);
    
    // 测试全局变量
    const sender = await globalVariablesDemo.getSender();
    const blockNumber = await globalVariablesDemo.getBlockNumber();
    const timestamp = await globalVariablesDemo.getTimestamp();
    
    console.log("   ├─ 当前发送者:", sender);
    console.log("   ├─ 区块号:", blockNumber.toString());
    console.log("   └─ 时间戳:", timestamp.toString());
    
    deploymentInfo.contracts.GlobalVariablesDemo = {
      address: globalVariablesDemoAddress
    };
  } catch (error) {
    console.log("❌ GlobalVariablesDemo 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 6: 测试地址操作
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.AddressDemo) {
    console.log("📦 步骤 6: 测试地址操作...");
    try {
      const addressDemo = await ethers.getContractAt(
        "AddressDemo",
        deploymentInfo.contracts.AddressDemo.address
      );
      
      // 测试添加成员
      console.log("   添加成员...");
      const [deployer, manager, addr1] = await ethers.getSigners();
      await addressDemo.addMember(addr1.address);
      const memberCount = await addressDemo.getMemberCount();
      console.log("   ✅ 成员数量:", memberCount.toString());
      
      // 测试存款
      console.log("   测试存款...");
      const depositAmount = ethers.parseEther("0.1");
      const tx = await addressDemo.connect(addr1).deposit({ value: depositAmount });
      await tx.wait();
      
      const balance = await addressDemo.getBalance(addr1.address);
      console.log("   ✅ 账户余额:", ethers.formatEther(balance), "ETH");
      
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
  if (deploymentInfo.contracts.SimpleToken) {
    console.log("   • SimpleToken:", deploymentInfo.contracts.SimpleToken.address);
  }
  if (deploymentInfo.contracts.AddressDemo) {
    console.log("   • AddressDemo:", deploymentInfo.contracts.AddressDemo.address);
  }
  if (deploymentInfo.contracts.ContractTypeDemo) {
    console.log("   • ContractTypeDemo:", deploymentInfo.contracts.ContractTypeDemo.address);
  }
  if (deploymentInfo.contracts.GlobalVariablesDemo) {
    console.log("   • GlobalVariablesDemo:", deploymentInfo.contracts.GlobalVariablesDemo.address);
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

