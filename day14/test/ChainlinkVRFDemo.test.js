// SPDX-License-Identifier: MIT
/**
 * @title ChainlinkVRFDemo 测试
 * @notice 测试 Chainlink VRF 随机数生成
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainlinkVRFDemo", function () {
    let vrf;
    let owner;
    const VRF_COORDINATOR = "0x8103B0A293A8c2bD1f5D4f0f0cF8C2c0d1a5b3C7";
    const KEY_HASH = "0xd89b2bf150e3b9e13446986e571fb9cab24b13c63de35e6ed52000000000000";
    const FEE = ethers.parseEther("0.01");

    beforeEach(async () => {
        [owner] = await ethers.getSigners();

        const ChainlinkVRFDemo = await ethers.getContractFactory("ChainlinkVRFDemo");
        vrf = await ChainlinkVRFDemo.deploy(VRF_COORDINATOR, KEY_HASH, FEE);
        await vrf.waitForDeployment();
    });

    describe("请求随机数", () => {
        it("应该能请求随机数", async () => {
            const tx = await vrf.requestRandomNumber();
            const receipt = await tx.wait();

            // 检查事件
            const requestEvent = receipt.logs.find(log => {
                try {
                    return log.fragment && log.fragment.name === "RandomNumberRequested";
                } catch {
                    return false;
                }
            });
            expect(requestEvent).to.not.be.undefined;
        });

        it("请求后随机数应该完成", async () => {
            const requestId = await vrf.requestRandomNumber();
            const requestIdNum = requestId;

            const [fulfilled, randomNumber] = await vrf.getRandomNumber(requestIdNum);
            expect(fulfilled).to.equal(true);
            expect(randomNumber).to.be.gt(0);
        });
    });

    describe("随机数范围", () => {
        it("getRandomValue 应该在范围内", async () => {
            const requestId = await vrf.requestRandomNumber();
            const requestIdNum = requestId;

            const randomValue = await vrf.getRandomValue(requestIdNum, 10);
            expect(randomValue).to.be.lt(10);
        });

        it("getRandomValueInRange 应该在范围内", async () => {
            const requestId = await vrf.requestRandomNumber();
            const requestIdNum = requestId;

            const randomValue = await vrf.getRandomValueInRange(requestIdNum, 100, 200);
            expect(randomValue).to.be.gte(100);
            expect(randomValue).to.be.lt(200);
        });
    });

    describe("错误处理", () => {
        it("应该拒绝 maxValue 为 0", async () => {
            const requestId = await vrf.requestRandomNumber();
            const requestIdNum = requestId;

            await expect(
                vrf.getRandomValue(requestIdNum, 0)
            ).to.be.revertedWith("最大值必须大于0");
        });

        it("应该拒绝 maxValue <= minValue", async () => {
            const requestId = await vrf.requestRandomNumber();
            const requestIdNum = requestId;

            await expect(
                vrf.getRandomValueInRange(requestIdNum, 100, 100)
            ).to.be.revertedWith("最大值必须大于最小值");
        });
    });
});
