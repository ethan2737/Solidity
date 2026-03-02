const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AddressDemo", function () {
  let addressDemo;
  let owner, manager, addr1, addr2;

  beforeEach(async function () {
    [owner, manager, addr1, addr2] = await ethers.getSigners();

    const AddressDemo = await ethers.getContractFactory("AddressDemo");
    addressDemo = await AddressDemo.deploy(manager.address);
    await addressDemo.waitForDeployment();
  });

  describe("地址类型", function () {
    it("应该正确设置 owner 和 manager", async function () {
      expect(await addressDemo.owner()).to.equal(owner.address);
      expect(await addressDemo.manager()).to.equal(manager.address);
    });

    it("应该能够获取合约地址", async function () {
      const contractAddress = await addressDemo.getContractAddress();
      expect(contractAddress).to.equal(await addressDemo.getAddress());
    });

    it("应该能够获取 msg.sender", async function () {
      const sender = await addressDemo.connect(addr1).getSender();
      expect(sender).to.equal(addr1.address);
    });

    it("应该能够获取 msg.value", async function () {
      const value = await addressDemo.getValue.staticCall();
      expect(value).to.equal(0);
    });
  });

  describe("地址比较", function () {
    it("应该能够检查零地址", async function () {
      expect(await addressDemo.isZeroAddress(ethers.ZeroAddress)).to.equal(true);
      expect(await addressDemo.isZeroAddress(owner.address)).to.equal(false);
    });

    it("应该能够比较两个地址", async function () {
      expect(await addressDemo.compareAddresses(owner.address, owner.address)).to.equal(true);
      expect(await addressDemo.compareAddresses(owner.address, manager.address)).to.equal(false);
    });

    it("应该能够检查是否是 owner", async function () {
      expect(await addressDemo.connect(owner).isOwner()).to.equal(true);
      expect(await addressDemo.connect(addr1).isOwner()).to.equal(false);
    });
  });

  describe("地址转换", function () {
    it("应该能够将 address 转换为 payable", async function () {
      const payableAddr = await addressDemo.toPayable(owner.address);
      expect(payableAddr).to.equal(owner.address);
    });

    it("应该能够将 payable 转换为 address", async function () {
      const payableAddr = await addressDemo.toPayable(owner.address);
      const normalAddr = await addressDemo.fromPayable(payableAddr);
      expect(normalAddr).to.equal(owner.address);
    });
  });

  describe("成员管理", function () {
    it("应该能够添加成员", async function () {
      await addressDemo.addMember(addr1.address);
      expect(await addressDemo.isMember(addr1.address)).to.equal(true);
      expect(await addressDemo.getMemberCount()).to.equal(1);
    });

    it("应该拒绝添加零地址", async function () {
      await expect(
        addressDemo.addMember(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("应该拒绝重复添加成员", async function () {
      await addressDemo.addMember(addr1.address);
      await expect(
        addressDemo.addMember(addr1.address)
      ).to.be.revertedWith("Already a member");
    });

    it("应该能够获取所有成员", async function () {
      await addressDemo.addMember(addr1.address);
      await addressDemo.addMember(addr2.address);
      
      const members = await addressDemo.getAllMembers();
      expect(members.length).to.equal(2);
      expect(members[0]).to.equal(addr1.address);
      expect(members[1]).to.equal(addr2.address);
    });
  });

  describe("ETH 操作", function () {
    it("应该能够接收 ETH", async function () {
      const amount = ethers.parseEther("0.1");
      const addressDemoAddress = await addressDemo.getAddress();
      await expect(
        addr1.sendTransaction({
          to: addressDemoAddress,
          value: amount
        })
      ).to.emit(addressDemo, "Deposit");
      
      const balance = await addressDemo.getBalance(addr1.address);
      expect(balance).to.equal(amount);
    });

    it("应该能够存款", async function () {
      const amount = ethers.parseEther("0.5");
      await addressDemo.connect(addr1).deposit({ value: amount });
      
      const balance = await addressDemo.getBalance(addr1.address);
      expect(balance).to.equal(amount);
    });

    it("应该能够提取 ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const withdrawAmount = ethers.parseEther("0.3");
      
      // 先存款
      await addressDemo.connect(addr1).deposit({ value: depositAmount });
      
      // 再提取
      await expect(
        addressDemo.connect(addr1).withdraw(withdrawAmount)
      ).to.emit(addressDemo, "Withdrawal");
      
      const balance = await addressDemo.getBalance(addr1.address);
      expect(balance).to.equal(depositAmount - withdrawAmount);
    });

    it("应该拒绝余额不足的提取", async function () {
      await expect(
        addressDemo.connect(addr1).withdraw(ethers.parseEther("0.1"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Owner 操作", function () {
    it("应该能够更改 owner", async function () {
      await addressDemo.changeOwner(addr1.address);
      expect(await addressDemo.owner()).to.equal(addr1.address);
    });

    it("应该拒绝非 owner 更改 owner", async function () {
      await expect(
        addressDemo.connect(addr1).changeOwner(addr2.address)
      ).to.be.revertedWith("Only owner can change owner");
    });

    it("应该能够设置 treasury", async function () {
      const newTreasury = await addressDemo.toPayable(addr1.address);
      await addressDemo.setTreasury(newTreasury);
      expect(await addressDemo.treasury()).to.equal(addr1.address);
    });
  });
});

