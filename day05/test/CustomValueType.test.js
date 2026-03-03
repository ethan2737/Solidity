const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomValueType", function () {
  let customValueType;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const CustomValueType = await ethers.getContractFactory("CustomValueType");
    customValueType = await CustomValueType.deploy();
    await customValueType.waitForDeployment();
  });

  describe("UserId 操作", function () {
    it("应该能够创建用户ID", async function () {
      // 调用写入函数创建用户ID
      await customValueType.createUserId(addr1.address);

      // 查询当前用户ID
      const userId = await customValueType.currentUserId();
      expect(userId).to.not.equal(0);

      // 验证用户地址
      const userAddress = await customValueType.getUserAddress(userId);
      expect(userAddress).to.equal(addr1.address);
    });

    it("应该能够递增用户ID", async function () {
      // 创建第一个用户
      await customValueType.createUserId(addr1.address);
      const userId1 = await customValueType.currentUserId();

      // 创建第二个用户
      await customValueType.createUserId(owner.address);
      const userId2 = await customValueType.currentUserId();

      // 用户ID应该递增
      expect(userId2.toString()).to.not.equal(userId1.toString());
    });
  });

  describe("OrderId 操作", function () {
    it("应该能够创建订单", async function () {
      // 先设置价格
      const price = await customValueType.createPriceFromEther.staticCall(100);
      await customValueType.setPrice(price);

      // 创建订单（写入交易）
      await customValueType.createOrder(price);

      // 查询当前订单ID
      const orderId = await customValueType.currentOrderId();
      expect(orderId).to.not.equal(0);

      // 验证订单价格
      const orderPrice = await customValueType.getOrderPrice(orderId);
      expect(orderPrice.toString()).to.equal(price.toString());
    });
  });

  describe("Price 操作", function () {
    it("应该能够设置价格", async function () {
      const price = await customValueType.createPriceFromEther.staticCall(10);
      await customValueType.setPrice(price);

      const currentPrice = await customValueType.getPriceInEther();
      expect(currentPrice.toString()).to.equal("10");
    });

    it("应该能够从 wei 创建价格", async function () {
      const price = await customValueType.createPriceFromWei.staticCall(ethers.parseEther("1").toString());
      await customValueType.setPrice(price);
      
      const priceInEther = await customValueType.getPriceInEther();
      expect(priceInEther.toString()).to.equal("1");
    });

    it("应该能够应用折扣", async function () {
      // 创建价格 100 ether
      const price = await customValueType.createPriceFromEther.staticCall(100);

      // 设置折扣为 10%
      await customValueType.setDiscount(10);

      // 应用折扣（pure 函数，直接获取返回值）
      const discountedPrice = await customValueType.applyDiscount.staticCall(price, 10);

      // 验证折扣后的价格 = 100 * 0.9 = 90 ether
      const discountedValue = BigInt(discountedPrice) / BigInt(1e18);
      expect(discountedValue.toString()).to.equal("90");
    });

    it("应该能够比较价格", async function () {
      const price1 = await customValueType.createPriceFromEther.staticCall(100);
      const price2 = await customValueType.createPriceFromEther.staticCall(100);

      const isEqual = await customValueType.comparePrices(price1, price2);
      expect(isEqual).to.equal(true);
    });
  });

  describe("Percentage 操作", function () {
    it("应该能够设置折扣", async function () {
      await customValueType.setDiscount(20);
      const discount = await customValueType.getDiscount();
      expect(discount).to.equal(20);
    });

    it("应该拒绝超过 100% 的折扣", async function () {
      await expect(customValueType.setDiscount(101)).to.be.revertedWith("Discount cannot exceed 100%");
    });
  });
});

