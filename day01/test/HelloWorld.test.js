const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * HelloWorld 合约测试套件
 *
 * 测试覆盖范围：
 * 1. 合约部署
 * 2. 构造函数功能
 * 3. setMessage() 函数
 * 4. getMessage() 函数
 * 5. getDeployer() 函数
 * 6. 事件触发
 * 7. Gas 优化检查
 * 8. 边界情况
 *
 * 使用方法：
 * npx hardhat test
 */
describe("HelloWorld", function () {
  // 测试变量
  let helloWorld;
  let owner;
  let addr1;
  let addr2;

  // 初始消息
  const initialMessage = "Hello, Web3 World! 🌍";

  /**
   * beforeEach: 在每个测试用例之前执行
   * 部署一个新的 HelloWorld 合约实例
   */
  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署合约
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    helloWorld = await HelloWorld.deploy(initialMessage);
    await helloWorld.waitForDeployment();
  });

  /**
   * 测试组 1: 合约部署
   */
  describe("部署", function () {
    it("应该成功部署合约", async function () {
      const contractAddress = await helloWorld.getAddress();
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
      expect(contractAddress).to.be.properAddress;
    });

    it("应该正确设置初始消息", async function () {
      const message = await helloWorld.getMessage();
      expect(message).to.equal(initialMessage);
    });

    it("应该返回调用者地址", async function () {
      // 注意：getDeployer 返回的是调用者，不是原始部署者
      const deployer = await helloWorld.getDeployer();
      expect(deployer).to.equal(owner.address);
    });
  });

  /**
   * 测试组 2: getMessage() 函数
   */
  describe("getMessage()", function () {
    it("应该返回初始消息", async function () {
      const message = await helloWorld.getMessage();
      expect(message).to.equal(initialMessage);
    });

    it("应该返回更新后的消息", async function () {
      const newMessage = "Updated message";
      await helloWorld.setMessage(newMessage);

      const message = await helloWorld.getMessage();
      expect(message).to.equal(newMessage);
    });

    it("应该是一个 view 函数（不消耗 gas）", async function () {
      // view 函数调用不需要交易，直接返回结果
      const message = await helloWorld.getMessage();
      expect(message).to.be.a("string");
    });
  });

  /**
   * 测试组 3: setMessage() 函数
   */
  describe("setMessage()", function () {
    it("应该允许任何人更新消息", async function () {
      const newMessage = "New message from anyone";

      // 使用 addr1 调用 setMessage
      await helloWorld.connect(addr1).setMessage(newMessage);

      const message = await helloWorld.getMessage();
      expect(message).to.equal(newMessage);
    });

    it("应该触发 MessageChanged 事件", async function () {
      const newMessage = "Event test message";

      await expect(helloWorld.setMessage(newMessage))
        .to.emit(helloWorld, "MessageChanged")
        .withArgs(initialMessage, newMessage);
    });

    it("应该可以多次更新消息", async function () {
      const messages = [
        "First update",
        "Second update",
        "Third update"
      ];

      for (const msg of messages) {
        await helloWorld.setMessage(msg);
        const currentMessage = await helloWorld.getMessage();
        expect(currentMessage).to.equal(msg);
      }
    });

    it("应该允许设置空字符串", async function () {
      await helloWorld.setMessage("");
      const message = await helloWorld.getMessage();
      expect(message).to.equal("");
    });

    it("应该允许设置长消息", async function () {
      const longMessage = "A".repeat(1000);
      await helloWorld.setMessage(longMessage);
      const message = await helloWorld.getMessage();
      expect(message).to.equal(longMessage);
    });
  });

  /**
   * 测试组 4: getDeployer() 函数
   */
  describe("getDeployer()", function () {
    it("应该返回调用者地址", async function () {
      const deployer = await helloWorld.getDeployer();
      expect(deployer).to.equal(owner.address);
    });

    it("应该是一个 view 函数", async function () {
      const deployer = await helloWorld.getDeployer();
      expect(deployer).to.be.properAddress;
    });
  });

  /**
   * 测试组 5: 事件
   */
  describe("事件", function () {
    it("setMessage 应该触发 MessageChanged 事件", async function () {
      const newMessage = "Event test";

      const tx = await helloWorld.setMessage(newMessage);
      const receipt = await tx.wait();

      // 检查事件是否被触发
      expect(receipt.logs).to.not.be.undefined;
      expect(receipt.logs.length).to.be.greaterThan(0);

      // 查找并解析 MessageChanged 事件
      const event = receipt.logs.find(log => {
        try {
          const parsed = helloWorld.interface.parseLog(log);
          return parsed.name === "MessageChanged";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
    });
  });

  /**
   * 测试组 6: Gas 优化检查
   */
  describe("Gas 优化", function () {
    it("getMessage() 应该不消耗 gas（view 函数）", async function () {
      // view 函数不返回交易收据，因为没有实际交易
      const tx = await helloWorld.getMessage();
      expect(tx).to.be.a("string");
    });

    it("setMessage() 应该消耗合理的 gas", async function () {
      const tx = await helloWorld.setMessage("Gas test");
      const receipt = await tx.wait();

      // Gas 使用量应该在合理范围内（通常 < 100,000）
      expect(Number(receipt.gasUsed)).to.be.lessThan(100000);
    });
  });

  /**
   * 测试组 7: 边界情况
   */
  describe("边界情况", function () {
    it("应该处理特殊字符", async function () {
      const specialMessage = "Hello! @#$%^&*() 中文 🎉";
      await helloWorld.setMessage(specialMessage);
      const message = await helloWorld.getMessage();
      expect(message).to.equal(specialMessage);
    });

    it("应该处理 Unicode 字符", async function () {
      const unicodeMessage = "Hello 🌍 世界 مرحبا";
      await helloWorld.setMessage(unicodeMessage);
      const message = await helloWorld.getMessage();
      expect(message).to.equal(unicodeMessage);
    });
  });
});
