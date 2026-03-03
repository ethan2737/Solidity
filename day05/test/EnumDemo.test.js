const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnumDemo", function () {
  let enumDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const EnumDemo = await ethers.getContractFactory("EnumDemo");
    enumDemo = await EnumDemo.deploy();
    await enumDemo.waitForDeployment();
  });

  describe("枚举定义", function () {
    it("应该正确初始化状态", async function () {
      const state = await enumDemo.getCurrentState();
      expect(state).to.equal(0); // State.Created = 0
    });

    it("应该能够获取所有状态值", async function () {
      const values = await enumDemo.getAllStateValues();
      expect(values.created).to.equal(0);
      expect(values.locked).to.equal(1);
      expect(values.inactive).to.equal(2);
    });
  });

  describe("状态转换", function () {
    it("应该能够锁定状态", async function () {
      await expect(enumDemo.lock())
        .to.emit(enumDemo, "StateChanged")
        .withArgs(0, 1); // Created -> Locked
      
      const state = await enumDemo.getCurrentState();
      expect(state).to.equal(1); // Locked
    });

    it("应该拒绝从非 Created 状态锁定", async function () {
      await enumDemo.lock();
      await expect(enumDemo.lock()).to.be.revertedWith("Can only lock from Created state");
    });

    it("应该能够停用状态", async function () {
      await enumDemo.deactivate();
      const state = await enumDemo.getCurrentState();
      expect(state).to.equal(2); // Inactive
    });

    it("应该能够从 Locked 状态停用", async function () {
      await enumDemo.lock();
      await enumDemo.deactivate();
      const state = await enumDemo.getCurrentState();
      expect(state).to.equal(2); // Inactive
    });

    it("应该能够重置状态", async function () {
      await enumDemo.deactivate();
      await enumDemo.reset();
      const state = await enumDemo.getCurrentState();
      expect(state).to.equal(0); // Created
    });
  });

  describe("订单状态管理", function () {
    it("应该能够创建订单", async function () {
      await enumDemo.createOrder(1);
      const status = await enumDemo.getOrderStatus(1);
      expect(status).to.equal(0); // Pending
    });

    it("应该能够确认订单", async function () {
      await enumDemo.createOrder(1);
      await enumDemo.confirmOrder(1);
      const status = await enumDemo.getOrderStatus(1);
      expect(status).to.equal(1); // Confirmed
    });

    it("应该能够完成订单流程", async function () {
      await enumDemo.createOrder(1);
      await enumDemo.confirmOrder(1);
      await enumDemo.shipOrder(1);
      await enumDemo.deliverOrder(1);
      
      const status = await enumDemo.getOrderStatus(1);
      expect(status).to.equal(3); // Delivered
    });

    it("应该能够取消订单", async function () {
      await enumDemo.createOrder(1);
      await enumDemo.cancelOrder(1);
      const status = await enumDemo.getOrderStatus(1);
      expect(status).to.equal(4); // Cancelled
    });
  });

  describe("用户角色管理", function () {
    it("应该能够设置用户角色", async function () {
      await enumDemo.setUserRole(addr1.address, 2); // Admin
      const role = await enumDemo.getUserRole(addr1.address);
      expect(role).to.equal(2);
    });

    it("应该能够检查是否是管理员", async function () {
      await enumDemo.setUserRole(addr1.address, 2); // Admin
      expect(await enumDemo.isAdmin(addr1.address)).to.equal(true);
      
      await enumDemo.setUserRole(addr1.address, 3); // Owner
      expect(await enumDemo.isAdmin(addr1.address)).to.equal(true);
    });

    it("应该能够检查是否是所有者", async function () {
      await enumDemo.setUserRole(addr1.address, 3); // Owner
      expect(await enumDemo.isOwner(addr1.address)).to.equal(true);
    });
  });

  describe("枚举转换", function () {
    it("应该能够将枚举转换为 uint8", async function () {
      expect(await enumDemo.stateToUint8(0)).to.equal(0); // Created
      expect(await enumDemo.stateToUint8(1)).to.equal(1); // Locked
      expect(await enumDemo.stateToUint8(2)).to.equal(2); // Inactive
    });

    it("应该能够将 uint8 转换为枚举", async function () {
      const state = await enumDemo.uint8ToState(1);
      expect(state).to.equal(1); // Locked
    });

    it("应该拒绝无效的枚举值", async function () {
      await expect(enumDemo.uint8ToState(10)).to.be.revertedWith("Invalid state value");
    });
  });

  describe("枚举比较", function () {
    it("应该能够比较两个状态", async function () {
      expect(await enumDemo.compareStates(0, 0)).to.equal(true);
      expect(await enumDemo.compareStates(0, 1)).to.equal(false);
    });

    it("应该能够检查当前状态", async function () {
      expect(await enumDemo.isCreated()).to.equal(true);
      expect(await enumDemo.isLocked()).to.equal(false);
      expect(await enumDemo.isInactive()).to.equal(false);
    });
  });
});

