const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FunctionCallDemo", function () {
  let functionCallDemo;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const FunctionCallDemo = await ethers.getContractFactory("FunctionCallDemo");
    functionCallDemo = await FunctionCallDemo.deploy();
    await functionCallDemo.waitForDeployment();
  });

  describe("内部调用", function () {
    it("应该能够进行内部调用", async function () {
      await functionCallDemo.makeInternalCall(100);
      const value = await functionCallDemo.value();
      expect(value).to.equal(100);
    });

    it("应该能够从 public 函数内部调用另一个 public 函数", async function () {
      await functionCallDemo.internalCallPublic(200);
      const value = await functionCallDemo.value();
      expect(value).to.equal(200);
    });

    it("应该能够进行内部调用链", async function () {
      await functionCallDemo.internalCallChain();
      const callCounts = await functionCallDemo.getCallCounts();
      expect(callCounts.internalCount).to.equal(3);
    });
  });

  describe("外部调用", function () {
    it("应该能够通过 this 调用 external 函数", async function () {
      await functionCallDemo.makeExternalCallViaThis(300);
      const value = await functionCallDemo.value();
      expect(value).to.equal(300);
    });

    it("应该能够通过 this 调用 public 函数", async function () {
      await functionCallDemo.makeExternalCallPublic(400);
      const value = await functionCallDemo.value();
      expect(value).to.equal(400);
    });

    it("应该能够进行外部调用链", async function () {
      await functionCallDemo.externalCallChain();
      const callCounts = await functionCallDemo.getCallCounts();
      expect(callCounts.externalCount).to.equal(3);
    });
  });

  describe("调用其他合约", function () {
    it("应该能够调用其他合约的函数", async function () {
      // 部署另一个合约实例
      const FunctionCallDemo2 = await ethers.getContractFactory("FunctionCallDemo");
      const functionCallDemo2 = await FunctionCallDemo2.deploy();
      await functionCallDemo2.waitForDeployment();

      // 使用 getAddress() 获取合约地址
      await functionCallDemo.callOtherContract(await functionCallDemo2.getAddress(), 500);
      const value = await functionCallDemo2.value();
      expect(value).to.equal(500);
    });
  });

  describe("递归调用", function () {
    it("应该能够进行递归调用", async function () {
      await functionCallDemo.recursiveCall(0);
      // 验证递归调用完成（通过事件）
    });

    it("应该能够进行外部递归调用", async function () {
      await functionCallDemo.recursiveExternalCall(0);
      // 验证外部递归调用完成
    });
  });
});

