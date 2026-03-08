// SPDX-License-Identifier: MIT
/**
 * @title Deploy Script
 * @notice 部署 CompleteDemo 合约的脚本
 */
const hre = require("hardhat");

async function main() {
    console.log("========================================");
    console.log("开始部署 CompleteDemo 合约...");
    console.log("========================================\n");

    // 获取签名者
    const [deployer, treasury] = await hre.ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("国库地址:", treasury.address);

    // 部署参数
    const tokenName = "CompleteDemo";
    const tokenSymbol = "CDM";
    const initialSupply = 100; // 使用简单数字

    console.log("\n部署参数:");
    console.log("- 代币名称:", tokenName);
    console.log("- 代币符号:", tokenSymbol);
    console.log("- 初始供应量:", initialSupply, "CDM");
    console.log("");

    // 部署合约
    const CompleteDemo = await hre.ethers.getContractFactory("CompleteDemo");
    const contract = await CompleteDemo.deploy(
        tokenName,
        tokenSymbol,
        treasury.address,
        initialSupply
    );

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("========================================");
    console.log("合约部署成功！");
    console.log("========================================");
    console.log("合约地址:", contractAddress);
    console.log("");

    // 打印合约信息
    console.log("合约信息:");
    console.log("- 代币名称:", await contract.name());
    console.log("- 代币符号:", await contract.symbol());
    console.log("- 总供应量:", (await contract.totalSupply()).toString());
    console.log("- 部署者余额:", (await contract.balanceOf(deployer.address)).toString());
    console.log("");

    // 打印常量
    console.log("Constant 常量:");
    console.log("- DECIMALS:", await contract.DECIMALS());
    console.log("- TOTAL_SUPPLY:", (await contract.TOTAL_SUPPLY()).toString());
    console.log("- BURN_ADDRESS:", await contract.BURN_ADDRESS());
    console.log("");

    // 打印不可变量
    console.log("Immutable 变量:");
    console.log("- owner:", await contract.owner());
    console.log("- treasury:", await contract.treasury());
    const launchTs = await contract.launchDate();
    console.log("- launchDate:", new Date(Number(launchTs) * 1000).toLocaleString());
    console.log("");

    // 验证部署
    console.log("========================================");
    console.log("验证部署...");
    console.log("========================================");

    const code = await hre.ethers.provider.getCode(contractAddress);
    console.log("合约字节码长度:", (code.length - 2) / 2, "bytes");

    if ((code.length - 2) / 2 > 24576) {
        console.log("警告: 字节码超过 24KB 限制！");
    } else {
        console.log("✓ 字节码大小正常（< 24KB）");
    }

    console.log("\n========================================");
    console.log("部署完成！");
    console.log("========================================\n");

    // 等待一段时间，确保区块确认
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 如果是测试网络，尝试验证合约
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [
                    tokenName,
                    tokenSymbol,
                    treasury.address,
                    initialSupply
                ]
            });
            console.log("合约验证成功！");
        } catch (error) {
            console.log("合约验证失败:", error.message);
        }
    }
}

// 错误处理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    });
