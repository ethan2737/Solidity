const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 开始部署 Day 17 Staking/Mining 合约...\n");

  // 获取部署者账户
  const [deployer, addr1, addr2] = await ethers.getSigners();
  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);

  // 获取账户余额
  const provider = ethers.provider;
  const balance = await provider.getBalance(deployer.address);
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
  // 步骤 2: 部署 MockERC20 代币（质押代币）
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 2: 部署 MockERC20 质押代币...");
  let stakingToken;
  let stakingTokenAddress;
  let rewardTokenAddress;
  let stakingMiningAddress;
  try {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    stakingToken = await MockERC20.deploy(
      "Staking Token",
      "STK",
      18,
      ethers.parseEther("1000000") // 1,000,000 tokens
    );
    await stakingToken.waitForDeployment();
    stakingTokenAddress = await stakingToken.getAddress();

    console.log("   ✅ StakingToken 部署成功!");
    console.log("      └─ 合约地址:", stakingTokenAddress);

    deploymentInfo.contracts.StakingToken = {
      address: stakingTokenAddress
    };
  } catch (error) {
    console.log("   ❌ StakingToken 部署失败:", error.message);
    return;
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 3: 部署 MockERC20 代币（奖励代币）
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 3: 部署 MockERC20 奖励代币...");
  let rewardToken;
  try {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    rewardToken = await MockERC20.deploy(
      "Reward Token",
      "RWD",
      18,
      ethers.parseEther("1000000") // 1,000,000 tokens
    );
    await rewardToken.waitForDeployment();
    rewardTokenAddress = await rewardToken.getAddress();

    console.log("   ✅ RewardToken 部署成功!");
    console.log("      └─ 合约地址:", rewardTokenAddress);

    deploymentInfo.contracts.RewardToken = {
      address: rewardTokenAddress
    };
  } catch (error) {
    console.log("   ❌ RewardToken 部署失败:", error.message);
    return;
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 4: 部署 StakingMining 合约
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 4: 部署 StakingMining 合约...");
  let stakingMining;
  try {
    const StakingMining = await ethers.getContractFactory("StakingMining");
    // 奖励速率：每秒 1 token (1e18 wei per second)
    const rewardRate = ethers.parseEther("1");
    stakingMining = await StakingMining.deploy(
      stakingTokenAddress,
      rewardTokenAddress,
      rewardRate
    );
    await stakingMining.waitForDeployment();
    stakingMiningAddress = await stakingMining.getAddress();

    console.log("   ✅ StakingMining 部署成功!");
    console.log("      └─ 合约地址:", stakingMiningAddress);
    console.log("      └─ 奖励速率:", ethers.formatEther(rewardRate), "tokens/second");

    deploymentInfo.contracts.StakingMining = {
      address: stakingMiningAddress,
      rewardRate: rewardRate.toString()
    };
  } catch (error) {
    console.log("   ❌ StakingMining 部署失败:", error.message);
    return;
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 5: 初始化合约（向合约转入奖励代币）
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 5: 初始化合约（转入奖励代币）...");
  try {
    const rewardAmount = ethers.parseEther("100000"); // 100,000 tokens
    await rewardToken.transfer(stakingMiningAddress, rewardAmount);
    console.log("   ✅ 已向合约转入", ethers.formatEther(rewardAmount), "奖励代币");
  } catch (error) {
    console.log("   ❌ 初始化失败:", error.message);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 步骤 6: 测试基本功能
  // ═══════════════════════════════════════════════════════════
  console.log("📦 步骤 6: 测试基本功能...");
  try {
    // 给测试地址分配代币
    const testAmount = ethers.parseEther("1000");
    await stakingToken.transfer(addr1.address, testAmount);
    await stakingToken.transfer(addr2.address, testAmount);
    console.log("   ✅ 已向测试地址分配代币");

    // 测试地址授权
    const stakingTokenWithAddr1 = stakingToken.connect(addr1);
    await stakingTokenWithAddr1.approve(stakingMiningAddress, testAmount);
    console.log("   ✅ 测试地址1已授权");

    // 测试质押
    const stakingMiningWithAddr1 = stakingMining.connect(addr1);
    const stakeAmount = ethers.parseEther("100");
    await stakingMiningWithAddr1.stake(stakeAmount);
    console.log("   ✅ 测试质押成功:", ethers.formatEther(stakeAmount), "tokens");
  } catch (error) {
    console.log("   ❌ 测试失败:", error.message);
  }
  console.log("");

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
  if (deploymentInfo.contracts.StakingToken) {
    console.log("   • StakingToken:", deploymentInfo.contracts.StakingToken.address);
  }
  if (deploymentInfo.contracts.RewardToken) {
    console.log("   • RewardToken:", deploymentInfo.contracts.RewardToken.address);
  }
  if (deploymentInfo.contracts.StakingMining) {
    console.log("   • StakingMining:", deploymentInfo.contracts.StakingMining.address);
  }
  console.log("");
  console.log("🎯 下一步:");
  console.log("   1. 运行测试: npm test");
  console.log("   2. 启动节点: npm run node");
  console.log("   3. 部署合约: npm run deploy");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });

