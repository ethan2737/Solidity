const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MappingDemo", function () {
  let mappingDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MappingDemo = await ethers.getContractFactory("MappingDemo");
    mappingDemo = await MappingDemo.deploy();
    await mappingDemo.deployed();
  });

  describe("基本映射操作", function () {
    it("应该能够设置余额", async function () {
      const amount = ethers.utils.parseEther("100");
      await mappingDemo.setBalance(addr1.address, amount);
      
      const balance = await mappingDemo.balances(addr1.address);
      expect(balance).to.equal(amount);
    });

    it("应该能够增加余额", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await mappingDemo.increaseBalance(addr1.address, ethers.utils.parseEther("50"));
      
      const balance = await mappingDemo.balances(addr1.address);
      expect(balance).to.equal(ethers.utils.parseEther("150"));
    });

    it("应该能够减少余额", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await mappingDemo.decreaseBalance(addr1.address, ethers.utils.parseEther("30"));
      
      const balance = await mappingDemo.balances(addr1.address);
      expect(balance).to.equal(ethers.utils.parseEther("70"));
    });

    it("应该拒绝余额不足的减少", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await expect(
        mappingDemo.decreaseBalance(addr1.address, ethers.utils.parseEther("150"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("成员管理", function () {
    it("应该能够添加成员", async function () {
      await mappingDemo.addMember(addr1.address);
      expect(await mappingDemo.isMember(addr1.address)).to.equal(true);
    });

    it("应该拒绝重复添加成员", async function () {
      await mappingDemo.addMember(addr1.address);
      await expect(
        mappingDemo.addMember(addr1.address)
      ).to.be.revertedWith("Already a member");
    });

    it("应该能够移除成员", async function () {
      await mappingDemo.addMember(addr1.address);
      await mappingDemo.removeMember(addr1.address);
      expect(await mappingDemo.isMember(addr1.address)).to.equal(false);
    });

    it("应该能够获取成员数量", async function () {
      await mappingDemo.addMember(addr1.address);
      await mappingDemo.addMember(addr2.address);
      
      const count = await mappingDemo.getMemberCount();
      expect(count).to.equal(2);
    });

    it("应该能够获取所有成员", async function () {
      await mappingDemo.addMember(addr1.address);
      await mappingDemo.addMember(addr2.address);
      
      const members = await mappingDemo.getAllMembers();
      expect(members.length).to.equal(2);
      expect(members[0]).to.equal(addr1.address);
      expect(members[1]).to.equal(addr2.address);
    });
  });

  describe("嵌套映射", function () {
    it("应该能够设置授权额度", async function () {
      const amount = ethers.utils.parseEther("100");
      await mappingDemo.setAllowance(addr1.address, addr2.address, amount);
      
      const allowance = await mappingDemo.getAllowance(addr1.address, addr2.address);
      expect(allowance).to.equal(amount);
    });

    it("应该能够设置权限", async function () {
      await mappingDemo.setPermission(1, "read", true);
      expect(await mappingDemo.hasPermission(1, "read")).to.equal(true);
    });
  });

  describe("映射遍历", function () {
    it("应该能够获取所有地址", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await mappingDemo.setBalance(addr2.address, ethers.utils.parseEther("200"));
      
      const addresses = await mappingDemo.getAllAddresses();
      expect(addresses.length).to.equal(2);
    });

    it("应该能够计算总余额", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await mappingDemo.setBalance(addr2.address, ethers.utils.parseEther("200"));
      
      const total = await mappingDemo.getTotalBalance();
      expect(total).to.equal(ethers.utils.parseEther("300"));
    });

    it("应该能够查找符合条件的地址", async function () {
      await mappingDemo.setBalance(addr1.address, ethers.utils.parseEther("100"));
      await mappingDemo.setBalance(addr2.address, ethers.utils.parseEther("200"));
      
      const addresses = await mappingDemo.findAddressesWithBalance(ethers.utils.parseEther("150"));
      expect(addresses.length).to.equal(1);
      expect(addresses[0]).to.equal(addr2.address);
    });
  });
});

