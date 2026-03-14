// SPDX-License-Identifier: MIT
/**
 * @title RandomNumberDemo 测试
 * @notice 测试不安全的随机数生成
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RandomNumberDemo", function () {
    let randomNum;
    let owner;
    let user1;

    beforeEach(async () => {
        [owner, user1] = await ethers.getSigners();

        const RandomNumberDemo = await ethers.getContractFactory("RandomNumberDemo");
        randomNum = await RandomNumberDemo.deploy();
        await randomNum.waitForDeployment();
    });

    describe("blockhash 随机数", () => {
        it("应该生成随机数", async () => {
            const tx = await randomNum.generateRandomWithBlockhash();
            await tx.wait();

            const random = await randomNum.getUserRandomNumber(owner.address);
            expect(random).to.be.lt(100);
        });
    });

    describe("timestamp 随机数", () => {
        it("应该生成随机数", async () => {
            const tx = await randomNum.generateRandomWithTimestamp();
            await tx.wait();

            const random = await randomNum.getUserRandomNumber(owner.address);
            expect(random).to.be.lt(100);
        });
    });

    describe("prevrandao 随机数", () => {
        it("应该生成随机数", async () => {
            const tx = await randomNum.generateRandomWithPrevRandao();
            await tx.wait();

            const random = await randomNum.getUserRandomNumber(owner.address);
            expect(random).to.be.lt(100);
        });
    });

    describe("组合随机数", () => {
        it("应该生成随机数", async () => {
            await randomNum.generateRandomWithCombination();
            const random = await randomNum.getUserRandomNumber(owner.address);
            expect(random).to.be.lt(100);
        });

        it("nonce 应该递增", async () => {
            const nonce1 = await randomNum.nonce();
            await randomNum.generateRandomWithCombination();
            const nonce2 = await randomNum.nonce();
            expect(nonce2).to.equal(nonce1 + 1n);
        });
    });

    describe("随机数范围", () => {
        it("随机数应该在 0-99 范围内", async () => {
            for (let i = 0; i < 5; i++) {
                await randomNum.generateRandomWithTimestamp();
                const random = await randomNum.getUserRandomNumber(owner.address);
                expect(random).to.be.lt(100);
            }
        });
    });
});
