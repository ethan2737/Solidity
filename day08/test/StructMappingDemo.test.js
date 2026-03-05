const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StructMappingDemo", function () {
  let structMappingDemo;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const StructMappingDemo = await ethers.getContractFactory("StructMappingDemo");
    structMappingDemo = await StructMappingDemo.deploy();
    await structMappingDemo.waitForDeployment();
  });

  describe("用户管理（如题目要求）", function () {
    it("应该能够创建用户", async function () {
      const balance = ethers.parseEther("100");
      await structMappingDemo.createUser(addr1.address, balance);
      
      const user = await structMappingDemo.getUser(addr1.address);
      expect(user.addr).to.equal(addr1.address);
      expect(user.balance).to.equal(balance);
      expect(user.isActive).to.equal(true);
    });

    it("应该拒绝重复创建用户", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await expect(
        structMappingDemo.createUser(addr1.address, ethers.parseEther("200"))
      ).to.be.revertedWith("User already exists");
    });

    it("应该能够获取用户信息", async function () {
      const balance = ethers.parseEther("100");
      await structMappingDemo.createUser(addr1.address, balance);
      
      const user = await structMappingDemo.getUser(addr1.address);
      expect(user.addr).to.equal(addr1.address);
      expect(user.balance).to.equal(balance);
    });

    it("应该能够更新用户余额", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.updateUserBalance(addr1.address, ethers.parseEther("200"));
      
      const balance = await structMappingDemo.getUserBalance(addr1.address);
      expect(balance).to.equal(ethers.parseEther("200"));
    });

    it("应该能够增加用户余额", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.increaseUserBalance(addr1.address, ethers.parseEther("50"));
      
      const balance = await structMappingDemo.getUserBalance(addr1.address);
      expect(balance).to.equal(ethers.parseEther("150"));
    });

    it("应该能够减少用户余额", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.decreaseUserBalance(addr1.address, ethers.parseEther("30"));
      
      const balance = await structMappingDemo.getUserBalance(addr1.address);
      expect(balance).to.equal(ethers.parseEther("70"));
    });

    it("应该拒绝余额不足的减少", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await expect(
        structMappingDemo.decreaseUserBalance(addr1.address, ethers.parseEther("150"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("应该能够检查用户是否存在", async function () {
      expect(await structMappingDemo.userExistsCheck(addr1.address)).to.equal(false);
      
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      expect(await structMappingDemo.userExistsCheck(addr1.address)).to.equal(true);
    });
  });

  describe("订单管理", function () {
    it("应该能够创建订单", async function () {
      // 使用 staticCall 获取返回值
      const orderId = await structMappingDemo.createOrder.staticCall(
        addr1.address,
        addr2.address,
        ethers.parseEther("100")
      );

      expect(orderId).to.equal(1);

      // 执行实际交易
      await structMappingDemo.createOrder(
        addr1.address,
        addr2.address,
        ethers.parseEther("100")
      );

      const order = await structMappingDemo.getOrder(orderId);
      expect(order.buyer).to.equal(addr1.address);
      expect(order.seller).to.equal(addr2.address);
      expect(order.amount).to.equal(ethers.parseEther("100"));
    });

    it("应该能够更新订单状态", async function () {
      const orderId = await structMappingDemo.createOrder.staticCall(
        addr1.address,
        addr2.address,
        ethers.parseEther("100")
      );

      // 执行实际交易来创建订单
      await structMappingDemo.createOrder(
        addr1.address,
        addr2.address,
        ethers.parseEther("100")
      );

      await structMappingDemo.updateOrderStatus(orderId, 1); // Confirmed
      const order = await structMappingDemo.getOrder(orderId);
      expect(order.status).to.equal(1);
    });
  });

  describe("产品管理", function () {
    it("应该能够创建产品", async function () {
      const productId = await structMappingDemo.createProduct.staticCall(
        "Test Product",
        ethers.parseEther("10"),
        100
      );

      expect(productId).to.equal(1);

      await structMappingDemo.createProduct(
        "Test Product",
        ethers.parseEther("10"),
        100
      );

      const product = await structMappingDemo.getProduct(productId);
      expect(product.name).to.equal("Test Product");
      expect(product.price).to.equal(ethers.parseEther("10"));
      expect(product.stock).to.equal(100);
    });
  });

  describe("嵌套映射", function () {
    it("应该能够设置用户产品数量", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      const productId = await structMappingDemo.createProduct.staticCall("Product", ethers.parseEther("10"), 100);

      await structMappingDemo.createProduct("Product", ethers.parseEther("10"), 100);

      await structMappingDemo.setUserProduct(addr1.address, productId, 5);
      const quantity = await structMappingDemo.getUserProduct(addr1.address, productId);
      expect(quantity).to.equal(5);
    });
  });

  describe("查询函数", function () {
    it("应该能够获取所有用户", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.createUser(addr2.address, ethers.parseEther("200"));
      
      const users = await structMappingDemo.getAllUsers();
      expect(users.length).to.equal(2);
    });

    it("应该能够计算总余额", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.createUser(addr2.address, ethers.parseEther("200"));
      
      const totalBalance = await structMappingDemo.getTotalBalance();
      expect(totalBalance).to.equal(ethers.parseEther("300"));
    });

    it("应该能够查找符合条件的用户", async function () {
      await structMappingDemo.createUser(addr1.address, ethers.parseEther("100"));
      await structMappingDemo.createUser(addr2.address, ethers.parseEther("200"));
      
      const users = await structMappingDemo.findUsersWithBalance(ethers.parseEther("150"));
      expect(users.length).to.equal(1);
      expect(users[0]).to.equal(addr2.address);
    });
  });
});

