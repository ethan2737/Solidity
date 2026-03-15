const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🤖 AI 自动化测试 - Day 23 ERC20 代币\n");

  const [deployer, addr1, addr2] = await ethers.getSigners();
  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");

  let deploymentInfo = {};
  if (fs.existsSync(deploymentInfoPath)) {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // ═══════════════════════════════════════════════════════════
  // 测试 MyERC20Token
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts?.MyERC20Token?.address) {
    console.log("📦 测试 MyERC20Token...");
    const myERC20Token = await ethers.getContractAt(
      "MyERC20Token",
      deploymentInfo.contracts.MyERC20Token.address
    );

    // 测试 1: 查询基本信息
    try {
      const name = await myERC20Token.name();
      const symbol = await myERC20Token.symbol();
      const totalSupply = await myERC20Token.totalSupply();
      const deployerBalance = await myERC20Token.balanceOf(deployer.address);

      console.log("   ✅ 基本信息查询成功");
      console.log("      └─ 名称:", name);
      console.log("      └─ 符号:", symbol);
      console.log("      └─ 总供应量:", ethers.utils.formatEther(totalSupply));
      console.log("      └─ 部署者余额:", ethers.utils.formatEther(deployerBalance));

      testResults.tests.push({
        contract: "MyERC20Token",
        test: "基本信息查询",
        status: "passed"
      });
    } catch (error) {
      console.log("   ❌ 基本信息查询失败:", error.message);
      testResults.tests.push({
        contract: "MyERC20Token",
        test: "基本信息查询",
        status: "failed",
        error: error.message
      });
    }

    // 测试 2: transfer
    try {
      const transferAmount = ethers.utils.parseEther("100");
      await myERC20Token.transfer(addr1.address, transferAmount);
      const addr1Balance = await myERC20Token.balanceOf(addr1.address);

      if (addr1Balance.eq(transferAmount)) {
        console.log("   ✅ transfer 测试成功");
        testResults.tests.push({
          contract: "MyERC20Token",
          test: "transfer",
          status: "passed"
        });
      } else {
        throw new Error("余额不匹配");
      }
    } catch (error) {
      console.log("   ❌ transfer 测试失败:", error.message);
      testResults.tests.push({
        contract: "MyERC20Token",
        test: "transfer",
        status: "failed",
        error: error.message
      });
    }

    // 测试 3: approve
    try {
      const approveAmount = ethers.utils.parseEther("500");
      await myERC20Token.approve(addr2.address, approveAmount);
      const allowance = await myERC20Token.allowance(deployer.address, addr2.address);

      if (allowance.eq(approveAmount)) {
        console.log("   ✅ approve 测试成功");
        testResults.tests.push({
          contract: "MyERC20Token",
          test: "approve",
          status: "passed"
        });
      } else {
        throw new Error("授权额度不匹配");
      }
    } catch (error) {
      console.log("   ❌ approve 测试失败:", error.message);
      testResults.tests.push({
        contract: "MyERC20Token",
        test: "approve",
        status: "failed",
        error: error.message
      });
    }

    // 测试 4: transferFrom
    try {
      const transferFromAmount = ethers.utils.parseEther("200");
      const tokenWithAddr2 = myERC20Token.connect(addr2);
      await tokenWithAddr2.transferFrom(deployer.address, addr2.address, transferFromAmount);
      const addr2Balance = await myERC20Token.balanceOf(addr2.address);
      const remainingAllowance = await myERC20Token.allowance(deployer.address, addr2.address);

      if (addr2Balance.eq(transferFromAmount)) {
        console.log("   ✅ transferFrom 测试成功");
        console.log("      └─ 剩余授权:", ethers.utils.formatEther(remainingAllowance));
        testResults.tests.push({
          contract: "MyERC20Token",
          test: "transferFrom",
          status: "passed"
        });
      } else {
        throw new Error("转账金额不匹配");
      }
    } catch (error) {
      console.log("   ❌ transferFrom 测试失败:", error.message);
      testResults.tests.push({
        contract: "MyERC20Token",
        test: "transferFrom",
        status: "failed",
        error: error.message
      });
    }

    // 测试 5: mint
    try {
      const mintAmount = ethers.utils.parseEther("1000");
      const totalSupplyBefore = await myERC20Token.totalSupply();
      await myERC20Token.mint(addr1.address, mintAmount);
      const totalSupplyAfter = await myERC20Token.totalSupply();

      if (totalSupplyAfter.eq(totalSupplyBefore.add(mintAmount))) {
        console.log("   ✅ mint 测试成功");
        testResults.tests.push({
          contract: "MyERC20Token",
          test: "mint",
          status: "passed"
        });
      } else {
        throw new Error("总供应量不匹配");
      }
    } catch (error) {
      console.log("   ❌ mint 测试失败:", error.message);
      testResults.tests.push({
        contract: "MyERC20Token",
        test: "mint",
        status: "failed",
        error: error.message
      });
    }

    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 测试 ERC20Basic
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts?.ERC20Basic?.address) {
    console.log("📦 测试 ERC20Basic...");
    const erc20Basic = await ethers.getContractAt(
      "ERC20Basic",
      deploymentInfo.contracts.ERC20Basic.address
    );

    // 测试 1: 查询基本信息
    try {
      const name = await erc20Basic.name();
      const symbol = await erc20Basic.symbol();
      const decimals = await erc20Basic.decimals();
      const totalSupply = await erc20Basic.totalSupply();

      console.log("   ✅ 基本信息查询成功");
      console.log("      └─ 名称:", name);
      console.log("      └─ 符号:", symbol);
      console.log("      └─ 小数位数:", decimals);
      console.log("      └─ 总供应量:", ethers.utils.formatEther(totalSupply));

      testResults.tests.push({
        contract: "ERC20Basic",
        test: "基本信息查询",
        status: "passed"
      });
    } catch (error) {
      console.log("   ❌ 基本信息查询失败:", error.message);
      testResults.tests.push({
        contract: "ERC20Basic",
        test: "基本信息查询",
        status: "failed",
        error: error.message
      });
    }

    // 测试 2: transfer
    try {
      const transferAmount = ethers.utils.parseEther("50");
      await erc20Basic.transfer(addr1.address, transferAmount);
      const addr1Balance = await erc20Basic.balanceOf(addr1.address);

      if (addr1Balance.eq(transferAmount)) {
        console.log("   ✅ transfer 测试成功");
        testResults.tests.push({
          contract: "ERC20Basic",
          test: "transfer",
          status: "passed"
        });
      } else {
        throw new Error("余额不匹配");
      }
    } catch (error) {
      console.log("   ❌ transfer 测试失败:", error.message);
      testResults.tests.push({
        contract: "ERC20Basic",
        test: "transfer",
        status: "failed",
        error: error.message
      });
    }

    // 测试 3: approve 和 transferFrom
    try {
      const approveAmount = ethers.utils.parseEther("300");
      await erc20Basic.approve(addr2.address, approveAmount);
      const tokenWithAddr2 = erc20Basic.connect(addr2);
      await tokenWithAddr2.transferFrom(deployer.address, addr2.address, ethers.utils.parseEther("100"));
      const remainingAllowance = await erc20Basic.allowance(deployer.address, addr2.address);

      if (remainingAllowance.eq(ethers.utils.parseEther("200"))) {
        console.log("   ✅ approve/transferFrom 测试成功");
        testResults.tests.push({
          contract: "ERC20Basic",
          test: "approve/transferFrom",
          status: "passed"
        });
      } else {
        throw new Error("授权额度不匹配");
      }
    } catch (error) {
      console.log("   ❌ approve/transferFrom 测试失败:", error.message);
      testResults.tests.push({
        contract: "ERC20Basic",
        test: "approve/transferFrom",
        status: "failed",
        error: error.message
      });
    }

    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 生成测试报告
  // ═══════════════════════════════════════════════════════════
  const passedTests = testResults.tests.filter(t => t.status === "passed").length;
  const failedTests = testResults.tests.filter(t => t.status === "failed").length;
  const totalTests = testResults.tests.length;

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║            📊 测试报告                                  ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📋 测试摘要:");
  console.log("   • 总测试数:", totalTests);
  console.log("   • 通过:", passedTests);
  console.log("   • 失败:", failedTests);
  console.log("   • 成功率:", totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + "%" : "0%");
  console.log("");

  // 保存测试结果
  const testResultsPath = path.join(__dirname, "..", "test-results.json");
  fs.writeFileSync(
    testResultsPath,
    JSON.stringify(testResults, null, 2)
  );
  console.log("💾 测试结果已保存到 test-results.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 测试失败:");
    console.error(error);
    process.exit(1);
  });

