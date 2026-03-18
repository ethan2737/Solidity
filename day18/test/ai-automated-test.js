/**
 * @title AI 自动化测试脚本 - 闪电贷
 * @notice 这个脚本用于 AI 代理自动运行测试并生成报告
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// 测试结果收集器
const testResults = {
  timestamp: new Date().toISOString(),
  network: process.env.HARDHAT_NETWORK || "hardhat",
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

function recordTest(name, passed, error = null) {
  testResults.tests.push({
    name,
    passed,
    error: error ? error.message : null,
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

async function runAutomatedTests() {
  console.log("🤖 开始 AI 自动化测试 - 闪电贷...\n");
  console.log("=".repeat(60));

  let flashLoanPool;
  let flashLoanReceiver;
  let token;
  let owner;
  let addr1;

  const TOKEN_SUPPLY = ethers.parseEther("1000000");
  const FLASH_LOAN_AMOUNT = ethers.parseEther("10000");
  const POOL_DEPOSIT = ethers.parseEther("50000");

  try {
    [owner, addr1] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 测试 1: 部署 MockERC20
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 测试 1: 部署 MockERC20");
    try {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      token = await MockERC20.deploy("Test Token", "TEST", TOKEN_SUPPLY);
      await token.waitForDeployment();
      
      const tokenAddress = await token.getAddress();
      const isValid = tokenAddress !== ethers.ZeroAddress;
      recordTest("部署 MockERC20", isValid);
      console.log(`   ${isValid ? '✅' : '❌'} 代币地址: ${tokenAddress}`);
    } catch (error) {
      recordTest("部署 MockERC20", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 2: 部署 SimpleFlashLoan
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 测试 2: 部署 SimpleFlashLoan");
    try {
      const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
      flashLoanPool = await SimpleFlashLoan.deploy();
      await flashLoanPool.waitForDeployment();
      
      const poolAddress = await flashLoanPool.getAddress();
      const isValid = poolAddress !== ethers.ZeroAddress;
      recordTest("部署 SimpleFlashLoan", isValid);
      console.log(`   ${isValid ? '✅' : '❌'} 池子地址: ${poolAddress}`);
      
      // 验证手续费率
      const feeBps = await flashLoanPool.FLASH_LOAN_FEE_BPS();
      console.log(`   手续费率: ${feeBps.toString()} 基点 (0.09%)`);
    } catch (error) {
      recordTest("部署 SimpleFlashLoan", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 3: 部署 FlashLoanReceiver
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 测试 3: 部署 FlashLoanReceiver");
    try {
      const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver");
      flashLoanReceiver = await FlashLoanReceiver.deploy(await flashLoanPool.getAddress());
      await flashLoanReceiver.waitForDeployment();
      
      const receiverAddress = await flashLoanReceiver.getAddress();
      const isValid = receiverAddress !== ethers.ZeroAddress;
      recordTest("部署 FlashLoanReceiver", isValid);
      console.log(`   ${isValid ? '✅' : '❌'} 接收者地址: ${receiverAddress}`);
    } catch (error) {
      recordTest("部署 FlashLoanReceiver", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 4: 向池子存入资金
    // ═══════════════════════════════════════════════════════════
    console.log("\n💰 测试 4: 向池子存入资金");
    try {
      await token.transfer(await flashLoanPool.getAddress(), POOL_DEPOSIT);
      
      const balance = await flashLoanPool.getBalance(await token.getAddress());
      const isCorrect = balance === POOL_DEPOSIT;
      recordTest("向池子存入资金", isCorrect);
      console.log(`   ${isCorrect ? '✅' : '❌'} 池子余额: ${ethers.formatEther(balance)} TEST`);
    } catch (error) {
      recordTest("向池子存入资金", false, error);
      console.log(`   ❌ 存入失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 5: 查询池子余额
    // ═══════════════════════════════════════════════════════════
    console.log("\n📊 测试 5: 查询池子余额");
    try {
      const balance = await flashLoanPool.getBalance(await token.getAddress());
      const isValid = balance > 0n;
      recordTest("查询池子余额", isValid);
      console.log(`   ${isValid ? '✅' : '❌'} 余额: ${ethers.formatEther(balance)} TEST`);
    } catch (error) {
      recordTest("查询池子余额", false, error);
      console.log(`   ❌ 查询失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 6: 执行闪电贷（需要接收者有足够资金归还）
    // ═══════════════════════════════════════════════════════════
    console.log("\n⚡ 测试 6: 执行闪电贷");
    try {
      // 计算需要归还的金额（本金 + 手续费）
      const fee = (FLASH_LOAN_AMOUNT * 9n) / 10000n;
      const repayAmount = FLASH_LOAN_AMOUNT + fee;
      
      // 给接收者足够的代币来归还
      await token.transfer(await flashLoanReceiver.getAddress(), repayAmount);
      
      // 执行闪电贷
      const tx = await flashLoanReceiver.executeFlashLoan(
        await token.getAddress(),
        FLASH_LOAN_AMOUNT,
        "0x"
      );
      
      const receipt = await tx.wait();
      const eventEmitted = receipt.logs && receipt.logs.length > 0;
      
      recordTest("执行闪电贷", eventEmitted);
      console.log(`   ${eventEmitted ? '✅' : '❌'} 闪电贷执行成功`);
      console.log(`   Gas 使用量: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      recordTest("执行闪电贷", false, error);
      console.log(`   ❌ 执行失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 7: 验证资金不足的情况
    // ═══════════════════════════════════════════════════════════
    console.log("\n🚫 测试 7: 验证资金不足的情况");
    try {
      const largeAmount = ethers.parseEther("100000"); // 超过池子余额
      
      await expect(
        flashLoanReceiver.executeFlashLoan(
          await token.getAddress(),
          largeAmount,
          "0x"
        )
      ).to.be.reverted;
      
      recordTest("验证资金不足", true);
      console.log(`   ✅ 正确拒绝超额借贷`);
    } catch (error) {
      recordTest("验证资金不足", false, error);
      console.log(`   ❌ 测试失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 8: 手续费计算
    // ═══════════════════════════════════════════════════════════
    console.log("\n🧮 测试 8: 手续费计算");
    try {
      const feeBps = await flashLoanPool.FLASH_LOAN_FEE_BPS();
      const expectedFee = (FLASH_LOAN_AMOUNT * BigInt(feeBps)) / 10000n;
      const isCorrect = expectedFee === (FLASH_LOAN_AMOUNT * 9n) / 10000n;
      
      recordTest("手续费计算", isCorrect);
      console.log(`   ${isCorrect ? '✅' : '❌'} 手续费: ${ethers.formatEther(expectedFee)} TEST`);
      console.log(`   费率: ${feeBps.toString()} 基点`);
    } catch (error) {
      recordTest("手续费计算", false, error);
      console.log(`   ❌ 计算失败: ${error.message}`);
    }

  } catch (error) {
    console.log(`\n❌ 测试执行出错: ${error.message}`);
    testResults.summary.errors.push({
      test: "测试执行",
      error: error.message,
      stack: error.stack
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 生成测试报告
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 测试摘要:");
  console.log(`   总测试数: ${testResults.summary.total}`);
  console.log(`   ✅ 通过: ${testResults.summary.passed}`);
  console.log(`   ❌ 失败: ${testResults.summary.failed}`);
  if (testResults.summary.total > 0) {
    console.log(`   通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  }

  // 保存测试结果到文件
  const reportPath = path.join(__dirname, "..", "test-results.json");
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 测试结果已保存到: ${reportPath}`);

  const allPassed = testResults.summary.failed === 0;
  console.log(`\n${allPassed ? '✅' : '❌'} 测试${allPassed ? '全部通过' : '有失败'}`);
  
  return allPassed;
}

if (require.main === module) {
  runAutomatedTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("测试执行失败:", error);
      process.exit(1);
    });
}

module.exports = { runAutomatedTests };

