const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ErrorHandlingDemo", function () {
  let errorHandlingDemo;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ErrorHandlingDemo = await ethers.getContractFactory("ErrorHandlingDemo");
    errorHandlingDemo = await ErrorHandlingDemo.deploy();
    // 等待部署完成
    await errorHandlingDemo.waitForDeployment();
  });

  describe("Require 错误处理", function () {
    it("应该能够使用 require 验证输入", async function () {
      await errorHandlingDemo.setValueWithRequire(100);
      const value = await errorHandlingDemo.value();
      expect(value).to.equal(100);
    });

    it("应该拒绝无效输入（require）", async function () {
      await expect(
        errorHandlingDemo.setValueWithRequire(0)
      ).to.be.revertedWith("Value must be greater than 0");
    });

    it("应该拒绝超出范围的输入（require）", async function () {
      await expect(
        errorHandlingDemo.setValueWithRequire(1001)
      ).to.be.revertedWith("Value must be less than or equal to 1000");
    });

    it("应该能够使用 require 检查权限", async function () {
      await errorHandlingDemo.setValueOwnerOnly(200);
      const value = await errorHandlingDemo.value();
      expect(value).to.equal(200);
    });

    it("应该拒绝非 owner 调用（require）", async function () {
      await expect(
        errorHandlingDemo.connect(addr1).setValueOwnerOnly(200)
      ).to.be.revertedWith("Only owner can set value");
    });

    it("应该能够使用 require 检查余额", async function () {
      await errorHandlingDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await errorHandlingDemo.connect(addr1).withdraw(ethers.parseEther("50"));

      const balance = await errorHandlingDemo.getBalance(addr1.address);
      expect(balance).to.equal(ethers.parseEther("50"));
    });

    it("应该拒绝余额不足的提取（require）", async function () {
      await errorHandlingDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await expect(
        errorHandlingDemo.connect(addr1).withdraw(ethers.parseEther("150"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Revert 错误处理", function () {
    it("应该能够使用 revert 回滚", async function () {
      await errorHandlingDemo.setValueWithRevert(100);
      const value = await errorHandlingDemo.value();
      expect(value).to.equal(100);
    });

    it("应该拒绝无效输入（revert）", async function () {
      await expect(
        errorHandlingDemo.setValueWithRevert(0)
      ).to.be.revertedWith("Value cannot be zero");
    });

    it("应该能够使用自定义错误", async function () {
      await errorHandlingDemo.setBalance(addr1.address, ethers.parseEther("100"));
      await expect(
        errorHandlingDemo.connect(addr1).withdrawWithCustomError(ethers.parseEther("150"))
      ).to.be.reverted;
    });

    it("应该能够使用自定义错误检查权限", async function () {
      await expect(
        errorHandlingDemo.connect(addr1).ownerOnlyWithCustomError()
      ).to.be.reverted;
    });
  });

  describe("Assert 错误处理", function () {
    it("应该能够使用 assert 检查状态", async function () {
      await errorHandlingDemo.setValueWithAssert(100);
      const value = await errorHandlingDemo.value();
      expect(value).to.equal(100);
    });

    it("assert 失败应该回滚", async function () {
      // 设置一个会导致 assert 失败的值
      await errorHandlingDemo.setValueWithRequire(100);
      // 尝试设置一个更小的值，会导致 assert 失败
      await expect(
        errorHandlingDemo.setValueWithAssert(50)
      ).to.be.reverted;
    });
  });

  describe("Try-Catch 错误处理", function () {
    it("应该能够使用 try-catch 处理外部调用错误", async function () {
      // 部署另一个合约实例
      const ErrorHandlingDemo2 = await ethers.getContractFactory("ErrorHandlingDemo");
      const errorHandlingDemo2 = await ErrorHandlingDemo2.deploy();
      await errorHandlingDemo2.waitForDeployment();

      // 测试成功的调用 - 使用 getAddress() 获取合约地址
      await errorHandlingDemo.callExternalWithTryCatch(await errorHandlingDemo2.getAddress(), 100);
      const value = await errorHandlingDemo.value();
      expect(value).to.equal(100);
    });
  });
});

