/**
 * ERC20 代币合约部署脚本
 *
 * 用途：
 * - 编译 Solidity 合约
 * - 部署 ERC20Basic 和 MyERC20Token 合约
 * - 测试基本功能（transfer, approve, transferFrom, mint）
 * - 保存部署信息到 JSON 文件
 *
 * 使用方法：
 * - 本地部署：npm run deploy
 * - 测试网部署：npm run deploy -- --network sepolia
 */

const hre = require("hardhat");        // Hardhat 运行时环境
const { ethers } = require("hardhat"); // Ethers.js 库
const fs = require("fs");             // Node.js 文件系统模块
const path = require("path");         // Node.js 路径模块

/**
 * main() - 部署主函数
 * async/await 异步函数，用于处理区块链交互
 */
async function main() {
  console.log("🚀 开始部署 Day 23 ERC20 代币合约...\n");

  // ==================== 获取测试账户 ====================
  // ethers.getSigners() 获取 Hardhat 配置的测试账户
  // deployer = 部署者（默认第一个账户，有 ETH）
  // addr1, addr2 = 普通测试账户
  const [deployer, addr1, addr2] = await ethers.getSigners();

  console.log("📍 部署者地址:", deployer.address);
  console.log("📍 测试地址1:", addr1.address);
  console.log("📍 测试地址2:", addr2.address);

  // 查询部署者的 ETH 余额（单位：Wei）
  const balance = await deployer.getBalance();
  // 转换为 ETH 单位显示（除以 10^18）
  console.log("💰 部署者余额:", ethers.utils.formatEther(balance), "ETH\n");

  // ==================== 准备部署信息 ====================
  // 用于保存部署信息，最后写入 JSON 文件
  const deploymentInfo = {
    network: hre.network.name,              // 网络名称（如 localhost, hardhat, sepolia）
    chainId: hre.network.config.chainId || 31337,  // Chain ID
    timestamp: new Date().toISOString(),    // 部署时间
    deployer: deployer.address,              // 部署者地址
    contracts: {}                           // 存放合约地址
  };

  // ==================== 步骤 1: 编译合约 ====================
  console.log("📦 步骤 1: 编译合约...");
  // hre.run("compile") 调用 Hardhat 的编译任务
  await hre.run("compile");
  console.log("✅ 编译完成\n");

  // ==================== 步骤 2: 部署 MyERC20Token ====================
  // 使用 OpenZeppelin 的 ERC20 模板
  console.log("📦 步骤 2: 部署 MyERC20Token（使用 OpenZeppelin 模板）...");
  try {
    // ethers.getContractFactory() 获取合约工厂
    // 参数：合约名称（必须与 .sol 文件中的 contract 名称一致）
    const MyERC20Token = await ethers.getContractFactory("MyERC20Token");

    // .deploy() 部署合约，传入构造函数参数
    const myERC20Token = await MyERC20Token.deploy(
      "Xiucai Token",                        // 代币名称
      "XCT",                                 // 代币符号
      ethers.utils.parseEther("10000000")   // 最大供应量：1000万（乘以 10^18）
    );

    // .deployed() 等待部署交易确认
    await myERC20Token.deployed();

    console.log("   ✅ MyERC20Token 部署成功!");
    console.log("      └─ 合约地址:", myERC20Token.address);

    // 查询部署后的代币信息
    const totalSupply = await myERC20Token.totalSupply();           // 总供应量
    const deployerBalance = await myERC20Token.balanceOf(deployer.address); // 部署者余额

    console.log("      └─ 总供应量:", ethers.utils.formatEther(totalSupply), "XCT");
    console.log("      └─ 部署者余额:", ethers.utils.formatEther(deployerBalance), "XCT");

    // 保存合约信息
    deploymentInfo.contracts.MyERC20Token = {
      address: myERC20Token.address,
      name: "Xiucai Token",
      symbol: "XCT",
      totalSupply: totalSupply.toString()  // 转为字符串避免大数精度问题
    };
  } catch (error) {
    console.log("   ❌ MyERC20Token 部署失败:", error.message);
  }
  console.log("");

  // ==================== 步骤 3: 部署 ERC20Basic ====================
  // 手动实现的 ERC20 基础版本
  console.log("📦 步骤 3: 部署 ERC20Basic（基础实现）...");
  try {
    // 获取 ERC20Basic 合约工厂
    const ERC20Basic = await ethers.getContractFactory("ERC20Basic");

    // 部署合约，传入构造函数参数
    const erc20Basic = await ERC20Basic.deploy(
      "Basic Token",                         // 代币名称
      "BSC",                                 // 代币符号
      18,                                    // 小数位数（以太坊标准 18 位）
      ethers.utils.parseEther("1000000")   // 初始供应量：100万
    );

    await erc20Basic.deployed();

    console.log("   ✅ ERC20Basic 部署成功!");
    console.log("      └─ 合约地址:", erc20Basic.address);

    const totalSupply = await erc20Basic.totalSupply();
    const deployerBalance = await erc20Basic.balanceOf(deployer.address);
    console.log("      └─ 总供应量:", ethers.utils.formatEther(totalSupply), "BSC");
    console.log("      └─ 部署者余额:", ethers.utils.formatEther(deployerBalance), "BSC");

    deploymentInfo.contracts.ERC20Basic = {
      address: erc20Basic.address,
      name: "Basic Token",
      symbol: "BSC",
      totalSupply: totalSupply.toString()
    };
  } catch (error) {
    console.log("   ❌ ERC20Basic 部署失败:", error.message);
  }
  console.log("");

  // ==================== 步骤 4: 测试 ERC20 功能 ====================
  // 部署后直接测试基本功能
  if (deploymentInfo.contracts.MyERC20Token) {
    console.log("📦 步骤 4: 测试 ERC20 功能...");

    try {
      // ethers.getContractAt() 获取已部署合约的实例
      // 参数：合约名称、合约地址
      const myERC20Token = await ethers.getContractAt(
        "MyERC20Token",
        deploymentInfo.contracts.MyERC20Token.address
      );

      // ----- 测试 1: transfer 转账 -----
      console.log("   测试 transfer...");
      const transferAmount = ethers.utils.parseEther("100"); // 100 XCT
      // 调用合约的 transfer 函数
      await myERC20Token.transfer(addr1.address, transferAmount);
      // 查询 addr1 的余额
      const addr1Balance = await myERC20Token.balanceOf(addr1.address);
      console.log("   ✅ transfer 测试成功");
      console.log("      └─ addr1 余额:", ethers.utils.formatEther(addr1Balance), "XCT");

      // ----- 测试 2: approve 授权 -----
      console.log("   测试 approve...");
      const approveAmount = ethers.utils.parseEther("50"); // 50 XCT
      // 授权 addr2
      await myERC20Token.approve(addr2.address, approveAmount);
      // 查询授权额度
      const allowance = await myERC20Token.allowance(deployer.address, addr2.address);
      console.log("   ✅ approve 测试成功");
      console.log("      └─ 授权额度:", ethers.utils.formatEther(allowance), "XCT");

      // ----- 测试 3: transferFrom 代理转账 -----
      console.log("   测试 transferFrom...");
      const transferFromAmount = ethers.utils.parseEther("30"); // 30 XCT

      // contract.connect(account) - 以另一个账户的身份调用合约
      const tokenWithAddr2 = myERC20Token.connect(addr2);
      // addr2 调用 transferFrom，从 deployer 转账到自己
      await tokenWithAddr2.transferFrom(deployer.address, addr2.address, transferFromAmount);

      const addr2Balance = await myERC20Token.balanceOf(addr2.address);
      const remainingAllowance = await myERC20Token.allowance(deployer.address, addr2.address);
      console.log("   ✅ transferFrom 测试成功");
      console.log("      └─ addr2 余额:", ethers.utils.formatEther(addr2Balance), "XCT");
      console.log("      └─ 剩余授权:", ethers.utils.formatEther(remainingAllowance), "XCT");

      // ----- 测试 4: mint 铸造 -----
      console.log("   测试 mint...");
      const mintAmount = ethers.utils.parseEther("1000"); // 1000 XCT
      // 只有 owner 可以铸造
      await myERC20Token.mint(addr1.address, mintAmount);
      const addr1BalanceAfterMint = await myERC20Token.balanceOf(addr1.address);
      console.log("   ✅ mint 测试成功");
      console.log("      └─ addr1 余额（铸造后）:", ethers.utils.formatEther(addr1BalanceAfterMint), "XCT");

    } catch (error) {
      console.log("   ❌ 测试失败:", error.message);
    }
    console.log("");
  }

  // ==================== 保存部署信息 ====================
  // 将部署信息写入 JSON 文件，供其他脚本使用
  const outputPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 部署信息已保存到 deployment-info.json\n");

  // ==================== 打印摘要 ====================
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║            🎉 部署完成！                              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📋 部署摘要:");
  console.log("   • 网络:", deploymentInfo.network);
  console.log("   • Chain ID:", deploymentInfo.chainId);
  console.log("   • 部署者:", deployer.address);
  if (deploymentInfo.contracts.MyERC20Token) {
    console.log("   • MyERC20Token:", deploymentInfo.contracts.MyERC20Token.address);
    console.log("     └─ 名称:", deploymentInfo.contracts.MyERC20Token.name);
    console.log("     └─ 符号:", deploymentInfo.contracts.MyERC20Token.symbol);
  }
  if (deploymentInfo.contracts.ERC20Basic) {
    console.log("   • ERC20Basic:", deploymentInfo.contracts.ERC20Basic.address);
    console.log("     └─ 名称:", deploymentInfo.contracts.ERC20Basic.name);
    console.log("     └─ 符号:", deploymentInfo.contracts.ERC20Basic.symbol);
  }
  console.log("");
  console.log("🎯 下一步:");
  console.log("   1. 运行测试: npm test");
  console.log("   2. 部署到测试网: npm run deploy -- --network sepolia");
  console.log("   3. 查看部署信息: cat deployment-info.json");
  console.log("");
}

/**
 * 执行 main() 函数
 * .then() 处理成功情况，退出码 0
 * .catch() 处理错误情况，退出码 1
 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });
