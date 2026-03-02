/**
 * @title AI 自动化测试脚本 - Day 4
 * @notice 测试地址类型和合约类型
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
  addressAnalysis: {},
  contractAnalysis: {}
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
  console.log("🤖 开始 Day 4 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let addressDemo, contractTypeDemo, globalVariablesDemo, token;
  let owner, manager, addr1;

  try {
    [owner, manager, addr1] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      // 部署 SimpleToken
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      token = await SimpleToken.deploy(ethers.utils.parseEther("1000000"));
      await token.deployed();
      
      // 部署 AddressDemo
      const AddressDemo = await ethers.getContractFactory("AddressDemo");
      addressDemo = await AddressDemo.deploy(manager.address);
      await addressDemo.deployed();
      
      // 部署 ContractTypeDemo
      const ContractTypeDemo = await ethers.getContractFactory("ContractTypeDemo");
      contractTypeDemo = await ContractTypeDemo.deploy();
      await contractTypeDemo.deployed();
      
      // 部署 GlobalVariablesDemo
      const GlobalVariablesDemo = await ethers.getContractFactory("GlobalVariablesDemo");
      globalVariablesDemo = await GlobalVariablesDemo.deploy();
      await globalVariablesDemo.deployed();
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试地址类型
    // ═══════════════════════════════════════════════════════════
    console.log("\n📍 测试地址类型...");
    
    try {
      const contractAddress = await addressDemo.getContractAddress();
      const sender = await addressDemo.connect(addr1).getSender();
      const ownerAddr = await addressDemo.owner();
      
      const isCorrect = contractAddress === addressDemo.address &&
                        sender === addr1.address &&
                        ownerAddr === owner.address;
      
      recordTest("地址类型操作", isCorrect, null, {
        contractAddress,
        sender,
        owner: ownerAddr
      });
      
      testResults.addressAnalysis = {
        contractAddress,
        owner: ownerAddr,
        manager: await addressDemo.manager()
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 地址类型操作成功`);
    } catch (error) {
      recordTest("地址类型操作", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 msg.sender
    // ═══════════════════════════════════════════════════════════
    console.log("\n👤 测试 msg.sender...");
    
    try {
      const sender1 = await addressDemo.connect(owner).getSender();
      const sender2 = await addressDemo.connect(addr1).getSender();
      
      const isCorrect = sender1 === owner.address && sender2 === addr1.address;
      
      recordTest("msg.sender", isCorrect, null, {
        ownerSender: sender1,
        addr1Sender: sender2
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} msg.sender 测试成功`);
    } catch (error) {
      recordTest("msg.sender", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 msg.value
    // ═══════════════════════════════════════════════════════════
    console.log("\n💰 测试 msg.value...");
    
    try {
      const amount = ethers.utils.parseEther("0.1");
      await addressDemo.connect(addr1).deposit({ value: amount });
      
      const balance = await addressDemo.getBalance(addr1.address);
      const isCorrect = balance.eq(amount);
      
      recordTest("msg.value", isCorrect, null, {
        deposited: amount.toString(),
        balance: balance.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} msg.value 测试成功`);
    } catch (error) {
      recordTest("msg.value", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试合约类型
    // ═══════════════════════════════════════════════════════════
    console.log("\n📄 测试合约类型...");
    
    try {
      await contractTypeDemo.setToken(token.address);
      const isTokenSet = await contractTypeDemo.isTokenSet();
      const tokenAddress = await contractTypeDemo.getTokenAddress();
      const tokenName = await contractTypeDemo.getTokenName();
      
      const isCorrect = isTokenSet === true &&
                        tokenAddress === token.address &&
                        tokenName === "Simple Token";
      
      recordTest("合约类型引用", isCorrect, null, {
        tokenAddress,
        tokenName,
        isTokenSet
      });
      
      testResults.contractAnalysis = {
        tokenAddress,
        tokenName,
        isSet: isTokenSet
      };
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 合约类型引用成功`);
    } catch (error) {
      recordTest("合约类型引用", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试调用其他合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔗 测试调用其他合约...");
    
    try {
      const tokenSymbol = await contractTypeDemo.getTokenSymbol();
      const tokenTotalSupply = await contractTypeDemo.getTokenTotalSupply();
      const ownerBalance = await contractTypeDemo.getTokenBalance(owner.address);
      
      const isCorrect = tokenSymbol === "ST" &&
                        tokenTotalSupply.eq(ethers.utils.parseEther("1000000")) &&
                        ownerBalance.eq(ethers.utils.parseEther("1000000"));
      
      recordTest("调用其他合约", isCorrect, null, {
        symbol: tokenSymbol,
        totalSupply: tokenTotalSupply.toString(),
        ownerBalance: ownerBalance.toString()
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 调用其他合约成功`);
    } catch (error) {
      recordTest("调用其他合约", false, error);
      console.log(`   ❌ 失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试全局变量
    // ═══════════════════════════════════════════════════════════
    console.log("\n🌐 测试全局变量...");
    
    try {
      const blockNumber = await globalVariablesDemo.getBlockNumber();
      const timestamp = await globalVariablesDemo.getTimestamp();
      const origin = await globalVariablesDemo.getOrigin();
      
      const isCorrect = blockNumber.gt(0) &&
                        timestamp.gt(0) &&
                        origin === owner.address;
      
      recordTest("全局变量", isCorrect, null, {
        blockNumber: blockNumber.toString(),
        timestamp: timestamp.toString(),
        origin
      });
      
      console.log(`   ${isCorrect ? '✅' : '❌'} 全局变量测试成功`);
    } catch (error) {
      recordTest("全局变量", false, error);
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

  if (Object.keys(testResults.addressAnalysis).length > 0) {
    console.log("\n📍 地址分析:");
    console.log(JSON.stringify(testResults.addressAnalysis, null, 2));
  }

  if (Object.keys(testResults.contractAnalysis).length > 0) {
    console.log("\n📄 合约分析:");
    console.log(JSON.stringify(testResults.contractAnalysis, null, 2));
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

