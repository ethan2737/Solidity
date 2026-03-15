const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyERC20Token", function () {
  let myERC20Token;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000"); // 100万代币
  const MAX_SUPPLY = ethers.utils.parseEther("10000000"); // 1000万代币

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const MyERC20Token = await ethers.getContractFactory("MyERC20Token");
    myERC20Token = await MyERC20Token.deploy(
      "Xiucai Token",
      "XCT",
      MAX_SUPPLY
    );
    await myERC20Token.deployed();
  });

  describe("部署", function () {
    it("应该正确设置代币名称和符号", async function () {
      expect(await myERC20Token.name()).to.equal("Xiucai Token");
      expect(await myERC20Token.symbol()).to.equal("XCT");
    });

    it("应该向部署者铸造初始供应量", async function () {
      const ownerBalance = await myERC20Token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("应该正确设置总供应量", async function () {
      const totalSupply = await myERC20Token.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("转账 (transfer)", function () {
    it("应该允许转账代币", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      await myERC20Token.transfer(addr1.address, transferAmount);

      const addr1Balance = await myERC20Token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("应该从发送者余额中扣除", async function () {
      const transferAmount = ethers.utils.parseEther("100");
      const ownerBalanceBefore = await myERC20Token.balanceOf(owner.address);

      await myERC20Token.transfer(addr1.address, transferAmount);

      const ownerBalanceAfter = await myERC20Token.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.sub(transferAmount));
    });

    it("应该拒绝余额不足的转账", async function () {
      const transferAmount = ethers.utils.parseEther("2000000"); // 超过余额

      await expect(
        myERC20Token.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("授权 (approve)", function () {
    it("应该允许授权代币", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      await myERC20Token.approve(addr1.address, approveAmount);

      const allowance = await myERC20Token.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("应该触发 Approval 事件", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      await expect(myERC20Token.approve(addr1.address, approveAmount))
        .to.emit(myERC20Token, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });
  });

  describe("代理转账 (transferFrom)", function () {
    it("应该允许代理转账", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("500");

      // 先授权
      await myERC20Token.approve(addr1.address, approveAmount);

      // 代理转账
      const tokenWithAddr1 = myERC20Token.connect(addr1);
      await tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount);

      const addr2Balance = await myERC20Token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("应该减少授权额度", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("500");

      await myERC20Token.approve(addr1.address, approveAmount);
      
      const tokenWithAddr1 = myERC20Token.connect(addr1);
      await tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount);

      const remainingAllowance = await myERC20Token.allowance(owner.address, addr1.address);
      expect(remainingAllowance).to.equal(approveAmount.sub(transferAmount));
    });

    it("应该拒绝超过授权额度的转账", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("2000");

      await myERC20Token.approve(addr1.address, approveAmount);

      const tokenWithAddr1 = myERC20Token.connect(addr1);
      await expect(
        tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("铸造 (mint)", function () {
    it("应该允许所有者铸造代币", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await myERC20Token.mint(addr1.address, mintAmount);

      const addr1Balance = await myERC20Token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);
    });

    it("应该增加总供应量", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      const totalSupplyBefore = await myERC20Token.totalSupply();

      await myERC20Token.mint(addr1.address, mintAmount);

      const totalSupplyAfter = await myERC20Token.totalSupply();
      expect(totalSupplyAfter).to.equal(totalSupplyBefore.add(mintAmount));
    });

    it("应该拒绝非所有者铸造", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      const tokenWithAddr1 = myERC20Token.connect(addr1);

      await expect(
        tokenWithAddr1.mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("应该拒绝超过最大供应量的铸造", async function () {
      const mintAmount = MAX_SUPPLY; // 超过最大供应量

      await expect(
        myERC20Token.mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("销毁 (burn)", function () {
    it("应该允许销毁代币", async function () {
      const burnAmount = ethers.utils.parseEther("1000");
      const ownerBalanceBefore = await myERC20Token.balanceOf(owner.address);

      await myERC20Token.burn(burnAmount);

      const ownerBalanceAfter = await myERC20Token.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.sub(burnAmount));
    });

    it("应该减少总供应量", async function () {
      const burnAmount = ethers.utils.parseEther("1000");
      const totalSupplyBefore = await myERC20Token.totalSupply();

      await myERC20Token.burn(burnAmount);

      const totalSupplyAfter = await myERC20Token.totalSupply();
      expect(totalSupplyAfter).to.equal(totalSupplyBefore.sub(burnAmount));
    });
  });

  describe("结束铸造 (finishMinting)", function () {
    it("应该允许所有者结束铸造", async function () {
      await myERC20Token.finishMinting();
      expect(await myERC20Token.mintingFinished()).to.be.true;
    });

    it("应该拒绝非所有者结束铸造", async function () {
      const tokenWithAddr1 = myERC20Token.connect(addr1);

      await expect(
        tokenWithAddr1.finishMinting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("应该拒绝在铸造结束后继续铸造", async function () {
      await myERC20Token.finishMinting();

      await expect(
        myERC20Token.mint(addr1.address, ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("Minting is finished");
    });
  });
});

