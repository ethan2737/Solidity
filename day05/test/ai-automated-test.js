/**
 * @title AI 自动化测试脚本 - Day 5
 * @notice 测试枚举和自定义值类型
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
  enumAnalysis: {},
  valueTypeAnalysis: {}
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
  console.log("🤖 开始 Day 5 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let enumDemo, customValueType, stateMachine;
  let owner, reviewer, addr1;

  try {
    [owner, reviewer, addr1] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const EnumDemo = await ethers.getContractFactory("EnumDemo");
      enumDemo = await EnumDemo.deploy();
      await enumDemo.waitForDeployment();

      const CustomValueType = await ethers.getContractFactory("CustomValueType");
      customValueType = await CustomValueType.deploy();
      await customValueType.waitForDeployment();

      const StateMachine = await ethers.getContractFactory("StateMachine");
      stateMachine = await StateMachine.deploy(reviewer.address);
      await stateMachine.waitForDeployment();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试枚举类型
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试枚举类型...");
    
    try {
      const initialState = await enumDemo.getCurrentState();
      const stateValues = await enumDemo.getAllStateValues();
      
      const isCorrect = initialState === 0n && // Created
                        stateValues.created === 0n &&
                        stateValues.locked === 1n &&
                        stateValues.inactive === 2n;
      
      recordTest("枚举定义", isCorrect, null, {
        initialState: initialState.toString(),
        stateValues: {
          created: stateValues.created.toString(),
          locked: stateValues.locked.toString(),
          inactive: stateValues.inactive.toString()
        }
      });
      
      testResults.enumAnalysis = {
        initialState: initialState.toString(),
        stateValues: {
          created: stateValues.created.toString(),
          locked: stateValues.locked.toString(),
          inactive: stateValues.inactive.toString()
        }
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 枚举定义正确`);
    } catch (error) {
      recordTest("枚举定义", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试状态转换
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 测试状态转换...");
    
    try {
      await enumDemo.lock();
      const lockedState = await enumDemo.getCurrentState();
      const isCorrect = lockedState === 1n; // Locked
      
      recordTest("状态转换", isCorrect, null, {
        from: "Created",
        to: "Locked",
        value: lockedState.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 状态转换成功`);
    } catch (error) {
      recordTest("状态转换", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试订单状态
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 测试订单状态...");
    
    try {
      await enumDemo.createOrder(1);
      await enumDemo.confirmOrder(1);
      const orderStatus = await enumDemo.getOrderStatus(1);
      
      const isCorrect = orderStatus === 1n; // Confirmed
      
      recordTest("订单状态管理", isCorrect, null, {
        orderId: "1",
        status: orderStatus.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 订单状态管理成功`);
    } catch (error) {
      recordTest("订单状态管理", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试自定义值类型
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔢 测试自定义值类型...");

    try {
      // 调用写入函数创建用户ID
      await customValueType.createUserId(addr1.address);
      // 查询当前用户ID
      const userId = await customValueType.getCurrentUserId();
      const userAddress = await customValueType.getUserAddress(userId);

      const isCorrect = userAddress === addr1.address;
      
      recordTest("自定义值类型", isCorrect, null, {
        userId: userId.toString(),
        userAddress
      });
      
      testResults.valueTypeAnalysis = {
        userId: userId.toString(),
        userAddress
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 自定义值类型成功`);
    } catch (error) {
      recordTest("自定义值类型", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试状态机
    // ═══════════════════════════════════════════════════════════
    console.log("\n🖥️  测试状态机...");
    
    try {
      const initialState = await stateMachine.getCurrentState();
      const canTransition = await stateMachine.canTransitionTo(1); // Review
      
      const isCorrect = initialState === 0n && // Draft
                        canTransition === true;
      
      recordTest("状态机", isCorrect, null, {
        initialState: initialState.toString(),
        canTransitionToReview: canTransition
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 状态机测试成功`);
    } catch (error) {
      recordTest("状态机", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试状态转换流程
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 测试状态转换流程...");
    
    try {
      await stateMachine.submitForReview();
      await stateMachine.connect(reviewer).approve();
      await stateMachine.activate();
      
      const finalState = await stateMachine.getCurrentState();
      const isCorrect = finalState === 3n; // Active
      
      recordTest("状态转换流程", isCorrect, null, {
        finalState: finalState.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 状态转换流程成功`);
    } catch (error) {
      recordTest("状态转换流程", false, error);
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

  if (Object.keys(testResults.enumAnalysis).length > 0) {
    console.log("\n📝 枚举分析:");
    console.log(JSON.stringify(testResults.enumAnalysis, null, 2));
  }

  if (Object.keys(testResults.valueTypeAnalysis).length > 0) {
    console.log("\n🔢 值类型分析:");
    console.log(JSON.stringify(testResults.valueTypeAnalysis, null, 2));
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

