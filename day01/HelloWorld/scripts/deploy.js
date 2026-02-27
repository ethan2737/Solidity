const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);

    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const helloWorld = await HelloWorld.deploy("Hello, Hardhat Deployment!");

    await helloWorld.waitForDeployment();
    const address = await helloWorld.getAddress();

    console.log("✅ 合约部署成功！");
    console.log("合约地址:", address);
    console.log("初始消息:", await helloWorld.getMessage());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});