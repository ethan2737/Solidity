const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 24 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);
  
  // 获取账户余额 (ethers v6: 使用 provider.getBalance)
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
  // 步骤 2: 部署测试代币
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署测试代币...");
  let tokenA, tokenB;
  
  try {
    const TestToken = await ethers.getContractFactory("contracts/TestToken.sol:TestToken");

    // 部署代币 A
    tokenA = await TestToken.deploy("Token A", "TKA", 18, 1000000); // 100万代币
    console.log("   ✅ Token A 部署成功!");
    console.log("      └─ 合约地址:", await tokenA.getAddress());

    // 部署代币 B
    tokenB = await TestToken.deploy("Token B", "TKB", 18, 1000000); // 100万代币
    console.log("   ✅ Token B 部署成功!");
    console.log("      └─ 合约地址:", await tokenB.getAddress());

    deploymentInfo.contracts.TestTokenA = {
      address: await tokenA.getAddress()
    };
    deploymentInfo.contracts.TestTokenB = {
      address: await tokenB.getAddress()
    };
  } catch (error) {
    console.log("   ❌ 测试代币部署失败:", error.message);
    return;
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 SimpleAMM
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 SimpleAMM...");
  try {
    const SimpleAMM = await ethers.getContractFactory("SimpleAMM");
    const simpleAMM = await SimpleAMM.deploy(await tokenA.getAddress(), await tokenB.getAddress());

    console.log("   ✅ SimpleAMM 部署成功!");
    console.log("      └─ 合约地址:", await simpleAMM.getAddress());

    deploymentInfo.contracts.SimpleAMM = {
      address: await simpleAMM.getAddress(),
      tokenA: await tokenA.getAddress(),
      tokenB: await tokenB.getAddress()
    };
  } catch (error) {
    console.log("   ❌ SimpleAMM 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 AMMWithLPToken
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 AMMWithLPToken...");
  try {
    const AMMWithLPToken = await ethers.getContractFactory("AMMWithLPToken");
    const ammWithLPToken = await AMMWithLPToken.deploy(await tokenA.getAddress(), await tokenB.getAddress());

    console.log("   ✅ AMMWithLPToken 部署成功!");
    console.log("      └─ 合约地址:", await ammWithLPToken.getAddress());

    deploymentInfo.contracts.AMMWithLPToken = {
      address: await ammWithLPToken.getAddress(),
      tokenA: await tokenA.getAddress(),
      tokenB: await tokenB.getAddress()
    };
  } catch (error) {
    console.log("   ❌ AMMWithLPToken 部署失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 测试 AMM 功能
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.AMMWithLPToken) {
    console.log("📦 步骤 5: 测试 AMM 功能...");
    try {
      const ammWithLPToken = await ethers.getContractAt(
        "AMMWithLPToken",
        deploymentInfo.contracts.AMMWithLPToken.address
      );
      
      // 给用户一些代币用于测试
      const amount = ethers.parseEther("1000");
      await tokenA.transfer(addr1.address, amount);
      await tokenB.transfer(addr1.address, amount);
      await tokenA.transfer(addr2.address, amount);
      await tokenB.transfer(addr2.address, amount);

      console.log("   ✅ 已分配测试代币给用户");

      // 测试添加流动性
      console.log("   测试添加流动性...");
      await tokenA.connect(addr1).approve(ammWithLPToken.target, amount);
      await tokenB.connect(addr1).approve(ammWithLPToken.target, amount);

      const liquidityAmount = ethers.parseEther("100");
      await ammWithLPToken.connect(addr1).addLiquidity(liquidityAmount, liquidityAmount);
      console.log("   ✅ 添加流动性成功");

      // 测试交换
      console.log("   测试代币交换...");
      const swapAmount = ethers.parseEther("10");
      await tokenA.connect(addr2).approve(ammWithLPToken.target, swapAmount);
      await ammWithLPToken.connect(addr2).swap(tokenA.target, swapAmount);
      console.log("   ✅ 代币交换成功");

      // 获取储备量
      const [reserveA, reserveB] = await ammWithLPToken.getReserves();
      const k = await ammWithLPToken.getK();
      console.log("   📊 当前储备量:");
      console.log("      ├─ Reserve A:", ethers.formatEther(reserveA));
      console.log("      ├─ Reserve B:", ethers.formatEther(reserveB));
      console.log("      └─ K (恒定乘积):", ethers.formatEther(k));
      
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
  if (deploymentInfo.contracts.TestTokenA) {
    console.log("   • Token A:", deploymentInfo.contracts.TestTokenA.address);
  }
  if (deploymentInfo.contracts.TestTokenB) {
    console.log("   • Token B:", deploymentInfo.contracts.TestTokenB.address);
  }
  if (deploymentInfo.contracts.SimpleAMM) {
    console.log("   • SimpleAMM:", deploymentInfo.contracts.SimpleAMM.address);
  }
  if (deploymentInfo.contracts.AMMWithLPToken) {
    console.log("   • AMMWithLPToken:", deploymentInfo.contracts.AMMWithLPToken.address);
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

