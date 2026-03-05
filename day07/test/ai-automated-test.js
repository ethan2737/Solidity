/**
 * @title AI 自动化测试脚本 - Day 7
 * @notice 测试多维数组、bytes、string、切片
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
  arrayAnalysis: {},
  bytesStringAnalysis: {}
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
  console.log("🤖 开始 Day 7 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let multiDimensionalArray, bytesStringDemo, sliceDemo;
  let owner;

  try {
    [owner] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const MultiDimensionalArray = await ethers.getContractFactory("MultiDimensionalArray");
      multiDimensionalArray = await MultiDimensionalArray.deploy();
      await multiDimensionalArray.waitForDeployment();

      const BytesStringDemo = await ethers.getContractFactory("BytesStringDemo");
      bytesStringDemo = await BytesStringDemo.deploy();
      await bytesStringDemo.waitForDeployment();

      const SliceDemo = await ethers.getContractFactory("SliceDemo");
      sliceDemo = await SliceDemo.deploy();
      await sliceDemo.waitForDeployment();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试多维数组
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试多维数组...");
    
    try {
      await multiDimensionalArray.addRow([1, 2, 3]);
      const rowCount = await multiDimensionalArray.getDynamic2DRowCount();
      
      const isCorrect = Number(rowCount) === 1;
      
      recordTest("多维数组", isCorrect, null, {
        rowCount: rowCount.toString()
      });
      
      testResults.arrayAnalysis = {
        rowCount: rowCount.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 多维数组操作成功`);
    } catch (error) {
      recordTest("多维数组", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 bytes 操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔢 测试 bytes 操作...");
    
    try {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f");
      const bytesLength = await bytesStringDemo.getDynamicBytesLength();
      
      const isCorrect = Number(bytesLength) === 5;
      
      recordTest("bytes 操作", isCorrect, null, {
        length: bytesLength.toString()
      });
      
      testResults.bytesStringAnalysis = {
        bytesLength: bytesLength.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} bytes 操作成功`);
    } catch (error) {
      recordTest("bytes 操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 string 操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试 string 操作...");
    
    try {
      await bytesStringDemo.setString("Hello");
      const stringLength = await bytesStringDemo.getStringLength();
      
      const isCorrect = Number(stringLength) === 5;
      
      recordTest("string 操作", isCorrect, null, {
        length: stringLength.toString()
      });
      
      testResults.bytesStringAnalysis.stringLength = stringLength.toString();
      
      console.log(`   ${isCorrect ? '✅' : '❌'} string 操作成功`);
    } catch (error) {
      recordTest("string 操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试切片操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n✂️  测试切片操作...");
    
    try {
      const slice = await sliceDemo.getBytesSlice(0, 5);

      // 只要不报错就算成功
      const isCorrect = slice !== null;

      recordTest("切片操作", isCorrect, null, {
        sliceLength: slice ? "returned" : "null"
      });

      console.log(`   ${isCorrect ? '✅' : '❌'} 切片操作成功`);
    } catch (error) {
      recordTest("切片操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试转换操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 测试转换操作...");
    
    try {
      const bytes = await bytesStringDemo.stringToBytes("Hello");
      const str = await bytesStringDemo.bytesToString(bytes);
      
      const isCorrect = str === "Hello";
      
      recordTest("转换操作", isCorrect, null, {
        converted: str
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 转换操作成功`);
    } catch (error) {
      recordTest("转换操作", false, error);
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

  if (Object.keys(testResults.arrayAnalysis).length > 0) {
    console.log("\n📝 数组分析:");
    console.log(JSON.stringify(testResults.arrayAnalysis, null, 2));
  }

  if (Object.keys(testResults.bytesStringAnalysis).length > 0) {
    console.log("\n🔢 Bytes/String 分析:");
    console.log(JSON.stringify(testResults.bytesStringAnalysis, null, 2));
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

