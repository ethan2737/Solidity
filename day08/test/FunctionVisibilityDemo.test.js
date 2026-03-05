const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FunctionVisibilityDemo", function () {
  let functionVisibilityDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FunctionVisibilityDemo = await ethers.getContractFactory("FunctionVisibilityDemo");
    functionVisibilityDemo = await FunctionVisibilityDemo.deploy();
    await functionVisibilityDemo.waitForDeployment();
  });

  describe("Public 函数（如题目要求）", function () {
    it("应该能够从外部调用 public 函数", async function () {
      await functionVisibilityDemo.publicFunction(100);
      const value = await functionVisibilityDemo.getPublicValue();
      expect(value).to.equal(100);
    });

    it("应该能够从内部调用 public 函数", async function () {
      // publicCallInternal() 内部调用 _internalFunction(100)，设置 internalValue = 100
      await functionVisibilityDemo.publicCallInternal();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[2]).to.equal(100);  // internalValue = 100
    });

    it("应该能够从 public 函数调用 internal 函数", async function () {
      await functionVisibilityDemo.publicCallInternal();
      // 验证 internal 函数被调用（通过事件或状态变化）
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[2]).to.equal(100);
    });

    it("应该能够从 public 函数调用 private 函数", async function () {
      await functionVisibilityDemo.publicCallPrivate();
      // 验证 private 函数被调用
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[1]).to.equal(200);
    });
  });

  describe("External 函数（如题目要求）", function () {
    it("应该能够从外部调用 external 函数", async function () {
      await functionVisibilityDemo.externalFunction(300);
      const value = await functionVisibilityDemo.getPublicValueExternal();
      expect(value).to.equal(300);
    });

    it("应该能够通过 this 从内部调用 external 函数", async function () {
      await functionVisibilityDemo.internalCallExternalViaThis();
      const value = await functionVisibilityDemo.getPublicValue();
      expect(value).to.equal(300);
    });
  });

  describe("Internal 函数（如题目要求）", function () {
    it("应该能够从 public 函数调用 internal 函数", async function () {
      await functionVisibilityDemo.callInternalFromPublic();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[2]).to.equal(400);
    });

    it("应该能够从 internal 函数调用另一个 internal 函数", async function () {
      await functionVisibilityDemo.callInternalChain();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[2]).to.equal(500);
    });
  });

  describe("Private 函数（如题目要求）", function () {
    it("应该能够从 public 函数调用 private 函数", async function () {
      await functionVisibilityDemo.callPrivateFromPublic();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[1]).to.equal(600);
    });

    it("应该能够从 private 函数调用另一个 private 函数", async function () {
      await functionVisibilityDemo.callPrivateChain();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[1]).to.equal(700);
    });
  });

  describe("函数调用组合", function () {
    it("应该能够调用函数链", async function () {
      await functionVisibilityDemo.callChain();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[2]).to.equal(800);
      expect(allValues[1]).to.equal(900);
    });

    it("应该能够调用所有类型的函数", async function () {
      // callAllTypes 依次调用:
      // 1. publicFunction(1000) -> publicValue = 1000
      // 2. _internalFunction(1100) -> internalValue = 1100
      // 3. _privateFunction(1200) -> privateValue = 1200
      // 4. this.externalFunction(1300) -> publicValue = 1300 (覆盖)
      await functionVisibilityDemo.callAllTypes();
      const allValues = await functionVisibilityDemo.getAllValues();
      expect(allValues[0]).to.equal(1300);  // publicValue 最终是 1300
      expect(allValues[2]).to.equal(1100);  // internalValue
      expect(allValues[1]).to.equal(1200);  // privateValue
    });
  });

  describe("访问控制", function () {
    it("应该允许 owner 调用 ownerOnlyFunction", async function () {
      await functionVisibilityDemo.ownerOnlyFunction();
      const value = await functionVisibilityDemo.getPublicValue();
      expect(value).to.equal(9999);
    });

    it("应该拒绝非 owner 调用 ownerOnlyFunction", async function () {
      await expect(
        functionVisibilityDemo.connect(addr1).ownerOnlyFunction()
      ).to.be.revertedWith("Only owner");
    });

    it("应该允许 owner 调用 ownerOnlyExternal", async function () {
      await functionVisibilityDemo.ownerOnlyExternal();
      const value = await functionVisibilityDemo.getPublicValue();
      expect(value).to.equal(8888);
    });
  });
});

