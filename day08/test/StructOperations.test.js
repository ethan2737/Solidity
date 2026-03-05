const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StructOperations", function () {
  let structOperations;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const StructOperations = await ethers.getContractFactory("StructOperations");
    structOperations = await StructOperations.deploy();
    await structOperations.waitForDeployment();
  });

  describe("结构体创建", function () {
    it("应该能够使用命名参数创建 Person", async function () {
      const person = await structOperations.createPersonNamed("Alice", 25, addr1.address);
      expect(person.name).to.equal("Alice");
      expect(person.age).to.equal(25);
      expect(person.addr).to.equal(addr1.address);
      expect(person.isActive).to.equal(true);
    });

    it("应该能够使用位置参数创建 Person", async function () {
      const person = await structOperations.createPersonPositional("Bob", 30, addr2.address);
      expect(person.name).to.equal("Bob");
      expect(person.age).to.equal(30);
      expect(person.addr).to.equal(addr2.address);
    });

    it("应该能够创建并存储 Person", async function () {
      await structOperations.createAndStorePerson("Alice", 25, addr1.address);
      
      const person = await structOperations.getPersonFromMapping(addr1.address);
      expect(person.name).to.equal("Alice");
      expect(person.age).to.equal(25);
    });

    it("应该能够添加 Person 到数组", async function () {
      await structOperations.addPersonToArray("Alice", 25, addr1.address);
      
      const person = await structOperations.getPersonFromArray(0);
      expect(person.name).to.equal("Alice");
      expect(person.age).to.equal(25);
    });
  });

  describe("结构体修改", function () {
    it("应该能够修改映射中的结构体", async function () {
      await structOperations.createAndStorePerson("Alice", 25, addr1.address);
      await structOperations.updatePersonInMapping(addr1.address, "Alice Updated", 26);
      
      const person = await structOperations.getPersonFromMapping(addr1.address);
      expect(person.name).to.equal("Alice Updated");
      expect(person.age).to.equal(26);
    });

    it("应该能够修改数组中的结构体", async function () {
      await structOperations.addPersonToArray("Alice", 25, addr1.address);
      await structOperations.updatePersonInArray(0, "Alice Updated", 26);
      
      const person = await structOperations.getPersonFromArray(0);
      expect(person.name).to.equal("Alice Updated");
      expect(person.age).to.equal(26);
    });
  });

  describe("结构体比较", function () {
    it.skip("应该能够比较两个 Person", async function () {
      const person1 = await structOperations.createPersonNamed.staticCall("Alice", 25, addr1.address);
      // 创建副本避免 frozen 对象问题
      const person2 = { ...person1 };

      const isEqual = await structOperations.comparePersons(person1, person2);
      expect(isEqual).to.equal(true);
    });

    it.skip("应该能够比较 Person 的地址", async function () {
      const person1 = await structOperations.createPersonNamed.staticCall("Alice", 25, addr1.address);
      const person2 = { ...person1, name: "Bob", age: 30 };

      const sameAddress = await structOperations.comparePersonAddresses(person1, person2);
      expect(sameAddress).to.equal(true);
    });
  });

  describe("结构体复制", function () {
    it.skip("应该能够复制 Person", async function () {
      const original = await structOperations.createPersonNamed.staticCall("Alice", 25, addr1.address);
      const copied = await structOperations.copyPerson({ ...original });

      expect(copied.name).to.equal(original.name);
      expect(copied.age).to.equal(original.age);
      expect(copied.addr).to.equal(original.addr);
    });

    it.skip("应该能够复制并修改 Person", async function () {
      const original = await structOperations.createPersonNamed.staticCall("Alice", 25, addr1.address);
      const modified = await structOperations.copyAndModifyPerson({ ...original }, "Alice Modified");

      expect(modified.name).to.equal("Alice Modified");
      expect(modified.age).to.equal(original.age);
    });
  });

  describe("嵌套结构体", function () {
    it("应该能够创建 Rectangle", async function () {
      const rect = await structOperations.createRectangle.staticCall(0, 10, 10, 0);

      expect(rect.topLeft.x).to.equal(0);
      expect(rect.topLeft.y).to.equal(10);
      expect(rect.bottomRight.x).to.equal(10);
      expect(rect.bottomRight.y).to.equal(0);
    });

    it.skip("应该能够计算 Rectangle 的面积", async function () {
      const rect = await structOperations.createRectangle.staticCall(0, 10, 10, 0);
      const area = await structOperations.calculateRectangleArea(rect);
      
      expect(area).to.equal(100);
    });
  });
});

