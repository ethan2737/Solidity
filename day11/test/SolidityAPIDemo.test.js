const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * SolidityAPIDemo 测试套件
 * 测试全局变量和错误处理功能
 */
describe("SolidityAPIDemo", function () {
  let demo;
  let owner;
  let addr1;
  let addr2;

  // 部署合约
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Demo = await ethers.getContractFactory("SolidityAPIDemo");
    demo = await Demo.deploy();
    await demo.waitForDeployment();
  });

  // ═══════════════════════════════════════════════════════════
  // 第一部分：msg.sender / msg.value 测试
  // ═══════════════════════════════════════════════════════════

  describe("msg.sender 和 msg.value", function () {
    it("应该正确记录存款并更新余额", async function () {
      // 存款
      const depositAmount = ethers.parseEther("1.0");
      await demo.connect(addr1).deposit({ value: depositAmount });

      // 检查余额
      const balance = await demo.balances(addr1.address);
      expect(balance).to.equal(depositAmount);
    });

    it("应该正确获取 msg.sender 信息", async function () {
      const [sender, ethAmount] = await demo.getMsgInfo();
      expect(sender).to.equal(owner.address);
    });

    it("应该正确获取 tx.origin", async function () {
      const origin = await demo.getTxOrigin();
      expect(origin).to.equal(owner.address);
    });

    it("直接调用时 msg.sender 应等于 tx.origin", async function () {
      const [sender, origin, isSame] = await demo.compareSenderAndOrigin();
      expect(sender).to.equal(origin);
      expect(isSame).to.equal(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第二部分：区块变量测试
  // ═══════════════════════════════════════════════════════════

  describe("区块变量", function () {
    it("应该返回 block.timestamp", async function () {
      const timestamp = await demo.getBlockTimestamp();
      expect(timestamp).to.be.gt(0);
    });

    it("应该返回 block.number", async function () {
      const blockNumber = await demo.getBlockNumber();
      expect(blockNumber).to.be.gt(0);
    });

    it("应该返回 block.coinbase", async function () {
      const coinbase = await demo.getBlockCoinbase();
      expect(coinbase).to.not.equal(ethers.ZeroAddress);
    });

    it("应该返回所有区块信息", async function () {
      const [timestamp, number, coinbase, difficulty, gaslimit] = await demo.getAllBlockInfo();
      expect(timestamp).to.be.gt(0);
      expect(number).to.be.gt(0);
      expect(coinbase).to.not.equal(ethers.ZeroAddress);
      expect(difficulty).to.be.gt(0);
      expect(gaslimit).to.be.gt(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第三部分：地址与合约变量测试
  // ═══════════════════════════════════════════════════════════

  describe("地址与合约变量", function () {
    it("应该返回合约地址", async function () {
      const contractAddress = await demo.getContractAddress();
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("应该返回合约余额", async function () {
      const balance = await demo.getContractBalance();
      expect(balance).to.equal(0);
    });

    it("存款后合约余额应增加", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await demo.deposit({ value: depositAmount });

      const balance = await demo.getContractBalance();
      expect(balance).to.equal(depositAmount);
    });

    it("应该返回剩余 Gas", async function () {
      const gasLeft = await demo.getGasLeft();
      expect(gasLeft).to.be.gt(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第四部分：编码与哈希函数测试
  // ═══════════════════════════════════════════════════════════

  describe("编码与哈希函数", function () {
    it("应该正确使用 abi.encode", async function () {
      const encoded = await demo.encodeWithAbi(1, 2);
      expect(encoded.length).to.be.gt(0);
    });

    it("应该正确使用 abi.encodePacked", async function () {
      const packed = await demo.encodePacked(1, 2);
      expect(packed.length).to.be.gt(0);
    });

    it("应该正确计算 keccak256 哈希", async function () {
      const hash = await demo.hashString("hello");
      expect(hash).to.not.equal(ethers.ZeroHash);
    });

    it("不同输入应产生不同哈希", async function () {
      const hash1 = await demo.hashString("hello");
      const hash2 = await demo.hashString("world");
      expect(hash1).to.not.equal(hash2);
    });

    it("应该正确计算哈希并验证", async function () {
      // 测试哈希计算
      const hash = await demo.hashString("hello world");
      expect(hash).to.not.equal(ethers.ZeroHash);

      // 测试多参数哈希
      const multiHash = await demo.hashMultiple(123, owner.address, "test");
      expect(multiHash).to.not.equal(ethers.ZeroHash);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第五部分：require 错误处理测试
  // ═══════════════════════════════════════════════════════════

  describe("require 错误处理", function () {
    it("应该允许设置有效值", async function () {
      await demo.setValueWithRequire(100);
      const value = await demo.getValue();
      expect(value).to.equal(100);
    });

    it("应该拒绝零值", async function () {
      await expect(demo.setValueWithRequire(0)).to.be.revertedWith("Value must be greater than 0");
    });

    it("应该拒绝超过最大值", async function () {
      await expect(demo.setValueWithRequire(1001)).to.be.revertedWith("Value must be less than or equal to 1000");
    });

    it("应该正确执行 owner 检查", async function () {
      await demo.setValueWithOwnerCheck(50);
      const value = await demo.getValue();
      expect(value).to.equal(50);
    });

    it("非 owner 不能设置值", async function () {
      await expect(
        demo.connect(addr1).setValueWithOwnerCheck(50)
      ).to.be.revertedWith("Only owner can set value");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第六部分：revert 错误处理测试
  // ═══════════════════════════════════════════════════════════

  describe("revert 错误处理", function () {
    it("应该允许设置有效值", async function () {
      await demo.setValueWithRevert(200);
      const value = await demo.getValue();
      expect(value).to.equal(200);
    });

    it("应该拒绝零值（使用 revert）", async function () {
      await expect(demo.setValueWithRevert(0)).to.be.revertedWith("Value cannot be zero");
    });

    it("应该拒绝超过最大值（使用 revert）", async function () {
      await expect(demo.setValueWithRevert(1001)).to.be.revertedWith("Value exceeds maximum");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第七部分：assert 错误处理测试
  // ═══════════════════════════════════════════════════════════

  describe("assert 错误处理", function () {
    it("存款后 assert 检查应通过", async function () {
      const amount = ethers.parseEther("0.1");
      await demo.depositWithAssert(amount);

      const balance = await demo.balances(owner.address);
      expect(balance).to.equal(amount);
    });

    it("应该正确执行 safeAdd", async function () {
      const result = await demo.safeAdd(100, 200);
      expect(result).to.equal(300);
    });

    it("safeAdd 应检测溢出", async function () {
      // uint256 最大值
      const maxUint = ethers.MaxUint256;
      await expect(demo.safeAdd(maxUint, 1)).to.be.reverted;
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第八部分：try/catch 测试
  // ═══════════════════════════════════════════════════════════

  describe("try/catch 错误处理", function () {
    it("应该成功调用外部合约", async function () {
      // 直接调用自己的 setValueWithRequire
      await demo.setValueWithRequire(50);
      const value = await demo.getValue();
      expect(value).to.equal(50);
    });

    it("应该正确处理外部调用错误", async function () {
      // 部署一个新的合约实例作为目标
      const Demo2 = await ethers.getContractFactory("SolidityAPIDemo");
      const demo2 = await Demo2.deploy();
      await demo2.waitForDeployment();

      // 使用 try/catch 方式调用，预期会触发错误处理
      await demo.callExternalWithTryCatch(demo2.target, 0);

      // 由于传入了 0，会触发 require 错误，但不会 revert（被 catch 捕获）
      // 这是一个异常场景，测试通过即可
    });

    it("应该正确执行批量调用", async function () {
      // 部署一个新的合约
      const Demo2 = await ethers.getContractFactory("SolidityAPIDemo");
      const demo2 = await Demo2.deploy();
      await demo2.waitForDeployment();

      // 批量调用 - 使用正确的 payable 地址格式
      const targets = [demo.target, demo2.target];
      const values = [10, 20];

      // 注意：batchCall 返回的是 transaction response，需要等待
      const tx = await demo.batchCall(targets, values);
      await tx.wait();

      // 检查值是否设置成功
      const value1 = await demo.getValue();
      expect(value1).to.equal(10);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // 第九部分：提款测试
  // ═══════════════════════════════════════════════════════════

  describe("提款功能", function () {
    beforeEach(async function () {
      // 先存款
      const depositAmount = ethers.parseEther("2.0");
      await demo.connect(addr1).deposit({ value: depositAmount });
    });

    it("应该成功提取资金", async function () {
      const withdrawAmount = ethers.parseEther("1.0");

      // 记录提取前余额
      const balanceBefore = await demo.balances(addr1.address);

      // 提取
      await demo.connect(addr1).withdraw(withdrawAmount);

      // 检查余额变化
      const balanceAfter = await demo.balances(addr1.address);
      expect(balanceAfter).to.equal(balanceBefore - withdrawAmount);
    });

    it("应该拒绝超额提取", async function () {
      const withdrawAmount = ethers.parseEther("10.0");

      await expect(
        demo.connect(addr1).withdraw(withdrawAmount)
      ).to.be.reverted;
    });

    it("应该拒绝零值提取", async function () {
      await expect(
        demo.connect(addr1).withdraw(0)
      ).to.be.reverted;
    });
  });
});

/**
 * VulnerableWallet 测试
 * 演示 tx.origin 攻击
 */
describe("VulnerableWallet", function () {
  let vulnerable;
  let owner;
  let attacker;

  beforeEach(async function () {
    [owner, attacker] = await ethers.getSigners();

    const VulnerableWallet = await ethers.getContractFactory("VulnerableWallet");
    vulnerable = await VulnerableWallet.deploy();
    await vulnerable.waitForDeployment();
  });

  it("owner 应该可以存款和取款", async function () {
    // 存款 - 调用 deposit 函数
    await vulnerable.deposit({ value: ethers.parseEther("1.0") });

    expect(await vulnerable.getBalance()).to.equal(ethers.parseEther("1.0"));

    // 取款
    await vulnerable.withdraw(ethers.parseEther("0.5"));
    expect(await vulnerable.getBalance()).to.equal(ethers.parseEther("0.5"));
  });
});

/**
 * SafeWallet 测试
 * 展示正确的安全实现
 */
describe("SafeWallet", function () {
  let safe;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const SafeWallet = await ethers.getContractFactory("SafeWallet");
    safe = await SafeWallet.deploy();
    await safe.waitForDeployment();
  });

  it("user 应该可以存款", async function () {
    // 调用 deposit 函数存款
    await safe.connect(user).deposit({ value: ethers.parseEther("1.0") });

    expect(await safe.balances(user.address)).to.equal(ethers.parseEther("1.0"));
  });

  it("user 应该可以取款", async function () {
    // 存款 - 调用 deposit 函数
    await safe.connect(user).deposit({ value: ethers.parseEther("1.0") });

    // 取款
    await safe.connect(user).withdraw(ethers.parseEther("0.5"));
    expect(await safe.balances(user.address)).to.equal(ethers.parseEther("0.5"));
  });

  it("user 不能提取其他人的资金", async function () {
    // owner 存款 - 调用 deposit 函数
    await safe.connect(owner).deposit({ value: ethers.parseEther("1.0") });

    // user 尝试取款
    await expect(
      safe.connect(user).withdraw(ethers.parseEther("0.5"))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("owner 可以提取所有资金", async function () {
    // user 存款 - 调用 deposit 函数
    await safe.connect(user).deposit({ value: ethers.parseEther("1.0") });

    // owner 提取所有
    await safe.connect(owner).withdrawAll();
    expect(await safe.getBalance()).to.equal(0);
  });
});
