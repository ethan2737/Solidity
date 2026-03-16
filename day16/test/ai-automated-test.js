/**
 * @title AI 自动化测试脚本 - Day 24
 * @notice 测试 AMM（自动做市商）和 x·y=k 恒定乘积模型
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
  ammAnalysis: {
    constantProduct: {},
    liquidity: {},
    swap: {}
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
  console.log("🤖 开始 Day 24 AI 自动化测试...\n");
  console.log("=".repeat(60));

  let tokenA, tokenB, amm;
  let owner, addr1, addr2;

  try {
    [owner, addr1, addr2] = await ethers.getSigners();

    // ═══════════════════════════════════════════════════════════
    // 部署合约
    // ═══════════════════════════════════════════════════════════
    console.log("\n📦 部署合约...");
    try {
      const TestToken = await ethers.getContractFactory("contracts/TestToken.sol:TestToken");
      tokenA = await TestToken.deploy("Token A", "TKA", 18, 1000000);

      tokenB = await TestToken.deploy("Token B", "TKB", 18, 1000000);

      const AMMWithLPToken = await ethers.getContractFactory("AMMWithLPToken");
      amm = await AMMWithLPToken.deploy(await tokenA.getAddress(), await tokenB.getAddress());
      
      recordTest("合约部署", true);
      console.log("   ✅ 所有合约部署成功");
    } catch (error) {
      recordTest("合约部署", false, error);
      console.log(`   ❌ 部署失败: ${error.message}`);
      throw error;
    }

    // ═══════════════════════════════════════════════════════════
    // 测试添加流动性
    // ═══════════════════════════════════════════════════════════
    console.log("\n💧 测试添加流动性...");
    
    try {
      // 分配代币
      const amount = ethers.parseEther("10000");
      await tokenA.transfer(addr1.address, amount);
      await tokenB.transfer(addr1.address, amount);
      
      const liquidityAmount = ethers.parseEther("1000");
      await tokenA.connect(addr1).approve(amm.target, liquidityAmount);
      await tokenB.connect(addr1).approve(amm.target, liquidityAmount);
      
      const tx = await amm.connect(addr1).addLiquidity(liquidityAmount, liquidityAmount);
      const receipt = await tx.wait();
      
      const [reserveA, reserveB] = await amm.getReserves();
      const lpBalance = await amm.balanceOf(addr1.address);
      
      const isCorrect = reserveA === liquidityAmount &&
                       reserveB === liquidityAmount &&
                       lpBalance > 0n;
      
      recordTest("添加流动性 - 首次添加", isCorrect, null, {
        reserveA: reserveA.toString(),
        reserveB: reserveB.toString(),
        lpBalance: lpBalance.toString()
      });
      
      if (isCorrect) {
        console.log("   ✅ 添加流动性成功");
        testResults.ammAnalysis.liquidity.firstAdd = {
          reserveA: reserveA.toString(),
          reserveB: reserveB.toString(),
          lpBalance: lpBalance.toString()
        };
      } else {
        console.log("   ❌ 添加流动性失败");
      }
    } catch (error) {
      recordTest("添加流动性 - 首次添加", false, error);
      console.log(`   ❌ 添加流动性失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 x·y=k 恒定乘积模型
    // ═══════════════════════════════════════════════════════════
    console.log("\n📊 测试 x·y=k 恒定乘积模型...");
    
    try {
      const [reserveA, reserveB] = await amm.getReserves();
      const k = await amm.getK();
      const calculatedK = reserveA * reserveB;

      const isCorrect = k === calculatedK;
      
      recordTest("恒定乘积 - 验证公式", isCorrect, null, {
        reserveA: reserveA.toString(),
        reserveB: reserveB.toString(),
        k: k.toString(),
        calculatedK: calculatedK.toString()
      });
      
      if (isCorrect) {
        console.log("   ✅ 恒定乘积公式验证通过");
        testResults.ammAnalysis.constantProduct.initialK = k.toString();
      } else {
        console.log("   ❌ 恒定乘积公式验证失败");
      }
    } catch (error) {
      recordTest("恒定乘积 - 验证公式", false, error);
      console.log(`   ❌ 恒定乘积验证失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试代币交换
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔄 测试代币交换...");
    
    try {
      // 分配代币给 addr2
      const swapAmount = ethers.parseEther("100");
      await tokenA.transfer(addr2.address, swapAmount);
      
      const kBefore = await amm.getK();
      const balanceBBefore = await tokenB.balanceOf(addr2.address);
      
      await tokenA.connect(addr2).approve(amm.target, swapAmount);
      const tx = await amm.connect(addr2).swap(tokenA.target, swapAmount);
      const receipt = await tx.wait();
      
      const balanceBAfter = await tokenB.balanceOf(addr2.address);
      const kAfter = await amm.getK();
      const [reserveA, reserveB] = await amm.getReserves();
      
      const receivedB = balanceBAfter - balanceBBefore;
      const kDiff = kAfter > kBefore ? kAfter - kBefore : kBefore - kAfter;

      const isCorrect = receivedB > 0n && kDiff < ethers.parseEther("2000");
      
      recordTest("代币交换 - A 换 B", isCorrect, null, {
        swapAmount: swapAmount.toString(),
        receivedB: receivedB.toString(),
        kBefore: kBefore.toString(),
        kAfter: kAfter.toString(),
        kDiff: kDiff.toString()
      });
      
      if (isCorrect) {
        console.log("   ✅ 代币交换成功");
        testResults.ammAnalysis.swap.firstSwap = {
          amountIn: swapAmount.toString(),
          amountOut: receivedB.toString(),
          kBefore: kBefore.toString(),
          kAfter: kAfter.toString()
        };
      } else {
        console.log("   ❌ 代币交换失败");
      }
    } catch (error) {
      recordTest("代币交换 - A 换 B", false, error);
      console.log(`   ❌ 代币交换失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试 getAmountOut
    // ═══════════════════════════════════════════════════════════
    console.log("\n🔮 测试 getAmountOut...");
    
    try {
      const swapAmount = ethers.parseEther("50");
      const expectedOut = await amm.getAmountOut(tokenA.target, swapAmount);
      
      const isCorrect = expectedOut > 0n;
      
      recordTest("getAmountOut - 计算输出数量", isCorrect, null, {
        amountIn: swapAmount.toString(),
        amountOut: expectedOut.toString()
      });
      
      if (isCorrect) {
        console.log("   ✅ getAmountOut 计算正确");
      } else {
        console.log("   ❌ getAmountOut 计算失败");
      }
    } catch (error) {
      recordTest("getAmountOut - 计算输出数量", false, error);
      console.log(`   ❌ getAmountOut 测试失败: ${error.message}`);
    }

    // ═══════════════════════════════════════════════════════════
    // 测试移除流动性
    // ═══════════════════════════════════════════════════════════
    console.log("\n💧 测试移除流动性...");
    
    try {
      const lpBalance = await amm.balanceOf(addr1.address);
      const liquidityToRemove = lpBalance / 2n;
      
      const balanceABefore = await tokenA.balanceOf(addr1.address);
      const balanceBBefore = await tokenB.balanceOf(addr1.address);
      
      const tx = await amm.connect(addr1).removeLiquidity(liquidityToRemove);
      const receipt = await tx.wait();
      
      const balanceAAfter = await tokenA.balanceOf(addr1.address);
      const balanceBAfter = await tokenB.balanceOf(addr1.address);
      
      const receivedA = balanceAAfter - balanceABefore;
      const receivedB = balanceBAfter - balanceBBefore;

      const isCorrect = receivedA > 0n && receivedB > 0n;
      
      recordTest("移除流动性", isCorrect, null, {
        liquidityRemoved: liquidityToRemove.toString(),
        receivedA: receivedA.toString(),
        receivedB: receivedB.toString()
      });
      
      if (isCorrect) {
        console.log("   ✅ 移除流动性成功");
      } else {
        console.log("   ❌ 移除流动性失败");
      }
    } catch (error) {
      recordTest("移除流动性", false, error);
      console.log(`   ❌ 移除流动性失败: ${error.message}`);
    }

  } catch (error) {
    console.error("\n❌ 测试过程出错:", error);
  }

  // ═══════════════════════════════════════════════════════════
  // 生成测试报告
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("📊 测试摘要");
  console.log("=".repeat(60));
  console.log(`总测试数: ${testResults.summary.total}`);
  console.log(`通过: ${testResults.summary.passed} ✅`);
  console.log(`失败: ${testResults.summary.failed} ❌`);
  console.log(`通过率: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

  if (testResults.summary.errors.length > 0) {
    console.log("\n❌ 错误详情:");
    testResults.summary.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.test}: ${err.error}`);
    });
  }

  // 保存测试结果
  const outputPath = path.join(__dirname, "..", "test-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
  console.log(`\n💾 测试结果已保存到: ${outputPath}`);

  // ═══════════════════════════════════════════════════════════
  // AMM 分析报告
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(60));
  console.log("📈 AMM 分析报告");
  console.log("=".repeat(60));
  console.log(JSON.stringify(testResults.ammAnalysis, null, 2));

  return testResults;
}

// 运行测试
if (require.main === module) {
  runAutomatedTests()
    .then(() => {
      console.log("\n✅ AI 自动化测试完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 测试失败:", error);
      process.exit(1);
    });
}

module.exports = { runAutomatedTests };

