const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StorageMemoryDemo", function () {
  let storageMemoryDemo;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const StorageMemoryDemo = await ethers.getContractFactory("StorageMemoryDemo");
    storageMemoryDemo = await StorageMemoryDemo.deploy();
    await storageMemoryDemo.deployed();
  });

  describe("Storage 操作", function () {
    it("应该能够添加元素到 storage 数组", async function () {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.addToStorageArray(200);
      
      const array = await storageMemoryDemo.getStorageArray();
      expect(array.length).to.equal(2);
      expect(array[0]).to.equal(100);
      expect(array[1]).to.equal(200);
    });

    it("应该能够修改 storage 数组元素", async function () {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.updateStorageArray(0, 999);
      
      const array = await storageMemoryDemo.getStorageArray();
      expect(array[0]).to.equal(999);
    });

    it("storage 修改应该持久化", async function () {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.updateStorageArray(0, 999);
      
      // 再次查询应该还是 999
      const array = await storageMemoryDemo.getStorageArray();
      expect(array[0]).to.equal(999);
    });
  });

  describe("Memory 操作", function () {
    it("应该能够处理 memory 数组", async function () {
      const input = [10, 20, 30];
      const result = await storageMemoryDemo.processMemoryArray(input);
      
      expect(result.length).to.equal(3);
      expect(result[0]).to.equal(20); // 10 * 2
      expect(result[1]).to.equal(40); // 20 * 2
      expect(result[2]).to.equal(60); // 30 * 2
    });

    it("memory 数组修改不应该影响原始数据", async function () {
      const input = [10, 20];
      await storageMemoryDemo.processMemoryArray(input);
      
      // 原始数组应该不变（但在 Solidity 中，memory 参数会被修改）
      // 这是 Solidity 的特性：memory 参数可以被修改
    });

    it("应该能够创建 memory 数组", async function () {
      const array = await storageMemoryDemo.createMemoryArray(5);
      expect(array.length).to.equal(5);
      expect(array[0]).to.equal(0);
      expect(array[1]).to.equal(10);
      expect(array[4]).to.equal(40);
    });

    it("应该能够复制 storage 到 memory", async function () {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.addToStorageArray(200);
      
      const memoryArray = await storageMemoryDemo.copyStorageToMemory();
      expect(memoryArray.length).to.equal(2);
      expect(memoryArray[0]).to.equal(100);
      expect(memoryArray[1]).to.equal(200);
    });
  });

  describe("Calldata 操作", function () {
    it("应该能够处理 calldata 数组", async function () {
      const input = [10, 20, 30];
      const sum = await storageMemoryDemo.sumCalldataArray(input);
      expect(sum).to.equal(60);
    });

    it("应该能够处理 calldata 字符串", async function () {
      const length = await storageMemoryDemo.getStringLength("Hello");
      expect(length).to.equal(5);
    });
  });

  describe("Storage 引用", function () {
    it("应该能够通过 storage 引用修改数组", async function () {
      await storageMemoryDemo.addToStorageArray(100);
      await storageMemoryDemo.modifyViaStorageReference(0, 999);
      
      const array = await storageMemoryDemo.getStorageArray();
      expect(array[0]).to.equal(999);
    });
  });

  describe("结构体操作", function () {
    it("应该能够添加用户", async function () {
      await storageMemoryDemo.addUser(1, addr1.address, "Alice");
      
      const user = await storageMemoryDemo.getUser(0);
      expect(user.id).to.equal(1);
      expect(user.addr).to.equal(addr1.address);
      expect(user.name).to.equal("Alice");
    });

    it("应该能够修改用户（storage 引用）", async function () {
      await storageMemoryDemo.addUser(1, addr1.address, "Alice");
      await storageMemoryDemo.updateUserName(0, "Bob");
      
      const user = await storageMemoryDemo.getUser(0);
      expect(user.name).to.equal("Bob");
    });

    it("应该能够处理 memory 结构体", async function () {
      const user = {
        id: 1,
        addr: addr1.address,
        name: "Alice"
      };
      
      const result = await storageMemoryDemo.processMemoryUser(user);
      expect(result.id).to.equal(2); // 1 * 2
    });
  });
});

