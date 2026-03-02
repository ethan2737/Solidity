const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 4 合约部署...\n");

  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  
  if (!fs.existsSync(deploymentInfoPath)) {
    console.error("❌ 找不到 deployment-info.json");
    console.log("💡 请先运行部署脚本: npx hardhat run scripts/deploy.js --network localhost");
    return;
  }

  const deploymentInfo = JSON.parse(
    fs.readFileSync(deploymentInfoPath, "utf8")
  );

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║           验证 Day 4 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证 SimpleToken
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.SimpleToken) {
    console.log("1️⃣ 验证 SimpleToken 合约...");
    try {
      const token = await ethers.getContractAt(
        "SimpleToken",
        deploymentInfo.contracts.SimpleToken.address
      );
      
      const name = await token.name();
      const symbol = await token.symbol();
      const totalSupply = await token.totalSupply();
      
      console.log("   ✅ SimpleToken 验证通过");
      console.log("      ├─ 地址:", token.address);
      console.log("      ├─ 名称:", name);
      console.log("      ├─ 符号:", symbol);
      console.log("      └─ 总供应量:", ethers.utils.formatEther(totalSupply), symbol);
    } catch (error) {
      console.log("   ❌ SimpleToken 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 AddressDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.AddressDemo) {
    console.log("2️⃣ 验证 AddressDemo 合约...");
    try {
      const addressDemo = await ethers.getContractAt(
        "AddressDemo",
        deploymentInfo.contracts.AddressDemo.address
      );
      
      const owner = await addressDemo.owner();
      const manager = await addressDemo.manager();
      const contractAddress = await addressDemo.getContractAddress();
      
      console.log("   ✅ AddressDemo 验证通过");
      console.log("      ├─ 合约地址:", contractAddress);
      console.log("      ├─ Owner:", owner);
      console.log("      ├─ Manager:", manager);
      console.log("      └─ Owner 匹配:", owner.toLowerCase() === deploymentInfo.deployer.toLowerCase());
    } catch (error) {
      console.log("   ❌ AddressDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 ContractTypeDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.ContractTypeDemo) {
    console.log("3️⃣ 验证 ContractTypeDemo 合约...");
    try {
      const contractTypeDemo = await ethers.getContractAt(
        "ContractTypeDemo",
        deploymentInfo.contracts.ContractTypeDemo.address
      );
      
      const isTokenSet = await contractTypeDemo.isTokenSet();
      console.log("   ✅ ContractTypeDemo 验证通过");
      console.log("      ├─ 合约地址:", contractTypeDemo.address);
      console.log("      └─ Token 已设置:", isTokenSet);
      
      if (isTokenSet) {
        const tokenName = await contractTypeDemo.getTokenName();
        const tokenAddress = await contractTypeDemo.getTokenAddress();
        console.log("      ├─ Token 名称:", tokenName);
        console.log("      └─ Token 地址:", tokenAddress);
      }
    } catch (error) {
      console.log("   ❌ ContractTypeDemo 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 GlobalVariablesDemo
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.GlobalVariablesDemo) {
    console.log("4️⃣ 验证 GlobalVariablesDemo 合约...");
    try {
      const globalVariablesDemo = await ethers.getContractAt(
        "GlobalVariablesDemo",
        deploymentInfo.contracts.GlobalVariablesDemo.address
      );
      
      const [signer] = await ethers.getSigners();
      const sender = await globalVariablesDemo.getSender();
      const blockNumber = await globalVariablesDemo.getBlockNumber();
      const timestamp = await globalVariablesDemo.getTimestamp();
      
      console.log("   ✅ GlobalVariablesDemo 验证通过");
      console.log("      ├─ 合约地址:", globalVariablesDemo.address);
      console.log("      ├─ 当前发送者:", sender);
      console.log("      ├─ 区块号:", blockNumber.toString());
      console.log("      └─ 时间戳:", new Date(timestamp.toNumber() * 1000).toISOString());
    } catch (error) {
      console.log("   ❌ GlobalVariablesDemo 验证失败:", error.message);
    }
    console.log("");
  }

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║              ✅ 验证完成！                             ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 验证过程出错:");
    console.error(error);
    process.exit(1);
  });

