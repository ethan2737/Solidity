/**
 * @title AI 自动化测试脚本 - Day 10
 * @notice 测试函数修改器（modifier）
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
  modifierAnalysis: {}
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

async function runAutomatedTests() {
  console.log("🤖 开始 Day 10 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let modifierDemo, inheritedContract, modifierAdvanced;
  let owner, addr1;

  try {
    [owner, addr1] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const ModifierDemo = await ethers.getContractFactory("ModifierDemo");
      modifierDemo = await ModifierDemo.deploy();

      const InheritedContract = await ethers.getContractFactory("InheritedContract");
      inheritedContract = await InheritedContract.deploy();

      const ModifierAdvanced = await ethers.getContractFactory("ModifierAdvanced");
      modifierAdvanced = await ModifierAdvanced.deploy();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 onlyOwner modifier（如题目要求）
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试 onlyOwner modifier（如题目要求）...");
    
    try {
      // 测试 owner 调用（如题目要求）
      await modifierDemo.setValue(100);
      const value = await modifierDemo.getValue();
      
      // 测试非 owner 调用（应该失败）
      let nonOwnerFailed = false;
      try {
        await modifierDemo.connect(addr1).setValue(200);
      } catch (e) {
        nonOwnerFailed = true;
      }
      
      const isCorrect = value === 100n && nonOwnerFailed;
      
      recordTest("onlyOwner modifier（如题目要求）", isCorrect, null, {
        value: value.toString(),
        nonOwnerRejected: nonOwnerFailed
      });
      
      testResults.modifierAnalysis = {
        onlyOwner: "success",
        nonOwnerRejected: nonOwnerFailed
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} onlyOwner modifier 测试成功`);
    } catch (error) {
      recordTest("onlyOwner modifier（如题目要求）", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试带参数的 modifier
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔧 测试带参数的 modifier...");
    
    try {
      await modifierDemo.setValueWithValidation(500);
      const value = await modifierDemo.getValue();
      
      const isCorrect = value === 500n;
      
      recordTest("带参数的 modifier", isCorrect, null, {
        value: value.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 带参数的 modifier 测试成功`);
    } catch (error) {
      recordTest("带参数的 modifier", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试多个 modifier 组合
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 测试多个 modifier 组合...");
    
    try {
      await modifierDemo.setValueWithMultipleModifiers(300);
      const value = await modifierDemo.getValue();
      
      const isCorrect = value === 300n;
      
      recordTest("多个 modifier 组合", isCorrect, null, {
        value: value.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 多个 modifier 组合测试成功`);
    } catch (error) {
      recordTest("多个 modifier 组合", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 modifier 继承
    // ═══════════════════════════════════════════════════════════
    console.log("\n📚 测试 modifier 继承...");
    
    try {
      await inheritedContract.setValue(100);
      const value = await inheritedContract.value();
      
      const isCorrect = value === 100n;
      
      recordTest("modifier 继承", isCorrect, null, {
        value: value.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} modifier 继承测试成功`);
    } catch (error) {
      recordTest("modifier 继承", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试高级 modifier
    // ═══════════════════════════════════════════════════════════
    console.log("\n⚡ 测试高级 modifier...");
    
    try {
      await modifierAdvanced.setValueWithCooldown(100);
      const callCount = await modifierAdvanced.getCallCount(owner.address);
      
      const isCorrect = callCount === 1n;
      
      recordTest("高级 modifier", isCorrect, null, {
        callCount: callCount.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 高级 modifier 测试成功`);
    } catch (error) {
      recordTest("高级 modifier", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
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
  // 生成报告
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 测试摘要:");
  console.log(`   总测试数: ${testResults.summary.total}`);
  console.log(`   ✅ 通过: ${testResults.summary.passed}`);
  console.log(`   ❌ 失败: ${testResults.summary.failed}`);
  console.log(`   通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

  if (Object.keys(testResults.modifierAnalysis).length > 0) {
    console.log("\n📝 Modifier 分析:");
    console.log(JSON.stringify(testResults.modifierAnalysis, null, 2));
  }

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

