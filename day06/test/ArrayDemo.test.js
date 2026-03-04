const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArrayDemo", function () {
  let arrayDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ArrayDemo = await ethers.getContractFactory("ArrayDemo");
    arrayDemo = await ArrayDemo.deploy();
    await arrayDemo.deployed();
  });

  describe("固定长度数组", function () {
    it("应该正确初始化固定数组", async function () {
      const length = await arrayDemo.getFixedArrayLength();
      expect(length).to.equal(5);
    });

    it("应该能够设置和获取固定数组元素", async function () {
      await arrayDemo.setFixedArrayElement(0, 100);
      const value = await arrayDemo.getFixedArrayElement(0);
      expect(value).to.equal(100);
    });

    it("应该拒绝超出范围的索引", async function () {
      await expect(
        arrayDemo.setFixedArrayElement(5, 100)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("应该能够设置地址数组元素", async function () {
      await arrayDemo.setAddressArrayElement(0, addr1.address);
      const address = await arrayDemo.addressArray(0);
      expect(address).to.equal(addr1.address);
    });
  });

  describe("动态数组操作", function () {
    it("应该能够 push 元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      const length = await arrayDemo.getDynamicArrayLength();
      expect(length).to.equal(1);
    });

    it("应该能够获取 push 的元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      const value = await arrayDemo.getDynamicArrayElement(0);
      expect(value).to.equal(100);
    });

    it("应该能够 push 多个元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      await arrayDemo.pushToDynamicArray(300);
      
      const length = await arrayDemo.getDynamicArrayLength();
      expect(length).to.equal(3);
      
      expect(await arrayDemo.getDynamicArrayElement(0)).to.equal(100);
      expect(await arrayDemo.getDynamicArrayElement(1)).to.equal(200);
      expect(await arrayDemo.getDynamicArrayElement(2)).to.equal(300);
    });

    it("应该能够 pop 元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      
      await arrayDemo.popFromDynamicArray();
      const length = await arrayDemo.getDynamicArrayLength();
      expect(length).to.equal(1);
    });

    it("应该拒绝从空数组 pop", async function () {
      await expect(
        arrayDemo.popFromDynamicArray()
      ).to.be.revertedWith("Array is empty");
    });

    it("应该能够获取所有元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      
      const allElements = await arrayDemo.getAllDynamicArrayElements();
      expect(allElements.length).to.equal(2);
      expect(allElements[0]).to.equal(100);
      expect(allElements[1]).to.equal(200);
    });
  });

  describe("地址数组", function () {
    it("应该能够 push 地址", async function () {
      await arrayDemo.pushAddress(addr1.address);
      const addresses = await arrayDemo.getAllAddresses();
      expect(addresses.length).to.equal(1);
      expect(addresses[0]).to.equal(addr1.address);
    });

    it("应该拒绝零地址", async function () {
      await expect(
        arrayDemo.pushAddress(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("字符串数组", function () {
    it("应该能够 push 字符串", async function () {
      await arrayDemo.pushString("Hello");
      await arrayDemo.pushString("World");
      
      const strings = await arrayDemo.getAllStrings();
      expect(strings.length).to.equal(2);
      expect(strings[0]).to.equal("Hello");
      expect(strings[1]).to.equal("World");
    });
  });

  describe("数组修改", function () {
    it("应该能够更新元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.updateElement(0, 200);
      
      const value = await arrayDemo.getDynamicArrayElement(0);
      expect(value).to.equal(200);
    });

    it("应该能够删除元素", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.deleteElement(0);
      
      const value = await arrayDemo.getDynamicArrayElement(0);
      expect(value).to.equal(0); // delete 设置为 0
    });

    it("应该能够清空数组", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      
      await arrayDemo.clearArray();
      const length = await arrayDemo.getDynamicArrayLength();
      expect(length).to.equal(0);
    });
  });

  describe("数组搜索", function () {
    it("应该能够查找元素索引", async function () {
      await arrayDemo.pushToDynamicArray(100);
      await arrayDemo.pushToDynamicArray(200);
      await arrayDemo.pushToDynamicArray(300);
      
      const index = await arrayDemo.findIndex(200);
      expect(index).to.equal(1);
    });

    it("应该返回数组长度如果未找到", async function () {
      await arrayDemo.pushToDynamicArray(100);
      const index = await arrayDemo.findIndex(999);
      const length = await arrayDemo.getDynamicArrayLength();
      expect(index).to.equal(length);
    });

    it("应该能够检查元素是否存在", async function () {
      await arrayDemo.pushToDynamicArray(100);
      expect(await arrayDemo.contains(100)).to.equal(true);
      expect(await arrayDemo.contains(999)).to.equal(false);
    });
  });

  describe("数组统计", function () {
    it("应该能够计算总和", async function () {
      await arrayDemo.pushToDynamicArray(10);
      await arrayDemo.pushToDynamicArray(20);
      await arrayDemo.pushToDynamicArray(30);
      
      const sum = await arrayDemo.sumArray();
      expect(sum).to.equal(60);
    });

    it("应该能够计算平均值", async function () {
      await arrayDemo.pushToDynamicArray(10);
      await arrayDemo.pushToDynamicArray(20);
      await arrayDemo.pushToDynamicArray(30);
      
      const average = await arrayDemo.averageArray();
      expect(average).to.equal(20);
    });

    it("应该能够查找最大值", async function () {
      await arrayDemo.pushToDynamicArray(10);
      await arrayDemo.pushToDynamicArray(30);
      await arrayDemo.pushToDynamicArray(20);
      
      const max = await arrayDemo.findMax();
      expect(max).to.equal(30);
    });

    it("应该能够查找最小值", async function () {
      await arrayDemo.pushToDynamicArray(30);
      await arrayDemo.pushToDynamicArray(10);
      await arrayDemo.pushToDynamicArray(20);
      
      const min = await arrayDemo.findMin();
      expect(min).to.equal(10);
    });
  });
});

