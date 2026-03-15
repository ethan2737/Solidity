/**
 * ERC20Basic 合约测试用例
 *
 * 测试框架：Hardhat + Chai + Ethers.js
 * 测试内容：覆盖 ERC20 标准的所有核心功能
 *
 * 测试思路：
 * 1. 每个公开函数对应一组测试
 * 2. 每个函数测试正向案例（应该成功）和负向案例（应该失败）
 * 3. 验证返回值、状态变化、事件触发三个维度
 */

const { expect } = require("chai");    // Chai 断言库：expect(...).to.equal(...)
const { ethers } = require("hardhat"); // Hardhat Ethers 插件：用于部署和调用合约

/**
 * describe() - 测试分组
 * 第一个参数：测试组名称
 * 第二个参数：测试函数
 */
describe("ERC20Basic", function () {
  // 声明合约实例和测试账户变量
  let erc20Basic;  // 合约实例
  let owner;      // 部署者账户（也是初始代币持有者）
  let addr1;      // 测试账户1
  let addr2;      // 测试账户2
  let addrs;      // 其他测试账户数组

  // 常量：初始供应量（100万代币，使用 ethers.utils.parseEther 转换）
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");

  /**
   * beforeEach() - 每个测试用例执行前运行
   * 作用：重新部署合约，确保每个测试独立运行
   */
  beforeEach(async function () {
    // 获取测试账户（Hardhat 自动生成 20 个测试账户）
    // owner = 部署者，addr1/addr2 = 普通测试账户
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 获取合约工厂（用于部署合约）
    const ERC20Basic = await ethers.getContractFactory("ERC20Basic");

    // 部署合约，传入构造函数参数
    // 参数：代币名称、代币符号、小数位数、初始供应量
    erc20Basic = await ERC20Basic.deploy(
      "Basic Token",  // name: 代币名称
      "BSC",          // symbol: 代币符号
      18,             // decimals: 小数位数（以太坊标准 18 位）
      INITIAL_SUPPLY  // initialSupply: 初始供应量
    );

    // 等待合约部署完成（区块链确认）
    await erc20Basic.deployed();
  });

  /**
   * describe("部署", ...) - 部署相关测试
   * 验证构造函数是否正确初始化代币参数
   */
  describe("部署", function () {
    /**
     * it() - 单个测试用例
     * 第一个参数：测试描述（应该...）
     * 第二个参数：测试函数（async）
     */
    it("应该正确设置代币名称、符号和小数位数", async function () {
      // 验证 name() 返回值
      expect(await erc20Basic.name()).to.equal("Basic Token");
      // 验证 symbol() 返回值
      expect(await erc20Basic.symbol()).to.equal("BSC");
      // 验证 decimals() 返回值
      expect(await erc20Basic.decimals()).to.equal(18);
    });

    it("应该向部署者分配初始供应量", async function () {
      // 查询部署者的代币余额
      const ownerBalance = await erc20Basic.balanceOf(owner.address);
      // 验证余额等于初始供应量
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("应该正确设置总供应量", async function () {
      // 查询总供应量
      const totalSupply = await erc20Basic.totalSupply();
      // 验证总供应量等于初始供应量
      expect(totalSupply).to.equal(INITIAL_SUPPLY);
    });
  });

  /**
   * describe("转账 (transfer)", ...) - 转账功能测试
   * 测试 ERC20 的 transfer() 函数
   */
  describe("转账 (transfer)", function () {
    it("应该允许转账代币", async function () {
      // 准备转账金额：100 ETH（注意：内部会乘以 10^decimals）
      const transferAmount = ethers.utils.parseEther("100");

      // 调用合约的 transfer 函数转账
      // 从 owner 转账到 addr1
      await erc20Basic.transfer(addr1.address, transferAmount);

      // 查询 addr1 的余额
      const addr1Balance = await erc20Basic.balanceOf(addr1.address);
      // 验证余额等于转账金额
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("应该从发送者余额中扣除", async function () {
      const transferAmount = ethers.utils.parseEther("100");

      // 转账前的余额
      const ownerBalanceBefore = await erc20Basic.balanceOf(owner.address);

      // 执行转账
      await erc20Basic.transfer(addr1.address, transferAmount);

      // 转账后的余额
      const ownerBalanceAfter = await erc20Basic.balanceOf(owner.address);
      // 验证余额减少了转账金额（使用 .sub() 进行大数减法）
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.sub(transferAmount));
    });

    it("应该触发 Transfer 事件", async function () {
      const transferAmount = ethers.utils.parseEther("100");

      // expect(...).to.emit(...).withArgs(...) 验证事件触发
      // 验证合约触发了 Transfer 事件，且参数正确
      await expect(erc20Basic.transfer(addr1.address, transferAmount))
        .to.emit(erc20Basic, "Transfer")                    // 事件名
        .withArgs(owner.address, addr1.address, transferAmount); // 事件参数
    });

    it("应该拒绝余额不足的转账", async function () {
      // 尝试转账超过余额的数量（200万 > 初始100万）
      const transferAmount = ethers.utils.parseEther("2000000");

      // expect(...).to.be.revertedWith(...) 验证交易失败
      await expect(
        erc20Basic.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("ERC20: insufficient balance");
    });

    it("应该拒绝向零地址转账", async function () {
      const transferAmount = ethers.utils.parseEther("100");

      // 零地址：ethers.constants.AddressZero
      await expect(
        erc20Basic.transfer(ethers.constants.AddressZero, transferAmount)
      ).to.be.revertedWith("ERC20: transfer to zero address");
    });
  });

  /**
   * describe("授权 (approve)", ...) - 授权功能测试
   * 测试 ERC20 的 approve() 函数
   */
  describe("授权 (approve)", function () {
    it("应该允许授权代币", async function () {
      // 授权金额
      const approveAmount = ethers.utils.parseEther("1000");

      // 调用 approve 授权 addr1
      await erc20Basic.approve(addr1.address, approveAmount);

      // 查询授权额度：owner 授权给 addr1 的额度
      const allowance = await erc20Basic.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("应该触发 Approval 事件", async function () {
      const approveAmount = ethers.utils.parseEther("1000");

      // 验证 Approval 事件
      await expect(erc20Basic.approve(addr1.address, approveAmount))
        .to.emit(erc20Basic, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });

    it("应该拒绝向零地址授权", async function () {
      const approveAmount = ethers.utils.parseEther("1000");

      // 不能授权给零地址
      await expect(
        erc20Basic.approve(ethers.constants.AddressZero, approveAmount)
      ).to.be.revertedWith("ERC20: approve to zero address");
    });
  });

  /**
   * describe("代理转账 (transferFrom)", ...) - 代理转账测试
   * 测试 ERC20 的 transferFrom() 函数
   * 场景：已授权的账户代表他人转账
   */
  describe("代理转账 (transferFrom)", function () {
    it("应该允许代理转账", async function () {
      const approveAmount = ethers.utils.parseEther("1000"); // 授权1000
      const transferAmount = ethers.utils.parseEther("500"); // 转账500

      // 步骤1：owner 授权 addr1
      await erc20Basic.approve(addr1.address, approveAmount);

      // 步骤2：addr1 作为调用者执行 transferFrom
      // contract.connect(addr1) - 以 addr1 的身份调用合约
      const tokenWithAddr1 = erc20Basic.connect(addr1);
      await tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount);

      // 验证 addr2 收到了代币
      const addr2Balance = await erc20Basic.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("应该减少授权额度", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("500");

      // 授权
      await erc20Basic.approve(addr1.address, approveAmount);

      // 执行代理转账
      const tokenWithAddr1 = erc20Basic.connect(addr1);
      await tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount);

      // 查询剩余授权额度
      const remainingAllowance = await erc20Basic.allowance(owner.address, addr1.address);
      // 验证剩余额度 = 原授权额度 - 转账金额
      expect(remainingAllowance).to.equal(approveAmount.sub(transferAmount));
    });

    it("应该拒绝超过授权额度的转账", async function () {
      const approveAmount = ethers.utils.parseEther("1000");
      const transferAmount = ethers.utils.parseEther("2000"); // 超过授权额度

      // 授权 1000
      await erc20Basic.approve(addr1.address, approveAmount);

      // 尝试转账 2000（应该失败）
      const tokenWithAddr1 = erc20Basic.connect(addr1);
      await expect(
        tokenWithAddr1.transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  /**
   * describe("增加授权 (increaseAllowance)", ...) - 增加授权测试
   * 测试 increaseAllowance() 函数（安全授权方式）
   */
  describe("增加授权 (increaseAllowance)", function () {
    it("应该允许增加授权额度", async function () {
      const initialAmount = ethers.utils.parseEther("1000");
      const addedAmount = ethers.utils.parseEther("500");

      // 初始授权 1000
      await erc20Basic.approve(addr1.address, initialAmount);
      // 增加授权 500
      await erc20Basic.increaseAllowance(addr1.address, addedAmount);

      // 查询授权额度
      const allowance = await erc20Basic.allowance(owner.address, addr1.address);
      // 验证 = 1000 + 500 = 1500（使用 .add() 进行大数加法）
      expect(allowance).to.equal(initialAmount.add(addedAmount));
    });
  });

  /**
   * describe("减少授权 (decreaseAllowance)", ...) - 减少授权测试
   * 测试 decreaseAllowance() 函数
   */
  describe("减少授权 (decreaseAllowance)", function () {
    it("应该允许减少授权额度", async function () {
      const initialAmount = ethers.utils.parseEther("1000");
      const subtractedAmount = ethers.utils.parseEther("300");

      // 初始授权 1000
      await erc20Basic.approve(addr1.address, initialAmount);
      // 减少授权 300
      await erc20Basic.decreaseAllowance(addr1.address, subtractedAmount);

      // 查询授权额度
      const allowance = await erc20Basic.allowance(owner.address, addr1.address);
      // 验证 = 1000 - 300 = 700
      expect(allowance).to.equal(initialAmount.sub(subtractedAmount));
    });

    it("应该拒绝减少超过当前授权额度的数量", async function () {
      const initialAmount = ethers.utils.parseEther("1000");
      const subtractedAmount = ethers.utils.parseEther("2000"); // 超过授权额度

      // 授权 1000
      await erc20Basic.approve(addr1.address, initialAmount);

      // 尝试减少 2000（应该失败）
      await expect(
        erc20Basic.decreaseAllowance(addr1.address, subtractedAmount)
      ).to.be.revertedWith("ERC20: decreased allowance below zero");
    });
  });
});

