// SPDX-License-Identifier: MIT
/**
 * @title ReentrancyVulnerable 测试
 * @notice 测试重入攻击漏洞合约
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReentrancyVulnerable", function () {
    let vulnerable;
    let owner;
    let attacker;

    beforeEach(async () => {
        [owner, attacker] = await ethers.getSigners();

        const Vulnerable = await ethers.getContractFactory("ReentrancyVulnerable");
        vulnerable = await Vulnerable.deploy();
        await vulnerable.waitForDeployment();
    });

    // 测试存款功能
    describe("存款功能", () => {
        it("应该正确存款", async () => {
            const depositAmount = ethers.parseEther("1");

            await vulnerable.deposit({ value: depositAmount });

            const balance = await vulnerable.balances(owner.address);
            expect(balance).to.equal(depositAmount);
        });

        it("应该拒绝零存款", async () => {
            await expect(
                vulnerable.deposit({ value: 0 })
            ).to.be.revertedWith("存款金额必须大于0");
        });
    });

    // 测试提现功能
    describe("提现功能", () => {
        it("应该正确提现", async () => {
            const depositAmount = ethers.parseEther("1");

            // 存款
            await vulnerable.deposit({ value: depositAmount });

            // 提现
            await vulnerable.withdraw();

            const balance = await vulnerable.balances(owner.address);
            expect(balance).to.equal(0);
        });

        it("应该拒绝余额不足的提现", async () => {
            await expect(
                vulnerable.withdraw()
            ).to.be.revertedWith("余额不足");
        });
    });

    // 测试重入攻击（演示漏洞）
    describe("重入攻击演示", () => {
        it("演示重入攻击", async () => {
            const depositAmount = ethers.parseEther("1");

            // 攻击者存款
            await vulnerable.connect(attacker).deposit({ value: depositAmount });

            // 攻击者尝试提现（会触发重入）
            // 注意：这里只是演示，实际攻击需要恶意合约
            await vulnerable.connect(attacker).withdraw();

            // 攻击者余额应为0
            const balance = await vulnerable.balances(attacker.address);
            expect(balance).to.equal(0);
        });
    });
});
