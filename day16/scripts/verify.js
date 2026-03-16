const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 验证 Day 24 合约部署...\n");

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
  console.log("║           验证 Day 24 合约部署                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════
  // 验证测试代币
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.TestTokenA) {
    console.log("1️⃣ 验证 TestTokenA 合约...");
    try {
      const tokenA = await ethers.getContractAt(
        "contracts/TestToken.sol:TestToken",
        deploymentInfo.contracts.TestTokenA.address
      );

      const name = await tokenA.name();
      const symbol = await tokenA.symbol();
      const totalSupply = await tokenA.totalSupply();

      console.log("   ✅ TestTokenA 验证通过");
      console.log("      ├─ 合约地址:", tokenA.target);
      console.log("      ├─ 名称:", name);
      console.log("      ├─ 符号:", symbol);
      console.log("      └─ 总供应量:", ethers.formatEther(totalSupply));
    } catch (error) {
      console.log("   ❌ TestTokenA 验证失败:", error.message);
    }
    console.log("");
  }

  if (deploymentInfo.contracts.TestTokenB) {
    console.log("2️⃣ 验证 TestTokenB 合约...");
    try {
      const tokenB = await ethers.getContractAt(
        "contracts/TestToken.sol:TestToken",
        deploymentInfo.contracts.TestTokenB.address
      );

      const name = await tokenB.name();
      const symbol = await tokenB.symbol();
      const totalSupply = await tokenB.totalSupply();

      console.log("   ✅ TestTokenB 验证通过");
      console.log("      ├─ 合约地址:", tokenB.target);
      console.log("      ├─ 名称:", name);
      console.log("      ├─ 符号:", symbol);
      console.log("      └─ 总供应量:", ethers.formatEther(totalSupply));
    } catch (error) {
      console.log("   ❌ TestTokenB 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 SimpleAMM
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.SimpleAMM) {
    console.log("3️⃣ 验证 SimpleAMM 合约...");
    try {
      const simpleAMM = await ethers.getContractAt(
        "SimpleAMM",
        deploymentInfo.contracts.SimpleAMM.address
      );
      
      const tokenA = await simpleAMM.tokenA();
      const tokenB = await simpleAMM.tokenB();
      const [reserveA, reserveB] = await simpleAMM.getReserves();
      const k = await simpleAMM.getK();

      console.log("   ✅ SimpleAMM 验证通过");
      console.log("      ├─ 合约地址:", simpleAMM.target);
      console.log("      ├─ Token A:", tokenA);
      console.log("      ├─ Token B:", tokenB);
      console.log("      ├─ Reserve A:", ethers.formatEther(reserveA));
      console.log("      ├─ Reserve B:", ethers.formatEther(reserveB));
      console.log("      └─ K (恒定乘积):", ethers.formatEther(k));
    } catch (error) {
      console.log("   ❌ SimpleAMM 验证失败:", error.message);
    }
    console.log("");
  }

  // ═══════════════════════════════════════════════════════════
  // 验证 AMMWithLPToken
  // ═══════════════════════════════════════════════════════════
  if (deploymentInfo.contracts.AMMWithLPToken) {
    console.log("4️⃣ 验证 AMMWithLPToken 合约...");
    try {
      const ammWithLPToken = await ethers.getContractAt(
        "AMMWithLPToken",
        deploymentInfo.contracts.AMMWithLPToken.address
      );
      
      const tokenA = await ammWithLPToken.tokenA();
      const tokenB = await ammWithLPToken.tokenB();
      const [reserveA, reserveB] = await ammWithLPToken.getReserves();
      const k = await ammWithLPToken.getK();
      const totalSupply = await ammWithLPToken.totalSupply();

      console.log("   ✅ AMMWithLPToken 验证通过");
      console.log("      ├─ 合约地址:", ammWithLPToken.target);
      console.log("      ├─ Token A:", tokenA);
      console.log("      ├─ Token B:", tokenB);
      console.log("      ├─ Reserve A:", ethers.formatEther(reserveA));
      console.log("      ├─ Reserve B:", ethers.formatEther(reserveB));
      console.log("      ├─ K (恒定乘积):", ethers.formatEther(k));
      console.log("      └─ LP 代币总供应量:", ethers.formatEther(totalSupply));
    } catch (error) {
      console.log("   ❌ AMMWithLPToken 验证失败:", error.message);
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

