const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * ComprehensiveDemo 合约测试
 */
describe("ComprehensiveDemo", function () {
  let targetContract;
  let comprehensiveDemo;
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

    // 部署综合演示合约
    const ComprehensiveDemo = await ethers.getContractFactory("ComprehensiveDemo");
    comprehensiveDemo = await ComprehensiveDemo.deploy("ComprehensiveDemo");
    await comprehensiveDemo.waitForDeployment();

    // 设置目标合约地址
    await comprehensiveDemo.setTargetContract(await targetContract.getAddress());
  });

  // ═══════════════════════════════════════════════════════════
  // ABI 编码测试
  // ═══════════════════════════════════════════════════════════

  describe("ABI Encoding", function () {
    it("测试 abi.encode 编码和解码", async function () {
      const value = 123;
      const name = "Test";
      const addr = "0x1230000000000000000000000000000000000123";

      // 编码
      const encoded = await comprehensiveDemo.encodeWithEncode(value, name, addr);
      expect(encoded.length).to.gt(0);

      // 解码
      const [decodedValue, decodedName, decodedAddr] = await comprehensiveDemo.decodeDemo(encoded);
      expect(decodedValue).to.equal(value);
      expect(decodedName).to.equal(name);
      expect(decodedAddr).to.equal(addr);
    });

    it("测试 abi.encodePacked 编码", async function () {
      const value = 456;
      const name = "Packed";
      const addr = "0x4560000000000000000000000000000000000456";

      const encoded = await comprehensiveDemo.encodeWithEncodePacked(value, name, addr);
      expect(encoded.length).to.gt(0);
    });

    it("测试 encodeWithSignature 编码", async function () {
      const value = 789;
      const encoded = await comprehensiveDemo.encodeWithSignatureDemo(value);
      // 编码结果包含函数选择器（4字节）+ 参数
      expect(encoded.length).to.gt(0);
    });

    it("测试 computeHash 函数", async function () {
      const value = 100;
      const name = "HashTest";
      const addr = "0xABC0000000000000000000000000000000000ABC";

      const hash = await comprehensiveDemo.computeHash(value, name, addr);
      expect(hash).to.not.equal(ethers.ZeroHash);
    });

    it("测试获取函数选择器", async function () {
      const selector = await comprehensiveDemo.getFunctionSelector("setValue(uint256)");
      expect(selector).to.not.equal("0x00000000");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 接口调用测试
  // ═══════════════════════════════════════════════════════════

  describe("Interface Call", function () {
    it("测试通过接口设置值", async function () {
      const newValue = 200;
      await comprehensiveDemo.interfaceSetValue(newValue);

      const value = await targetContract.value();
      expect(value).to.equal(newValue);
    });

    it("测试通过接口增加计数器", async function () {
      expect(await targetContract.counter()).to.equal(0);

      await comprehensiveDemo.interfaceIncrementCounter();

      expect(await targetContract.counter()).to.equal(1);
    });

    it("测试获取完整信息", async function () {
      await targetContract.setValue(999);
      await targetContract.incrementCounter();

      const [value, ownerAddr, counter, contractAddr] = await comprehensiveDemo.interfaceGetInfo();

      expect(value).to.equal(999);
      expect(counter).to.equal(1);
      expect(contractAddr).to.equal(await targetContract.getAddress());
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Low-level Call 测试
  // ═══════════════════════════════════════════════════════════

  describe("Low-level Call", function () {
    it("测试 low-level call 设置值", async function () {
      const newValue = 300;
      const tx = await comprehensiveDemo.lowLevelCallSetValue(newValue);
      await tx.wait();

      expect(await targetContract.value()).to.equal(newValue);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // Call vs Delegatecall 测试
  // ═══════════════════════════════════════════════════════════

  describe("Call vs Delegatecall", function () {
    it("测试 call 修改目标合约状态", async function () {
      const newValue = 111;
      await comprehensiveDemo.callSetValue(newValue);

      // 目标合约的值被修改
      expect(await targetContract.value()).to.equal(newValue);
      // 综合演示合约的值未改变
      expect(await comprehensiveDemo.value()).to.equal(0);
    });

    it("测试 delegatecall 修改当前合约状态", async function () {
      const newValue = 222;
      await comprehensiveDemo.delegatecallSetValue(newValue);

      // 综合演示合约的值被修改
      expect(await comprehensiveDemo.value()).to.equal(newValue);
      // 目标合约的值未改变
      expect(await targetContract.value()).to.equal(100);
    });

    it("测试 call vs delegatecall 计数器对比", async function () {
      // 初始状态
      expect(await targetContract.counter()).to.equal(0);
      expect(await comprehensiveDemo.counter()).to.equal(0);

      // 使用 call 增加目标合约计数器
      await comprehensiveDemo.callIncrementCounter();
      expect(await targetContract.counter()).to.equal(1);
      expect(await comprehensiveDemo.counter()).to.equal(0);

      // 使用 delegatecall 增加当前合约计数器
      await comprehensiveDemo.delegatecallIncrementCounter();
      expect(await targetContract.counter()).to.equal(1);
      expect(await comprehensiveDemo.counter()).to.equal(1);
    });

    it("测试对比 call 和 delegatecall 的综合效果", async function () {
      const testValue = 888;
      await comprehensiveDemo.compareCallAndDelegatecall(testValue);

      // 目标合约：值被设置，计数器增加
      expect(await targetContract.value()).to.equal(testValue);
      expect(await targetContract.counter()).to.equal(1);

      // 综合演示合约：值未变（call），计数器增加（delegatecall）
      expect(await comprehensiveDemo.value()).to.equal(0);
      expect(await comprehensiveDemo.counter()).to.equal(1);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 辅助函数测试
  // ═══════════════════════════════════════════════════════════

  describe("Helper Functions", function () {
    it("测试验证存储布局", async function () {
      const isMatch = await comprehensiveDemo.verifyStorageLayout();
      expect(isMatch).to.equal(true);
    });

    it("测试获取调用次数", async function () {
      expect(await comprehensiveDemo.getCallCount(user1.address)).to.equal(0);

      await comprehensiveDemo.connect(user1).interfaceSetValue(100);

      expect(await comprehensiveDemo.getCallCount(user1.address)).to.equal(1);
    });

    it("测试获取当前合约信息", async function () {
      await comprehensiveDemo.setOwnValue(123, "TestName");

      const [value, ownerAddr, counter, name] = await comprehensiveDemo.getThisContractInfo();

      expect(value).to.equal(123);
      expect(counter).to.equal(0);
      expect(name).to.equal("TestName");
    });

    it("测试设置目标合约地址", async function () {
      const newTarget = "0x1234000000000000000000000000000000123400";
      await comprehensiveDemo.setTargetContract(newTarget);

      expect(await comprehensiveDemo.targetContract()).to.equal(newTarget);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 边界测试
  // ═══════════════════════════════════════════════════════════

  describe("Edge Cases", function () {
    it("测试大数值", async function () {
      const largeValue = ethers.MaxUint256;
      await comprehensiveDemo.interfaceSetValue(largeValue);

      expect(await targetContract.value()).to.equal(largeValue);
    });

    it("测试多次调用累积效果", async function () {
      for (let i = 0; i < 5; i++) {
        await comprehensiveDemo.interfaceIncrementCounter();
      }

      expect(await targetContract.counter()).to.equal(5);
    });
  });
});
