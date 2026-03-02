const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VariableTypes", function () {
  let variableTypes;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const VariableTypes = await ethers.getContractFactory("VariableTypes");
    variableTypes = await VariableTypes.deploy(1000);
    await variableTypes.waitForDeployment();
  });

  describe("布尔类型", function () {
    it("应该正确初始化布尔值", async function () {
      expect(await variableTypes.isActive()).to.equal(true);
    });

    it("应该能够设置布尔值", async function () {
      await variableTypes.setIsActive(false);
      expect(await variableTypes.isActive()).to.equal(false);
    });

    it("应该能够获取所有布尔值", async function () {
      const result = await variableTypes.getAllBooleans();
      expect(result._isActive).to.equal(true);
      expect(result._isLocked).to.equal(false);
      expect(result._isPaused).to.equal(false);
    });
  });

  describe("无符号整型 (uint)", function () {
    it("应该正确初始化 uint8", async function () {
      expect(await variableTypes.smallNumber()).to.equal(100);
    });

    it("应该能够设置 uint8", async function () {
      await variableTypes.setSmallNumber(200);
      expect(await variableTypes.smallNumber()).to.equal(200);
    });

    it("应该拒绝超过 uint8 限制的值", async function () {
      // ethers v6 会在编码时检查范围，抛出 TypeError
      await expect(
        variableTypes.setSmallNumber(256)
      ).to.be.rejectedWith(/value out-of-bounds|INVALID_ARGUMENT/);
    });

    it("应该正确初始化 uint256", async function () {
      expect(await variableTypes.largeNumber()).to.equal(1000000);
    });

    it("应该能够设置 uint256", async function () {
      const newValue = "1000000000000000000";
      await variableTypes.setLargeNumber(newValue);
      expect(await variableTypes.largeNumber()).to.equal(newValue);
    });

    it("应该能够获取所有无符号整数", async function () {
      const result = await variableTypes.getAllUints();
      expect(result._smallNumber).to.equal(100);
      expect(result._largeNumber).to.equal(1000000);
      expect(result._defaultUint).to.equal(42);
    });
  });

  describe("有符号整型 (int)", function () {
    it("应该正确初始化 int8", async function () {
      expect(await variableTypes.smallInt()).to.equal(-50);
    });

    it("应该能够设置 int8", async function () {
      await variableTypes.setSmallInt(100);
      expect(await variableTypes.smallInt()).to.equal(100);
    });

    it("应该能够设置负数", async function () {
      await variableTypes.setSmallInt(-100);
      expect(await variableTypes.smallInt()).to.equal(-100);
    });

    it("应该拒绝超出 int8 范围的值", async function () {
      // ethers v6 会在编码时检查范围，抛出 TypeError
      await expect(
        variableTypes.setSmallInt(128)
      ).to.be.rejectedWith(/value out-of-bounds|INVALID_ARGUMENT/);
    });

    it("应该能够设置 int256", async function () {
      const newValue = "-1000000000000000000";
      await variableTypes.setLargeInt(newValue);
      expect(await variableTypes.largeInt()).to.equal(newValue);
    });
  });

  describe("常量 (constant)", function () {
    it("应该能够读取常量", async function () {
      expect(await variableTypes.MAX_VALUE()).to.equal(1000000);
      expect(await variableTypes.IS_ENABLED()).to.equal(true);
    });

    it("应该能够获取所有常量", async function () {
      const result = await variableTypes.getConstants();
      expect(result._maxValue).to.equal(1000000);
      expect(result._isEnabled).to.equal(true);
    });
  });

  describe("不可变变量 (immutable)", function () {
    it("应该能够读取 immutable 变量", async function () {
      expect(await variableTypes.INITIAL_VALUE()).to.equal(1000);
    });
  });

  describe("私有变量访问", function () {
    it("应该能够通过函数访问私有变量", async function () {
      const secretNumber = await variableTypes.getSecretNumber();
      expect(secretNumber).to.equal(999);
    });

    it("应该能够通过函数设置私有变量", async function () {
      await variableTypes.setSecretNumber(1234);
      const newSecretNumber = await variableTypes.getSecretNumber();
      expect(newSecretNumber).to.equal(1234);
    });
  });

  describe("纯函数 (pure)", function () {
    it("应该能够执行纯函数", async function () {
      const result = await variableTypes.add(10, 20);
      expect(result).to.equal(30);
    });

    it("应该能够比较布尔值", async function () {
      expect(await variableTypes.compareBooleans(true, true)).to.equal(true);
      expect(await variableTypes.compareBooleans(true, false)).to.equal(false);
    });
  });

  describe("类型转换", function () {
    it("应该能够转换 uint8 到 uint256", async function () {
      const result = await variableTypes.convertUint8ToUint256(255);
      expect(result).to.equal(255);
    });

    it("应该能够转换 uint256 到 uint8", async function () {
      const result = await variableTypes.convertUint256ToUint8(200);
      expect(result).to.equal(200);
    });

    it("应该拒绝超出 uint8 范围的转换", async function () {
      await expect(
        variableTypes.convertUint256ToUint8(256)
      ).to.be.revertedWith("Value too large for uint8");
    });

    it("应该能够转换正数 int 到 uint", async function () {
      const result = await variableTypes.convertIntToUint(100);
      expect(result).to.equal(100);
    });

    it("应该拒绝负数转 uint", async function () {
      await expect(
        variableTypes.convertIntToUint(-100)
      ).to.be.revertedWith("Cannot convert negative to uint");
    });
  });
});

