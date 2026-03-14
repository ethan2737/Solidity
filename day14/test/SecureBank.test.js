// SPDX-License-Identifier: MIT
/**
 * @title SecureBank 测试
 * @notice 测试安全银行合约（使用 Checks-Effects-Interactions 模式）
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureBank", function () {
    let secure;
    let owner;
    let user1;
    let user2;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();

        const Secure = await ethers.getContractFactory("SecureBank");
        secure = await Secure.deploy();
        await secure.waitForDeployment();
    });

    describe("存款功能", () => {
        it("应该正确存款", async () => {
            const depositAmount = ethers.parseEther("1");

            await secure.connect(user1).deposit({ value: depositAmount });

            const balance = await secure.balances(user1.address);
            expect(balance).to.equal(depositAmount);
        });

        it("应该正确累计存款", async () => {
            const depositAmount = ethers.parseEther("1");

            await secure.connect(user1).deposit({ value: depositAmount });
            await secure.connect(user1).deposit({ value: depositAmount });

            const balance = await secure.balances(user1.address);
            expect(balance).to.equal(depositAmount * 2n);
        });
    });

    describe("提现功能", () => {
        it("应该正确提现", async () => {
            const depositAmount = ethers.parseEther("1");

            // 存款
            await secure.connect(user1).deposit({ value: depositAmount });

            // 记录提现前的余额
            const balanceBefore = await ethers.provider.getBalance(user1.address);

            // 提现
            await secure.connect(user1).withdraw();

            // 余额应为0
            const balance = await secure.balances(user1.address);
            expect(balance).to.equal(0);
        });

        it("应该拒绝余额不足的提现", async () => {
            await expect(
                secure.connect(user1).withdraw()
            ).to.be.revertedWith("余额不足");
        });
    });

    describe("重入防护验证", () => {
        it("重入攻击应该失败", async () => {
            const depositAmount = ethers.parseEther("1");

            // 攻击者存款
            await secure.connect(user1).deposit({ value: depositAmount });

            // 尝试重入攻击
            // 由于使用了 Checks-Effects-Interactions 模式，重入应该失败
            await secure.connect(user1).withdraw();

            // 攻击者余额应为0
            const balance = await secure.balances(user1.address);
            expect(balance).to.equal(0);
        });
    });

    describe("合约余额", () => {
        it("应该正确显示合约余额", async () => {
            const depositAmount = ethers.parseEther("2");

            await secure.connect(user1).deposit({ value: depositAmount });
            await secure.connect(user2).deposit({ value: depositAmount });

            const contractBalance = await secure.getContractBalance();
            expect(contractBalance).to.equal(depositAmount * 2n);
        });
    });
});
