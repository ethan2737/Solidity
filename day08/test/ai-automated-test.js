/**
 * @title AI 自动化测试脚本 - Day 8
 * @notice 测试结构体和映射
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
  structAnalysis: {},
  mappingAnalysis: {}
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
  console.log("🤖 开始 Day 8 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let structMappingDemo, structOperations;
  let owner, addr1, addr2;

  try {
    [owner, addr1, addr2] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const StructMappingDemo = await ethers.getContractFactory("StructMappingDemo");
      structMappingDemo = await StructMappingDemo.deploy();
      await structMappingDemo.waitForDeployment();
      
      const StructOperations = await ethers.getContractFactory("StructOperations");
      structOperations = await StructOperations.deploy();
      await structOperations.waitForDeployment();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试结构体和映射（如题目要求）
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试结构体和映射（如题目要求）...");
    
    try {
      // 创建用户（如题目要求）
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      const user = await structMappingDemo.getUser(addr1.address);
      
      const isCorrect = user.addr === addr1.address &&
                        user.balance === ethers.parseEther("100") &&
                        user.isActive === true;
      
      recordTest("结构体和映射（如题目要求）", isCorrect, null, {
        userAddress: user.addr,
        balance: user.balance.toString(),
        isActive: user.isActive
      });
      
      testResults.structAnalysis = {
        userAddress: user.addr,
        balance: ethers.formatEther(user.balance),
        isActive: user.isActive
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 结构体和映射操作成功`);
    } catch (error) {
      recordTest("结构体和映射（如题目要求）", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试用户余额操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n💰 测试用户余额操作...");
    
    try {
      await structMappingDemo.increaseUserBalance(addr1.address, ethers.parseEther("50"));
      const balance = await structMappingDemo.getUserBalance(addr1.address);
      
      const isCorrect = balance === ethers.parseEther("150");
      
      recordTest("用户余额操作", isCorrect, null, {
        balance: ethers.formatEther(balance)
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 用户余额操作成功`);
    } catch (error) {
      recordTest("用户余额操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试映射查询
    // ═══════════════════════════════════════════════════════════
    console.log("\n🗺️  测试映射查询...");
    
    try {
      const userCount = await structMappingDemo.getUserCount();
      const totalBalance = await structMappingDemo.getTotalBalance();
      
      const isCorrect = userCount > 0n && totalBalance > 0n;
      
      recordTest("映射查询", isCorrect, null, {
        userCount: userCount.toString(),
        totalBalance: ethers.formatEther(totalBalance)
      });
      
      testResults.mappingAnalysis = {
        userCount: userCount.toString(),
        totalBalance: ethers.formatEther(totalBalance)
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 映射查询成功`);
    } catch (error) {
      recordTest("映射查询", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试结构体操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔧 测试结构体操作...");
    
    try {
      await structOperations.createAndStorePerson("Alice", 25, addr1.address);
      const person = await structOperations.getPersonFromMapping(addr1.address);
      
      const isCorrect = person.name === "Alice" && person.age === 25n;
      
      recordTest("结构体操作", isCorrect, null, {
        name: person.name,
        age: person.age.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 结构体操作成功`);
    } catch (error) {
      recordTest("结构体操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试嵌套映射
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 测试嵌套映射...");
    
    try {
      const productId = await structMappingDemo.createProduct.staticCall("Product", ethers.parseEther("10"), 100);
      await structMappingDemo.createProduct("Product", ethers.parseEther("10"), 100);
      await structMappingDemo.setUserProduct(addr1.address, productId, 5);
      const quantity = await structMappingDemo.getUserProduct(addr1.address, productId);

      const isCorrect = quantity === 5n;
      
      recordTest("嵌套映射", isCorrect, null, {
        quantity: quantity.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 嵌套映射成功`);
    } catch (error) {
      recordTest("嵌套映射", false, error);
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

  if (Object.keys(testResults.structAnalysis).length > 0) {
    console.log("\n📝 结构体分析:");
    console.log(JSON.stringify(testResults.structAnalysis, null, 2));
  }

  if (Object.keys(testResults.mappingAnalysis).length > 0) {
    console.log("\n🗺️  映射分析:");
    console.log(JSON.stringify(testResults.mappingAnalysis, null, 2));
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

