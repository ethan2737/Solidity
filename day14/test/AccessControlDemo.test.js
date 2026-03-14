// SPDX-License-Identifier: MIT
/**
 * @title AccessControlDemo 测试
 * @notice 测试访问控制功能
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControlDemo", function () {
    let accessControl;
    let owner;
    let user1;
    let user2;

    beforeEach(async () => {
        [owner, user1, user2] = await ethers.getSigners();

        const AccessControlDemo = await ethers.getContractFactory("AccessControlDemo");
        accessControl = await AccessControlDemo.deploy(owner.address);
        await accessControl.waitForDeployment();
    });

    describe("onlyOwner 修饰符", () => {
        it("所有者应该能设置 adminValue", async () => {
            await accessControl.setAdminValue(100);
            expect(await accessControl.adminValue()).to.equal(100);
        });

        it("非所有者不应该能设置 adminValue", async () => {
            await expect(
                accessControl.connect(user1).setAdminValue(100)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("所有者应该能调用 pause", async () => {
            await accessControl.pause();
            expect(await accessControl.paused()).to.equal(true);
        });

        it("非所有者不应该能调用 pause", async () => {
            await expect(
                accessControl.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("公共函数", () => {
        it("所有人应该能设置 publicValue", async () => {
            await accessControl.connect(user1).setPublicValue(200);
            expect(await accessControl.publicValue()).to.equal(200);
        });

        it("暂停后公共函数应该被阻止", async () => {
            await accessControl.pause();

            await expect(
                accessControl.connect(user1).setPublicValue(300)
            ).to.be.revertedWith("合约已暂停");
        });

        it("恢复后公共函数应该正常工作", async () => {
            await accessControl.pause();
            await accessControl.unpause();

            await accessControl.connect(user1).setPublicValue(300);
            expect(await accessControl.publicValue()).to.equal(300);
        });
    });

    describe("紧急提取", () => {
        it("所有者应该能提取资金", async () => {
            // 先存入一些 ETH
            await owner.sendTransaction({
                to: await accessControl.getAddress(),
                value: ethers.parseEther("1")
            });

            const balanceBefore = await ethers.provider.getBalance(user1.address);

            // 提取
            await accessControl.emergencyWithdraw(user1.address, ethers.parseEther("0.5"));

            const balanceAfter = await ethers.provider.getBalance(user1.address);
            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("非所有者不应该能提取资金", async () => {
            await expect(
                accessControl.connect(user1).emergencyWithdraw(user1.address, 100)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("接收 ETH", () => {
        it("合约应该能接收 ETH", async () => {
            const balanceBefore = await ethers.provider.getBalance(await accessControl.getAddress());

            await owner.sendTransaction({
                to: await accessControl.getAddress(),
                value: ethers.parseEther("1")
            });

            const balanceAfter = await ethers.provider.getBalance(await accessControl.getAddress());
            expect(balanceAfter).to.equal(balanceBefore + ethers.parseEther("1"));
        });
    });
});
