/**
 * @title AI 自动化测试脚本 - Day 17
 * @notice 测试 Staking/Mining 合约功能
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const testResults = {
  timestamp: new Date().toISOString(),
  network: process.env.HARDHAT_NETWORK || "hardhat",
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  },
  stakingAnalysis: {
    stake: {},
    unstake: {},
    reward: {},
    security: {}
  }
};

function recordTest(name, passed, error = null, details = null) {
  testResults.tests.push({
    name,
    passed,
    error: error ? error.message : null,
    details,
    timestamp: new Date().toISOString()
  });
  
  testResults.summary.total++;
  if (passed) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
    if (error) {
      testResults.summary.errors.push({
        test: name,
        error: error.message
      });
    }
  }
}

async function main() {
  console.log("🤖 自动化测试 - Day 17 Staking/Mining 合约\n");
  console.log("=" .repeat(60));
  
  let stakingToken, rewardToken, stakingMining;
  let stakingTokenAddr, rewardTokenAddr, stakingMiningAddr;
  let owner, addr1, addr2;
  const REWARD_RATE = ethers.parseEther("1");

  try {
    // 获取签名者
    [owner, addr1, addr2] = await ethers.getSigners();
    console.log("📍 测试账户:");
    console.log("   • Owner:", owner.address);
    console.log("   • Addr1:", addr1.address);
    console.log("   • Addr2:", addr2.address);
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("📦 部署合约...");
    
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    stakingToken = await MockERC20.deploy(
      "Staking Token",
      "STK",
      18,
      ethers.parseEther("1000000")
    );
    await stakingToken.waitForDeployment();
    stakingTokenAddr = await stakingToken.getAddress();
    console.log("   ✅ StakingToken:", stakingTokenAddr);

    rewardToken = await MockERC20.deploy(
      "Reward Token",
      "RWD",
      18,
      ethers.parseEther("1000000")
    );
    await rewardToken.waitForDeployment();
    rewardTokenAddr = await rewardToken.getAddress();
    console.log("   ✅ RewardToken:", rewardTokenAddr);

    const StakingMining = await ethers.getContractFactory("StakingMining");
    stakingMining = await StakingMining.deploy(
      stakingTokenAddr,
      rewardTokenAddr,
      REWARD_RATE
    );
    await stakingMining.waitForDeployment();
    stakingMiningAddr = await stakingMining.getAddress();
    console.log("   ✅ StakingMining:", stakingMiningAddr);
    console.log("");

    // 初始化
    await rewardToken.transfer(stakingMiningAddr, ethers.parseEther("100000"));
    await stakingToken.transfer(addr1.address, ethers.parseEther("10000"));
    await stakingToken.transfer(addr2.address, ethers.parseEther("10000"));
    console.log("   ✅ 合约初始化完成\n");

    // ═══════════════════════════════════════════════════════════
    // 测试 1: Stake功能
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 1: Stake功能");
    try {
      const stakeAmount = ethers.parseEther("1000");
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);
      
      const tx = await stakingMining.connect(addr1).stake(stakeAmount);
      await tx.wait();
      
      const userInfo = await stakingMining.getUserInfo(addr1.address);
      if (userInfo.stakedAmount === stakeAmount) {
        recordTest("Stake功能", true, null, { amount: stakeAmount.toString() });
        console.log("   ✅ Stake功能测试通过");
        testResults.stakingAnalysis.stake = { success: true, amount: stakeAmount.toString() };
      } else {
        throw new Error("Stake金额不匹配");
      }
    } catch (error) {
      recordTest("Stake功能", false, error);
      console.log("   ❌ Stake功能测试失败:", error.message);
    }
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 测试 2: 奖励计算
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 2: 奖励计算");
    try {
      // 等待1小时产生奖励
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      const earned = await stakingMining.earned(addr1.address);
      if (earned > 0n) {
        recordTest("奖励计算", true, null, { earned: earned.toString() });
        console.log("   ✅ 奖励计算测试通过");
        console.log("      └─ 奖励金额:", ethers.formatEther(earned), "tokens");
        testResults.stakingAnalysis.reward = { success: true, earned: earned.toString() };
      } else {
        throw new Error("奖励计算为0");
      }
    } catch (error) {
      recordTest("奖励计算", false, error);
      console.log("   ❌ 奖励计算测试失败:", error.message);
    }
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 测试 3: 领取奖励
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 3: 领取奖励");
    try {
      const rewardBefore = await rewardToken.balanceOf(addr1.address);
      const earned = await stakingMining.earned(addr1.address);
      
      const tx = await stakingMining.connect(addr1).claimReward();
      await tx.wait();
      
      const rewardAfter = await rewardToken.balanceOf(addr1.address);
      if (rewardAfter > rewardBefore) {
        recordTest("领取奖励", true, null, { 
          before: rewardBefore.toString(),
          after: rewardAfter.toString()
        });
        console.log("   ✅ 领取奖励测试通过");
        testResults.stakingAnalysis.reward.claimed = true;
      } else {
        throw new Error("奖励未正确发放");
      }
    } catch (error) {
      recordTest("领取奖励", false, error);
      console.log("   ❌ 领取奖励测试失败:", error.message);
    }
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 测试 4: Unstake功能（质押退出逻辑）
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 4: Unstake功能（质押退出逻辑）");
    try {
      const unstakeAmount = ethers.parseEther("500");
      const balanceBefore = await stakingToken.balanceOf(addr1.address);
      
      const tx = await stakingMining.connect(addr1).unstake(unstakeAmount);
      await tx.wait();
      
      const balanceAfter = await stakingToken.balanceOf(addr1.address);
      const userInfo = await stakingMining.getUserInfo(addr1.address);
      
      if (balanceAfter === balanceBefore + unstakeAmount &&
          userInfo.stakedAmount === ethers.parseEther("500")) {
        recordTest("Unstake功能", true, null, { amount: unstakeAmount.toString() });
        console.log("   ✅ Unstake功能测试通过");
        testResults.stakingAnalysis.unstake = { success: true, amount: unstakeAmount.toString() };
      } else {
        throw new Error("Unstake金额不匹配");
      }
    } catch (error) {
      recordTest("Unstake功能", false, error);
      console.log("   ❌ Unstake功能测试失败:", error.message);
    }
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 测试 5: 停损机制
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 5: 停损机制");
    try {
      // 暂停合约
      await stakingMining.pasue();
      const paused = await stakingMining.paused();
      
      if (paused) {
        // 尝试在暂停状态下stake（应该失败）
        try {
          const stakeAmount = ethers.parseEther("100");
          await stakingToken.connect(addr2).approve(stakingMiningAddr, stakeAmount);
          await stakingMining.connect(addr2).stake(stakeAmount);
          throw new Error("暂停状态下应该无法stake");
        } catch (error) {
          if (error.message.includes("ContractPaused") || error.message.includes("paused")) {
            recordTest("停损机制", true, null, { paused: true });
            console.log("   ✅ 停损机制测试通过");
            testResults.stakingAnalysis.security = { pause: true };
          } else {
            throw error;
          }
        }
      } else {
        throw new Error("合约未正确暂停");
      }
      
      // 恢复合约
      await stakingMining.unpause();
    } catch (error) {
      recordTest("停损机制", false, error);
      console.log("   ❌ 停损机制测试失败:", error.message);
    }
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 测试 6: Reward速率管理
    // ═══════════════════════════════════════════════════════════
    console.log("🧪 测试 6: Reward速率管理");
    try {
      const newRate = ethers.parseEther("2");
      const oldRate = await stakingMining.rewardRate();
      
      await stakingMining.setRewardRate(newRate);
      const updatedRate = await stakingMining.rewardRate();
      
      if (updatedRate === newRate) {
        recordTest("Reward速率管理", true, null, { 
          oldRate: oldRate.toString(),
          newRate: newRate.toString()
        });
        console.log("   ✅ Reward速率管理测试通过");
        testResults.stakingAnalysis.reward.rateUpdated = true;
      } else {
        throw new Error("Reward速率未正确更新");
      }
    } catch (error) {
      recordTest("Reward速率管理", false, error);
      console.log("   ❌ Reward速率管理测试失败:", error.message);
    }
    console.log("");

  } catch (error) {
    console.log("❌ 测试过程中发生错误:", error.message);
    recordTest("测试流程", false, error);
  }

  // ═══════════════════════════════════════════════════════════
  // 生成测试报告
  // ═══════════════════════════════════════════════════════════
  console.log("=" .repeat(60));
  console.log("📊 测试摘要");
  console.log("=" .repeat(60));
  console.log(`   总测试数: ${testResults.summary.total}`);
  console.log(`   ✅ 通过: ${testResults.summary.passed}`);
  console.log(`   ❌ 失败: ${testResults.summary.failed}`);
  console.log(`   通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  console.log("");

  if (testResults.summary.errors.length > 0) {
    console.log("❌ 错误详情:");
    testResults.summary.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.test}: ${err.error}`);
    });
    console.log("");
  }

  // 保存测试结果
  const outputPath = path.join(__dirname, "..", "test-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
  console.log(`💾 测试结果已保存到: ${outputPath}`);
  console.log("");

  // 退出
  if (testResults.summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });

