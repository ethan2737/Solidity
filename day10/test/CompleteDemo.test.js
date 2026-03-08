// SPDX-License-Identifier: MIT

/**
 * @title CompleteDemoTest
 * @notice CompleteDemo 合约的测试套件
 * @dev 测试构造函数、constant、immutable、receive、fallback 等功能
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CompleteDemo", function () {
    // 测试账户
    let owner;
    let addr1;
    let addr2;
    let treasury;

    // 合约实例
    let completeDemo;

    // 部署参数 - 使用小数字避免精度问题
    const TOKEN_NAME = "CompleteDemo";
    const TOKEN_SYMBOL = "CDM";
    const INITIAL_SUPPLY = 100; // 简单数字

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2, treasury] = await ethers.getSigners();

        // 部署合约
        const CompleteDemo = await ethers.getContractFactory("CompleteDemo");
        const contract = await CompleteDemo.deploy(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            treasury.address,
            INITIAL_SUPPLY
        );
        await contract.waitForDeployment();
        completeDemo = contract;
    });

    describe("构造函数测试", function () {
        it("应该正确设置代币名称", async function () {
            expect(await completeDemo.name()).to.equal(TOKEN_NAME);
        });

        it("应该正确设置代币符号", async function () {
            expect(await completeDemo.symbol()).to.equal(TOKEN_SYMBOL);
        });

        it("应该正确设置 owner（immutable）", async function () {
            expect(await completeDemo.owner()).to.equal(owner.address);
        });

        it("应该正确设置 treasury（immutable）", async function () {
            expect(await completeDemo.treasury()).to.equal(treasury.address);
        });

        it("应该正确设置 launchDate（immutable）", async function () {
            const launchDate = await completeDemo.launchDate();
            expect(launchDate).to.be.gt(0);
        });

        it("应该正确设置初始供应量", async function () {
            expect(await completeDemo.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("应该正确分配初始代币给部署者", async function () {
            expect(await completeDemo.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });
    });

    describe("Constant 常量测试", function () {
        it("应该正确返回 DECIMALS", async function () {
            expect(await completeDemo.DECIMALS()).to.equal(18);
        });

        it("应该正确返回 BURN_ADDRESS", async function () {
            expect(await completeDemo.BURN_ADDRESS()).to.equal("0x000000000000000000000000000000000000dEaD");
        });
    });

    describe("代币转账测试", function () {
        it("应该能够转账", async function () {
            const amount = 10;
            await completeDemo.connect(owner).transfer(addr1.address, amount);

            expect(await completeDemo.balanceOf(addr1.address)).to.equal(amount);
            expect(await completeDemo.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
        });

        it("余额不足时应该 revert", async function () {
            const amount = INITIAL_SUPPLY + 1;
            await expect(
                completeDemo.connect(owner).transfer(addr1.address, amount)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("转账到零地址时应该 revert", async function () {
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            await expect(
                completeDemo.connect(owner).transfer(zeroAddress, 100)
            ).to.be.revertedWith("Invalid address");
        });
    });

    describe("铸造和燃烧测试", function () {
        it("owner 应该能够铸造代币", async function () {
            const mintAmount = 50;
            await completeDemo.connect(owner).mint(addr1.address, mintAmount);

            expect(await completeDemo.balanceOf(addr1.address)).to.equal(mintAmount);
            expect(await completeDemo.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
        });

        it("非 owner 铸造应该 revert", async function () {
            await expect(
                completeDemo.connect(addr1).mint(addr1.address, 1000)
            ).to.be.revertedWith("Only owner");
        });

        it("应该能够燃烧代币", async function () {
            const burnAmount = 20;
            await completeDemo.connect(owner).burn(burnAmount);

            expect(await completeDemo.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - burnAmount);
            expect(await completeDemo.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
        });
    });

    describe("查询功能测试", function () {
        it("getContractInfo 应该返回正确信息", async function () {
            const info = await completeDemo.getContractInfo();

            expect(info._name).to.equal(TOKEN_NAME);
            expect(info._symbol).to.equal(TOKEN_SYMBOL);
            expect(info._totalSupply).to.equal(INITIAL_SUPPLY);
            expect(info._owner).to.equal(owner.address);
            expect(info._treasury).to.equal(treasury.address);
            expect(info._launchDate).to.be.gt(0);
        });

        it("getContractBalance 应该返回正确初始余额", async function () {
            expect(await completeDemo.getContractBalance()).to.equal(0);
        });
    });
});
