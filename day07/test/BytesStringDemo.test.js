const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BytesStringDemo", function () {
  let bytesStringDemo;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const BytesStringDemo = await ethers.getContractFactory("BytesStringDemo");
    bytesStringDemo = await BytesStringDemo.deploy();
    await bytesStringDemo.waitForDeployment();
  });

  describe("bytes 操作", function () {
    it("应该能够设置动态 bytes", async function () {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f"); // "Hello"
      const bytes = await bytesStringDemo.getDynamicBytes();
      expect(bytes).to.equal("0x48656c6c6f");
    });

    it("应该能够获取 bytes 长度", async function () {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f");
      const length = await bytesStringDemo.getDynamicBytesLength();
      expect(length).to.equal(5);
    });

    it("应该能够 push 字节", async function () {
      await bytesStringDemo.setDynamicBytes("0x4865");
      await bytesStringDemo.pushByte(0x6c);
      const length = await bytesStringDemo.getDynamicBytesLength();
      expect(length).to.equal(3);
    });

    it("应该能够 pop 字节", async function () {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f");
      await bytesStringDemo.popByte();
      const length = await bytesStringDemo.getDynamicBytesLength();
      expect(length).to.equal(4);
    });

    it("应该能够获取指定索引的字节", async function () {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f");
      const byte = await bytesStringDemo.getByte(0);
      expect(byte).to.equal("0x48");
    });
  });

  describe("string 操作", function () {
    it("应该能够设置字符串", async function () {
      await bytesStringDemo.setString("Hello");
      const str = await bytesStringDemo.getString();
      expect(str).to.equal("Hello");
    });

    it("应该能够获取字符串长度", async function () {
      await bytesStringDemo.setString("Hello");
      const length = await bytesStringDemo.getStringLength();
      expect(length).to.equal(5);
    });

    it("应该能够添加字符串到数组", async function () {
      await bytesStringDemo.pushString("Hello");
      await bytesStringDemo.pushString("World");
      
      const array = await bytesStringDemo.getStringArray();
      expect(array.length).to.equal(2);
      expect(array[0]).to.equal("Hello");
      expect(array[1]).to.equal("World");
    });
  });

  describe("bytes 和 string 转换", function () {
    it("应该能够将 string 转换为 bytes", async function () {
      const bytes = await bytesStringDemo.stringToBytes("Hello");
      expect(bytes).to.equal("0x48656c6c6f");
    });

    it("应该能够将 bytes 转换为 string", async function () {
      const str = await bytesStringDemo.bytesToString("0x48656c6c6f");
      expect(str).to.equal("Hello");
    });
  });

  describe("切片操作", function () {
    it("应该能够获取 bytes 切片", async function () {
      await bytesStringDemo.setDynamicBytes("0x48656c6c6f");
      const slice = await bytesStringDemo.getBytesSlice(0, 3);
      expect(slice).to.equal("0x48656c");
    });

    it("应该能够获取 string 切片", async function () {
      await bytesStringDemo.setString("Hello");
      const slice = await bytesStringDemo.getStringSlice(0, 3);
      expect(slice).to.equal("Hel");
    });

    it("应该能够获取字符串前缀", async function () {
      await bytesStringDemo.setString("Hello");
      const prefix = await bytesStringDemo.getStringPrefix(3);
      expect(prefix).to.equal("Hel");
    });

    it("应该能够获取字符串后缀", async function () {
      await bytesStringDemo.setString("Hello");
      const suffix = await bytesStringDemo.getStringSuffix(3);
      expect(suffix).to.equal("llo");
    });
  });

  describe("字符串搜索", function () {
    it("应该能够检查是否包含子字符串", async function () {
      const contains = await bytesStringDemo.containsSubstring("Hello World", "World");
      expect(contains).to.equal(true);
    });

    it("应该能够查找子字符串位置", async function () {
      const position = await bytesStringDemo.findSubstring("Hello World", "World");
      expect(position).to.equal(6);
    });
  });
});

