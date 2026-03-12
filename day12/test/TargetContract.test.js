const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * TargetContract 合约测试
 */
describe("TargetContract", function () {
  let targetContract;
  let owner;
  let user1;
  let user2;
  let addr1;

  // 部署合约
  beforeEach(async function () {
    // 获取测试账户
    [owner, user1, user2, ...addr1] = await ethers.getSigners();

    // 部署目标合约
    const TargetContract = await ethers.getContractFactory("TargetContract");
    targetContract = await TargetContract.deploy("TargetContract");
    await targetContract.waitForDeployment();
  });

  // ═══════════════════════════════════════════════════════════
  // 状态变量测试
  // ═══════════════════════════════════════════════════════════

  describe("State Variables", function () {
    it("测试初始值", async function () {
      expect(await targetContract.value()).to.equal(100);
      expect(await targetContract.counter()).to.equal(0);
      expect(await targetContract.name()).to.equal("TargetContract");
    });

    it("测试 owner 应该是部署者", async function () {
      expect(await targetContract.owner()).to.equal(owner.address);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // setValue 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("setValue", function () {
    it("测试设置值", async function () {
      const newValue = 500;
      await targetContract.setValue(newValue);
      expect(await targetContract.value()).to.equal(newValue);
    });

    it("测试设置大数值", async function () {
      const largeValue = ethers.MaxUint256;
      await targetContract.setValue(largeValue);
      expect(await targetContract.value()).to.equal(largeValue);
    });

    it("测试设置零值", async function () {
      await targetContract.setValue(0);
      expect(await targetContract.value()).to.equal(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // incrementCounter 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("incrementCounter", function () {
    it("测试计数器递增", async function () {
      expect(await targetContract.counter()).to.equal(0);

      await targetContract.incrementCounter();
      expect(await targetContract.counter()).to.equal(1);

      await targetContract.incrementCounter();
      expect(await targetContract.counter()).to.equal(2);
    });

    it("测试多次递增", async function () {
      for (let i = 0; i < 10; i++) {
        await targetContract.incrementCounter();
      }
      expect(await targetContract.counter()).to.equal(10);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // setOwner 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("setOwner", function () {
    it("测试设置新 owner", async function () {
      const newOwner = user1.address;
      await targetContract.setOwner(newOwner);
      expect(await targetContract.owner()).to.equal(newOwner);
    });

    it("测试设置为零地址", async function () {
      const zeroAddress = ethers.ZeroAddress;
      await targetContract.setOwner(zeroAddress);
      expect(await targetContract.owner()).to.equal(zeroAddress);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // setName 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("setName", function () {
    it("测试设置名称", async function () {
      const newName = "NewName";
      await targetContract.setName(newName);
      expect(await targetContract.name()).to.equal(newName);
    });

    it("测试设置空字符串", async function () {
      await targetContract.setName("");
      expect(await targetContract.name()).to.equal("");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // getInfo 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("getInfo", function () {
    it("测试获取合约信息", async function () {
      await targetContract.setValue(999);
      await targetContract.incrementCounter();

      const [value, contractOwner, counter, contractAddress] = await targetContract.getInfo();

      expect(value).to.equal(999);
      expect(contractOwner).to.equal(owner.address);
      expect(counter).to.equal(1);
      expect(contractAddress).to.equal(await targetContract.getAddress());
    });
  });

  // ═══════════════════════════════════════════════════════════
  // setValueAndName 函数测试
  // ═══════════════════════════════════════════════════════════

  describe("setValueAndName", function () {
    it("测试批量设置值和名称", async function () {
      const newValue = 888;
      const newName = "BatchSet";

      await targetContract.setValueAndName(newValue, newName);

      expect(await targetContract.value()).to.equal(newValue);
      expect(await targetContract.name()).to.equal(newName);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 事件测试
  // ═══════════════════════════════════════════════════════════

  describe("Events", function () {
    it("测试 ValueSet 事件", async function () {
      await expect(targetContract.setValue(200))
        .to.emit(targetContract, "ValueSet")
        .withArgs(100, 200);
    });

    it("测试 CounterIncremented 事件", async function () {
      await expect(targetContract.incrementCounter())
        .to.emit(targetContract, "CounterIncremented")
        .withArgs(1);
    });

    it("测试 OwnerChanged 事件", async function () {
      await expect(targetContract.setOwner(user1.address))
        .to.emit(targetContract, "OwnerChanged")
        .withArgs(owner.address, user1.address);
    });

    it("测试 NameSet 事件", async function () {
      await expect(targetContract.setName("NewName"))
        .to.emit(targetContract, "NameSet")
        .withArgs("TargetContract", "NewName");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 边界测试
  // ═══════════════════════════════════════════════════════════

  describe("Edge Cases", function () {
    it("测试连续设置不同值", async function () {
      const values = [1, 10, 100, 1000, 10000];

      for (const v of values) {
        await targetContract.setValue(v);
        expect(await targetContract.value()).to.equal(v);
      }
    });

    it("测试组合操作", async function () {
      await targetContract.setValue(123);
      await targetContract.setName("Test");
      await targetContract.incrementCounter();
      await targetContract.incrementCounter();

      const [value, , counter,] = await targetContract.getInfo();

      expect(value).to.equal(123);
      expect(counter).to.equal(2);
      expect(await targetContract.name()).to.equal("Test");
    });
  });
});
