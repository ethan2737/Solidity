/**
 * @title AI 自动化测试脚本 - Day 6
 * @notice 测试数组和引用类型
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
  storageMemoryAnalysis: {}
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
  console.log("🤖 开始 Day 6 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let arrayDemo, storageMemoryDemo, mappingDemo;
  let owner, addr1, addr2;

  try {
    [owner, addr1, addr2] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const ArrayDemo = await ethers.getContractFactory("ArrayDemo");
      arrayDemo = await ArrayDemo.deploy();
      await arrayDemo.waitForDeployment();

      const StorageMemoryDemo = await ethers.getContractFactory("StorageMemoryDemo");
      storageMemoryDemo = await StorageMemoryDemo.deploy();
      await storageMemoryDemo.waitForDeployment();

      const MappingDemo = await ethers.getContractFactory("MappingDemo");
      mappingDemo = await MappingDemo.deploy();
      await mappingDemo.waitForDeployment();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试数组操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n📝 测试数组操作...");
    
    try {
      // 测试固定数组
      const fixedLength = await arrayDemo.getFixedArrayLength();
      await arrayDemo.setFixedArrayElement(0, 100);
      const fixedValue = await arrayDemo.getFixedArrayElement(0);
      
      // 测试动态数组
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      const dynamicLength = await arrayDemo.getDynamicArrayLength();
      const dynamicValue = await arrayDemo.getDynamicArrayElement(0);
      
      const isCorrect = fixedLength === 5n &&
                        fixedValue === 100n &&
                        dynamicLength === 2n &&
                        dynamicValue === 100n;
      
      recordTest("数组操作", isCorrect, null, {
        fixedLength: fixedLength.toString(),
        fixedValue: fixedValue.toString(),
        dynamicLength: dynamicLength.toString(),
        dynamicValue: dynamicValue.toString()
      });
      
      testResults.arrayAnalysis = {
        fixedLength: fixedLength.toString(),
        dynamicLength: dynamicLength.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 数组操作成功`);
    } catch (error) {
      recordTest("数组操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 push 操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n➕ 测试 push 操作...");
    
    try {
      await arrayDemo.pushToDynamicArray(300);
      const length = await arrayDemo.getDynamicArrayLength();
      const allElements = await arrayDemo.getAllDynamicArrayElements();
      
      const isCorrect = length === 3n && allElements.length === 3;
      
      recordTest("push 操作", isCorrect, null, {
        length: length.toString(),
        elements: allElements.map(e => e.toString())
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} push 操作成功`);
    } catch (error) {
      recordTest("push 操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试地址数组
    // ═══════════════════════════════════════════════════════════
    console.log("\n📍 测试地址数组...");
    
    try {
      await arrayDemo.pushAddress(addr1.address);
      await arrayDemo.pushAddress(addr2.address);
      const addresses = await arrayDemo.getAllAddresses();
      
      const isCorrect = addresses.length === 2 &&
                        addresses[0] === addr1.address &&
                        addresses[1] === addr2.address;
      
      recordTest("地址数组", isCorrect, null, {
        length: addresses.length.toString(),
        addresses: addresses
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 地址数组操作成功`);
    } catch (error) {
      recordTest("地址数组", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 Storage vs Memory
    // ═══════════════════════════════════════════════════════════
    console.log("\n💾 测试 Storage vs Memory...");
    
    try {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.addToStorageArray(200);
      const storageArray = await storageMemoryDemo.getStorageArray();
      
      const memoryArray = await storageMemoryDemo.createMemoryArray(3);
      
      const isCorrect = storageArray.length === 2 &&
                        memoryArray.length === 3;
      
      recordTest("Storage vs Memory", isCorrect, null, {
        storageLength: storageArray.length.toString(),
        memoryLength: memoryArray.length.toString()
      });
      
      testResults.storageMemoryAnalysis = {
        storageLength: storageArray.length.toString(),
        memoryLength: memoryArray.length.toString()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} Storage vs Memory 测试成功`);
    } catch (error) {
      recordTest("Storage vs Memory", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试映射操作
    // ═══════════════════════════════════════════════════════════
    console.log("\n🗺️  测试映射操作...");
    
    try {
      await mappingDemo.setBalance(addr1.address, ethers.parseEther("100"));
      const balance = await mappingDemo.balances(addr1.address);
      
      const isCorrect = balance === ethers.parseEther("100");
      
      recordTest("映射操作", isCorrect, null, {
        balance: balance.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 映射操作成功`);
    } catch (error) {
      recordTest("映射操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试嵌套映射
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 测试嵌套映射...");
    
    try {
      await mappingDemo.setAllowance(addr1.address, addr2.address, ethers.parseEther("50"));
      const allowance = await mappingDemo.getAllowance(addr1.address, addr2.address);
      
      const isCorrect = allowance === ethers.parseEther("50");
      
      recordTest("嵌套映射", isCorrect, null, {
        allowance: allowance.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 嵌套映射成功`);
    } catch (error) {
      recordTest("嵌套映射", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试数组统计
    // ═══════════════════════════════════════════════════════════
    console.log("\n📊 测试数组统计...");
    
    try {
      const sum = await arrayDemo.sumArray();
      const max = await arrayDemo.findMax();
      const min = await arrayDemo.findMin();
      
      const isCorrect = sum > 0n && max > 0n && min > 0n;
      
      recordTest("数组统计", isCorrect, null, {
        sum: sum.toString(),
        max: max.toString(),
        min: min.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 数组统计成功`);
    } catch (error) {
      recordTest("数组统计", false, error);
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

  if (Object.keys(testResults.storageMemoryAnalysis).length > 0) {
    console.log("\n💾 Storage/Memory 分析:");
    console.log(JSON.stringify(testResults.storageMemoryAnalysis, null, 2));
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

