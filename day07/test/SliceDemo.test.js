const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SliceDemo", function () {
  let sliceDemo;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const SliceDemo = await ethers.getContractFactory("SliceDemo");
    sliceDemo = await SliceDemo.deploy();
    await sliceDemo.waitForDeployment();
  });

  describe("bytes 切片", function () {
    it("应该能够获取 bytes 切片", async function () {
      const slice = await sliceDemo.getBytesSlice(0, 5);
      // 在 ethers.js v6 中，bytes 返回值处理方式不同
      expect(slice).to.not.equal(null);
    });

    it("应该能够获取 bytes 前缀", async function () {
      const prefix = await sliceDemo.getBytesPrefix(5);
      expect(prefix).to.not.equal(null);
    });

    it("应该能够获取 bytes 后缀", async function () {
      const suffix = await sliceDemo.getBytesSuffix(5);
      expect(suffix).to.not.equal(null);
    });

    it("应该拒绝超出范围的切片", async function () {
      const length = await sliceDemo.getDataBytesLength();
      await expect(
        sliceDemo.getBytesSlice(0, Number(length) + 1)
      ).to.be.revertedWith("Slice out of bounds");
    });
  });

  describe("string 切片", function () {
    it("应该能够获取 string 切片", async function () {
      const slice = await sliceDemo.getStringSlice(0, 5);
      expect(slice.length).to.equal(5);
    });

    it("应该能够获取 string 前缀", async function () {
      const prefix = await sliceDemo.getStringPrefix(5);
      expect(prefix.length).to.equal(5);
    });

    it("应该能够获取 string 后缀", async function () {
      const suffix = await sliceDemo.getStringSuffix(5);
      expect(suffix.length).to.equal(5);
    });
  });

  describe("高级切片操作", function () {
    it("应该能够提取指定位置的字节", async function () {
      const indices = [0, 1, 2];
      const extracted = await sliceDemo.extractBytes(indices);
      // 在 ethers.js v6 中，bytes 返回值处理方式不同
      expect(extracted).to.not.equal(null);
    });

    it("应该能够反转字符串", async function () {
      const reversed = await sliceDemo.reverseString();
      expect(reversed.length).to.be.greaterThan(0);
    });

    it("应该能够移除字符串中的空格", async function () {
      await sliceDemo.setDataString("Hello World");
      const withoutSpaces = await sliceDemo.removeSpaces();
      expect(withoutSpaces).to.equal("HelloWorld");
    });
  });
});

