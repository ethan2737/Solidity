// ═══════════════════════════════════════════════════════════════════════════
// 导入依赖
// ═══════════════════════════════════════════════════════════════════════════

// 从 chai 库导入 expect，用于断言测试结果
// expect 是 BDD 风格的断言库，用于验证代码行为是否符合预期
const { expect } = require("chai");

// 从 hardhat 导入 ethers，用于与以太坊智能合约交互
// ethers 是一个完整的以太坊钱包和合约交互库
const { ethers } = require("hardhat");

// ═══════════════════════════════════════════════════════════════════════════
// 测试套件描述
// ═══════════════════════════════════════════════════════════════════════════

/**
 * describe: 定义一个测试套件（Test Suite）
 * 第一个参数 "StakingMining" 是测试套件的名称，会在测试报告中显示
 * 第二个参数是回调函数，包含所有测试用例和嵌套测试套件
 */
describe("StakingMining", function () {

  // ═════════════════════════════════════════════════════════════════════════
  // 声明全局变量（在整个测试套件中使用）
  // ═════════════════════════════════════════════════════════════════════════

  let stakingToken;     // 质押代币合约实例（用户质押的代币，如 USDT）
  let rewardToken;      // 奖励代币合约实例（发放给用户的奖励代币）
  let stakingMining;    // StakingMining 质押挖矿合约实例
  let stakingTokenAddr; // 质押代币合约地址
  let rewardTokenAddr;  // 奖励代币合约地址
  let stakingMiningAddr; // StakingMining 合约地址
  let owner;            // 合约所有者（部署者）
  let addr1;            // 测试用户 1
  let addr2;            // 测试用户 2

  // 奖励速率：每秒发放 1 个奖励代币
  // parseEther("1") 将人类可读的数字转换为 wei 单位（18 位小数）
  // 1 = 1e18 wei = 1000000000000000000
  const REWARD_RATE = ethers.parseEther("1"); // 每秒 1 Token

  // ═════════════════════════════════════════════════════════════════════════
  // .beforeEach() 钩子函数
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * beforeEach: 在**每个**测试用例（it）执行之前都会运行一次
   * 作用：为每个测试提供干净的初始状态，避免测试之间相互影响
   *
   * 执行流程：
   *   测试 1 开始前 → 执行 beforeEach → 执行测试 1
   *   测试 2 开始前 → 执行 beforeEach → 执行测试 2
   *   ...
   */
  beforeEach(async function () {

    // ───────────────────────────────────────────────────────────────────────
    // 获取测试账户
    // ───────────────────────────────────────────────────────────────────────

    /**
     * ethers.getSigners(): 获取 hardhat 提供的测试账户列表
     * 返回一个数组，每个元素是一个 Signer 对象
     * Signer 代表一个以太坊账户，可以签名交易、发送交易
     *
     * [owner, addr1, addr2] 是 ES6 解构赋值语法
     * 等价于：
     *   owner = signers[0]
     *   addr1 = signers[1]
     *   addr2 = signers[2]
     */
    [owner, addr1, addr2] = await ethers.getSigners();

    // ───────────────────────────────────────────────────────────────────────
    // 部署质押代币（MockERC20）
    // ───────────────────────────────────────────────────────────────────────

    /**
     * ethers.getContractFactory("MockERC20"): 获取 MockERC20 合约工厂
     * 合约工厂（ContractFactory）是用来部署合约的对象
     *
     * MockERC20: 一个模拟的 ERC20 代币合约，用于测试
     * 它实现了 ERC20 标准接口，可以用来模拟真实的代币（如 USDT、DAI）
     */
    const MockERC20 = await ethers.getContractFactory("MockERC20");

    /**
     * .deploy(...): 部署合约实例
     * 这是一个异步操作，需要等待交易确认
     *
     * MockERC20 构造函数参数：
     *   - name (string): 代币名称
     *   - symbol (string): 代币符号
     *   - decimals (uint8): 小数位数，18 表示代币精度为 10^18
     *   - initialSupply (uint256): 初始供应量
     *
     * ethers.parseEther("1000000"):
     *   将人类可读的数字转换为 wei 单位
     *   "1000000" → 1000000 * 10^18 = 10^24 wei
     *   也就是 100 万代币（18 位精度）
     */
    stakingToken = await MockERC20.deploy(
      "Staking Token",                // 代币名称：Staking Token
      "STK",                          // 代币符号：STK
      18,                             // 小数位数：18（标准精度）
      ethers.parseEther("1000000")  // 初始供应量：100 万代币
    );

    /**
     * .waitForDeployment(): 等待合约部署完成
     * 在 ethers v5 中，deploy() 返回合约对象，但需要等待部署完成
     * 在 ethers v6 中，这个方法已被废弃，deploy() 直接返回部署好的合约
     */
    await stakingToken.waitForDeployment();
    stakingTokenAddr = await stakingToken.getAddress();

    // ───────────────────────────────────────────────────────────────────────
    // 部署奖励代币（MockERC20）
    // ───────────────────────────────────────────────────────────────────────

    /**
     * 部署奖励代币合约，与质押代币使用相同的 MockERC20 合约
     * 区别在于名称、符号和用途不同
     */
    rewardToken = await MockERC20.deploy(
      "Reward Token",                // 代币名称：Reward Token
      "RWD",                         // 代币符号：RWD
      18,                            // 小数位数：18
      ethers.parseEther("1000000") // 初始供应量：100 万代币
    );
    await rewardToken.waitForDeployment();
    rewardTokenAddr = await rewardToken.getAddress();

    // ───────────────────────────────────────────────────────────────────────
    // 部署 StakingMining 质押挖矿合约
    // ───────────────────────────────────────────────────────────────────────

    /**
     * 获取 StakingMining 合约工厂
     * 这是我们要测试的主合约，实现了质押挖矿的核心逻辑
     */
    const StakingMining = await ethers.getContractFactory("StakingMining");

    /**
     * 部署 StakingMining 合约
     *
     * 构造函数参数：
     *   _stakingToken (address): 质押代币合约地址
     *     - 用户需要质押这种代币才能参与挖矿
     *
     *   _rewardToken (address): 奖励代币合约地址
     *     - 合约向用户发放这种代币作为奖励
     *
     *   _rewardRate (uint256): 奖励速率（每秒）
     *     - 每秒发放多少奖励代币（单位：wei）
     *     - REWARD_RATE = 1e18 = 每秒 1 个代币
     */
    stakingMining = await StakingMining.deploy(
      stakingTokenAddr,   // 质押代币地址
      rewardTokenAddr,    // 奖励代币地址
      REWARD_RATE             // 奖励速率：每秒 1 个代币
    );
    await stakingMining.waitForDeployment();
    stakingMiningAddr = await stakingMining.getAddress();

    // ───────────────────────────────────────────────────────────────────────
    // 向 StakingMining 合约转入奖励代币
    // ───────────────────────────────────────────────────────────────────────

    /**
     * rewardToken.transfer(): 从部署者（owner）向 StakingMining 合约转账
     *
     * 为什么要转账？
     *   StakingMining 合约需要有钱才能给用户发奖励
     *   就像银行需要有存款才能给用户发利息一样
     *
     * 参数：
     *   - to (address): 接收方地址
     *   - amount (uint256): 转账金额
     *
     * 注意：这里没有写 .connect()，默认使用 owner 账户发送交易
     * 因为只有 owner 账户有奖励代币（刚部署时的初始供应）
     */
    await rewardToken.transfer(
      stakingMiningAddr,           // 接收方：StakingMining 合约地址
      ethers.parseEther("100000") // 金额：10 万奖励代币
    );

    // ───────────────────────────────────────────────────────────────────────
    // 给测试账户分配质押代币
    // ───────────────────────────────────────────────────────────────────────

    /**
     * 向 addr1 和 addr2 转账质押代币
     *
     * 为什么要转账？
     *   测试用户需要有质押代币才能进行 stake 操作
     *   就像去银行存钱，先要有钱才能存
     *
     * .connect(addr1): 使用 addr1 账户发送交易
     * .transfer(接收方，金额): ERC20 标准转账函数
     */

    // 给 addr1 转账 10,000 个质押代币
    // addr1.address: 获取 addr1 的钱包地址
    await stakingToken.transfer(addr1.address, ethers.parseEther("10000"));

    // 给 addr2 转账 10,000 个质押代币
    await stakingToken.transfer(addr2.address, ethers.parseEther("10000"));
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：部署测试
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * describe("部署"): 嵌套的测试套件，测试合约部署后的初始状态
   * 这种嵌套结构让测试报告更有层次感
   */
  describe("部署", function () {

    /**
     * it("应该正确设置合约参数"): 一个具体的测试用例
     *
     * 测试报告输出格式：
     *   StakingMining
     *     部署
     *       ✓ 应该正确设置合约参数
     */
    it("应该正确设置合约参数", async function () {

      // expect(): 断言的开始，传入要验证的值
      // .to.equal(): 断言该值等于预期值

      // 验证质押代币地址是否正确设置
      // stakingMining.stakingToken(): 调用合约的 public view 函数，返回 stakingToken 地址
      expect(await stakingMining.stakingToken()).to.equal(stakingTokenAddr);

      // 验证奖励代币地址是否正确设置
      expect(await stakingMining.rewardToken()).to.equal(rewardTokenAddr);

      // 验证奖励速率是否正确设置
      // REWARD_RATE 是之前定义的常量：1e18 (每秒 1 个代币)
      expect(await stakingMining.rewardRate()).to.equal(REWARD_RATE);

      // 验证合约所有者是否是部署者
      // owner.address: 部署者的钱包地址
      expect(await stakingMining.owner()).to.equal(owner.address);

      // 验证合约初始状态是否未暂停
      // false 表示合约正常运行，用户可以质押/提取
      expect(await stakingMining.paused()).to.equal(false);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：Stake 功能（质押）
  // ═════════════════════════════════════════════════════════════════════════

  describe("Stake 功能", function () {

    /**
     * 测试用例 1: 正常质押流程
     * 验证用户可以成功质押代币
     */
    it("应该允许用户质押代币", async function () {

      // 定义质押数量：1000 个代币
      // parseEther("1000") = 1000 * 10^18 = 1e21 wei
      const stakeAmount = ethers.parseEther("1000");

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 1: 授权合约使用代币
      // ─────────────────────────────────────────────────────────────────────

      /**
       * ERC20 授权机制：
       * 用户必须先 approve() 授权，合约才能 transferFrom() 转走代币
       * 这是 ERC20 标准的安全设计，防止恶意合约随意转走用户代币
       *
       * .connect(addr1): 使用 addr1 账户发送交易
       * .approve(spender, amount): 授权 spender 转账 amount 数量的代币
       */
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 2: 执行质押
      // ─────────────────────────────────────────────────────────────────────

      /**
       * stake(amount): 调用 StakingMining 合约的质押函数
       *
       * expect(...).to.emit(): 断言交易是否触发了指定事件
       * .withArgs(): 断言事件的参数值
       *
       * 这行代码验证：
       * 1. stake() 交易成功执行
       * 2. 触发了 "Staked" 事件
       * 3. 事件的参数是 (addr1.address, stakeAmount)
       */
      await expect(stakingMining.connect(addr1).stake(stakeAmount))
        .to.emit(stakingMining, "Staked")
        .withArgs(addr1.address, stakeAmount);

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 3: 验证质押后的状态
      // ─────────────────────────────────────────────────────────────────────

      /**
       * getUserInfo(address): 查询用户的质押信息
       * 返回一个对象，包含：
       *   - stakedAmount: 质押数量
       *   - pendingRewards: 待领取奖励
       *   - lastStakeTime: 上次质押时间
       */
      const userInfo = await stakingMining.getUserInfo(addr1.address);

      // 验证用户质押数量是否正确
      expect(userInfo.stakedAmount).to.equal(stakeAmount);

      // 验证合约总质押量是否正确
      // totalStaked: 所有用户质押的代币总和
      expect(await stakingMining.totalStaked()).to.equal(stakeAmount);
    });

    /**
     * 测试用例 2: 拒绝零金额质押
     * 验证合约会正确拒绝无效的质押请求
     */
    it("应该拒绝零金额质押", async function () {

      /**
       * .to.be.revertedWithCustomError(): 断言交易会被 revert，且错误是指定的自定义错误
       *
       * Solidity 自定义错误：
       * error InvalidAmount();
       * 这种错误定义比字符串错误更省 gas
       */
      await expect(
        stakingMining.connect(addr1).stake(0)  // 质押 0 个代币（无效操作）
      ).to.be.revertedWithCustomError(stakingMining, "InvalidAmount");
    });

    /**
     * 测试用例 3: 拒绝余额不足的质押
     * 验证合约会检查用户余额，防止透支
     */
    it("应该拒绝余额不足的质押", async function () {

      // 定义质押数量：20,000 个代币
      // addr1 只有 10,000 个代币，所以应该失败
      const stakeAmount = ethers.parseEther("20000");

      // 授权（即使授权超过余额也是允许的，实际转账时才会检查）
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      /**
       * .to.be.revertedWithCustomError(): 断言交易 revert，错误是 "InsufficientBalance"
       *
       * 合约检查逻辑：
       * if (stakingToken.balanceOf(msg.sender) < amount) revert InsufficientBalance();
       */
      await expect(
        stakingMining.connect(addr1).stake(stakeAmount)
      ).to.be.revertedWithCustomError(stakingMining, "InsufficientBalance");
    });

    /**
     * 测试用例 4: 暂停状态下拒绝质押
     * 验证合约的紧急暂停机制是否有效
     */
    it("应该在暂停状态下拒绝质押", async function () {

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 1: owner 暂停合约
      // ─────────────────────────────────────────────────────────────────────

      /**
       * pause(): 调用合约的暂停函数
       * 只有 owner 可以调用
       * 暂停后，所有用户操作（stake/unstake/claim）都会被阻止
       */
      await stakingMining.pause();

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 2: 尝试质押（应该失败）
      // ─────────────────────────────────────────────────────────────────────

      const stakeAmount = ethers.parseEther("1000");

      // 授权（授权本身不需要合约未暂停，因为授权是给代币合约的）
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      /**
       * .to.be.revertedWithCustomError(): 断言 revert 错误是 "ContractPaused"
       *
       * 合约检查逻辑：
       * modifier whenNotPaused() {
       *   if (paused) revert ContractPaused();
       *   _;
       * }
       */
      await expect(
        stakingMining.connect(addr1).stake(stakeAmount)
      ).to.be.revertedWithCustomError(stakingMining, "ContractPaused");
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：Unstake 功能（质押退出）
  // ═════════════════════════════════════════════════════════════════════════

  describe("Unstake 功能（质押退出逻辑）", function () {

    /**
     * .beforeEach(): 在退出测试的每个用例前，先让用户质押一些代币
     * 这样后续测试才有东西可以退出
     */
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("1000");

      // 授权
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      // 质押 1000 个代币
      await stakingMining.connect(addr1).stake(stakeAmount);
    });

    /**
     * 测试用例 1: 允许用户退出质押
     */
    it("应该允许用户退出质押", async function () {

      // 定义退出数量：500 个代币
      const unstakeAmount = ethers.parseEther("500");

      /**
       * unstake(amount): 退出质押指定数量
       *
       * 验证：
       * 1. 交易成功执行
       * 2. 触发 "Unstaked" 事件
       * 3. 事件参数正确
       */
      await expect(stakingMining.connect(addr1).unstake(unstakeAmount))
        .to.emit(stakingMining, "Unstaked")
        .withArgs(addr1.address, unstakeAmount);

      // 验证用户剩余质押量：1000 - 500 = 500
      const userInfo = await stakingMining.getUserInfo(addr1.address);
      expect(userInfo.stakedAmount).to.equal(ethers.parseEther("500"));
    });

    /**
     * 测试用例 2: 允许用户全部退出
     */
    it("应该允许用户全部退出", async function () {

      /**
       * unstakeAll(): 退出所有质押
       * 内部实现：获取用户的 stakedAmount，然后调用 unstake()
       */
      await stakingMining.connect(addr1).unstakeAll();

      // 验证用户质押量归零
      const userInfo = await stakingMining.getUserInfo(addr1.address);
      expect(userInfo.stakedAmount).to.equal(0);

      // 验证合约总质押量归零
      expect(await stakingMining.totalStaked()).to.equal(0);
    });

    /**
     * 测试用例 3: 拒绝超过质押量的退出
     */
    it("应该拒绝超过质押量的退出", async function () {

      // 定义退出数量：2000 个代币
      // 用户只质押了 1000，所以应该失败
      const unstakeAmount = ethers.parseEther("2000");

      /**
       * .to.be.revertedWithCustomError(): 断言 revert 错误是 "InsufficientStaked"
       *
       * 合约检查逻辑：
       * if (user.stakedAmount < amount) revert InsufficientStaked();
       */
      await expect(
        stakingMining.connect(addr1).unstake(unstakeAmount)
      ).to.be.revertedWithCustomError(stakingMining, "InsufficientStaked");
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：奖励领取功能
  // ═════════════════════════════════════════════════════════════════════════

  describe("奖励领取功能", function () {

    /**
     * .beforeEach(): 在奖励测试的每个用例前，先让用户质押代币
     * 只有质押了才能产生奖励
     */
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("1000");

      // 授权
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      // 质押
      await stakingMining.connect(addr1).stake(stakeAmount);
    });

    /**
     * 测试用例 1: 允许用户领取奖励
     */
    it("应该允许用户领取奖励", async function () {

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 1: 快进时间以产生奖励
      // ─────────────────────────────────────────────────────────────────────

      /**
       * ethers.provider.send(): 向 hardhat 节点发送 RPC 请求
       *
       * "evm_increaseTime": Hardhat 特有的 RPC 方法，增加区块链时间
       * [3600]: 增加 3600 秒（1 小时）
       *
       * "evm_mine": 挖一个新块，让时间增加生效
       *
       * 为什么要快进时间？
       *   奖励 = timeElapsed * rewardRate
       *   如果不增加时间，奖励为 0，无法测试领取功能
       */
      await ethers.provider.send("evm_increaseTime", [3600]); // 增加 1 小时
      await ethers.provider.send("evm_mine");  // 挖一个新块

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 2: 检查有待领取奖励
      // ─────────────────────────────────────────────────────────────────────

      /**
       * earned(address): 计算用户待领取的奖励数量
       *
       * .to.be.gt(0): "greater than 0" 的缩写，断言值大于 0
       */
      const pendingRewards = await stakingMining.earned(addr1.address);
      expect(pendingRewards).to.be.gt(0);

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 3: 领取奖励并验证事件
      // ─────────────────────────────────────────────────────────────────────

      /**
       * claimReward(): 领取待领取的奖励
       *
       * 验证：
       * 1. 交易成功
       * 2. 触发 "RewardClaimed" 事件
       * 3. 事件参数正确（用户地址，领取数量）
       */
      await expect(stakingMining.connect(addr1).claimReward())
        .to.emit(stakingMining, "RewardClaimed")
        .withArgs(addr1.address, pendingRewards);
    });

    /**
     * 测试用例 2: 拒绝零奖励领取
     * 验证当用户没有可领取的奖励时，claimReward 会失败
     */
    it("应该拒绝零奖励领取", async function () {

      /**
       * 不等待时间，立即领取
       * 因为刚质押，时间流逝为 0，所以奖励为 0
       *
       * .to.be.revertedWithCustomError(): 断言 revert 错误是 "NoRewardsToClaim"
       */
      await expect(
        stakingMining.connect(addr1).claimReward()
      ).to.be.revertedWithCustomError(stakingMining, "NoRewardsToClaim");
    });

    /**
     * 测试用例 3: 正确计算奖励
     * 验证奖励计算公式是否正确
     */
    it("应该正确计算奖励", async function () {

      // ─────────────────────────────────────────────────────────────────────
      // 定义测试参数
      // ─────────────────────────────────────────────────────────────────────

      const stakeAmount = ethers.parseEther("1000");  // 质押 1000 个代币
      const timeElapsed = 3600;  // 时间流逝：3600 秒（1 小时）

      // ─────────────────────────────────────────────────────────────────────
      // 快进时间
      // ─────────────────────────────────────────────────────────────────────

      await ethers.provider.send("evm_increaseTime", [timeElapsed]);
      await ethers.provider.send("evm_mine");

      // ─────────────────────────────────────────────────────────────────────
      // 计算预期奖励
      // ─────────────────────────────────────────────────────────────────────

      /**
       * 预期奖励计算公式：
       * expectedReward = timeElapsed * rewardRate
       *
       * REWARD_RATE = 1e18 (每秒 1 个代币)
       * timeElapsed = 3600 秒
       * expectedReward = 3600 * 1e18 = 3600 个代币
       *
       * .mul(): BigNumber 的乘法方法
       * 不能直接用 *，因为 JavaScript 的 Number 精度不够处理 10^18 级别的数字
       */
      const expectedReward = REWARD_RATE.mul(timeElapsed);

      // ─────────────────────────────────────────────────────────────────────
      // 获取实际奖励
      // ─────────────────────────────────────────────────────────────────────

      const actualReward = await stakingMining.earned(addr1.address);

      // ─────────────────────────────────────────────────────────────────────
      // 验证：允许小的误差
      // ─────────────────────────────────────────────────────────────────────

      /**
       * .to.be.closeTo(expected, tolerance): 断言值在预期值的误差范围内
       *
       * 为什么需要误差？
       *   Solidity 使用整数除法，可能会有精度损失
       *   例如：1 / 3 = 0（而不是 0.333...）
       *
       * parseEther("0.1"): 允许 0.1 个代币的误差
       */
      expect(actualReward).to.be.closeTo(
        expectedReward,
        ethers.parseEther("0.1")
      );
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：Reward 速率管理
  // ═════════════════════════════════════════════════════════════════════════

  describe("Reward 速率管理", function () {

    /**
     * 测试用例 1: 允许 owner 更新奖励速率
     */
    it("应该允许 owner 更新奖励速率", async function () {

      // 定义新的奖励速率：每秒 2 个代币
      const newRate = ethers.parseEther("2");

      /**
       * setRewardRate(newRate): 设置新的奖励速率
       * 只有 owner 可以调用
       *
       * 验证：
       * 1. 交易成功
       * 2. 触发 "RewardRateUpdated" 事件
       * 3. 事件参数正确（旧速率，新速率）
       */
      await expect(stakingMining.setRewardRate(newRate))
        .to.emit(stakingMining, "RewardRateUpdated")
        .withArgs(REWARD_RATE, newRate);  // 旧值 = REWARD_RATE, 新值 = newRate

      // 验证奖励速率已更新
      expect(await stakingMining.rewardRate()).to.equal(newRate);
    });

    /**
     * 测试用例 2: 拒绝非 owner 更新奖励速率
     * 验证权限控制是否有效
     */
    it("应该拒绝非 owner 更新奖励速率", async function () {

      const newRate = ethers.parseEther("2");

      /**
       * .connect(addr1): 使用普通用户 addr1 发送交易
       *
       * .to.be.revertedWithCustomError(): 断言 revert 错误是 "Unauthorized"
       *
       * 合约检查逻辑：
       * modifier onlyOwner() {
       *   if (msg.sender != owner) revert Unauthorized(msg.sender);
       *   _;
       * }
       */
      await expect(
        stakingMining.connect(addr1).setRewardRate(newRate)
      ).to.be.revertedWithCustomError(stakingMining, "Unauthorized");
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：停损机制
  // ═════════════════════════════════════════════════════════════════════════

  describe("停损机制", function () {

    /**
     * 测试用例 1: 允许 owner 暂停合约
     */
    it("应该允许 owner 暂停合约", async function () {

      /**
       * pause(): 暂停合约
       *
       * 验证：
       * 1. 交易成功
       * 2. 触发 "ContractPaused" 事件
       * 3. 事件参数 = true（表示已暂停）
       */
      await expect(stakingMining.pause())
        .to.emit(stakingMining, "ContractPaused")
        .withArgs(true);

      // 验证合约状态已暂停
      expect(await stakingMining.paused()).to.equal(true);
    });

    /**
     * 测试用例 2: 允许 owner 恢复合约
     */
    it("应该允许 owner 恢复合约", async function () {

      // 先暂停合约
      await stakingMining.pause();

      /**
       * unpause(): 恢复合约
       *
       * 验证：
       * 1. 交易成功
       * 2. 触发 "ContractPaused" 事件
       * 3. 事件参数 = false（表示已恢复）
       */
      await expect(stakingMining.unpause())
        .to.emit(stakingMining, "ContractPaused")
        .withArgs(false);

      // 验证合约状态已恢复
      expect(await stakingMining.paused()).to.equal(false);
    });

    /**
     * 测试用例 3: 拒绝非 owner 暂停合约
     * 验证权限控制
     */
    it("应该拒绝非 owner 暂停合约", async function () {

      /**
       * .connect(addr1): 使用普通用户发送交易
       *
       * .to.be.revertedWithCustomError(): 断言 revert 错误是 "Unauthorized"
       */
      await expect(
        stakingMining.connect(addr1).pause()
      ).to.be.revertedWithCustomError(stakingMining, "Unauthorized");
    });

    /**
     * 测试用例 4: 允许 owner 紧急提取代币
     * 验证紧急情况下的资金提取功能
     */
    it("应该允许 owner 紧急提取代币", async function () {

      // 定义提取数量：1000 个代币
      const withdrawAmount = ethers.parseEther("1000");

      /**
       * emergencyWithdraw(token, amount): 紧急提取代币
       * 只有 owner 可以调用
       *
       * 参数：
       *   - token: 要提取的代币地址
       *   - amount: 提取数量
       *
       * 验证：
       * 1. 交易成功
       * 2. 触发 "EmergencyWithdraw" 事件
       * 3. 事件参数正确
       */
      await expect(stakingMining.emergencyWithdraw(rewardTokenAddr, withdrawAmount))
        .to.emit(stakingMining, "EmergencyWithdraw")
        .withArgs(rewardTokenAddr, withdrawAmount);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：查询功能
  // ═════════════════════════════════════════════════════════════════════════

  describe("查询功能", function () {

    /**
     * .beforeEach(): 先让用户质押一些代币，这样查询才有数据
     */
    beforeEach(async function () {
      const stakeAmount = ethers.parseEther("1000");

      // 授权并质押
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);
      await stakingMining.connect(addr1).stake(stakeAmount);
    });

    /**
     * 测试用例 1: 正确返回用户信息
     */
    it("应该正确返回用户信息", async function () {

      /**
       * getUserInfo(address): 获取用户质押信息
       * 返回对象包含：
       *   - stakedAmount: 质押数量
       *   - pendingRewards: 待领取奖励（自动计算）
       *   - lastStakeTime: 上次质押时间戳
       */
      const userInfo = await stakingMining.getUserInfo(addr1.address);

      // 验证质押数量正确
      expect(userInfo.stakedAmount).to.equal(ethers.parseEther("1000"));

      // 验证上次质押时间大于 0（表示已记录）
      expect(userInfo.lastStakeTime).to.be.gt(0);
    });

    /**
     * 测试用例 2: 正确返回合约代币余额
     */
    it("应该正确返回合约代币余额", async function () {

      /**
       * getStakingTokenBalance(): 获取合约中质押代币的余额
       * getRewardTokenBalance(): 获取合约中奖励代币的余额
       */
      const stakingBalance = await stakingMining.getStakingTokenBalance();
      const rewardBalance = await stakingMining.getRewardTokenBalance();

      // 验证质押代币余额：addr1 质押了 1000 个
      expect(stakingBalance).to.equal(ethers.parseEther("1000"));

      // 验证奖励代币余额大于 0（部署时转入了 100,000 个）
      expect(rewardBalance).to.be.gt(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 测试套件：完整流程测试
  // ═════════════════════════════════════════════════════════════════════════

  describe("完整流程测试", function () {

    /**
     * 测试用例：完整的 staking → 等待奖励 → 领取 → 退出流程
     * 这是一个端到端（E2E）测试，验证整个系统的协作
     */
    it("应该完成完整的 staking、奖励、退出流程", async function () {

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 1: 质押
      // ─────────────────────────────────────────────────────────────────────

      const stakeAmount = ethers.parseEther("1000");

      // 授权
      await stakingToken.connect(addr1).approve(stakingMiningAddr, stakeAmount);

      // 质押
      await stakingMining.connect(addr1).stake(stakeAmount);

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 2: 等待产生奖励
      // ─────────────────────────────────────────────────────────────────────

      // 快进 1 小时
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 3: 领取奖励
      // ─────────────────────────────────────────────────────────────────────

      // 获取领取前的奖励代币余额
      const rewardBefore = await rewardToken.balanceOf(addr1.address);

      // 领取奖励
      await stakingMining.connect(addr1).claimReward();

      // 获取领取后的奖励代币余额
      const rewardAfter = await rewardToken.balanceOf(addr1.address);

      // 验证余额增加了
      expect(rewardAfter).to.be.gt(rewardBefore);

      // ─────────────────────────────────────────────────────────────────────
      // 步骤 4: 退出质押
      // ─────────────────────────────────────────────────────────────────────

      // 全部退出
      await stakingMining.connect(addr1).unstakeAll();

      // 验证用户质押量归零
      const userInfo = await stakingMining.getUserInfo(addr1.address);
      expect(userInfo.stakedAmount).to.equal(0);
    });
  });
});
