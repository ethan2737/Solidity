/**
 * @title Deploy Script
 * @notice 部署综合演示合约
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // 部署目标合约
  console.log("\nDeploying TargetContract...");
  const TargetContract = await ethers.getContractFactory("TargetContract");
  const targetContract = await TargetContract.deploy("TargetContract");
  await targetContract.waitForDeployment();
  const targetAddress = await targetContract.getAddress();
  console.log("TargetContract deployed to:", targetAddress);

  // 部署综合演示合约
  console.log("\nDeploying ComprehensiveDemo...");
  const ComprehensiveDemo = await ethers.getContractFactory("ComprehensiveDemo");
  const comprehensiveDemo = await ComprehensiveDemo.deploy("ComprehensiveDemo");
  await comprehensiveDemo.waitForDeployment();
  const demoAddress = await comprehensiveDemo.getAddress();
  console.log("ComprehensiveDemo deployed to:", demoAddress);

  // 设置目标合约地址
  console.log("\nSetting target contract address...");
  const tx = await comprehensiveDemo.setTargetContract(targetAddress);
  await tx.wait();
  console.log("Target contract set successfully");

  // 输出部署摘要
  console.log("\n========== Deployment Summary ==========");
  console.log("TargetContract:", targetAddress);
  console.log("ComprehensiveDemo:", demoAddress);
  console.log("========================================");

  // 保存部署地址供验证脚本使用
  saveDeployAddress(targetAddress, demoAddress);
}

function saveDeployAddress(targetAddress, demoAddress) {
  const deployInfo = {
    targetContract: targetAddress,
    comprehensiveDemo: demoAddress,
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "deploy-address.json");
  fs.writeFileSync(filePath, JSON.stringify(deployInfo, null, 2));
  console.log("\nDeploy addresses saved to:", filePath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
