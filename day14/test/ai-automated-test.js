// SPDX-License-Identifier: MIT
/**
 * @title AI 自动化测试
 * @notice 自动测试所有合约功能
 */
const hre = require("hardhat");

async function main() {
    console.log("===========================================");
    console.log("开始 AI 自动化测试...");
    console.log("===========================================\n");

    const [deployer, user1, user2] = await hre.ethers.getSigners();
    let passed = 0;
    let failed = 0;

    // 辅助函数
    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`   ✅ ${name}`);
            passed++;
        } catch (e) {
            console.log(`   ❌ ${name}: ${e.message}`);
            failed++;
        }
    };

    // 1. 部署所有合约
    console.log("1. 部署合约...\n");

    const ReentrancyVulnerable = await hre.ethers.getContractFactory("ReentrancyVulnerable");
    const vulnerable = await ReentrancyVulnerable.deploy();
    await vulnerable.waitForDeployment();
    console.log("   ✅ ReentrancyVulnerable 部署成功");

    const SecureBank = await hre.ethers.getContractFactory("SecureBank");
    const secure = await SecureBank.deploy();
    await secure.waitForDeployment();
    console.log("   ✅ SecureBank 部署成功");

    const SafeMathDemo = await hre.ethers.getContractFactory("SafeMathDemo");
    const safeMath = await SafeMathDemo.deploy();
    await safeMath.waitForDeployment();
    console.log("   ✅ SafeMathDemo 部署成功");

    const AccessControlDemo = await hre.ethers.getContractFactory("AccessControlDemo");
    const accessControl = await AccessControlDemo.deploy(deployer.address);
    await accessControl.waitForDeployment();
    console.log("   ✅ AccessControlDemo 部署成功");

    const RandomNumberDemo = await hre.ethers.getContractFactory("RandomNumberDemo");
    const randomNum = await RandomNumberDemo.deploy();
    await randomNum.waitForDeployment();
    console.log("   ✅ RandomNumberDemo 部署成功");

    const ChainlinkVRFDemo = await hre.ethers.getContractFactory("ChainlinkVRFDemo");
    const vrfCoordinator = "0x1234567890123456789012345678901234567890";
    const keyHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CHAINLINK_VRF_KEY_HASH"));
    const vrf = await ChainlinkVRFDemo.deploy(vrfCoordinator, keyHash, hre.ethers.parseEther("0.01"));
    await vrf.waitForDeployment();
    console.log("   ✅ ChainlinkVRFDemo 部署成功\n");

    // 2. 测试 ReentrancyVulnerable
    console.log("2. 测试 ReentrancyVulnerable...\n");

    await test("存款功能", async () => {
        await vulnerable.connect(user1).deposit({ value: hre.ethers.parseEther("1") });
        const balance = await vulnerable.balances(user1.address);
        if (balance !== hre.ethers.parseEther("1")) throw new Error("存款失败");
    });

    await test("提现功能", async () => {
        await vulnerable.connect(user1).withdraw();
        const balance = await vulnerable.balances(user1.address);
        if (balance !== 0n) throw new Error("提现失败");
    });

    // 3. 测试 SecureBank
    console.log("\n3. 测试 SecureBank...\n");

    await test("SecureBank 存款", async () => {
        await secure.connect(user1).deposit({ value: hre.ethers.parseEther("1") });
        const balance = await secure.balances(user1.address);
        if (balance !== hre.ethers.parseEther("1")) throw new Error("存款失败");
    });

    await test("SecureBank 提现", async () => {
        await secure.connect(user1).withdraw();
        const balance = await secure.balances(user1.address);
        if (balance !== 0n) throw new Error("提现失败");
    });

    // 4. 测试 SafeMathDemo
    console.log("\n4. 测试 SafeMathDemo...\n");

    await test("内置加法", async () => {
        await safeMath.addWithBuiltIn(100);
        const value = await safeMath.getValue();
        if (value !== 100n) throw new Error("加法失败");
    });

    await test("SafeMath 加法", async () => {
        await safeMath.addWithSafeMath(50);
        const balance = await safeMath.getBalance();
        if (balance !== 50n) throw new Error("SafeMath加法失败");
    });

    // 5. 测试 AccessControlDemo
    console.log("\n5. 测试 AccessControlDemo...\n");

    await test("onlyOwner 设置值", async () => {
        await accessControl.setAdminValue(100);
        const value = await accessControl.adminValue();
        if (value !== 100n) throw new Error("设置失败");
    });

    await test("非所有者不能设置", async () => {
        try {
            await accessControl.connect(user1).setAdminValue(999);
            throw new Error("应该被拒绝");
        } catch (e) {
            if (!e.message.includes("Ownable")) throw e;
        }
    });

    await test("公共函数正常", async () => {
        await accessControl.connect(user1).setPublicValue(200);
        const value = await accessControl.publicValue();
        if (value !== 200n) throw new Error("公共函数失败");
    });

    await test("暂停功能", async () => {
        await accessControl.pause();
        const paused = await accessControl.paused();
        if (!paused) throw new Error("暂停失败");
    });

    // 6. 测试 RandomNumberDemo
    console.log("\n6. 测试 RandomNumberDemo...\n");

    await test("timestamp 随机数", async () => {
        await randomNum.generateRandomWithTimestamp();
        const random = await randomNum.getUserRandomNumber(user1.address);
        if (random >= 100n) throw new Error("随机数超出范围");
    });

    await test("组合随机数", async () => {
        await randomNum.generateRandomWithCombination();
        const random = await randomNum.getUserRandomNumber(user1.address);
        if (random >= 100n) throw new Error("随机数超出范围");
    });

    // 7. 测试 ChainlinkVRFDemo
    console.log("\n7. 测试 ChainlinkVRFDemo...\n");

    await test("请求随机数", async () => {
        await vrf.requestRandomNumber();
    });

    await test("随机数范围", async () => {
        await vrf.requestRandomNumber();
        // requestCounter 从 0 开始，第一个请求的 ID 是 0
        const value = await vrf.getRandomValue(0, 10);
        if (value >= 10n) throw new Error("范围错误");
    });

    // 汇总
    console.log("\n===========================================");
    console.log("AI 自动化测试完成！");
    console.log("===========================================");
    console.log(`   ✅ 通过: ${passed}`);
    console.log(`   ❌ 失败: ${failed}`);
    console.log("===========================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("测试失败:", error);
        process.exit(1);
    });
