/**
 * @title AI 自动化测试脚本 - Day 3
 * @notice 测试 Solidity 变量类型、布尔、整型、可见性
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
  typeAnalysis: {
    booleans: {},
    integers: {},
    visibility: {}
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

async function runAutomatedTests() {
  console.log("🤖 开始 Day 3 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let variableTypes, visibilityDemo, typeComparison;
  let owner;

  try {
    [owner] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const VariableTypes = await ethers.getContractFactory("VariableTypes");
      variableTypes = await VariableTypes.deploy(1000);
      await variableTypes.waitForDeployment();
      
      const VisibilityDemo = await ethers.getContractFactory("VisibilityDemo");
      visibilityDemo = await VisibilityDemo.deploy();
      await visibilityDemo.waitForDeployment();
      
      const TypeComparison = await ethers.getContractFactory("TypeComparison");
      typeComparison = await TypeComparison.deploy();
      await typeComparison.waitForDeployment();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试布尔类型
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试布尔类型...");
    
    try {
      const isActive = await variableTypes.isActive();
      const allBooleans = await variableTypes.getAllBooleans();
      
      const isCorrect = isActive === true && 
                        allBooleans._isActive === true &&
                        allBooleans._isLocked === false;
      
      recordTest("布尔类型读取", isCorrect, null, {
        isActive,
        allBooleans: {
          isActive: allBooleans._isActive,
          isLocked: allBooleans._isLocked,
          isPaused: allBooleans._isPaused
        }
      });
      
      testResults.typeAnalysis.booleans = {
        isActive,
        isLocked: allBooleans._isLocked,
        isPaused: allBooleans._isPaused
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 布尔值读取成功`);
    } catch (error) {
      recordTest("布尔类型读取", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    try {
      await variableTypes.setIsActive(false);
      const newIsActive = await variableTypes.isActive();
      const isCorrect = newIsActive === false;
      
      recordTest("布尔类型设置", isCorrect);
      console.log(`   ${isCorrect ? '✅' : '❌'} 布尔值设置成功`);
    } catch (error) {
      recordTest("布尔类型设置", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试无符号整型
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔢 测试无符号整型...");
    
    try {
      const smallNumber = await variableTypes.smallNumber();
      const largeNumber = await variableTypes.largeNumber();
      const allUints = await variableTypes.getAllUints();
      
      const isCorrect = smallNumber == 100 && 
                        largeNumber == 1000000 &&
                        allUints._smallNumber == 100;
      
      recordTest("无符号整型读取", isCorrect, null, {
        smallNumber: smallNumber.toString(),
        largeNumber: largeNumber.toString(),
        defaultUint: allUints._defaultUint.toString()
      });
      
      testResults.typeAnalysis.integers.uint = {
        uint8: smallNumber.toString(),
        uint256: largeNumber.toString(),
        default: allUints._defaultUint.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 无符号整型读取成功`);
    } catch (error) {
      recordTest("无符号整型读取", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    try {
      await variableTypes.setSmallNumber(200);
      const newSmallNumber = await variableTypes.smallNumber();
      const isCorrect = newSmallNumber == 200;
      
      recordTest("无符号整型设置", isCorrect);
      console.log(`   ${isCorrect ? '✅' : '❌'} 无符号整型设置成功`);
    } catch (error) {
      recordTest("无符号整型设置", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试有符号整型
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔢 测试有符号整型...");
    
    try {
      const smallInt = await variableTypes.smallInt();
      const largeInt = await variableTypes.largeInt();
      
      const isCorrect = smallInt == -50 && largeInt == -1000000;
      
      recordTest("有符号整型读取", isCorrect, null, {
        smallInt: smallInt.toString(),
        largeInt: largeInt.toString()
      });
      
      testResults.typeAnalysis.integers.int = {
        int8: smallInt.toString(),
        int256: largeInt.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 有符号整型读取成功`);
    } catch (error) {
      recordTest("有符号整型读取", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试常量
    // ═══════════════════════════════════════════════════════════
    console.log("\n📌 测试常量...");
    
    try {
      const maxValue = await variableTypes.MAX_VALUE();
      const isEnabled = await variableTypes.IS_ENABLED();
      
      const isCorrect = maxValue == 1000000 && isEnabled === true;
      
      recordTest("常量读取", isCorrect, null, {
        MAX_VALUE: maxValue.toString(),
        IS_ENABLED: isEnabled
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 常量读取成功`);
    } catch (error) {
      recordTest("常量读取", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 Immutable
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔒 测试 Immutable...");
    
    try {
      const initialValue = await variableTypes.INITIAL_VALUE();
      const isCorrect = initialValue == 1000;
      
      recordTest("Immutable 读取", isCorrect, null, {
        INITIAL_VALUE: initialValue.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} Immutable 读取成功`);
    } catch (error) {
      recordTest("Immutable 读取", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试可见性
    // ═══════════════════════════════════════════════════════════
    console.log("\n👁️  测试可见性...");
    
    try {
      const publicVar = await visibilityDemo.publicVar();
      const privateVar = await visibilityDemo.getPrivateVar();
      const internalVar = await visibilityDemo.getInternalVar();
      
      const isCorrect = publicVar == 100 && 
                        privateVar == 200 &&
                        internalVar == 300;
      
      recordTest("可见性访问", isCorrect, null, {
        public: publicVar.toString(),
        private: privateVar.toString(),
        internal: internalVar.toString()
      });
      
      testResults.typeAnalysis.visibility = {
        public: publicVar.toString(),
        private: privateVar.toString(),
        internal: internalVar.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 可见性访问成功`);
    } catch (error) {
      recordTest("可见性访问", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    try {
      const publicFunc = await visibilityDemo.publicFunction();
      const externalFunc = await visibilityDemo.externalFunction();
      
      const isCorrect = publicFunc === "This is a public function" &&
                        externalFunc === "This is an external function";
      
      recordTest("可见性函数调用", isCorrect);
      console.log(`   ${isCorrect ? '✅' : '❌'} 可见性函数调用成功`);
    } catch (error) {
      recordTest("可见性函数调用", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试类型范围
    // ═══════════════════════════════════════════════════════════
    console.log("\n📊 测试类型范围...");
    
    try {
      const uint8Max = await typeComparison.uint8Max();
      const uint256Max = await typeComparison.uint256Max();
      
      // 在 ethers v6 中，MaxUint256 是一个 BigInt 值
      const MaxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      const isCorrect = uint8Max == 255 && 
                        BigInt(uint256Max.toString()) == MaxUint256;
      
      recordTest("类型范围", isCorrect, null, {
        uint8Max: uint8Max.toString(),
        uint256Max: uint256Max.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 类型范围验证成功`);
    } catch (error) {
      recordTest("类型范围", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试默认值
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔢 测试默认值...");
    
    try {
      const defaults = await typeComparison.getDefaults();
      
      const isCorrect = defaults._bool === false &&
                        defaults._uint == 0 &&
                        defaults._int == 0;
      
      recordTest("默认值", isCorrect, null, {
        bool: defaults._bool,
        uint: defaults._uint.toString(),
        int: defaults._int.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 默认值验证成功`);
    } catch (error) {
      recordTest("默认值", false, error);
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

  if (Object.keys(testResults.typeAnalysis).length > 0) {
    console.log("\n📋 类型分析:");
    console.log("   布尔类型:", JSON.stringify(testResults.typeAnalysis.booleans, null, 2));
    console.log("   整型:", JSON.stringify(testResults.typeAnalysis.integers, null, 2));
    console.log("   可见性:", JSON.stringify(testResults.typeAnalysis.visibility, null, 2));
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

