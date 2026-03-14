// SPDX-License-Identifier: MIT
/**
 * @title 部署脚本
 * @notice 部署所有演示合约到本地网络
 */
const hre = require("hardhat");

async function main() {
    console.log("===========================================");
    console.log("开始部署智能合约演示项目...");
    console.log("===========================================\n");

    // 获取签名者（部署者）
    const [deployer] = await hre.ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("部署者余额:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log("");

    // 1. 部署 ReentrancyVulnerable（重入漏洞合约）
    console.log("1. 部署 ReentrancyVulnerable...");
    const ReentrancyVulnerable = await hre.ethers.getContractFactory("ReentrancyVulnerable");
    const vulnerable = await ReentrancyVulnerable.deploy();
    await vulnerable.waitForDeployment();
    const vulnerableAddr = await vulnerable.getAddress();
    console.log("   ✅ ReentrancyVulnerable 部署成功!");
    console.log("   地址:", vulnerableAddr);

    // 2. 部署 SecureBank（安全银行合约）
    console.log("\n2. 部署 SecureBank...");
    const SecureBank = await hre.ethers.getContractFactory("SecureBank");
    const secure = await SecureBank.deploy();
    await secure.waitForDeployment();
    const secureAddr = await secure.getAddress();
    console.log("   ✅ SecureBank 部署成功!");
    console.log("   地址:", secureAddr);

    // 3. 部署 SafeMathDemo
    console.log("\n3. 部署 SafeMathDemo...");
    const SafeMathDemo = await hre.ethers.getContractFactory("SafeMathDemo");
    const safeMath = await SafeMathDemo.deploy();
    await safeMath.waitForDeployment();
    const safeMathAddr = await safeMath.getAddress();
    console.log("   ✅ SafeMathDemo 部署成功!");
    console.log("   地址:", safeMathAddr);

    // 4. 部署 AccessControlDemo
    console.log("\n4. 部署 AccessControlDemo...");
    const AccessControlDemo = await hre.ethers.getContractFactory("AccessControlDemo");
    const accessControl = await AccessControlDemo.deploy(deployer.address);
    await accessControl.waitForDeployment();
    const accessControlAddr = await accessControl.getAddress();
    console.log("   ✅ AccessControlDemo 部署成功!");
    console.log("   地址:", accessControlAddr);

    // 5. 部署 RandomNumberDemo
    console.log("\n5. 部署 RandomNumberDemo...");
    const RandomNumberDemo = await hre.ethers.getContractFactory("RandomNumberDemo");
    const randomNum = await RandomNumberDemo.deploy();
    await randomNum.waitForDeployment();
    const randomNumAddr = await randomNum.getAddress();
    console.log("   ✅ RandomNumberDemo 部署成功!");
    console.log("   地址:", randomNumAddr);

    // 6. 部署 ChainlinkVRFDemo
    console.log("\n6. 部署 ChainlinkVRFDemo...");
    // Chainlink VRF 参数（测试网参数）
    const VRF_COORDINATOR = "0x1234567890123456789012345678901234567890";
    const KEY_HASH = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CHAINLINK_VRF_KEY_HASH"));
    const FEE = hre.ethers.parseEther("0.01"); // 0.01 LINK

    const ChainlinkVRFDemo = await hre.ethers.getContractFactory("ChainlinkVRFDemo");
    const vrf = await ChainlinkVRFDemo.deploy(VRF_COORDINATOR, KEY_HASH, FEE);
    await vrf.waitForDeployment();
    const vrfAddr = await vrf.getAddress();
    console.log("   ✅ ChainlinkVRFDemo 部署成功!");
    console.log("   地址:", vrfAddr);

    // 保存部署信息
    console.log("\n===========================================");
    console.log("部署完成！合约地址汇总：");
    console.log("===========================================");
    console.log("ReentrancyVulnerable:", vulnerableAddr);
    console.log("SecureBank:", secureAddr);
    console.log("SafeMathDemo:", safeMathAddr);
    console.log("AccessControlDemo:", accessControlAddr);
    console.log("RandomNumberDemo:", randomNumAddr);
    console.log("ChainlinkVRFDemo:", vrfAddr);
    console.log("===========================================\n");

    // 保存到文件
    const deploymentInfo = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            ReentrancyVulnerable: vulnerableAddr,
            SecureBank: secureAddr,
            SafeMathDemo: safeMathAddr,
            AccessControlDemo: accessControlAddr,
            RandomNumberDemo: randomNumAddr,
            ChainlinkVRFDemo: vrfAddr
        }
    };

    const fs = require("fs");
    fs.writeFileSync(
        "./deployment-addresses.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📄 部署地址已保存到 deployment-addresses.json");
}

main()
    .then(() => {
        console.log("✅ 部署脚本执行成功！");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });
