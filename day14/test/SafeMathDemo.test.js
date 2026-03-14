// SPDX-License-Identifier: MIT
/**
 * @title SafeMathDemo 测试
 * @notice 测试整数溢出防护功能
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SafeMathDemo", function () {
    let safeMath;
    let owner;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const SafeMathDemo = await ethers.getContractFactory("SafeMathDemo");
        safeMath = await SafeMathDemo.deploy();
        await safeMath.waitForDeployment();
    });

    describe("Solidity 0.8+ 内置溢出防护", () => {
        it("应该正确加法", async () => {
            await safeMath.addWithBuiltIn(100);
            const value = await safeMath.getValue();
            expect(value).to.equal(100);
        });

        it("应该正确减法", async () => {
            await safeMath.addWithBuiltIn(100);
            await safeMath.subtractWithBuiltIn(30);
            const value = await safeMath.getValue();
            expect(value).to.equal(70);
        });

        it("应该拒绝减法下溢", async () => {
            await expect(
                safeMath.subtractWithBuiltIn(100)
            ).to.be.reverted;
        });
    });

    describe("SafeMath 库", () => {
        it("应该正确使用 SafeMath 加法", async () => {
            await safeMath.addWithSafeMath(50);
            const balance = await safeMath.getBalance();
            expect(balance).to.equal(50);
        });

        it("应该正确使用 SafeMath 减法", async () => {
            await safeMath.addWithSafeMath(100);
            await safeMath.subtractWithSafeMath(30);
            const balance = await safeMath.getBalance();
            expect(balance).to.equal(70);
        });

        it("应该拒绝 SafeMath 减法下溢", async () => {
            await expect(
                safeMath.subtractWithSafeMath(100)
            ).to.be.revertedWith("SafeMath: 减法下溢");
        });
    });

    describe("unchecked 块", () => {
        it("应该正确执行 unchecked 加法", async () => {
            const result = await safeMath.uncheckedAdd(100, 50);
            expect(result).to.equal(150);
        });

        it("unchecked 块不检查溢出", async () => {
            const maxUint = ethers.MaxUint256;
            const result = await safeMath.uncheckedAdd(maxUint, 1);
            // 结果会溢出为0
            expect(result).to.equal(0);
        });
    });
});
