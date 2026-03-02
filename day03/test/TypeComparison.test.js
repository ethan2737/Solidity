const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TypeComparison", function () {
  let typeComparison;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const TypeComparison = await ethers.getContractFactory("TypeComparison");
    typeComparison = await TypeComparison.deploy();
    await typeComparison.waitForDeployment();
  });

  describe("类型范围", function () {
    it("应该正确设置 uint8 的最大值", async function () {
      const max = await typeComparison.uint8Max();
      expect(max).to.equal(255);
    });

    it("应该正确设置 uint8 的最小值", async function () {
      const min = await typeComparison.uint8Min();
      expect(min).to.equal(0);
    });

    it("应该能够获取类型最大值", async function () {
      const result = await typeComparison.getTypeMax();
      expect(result.maxUint8).to.equal(255);
      // 检查 uint256 最大值：2^256 - 1
      expect(result.maxUint256.toString()).to.equal("115792089237316195423570985008687907853269984665640564039457584007913129639935");
      expect(result.maxInt8).to.equal(127);
      // 检查 int256 最大值：2^255 - 1
      expect(result.maxInt256.toString()).to.equal("57896044618658097711785492504343953926634992332820282019728792003956564819967");
    });

    it("应该能够获取类型最小值", async function () {
      const result = await typeComparison.getTypeMin();
      expect(result.minInt8).to.equal(-128);
      // 检查 int256 最小值：-2^255
      expect(result.minInt256.toString()).to.equal("-57896044618658097711785492504343953926634992332820282019728792003956564819968");
    });
  });

  describe("默认值", function () {
    it("布尔值默认应该是 false", async function () {
      expect(await typeComparison.defaultBool()).to.equal(false);
    });

    it("uint 默认应该是 0", async function () {
      expect(await typeComparison.defaultUint()).to.equal(0);
    });

    it("int 默认应该是 0", async function () {
      expect(await typeComparison.defaultInt()).to.equal(0);
    });

    it("应该能够获取所有默认值", async function () {
      const result = await typeComparison.getDefaults();
      expect(result._bool).to.equal(false);
      expect(result._uint).to.equal(0);
      expect(result._int).to.equal(0);
    });
  });

  describe("可见性对比", function () {
    it("应该能够访问 public 变量", async function () {
      const publicVar = await typeComparison.publicVar();
      expect(publicVar).to.equal(100);
    });

    it("应该能够通过函数访问 private 变量", async function () {
      const result = await typeComparison.demonstrateVisibility();
      expect(result._public).to.equal(100);
      expect(result._private).to.equal(200);
      expect(result._internal).to.equal(300);
    });
  });

  describe("溢出检查", function () {
    it("应该能够安全地相加两个 uint8", async function () {
      const result = await typeComparison.safeAdd(100, 50);
      expect(result).to.equal(150);
    });

    it("应该拒绝 uint8 溢出", async function () {
      // Solidity 0.8+ 会自动检查溢出
      await expect(
        typeComparison.safeAdd(200, 100)
      ).to.be.reverted; // 会 revert，因为溢出
    });
  });
});

