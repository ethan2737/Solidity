const hre = require("hardhat");

/**
 * 部署脚本
 * 部署 SolidityAPIDemo 合约
 */
async function main() {
  console.log("开始部署 SolidityAPIDemo 合约...");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);

  // 获取余额（ethers v6 语法）
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(deployer.address);
  console.log("账户余额:", balance.toString());

  // 部署主合约
  console.log("\n部署 SolidityAPIDemo 合约...");
  const SolidityAPIDemo = await hre.ethers.getContractFactory("SolidityAPIDemo");
  const demo = await SolidityAPIDemo.deploy();
  await demo.waitForDeployment();
  const demoAddress = await demo.getAddress();
  console.log("SolidityAPIDemo 部署地址:", demoAddress);

  // 部署演示用 VulnerableWallet
  console.log("\n部署 VulnerableWallet 合约（用于演示 tx.origin 攻击）...");
  const VulnerableWallet = await hre.ethers.getContractFactory("VulnerableWallet");
  const vulnerable = await VulnerableWallet.deploy();
  await vulnerable.waitForDeployment();
  const vulnerableAddress = await vulnerable.getAddress();
  console.log("VulnerableWallet 部署地址:", vulnerableAddress);

  // 部署演示用 SafeWallet
  console.log("\n部署 SafeWallet 合约...");
  const SafeWallet = await hre.ethers.getContractFactory("SafeWallet");
  const safe = await SafeWallet.deploy();
  await safe.waitForDeployment();
  const safeAddress = await safe.getAddress();
  console.log("SafeWallet 部署地址:", safeAddress);

  // 部署 AttackerContract
  console.log("\n部署 AttackerContract 合约...");
  const AttackerContract = await hre.ethers.getContractFactory("AttackerContract");
  const attacker = await AttackerContract.deploy(vulnerableAddress);
  await attacker.waitForDeployment();
  const attackerAddress = await attacker.getAddress();
  console.log("AttackerContract 部署地址:", attackerAddress);

  // 打印部署后的账户余额
  const balanceAfter = await provider.getBalance(deployer.address);
  console.log("\n部署后账户余额:", balanceAfter.toString());

  console.log("\n========== 部署完成 ==========");
  console.log("合约地址汇总:");
  console.log("- SolidityAPIDemo:", demoAddress);
  console.log("- VulnerableWallet:", vulnerableAddress);
  console.log("- SafeWallet:", safeAddress);
  console.log("- AttackerContract:", attackerAddress);

  // 验证部署
  console.log("\n验证部署...");
  const demoOwner = await demo.owner();
  console.log("SolidityAPIDemo owner:", demoOwner);

  const safeOwner = await safe.owner();
  console.log("SafeWallet owner:", safeOwner);

  console.log("\n✅ 部署成功！");
}

// 错误处理
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });
