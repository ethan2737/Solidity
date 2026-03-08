const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ModifierDemo", function () {
  let modifierDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ModifierDemo = await ethers.getContractFactory("ModifierDemo");
    modifierDemo = await ModifierDemo.deploy();
  });

  describe("onlyOwner modifier（如题目要求）", function () {
    it("应该允许 owner 调用 setValue", async function () {
      await modifierDemo.setValue(100);
      const value = await modifierDemo.getValue();
      expect(value).to.equal(100);
    });

    it("应该拒绝非 owner 调用 setValue", async function () {
      await expect(
        modifierDemo.connect(addr1).setValue(100)
      ).to.be.revertedWith("Only owner");
    });

    it("应该允许 owner 转移所有权", async function () {
      await modifierDemo.transferOwnership(addr1.address);
      const newOwner = await modifierDemo.owner();
      expect(newOwner).to.equal(addr1.address);
    });

    it("应该拒绝零地址转移所有权", async function () {
      await expect(
        modifierDemo.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address not allowed");
    });
  });

  describe("onlyAdmin modifier", function () {
    it("应该允许 owner 添加管理员", async function () {
      await modifierDemo.addAdmin(addr1.address);
      const isAdmin = await modifierDemo.isAdmin(addr1.address);
      expect(isAdmin).to.equal(true);
    });

    it("应该允许 admin 调用 adminSetValue", async function () {
      await modifierDemo.addAdmin(addr1.address);
      await modifierDemo.connect(addr1).adminSetValue(200);
      const value = await modifierDemo.getValue();
      expect(value).to.equal(200);
    });

    it("应该拒绝非 admin 调用 adminSetValue", async function () {
      await expect(
        modifierDemo.connect(addr2).adminSetValue(200)
      ).to.be.revertedWith("Only admin or owner");
    });
  });

  describe("whenNotPaused / whenPaused modifier", function () {
    it("应该允许 owner 暂停合约", async function () {
      await modifierDemo.pause();
      const paused = await modifierDemo.paused();
      expect(paused).to.equal(true);
    });

    it("应该允许 owner 恢复合约", async function () {
      await modifierDemo.pause();
      await modifierDemo.unpause();
      const paused = await modifierDemo.paused();
      expect(paused).to.equal(false);
    });

    it("应该拒绝在暂停时调用 setValueWhenNotPaused", async function () {
      await modifierDemo.pause();
      await expect(
        modifierDemo.setValueWhenNotPaused(100)
      ).to.be.revertedWith("Contract is paused");
    });

    it("应该允许在未暂停时调用 setValueWhenNotPaused", async function () {
      await modifierDemo.setValueWhenNotPaused(100);
      const value = await modifierDemo.getValue();
      expect(value).to.equal(100);
    });
  });

  describe("带参数的 modifier", function () {
    it("应该允许设置有效范围内的值", async function () {
      await modifierDemo.setValueWithValidation(500);
      const value = await modifierDemo.getValue();
      expect(value).to.equal(500);
    });

    it("应该拒绝设置超出范围的值", async function () {
      await expect(
        modifierDemo.setValueWithValidation(5)
      ).to.be.revertedWith("Value out of range");
    });

    it("应该允许提取足够的余额", async function () {
      await modifierDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await modifierDemo.connect(addr1).withdraw(ethers.parseEther("50"));

      const balance = await modifierDemo.getBalance(addr1.address);
      expect(balance).to.equal(ethers.parseEther("50"));
    });

    it("应该拒绝提取不足的余额", async function () {
      await modifierDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await expect(
        modifierDemo.connect(addr1).withdraw(ethers.parseEther("150"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("多个 modifier 组合", function () {
    it("应该允许使用多个 modifier", async function () {
      await modifierDemo.setValueWithMultipleModifiers(300);
      const value = await modifierDemo.getValue();
      expect(value).to.equal(300);
    });

    it("应该拒绝非 owner 使用多个 modifier", async function () {
      await expect(
        modifierDemo.connect(addr1).setValueWithMultipleModifiers(300)
      ).to.be.revertedWith("Only owner");
    });

    it("应该拒绝在暂停时使用多个 modifier", async function () {
      await modifierDemo.pause();
      await expect(
        modifierDemo.setValueWithMultipleModifiers(300)
      ).to.be.revertedWith("Contract is paused");
    });
  });
});

