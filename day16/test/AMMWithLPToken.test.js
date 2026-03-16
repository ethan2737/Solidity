const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AMMWithLPToken", function () {
  let tokenA, tokenB, amm;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署测试代币
    const TestToken = await ethers.getContractFactory("contracts/TestToken.sol:TestToken");
    tokenA = await TestToken.deploy("Token A", "TKA", 18, 1000000);

    tokenB = await TestToken.deploy("Token B", "TKB", 18, 1000000);

    // 部署 AMM 合约
    const AMMWithLPToken = await ethers.getContractFactory("AMMWithLPToken");
    amm = await AMMWithLPToken.deploy(await tokenA.getAddress(), await tokenB.getAddress());

    // 给测试用户分配代币
    const amount = ethers.parseEther("10000");
    await tokenA.transfer(addr1.address, amount);
    await tokenB.transfer(addr1.address, amount);
    await tokenA.transfer(addr2.address, amount);
    await tokenB.transfer(addr2.address, amount);
  });

  describe("添加流动性", function () {
    it("应该允许首次添加流动性", async function () {
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("100");

      await tokenA.connect(addr1).approve(amm.target, amountA);
      await tokenB.connect(addr1).approve(amm.target, amountB);

      await expect(amm.connect(addr1).addLiquidity(amountA, amountB))
        .to.emit(amm, "LiquidityAdded");

      const [reserveA, reserveB] = await amm.getReserves();
      expect(reserveA).to.equal(amountA);
      expect(reserveB).to.equal(amountB);

      const lpBalance = await amm.balanceOf(addr1.address);
      expect(lpBalance).to.be.gt(0);
    });

    it("应该要求后续添加流动性时保持比例", async function () {
      // 首次添加流动性
      const amountA1 = ethers.parseEther("100");
      const amountB1 = ethers.parseEther("100");

      await tokenA.connect(addr1).approve(amm.target, amountA1);
      await tokenB.connect(addr1).approve(amm.target, amountB1);
      await amm.connect(addr1).addLiquidity(amountA1, amountB1);

      // 后续添加流动性（正确比例）
      const amountA2 = ethers.parseEther("50");
      const amountB2 = ethers.parseEther("50");

      await tokenA.connect(addr2).approve(amm.target, amountA2);
      await tokenB.connect(addr2).approve(amm.target, amountB2);

      await expect(amm.connect(addr2).addLiquidity(amountA2, amountB2))
        .to.emit(amm, "LiquidityAdded");

      // 后续添加流动性（错误比例）
      const amountA3 = ethers.parseEther("50");
      const amountB3 = ethers.parseEther("60");

      await tokenA.connect(addr2).approve(amm.target, amountA3);
      await tokenB.connect(addr2).approve(amm.target, amountB3);

      await expect(
        amm.connect(addr2).addLiquidity(amountA3, amountB3)
      ).to.be.revertedWith("Amounts must be proportional to reserves");
    });
  });

  describe("代币交换", function () {
    beforeEach(async function () {
      // 先添加流动性
      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("1000");

      await tokenA.connect(addr1).approve(amm.target, amountA);
      await tokenB.connect(addr1).approve(amm.target, amountB);
      await amm.connect(addr1).addLiquidity(amountA, amountB);
    });

    it("应该允许交换代币 A 为代币 B", async function () {
      const swapAmount = ethers.parseEther("100");
      const balanceBefore = await tokenB.balanceOf(addr2.address);

      await tokenA.connect(addr2).approve(amm.target, swapAmount);
      
      const tx = await amm.connect(addr2).swap(tokenA.target, swapAmount);
      await expect(tx).to.emit(amm, "Swap");

      const balanceAfter = await tokenB.balanceOf(addr2.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("应该允许交换代币 B 为代币 A", async function () {
      const swapAmount = ethers.parseEther("100");
      const balanceBefore = await tokenA.balanceOf(addr2.address);

      await tokenB.connect(addr2).approve(amm.target, swapAmount);
      
      const tx = await amm.connect(addr2).swap(tokenB.target, swapAmount);
      await expect(tx).to.emit(amm, "Swap");

      const balanceAfter = await tokenA.balanceOf(addr2.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("应该保持恒定乘积 k", async function () {
      const kBefore = await amm.getK();

      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(addr2).approve(amm.target, swapAmount);
      await amm.connect(addr2).swap(tokenA.target, swapAmount);

      const kAfter = await amm.getK();
      // 由于没有手续费，k 应近似保持不变（整数除法可能导致轻微偏差）
      const delta = ethers.parseEther("1000");
      expect(kAfter >= kBefore - delta && kAfter <= kBefore + delta).to.be.true;
    });

    it("应该正确计算输出数量", async function () {
      const swapAmount = ethers.parseEther("100");
      const expectedOut = await amm.getAmountOut(tokenA.target, swapAmount);

      await tokenA.connect(addr2).approve(amm.target, swapAmount);
      await amm.connect(addr2).swap(tokenA.target, swapAmount);

      // 从事件中获取实际输出 (ethers v6: 使用 queryFilter)
      const events = await amm.queryFilter(amm.filters.Swap());
      const swapEvent = events[events.length - 1];
      const actualOut = swapEvent.args.amountOut;

      expect(actualOut).to.equal(expectedOut);
    });
  });

  describe("移除流动性", function () {
    beforeEach(async function () {
      // 先添加流动性
      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("1000");

      await tokenA.connect(addr1).approve(amm.target, amountA);
      await tokenB.connect(addr1).approve(amm.target, amountB);
      await amm.connect(addr1).addLiquidity(amountA, amountB);
    });

    it("应该允许移除流动性", async function () {
      const lpBalance = await amm.balanceOf(addr1.address);
      const liquidityToRemove = lpBalance / 2n; // 移除一半

      const balanceABefore = await tokenA.balanceOf(addr1.address);
      const balanceBBefore = await tokenB.balanceOf(addr1.address);

      await expect(amm.connect(addr1).removeLiquidity(liquidityToRemove))
        .to.emit(amm, "LiquidityRemoved");

      const balanceAAfter = await tokenA.balanceOf(addr1.address);
      const balanceBAfter = await tokenB.balanceOf(addr1.address);

      expect(balanceAAfter).to.be.gt(balanceABefore);
      expect(balanceBAfter).to.be.gt(balanceBBefore);
    });

    it("应该拒绝移除超过持有的流动性", async function () {
      const lpBalance = await amm.balanceOf(addr1.address);
      const excessLiquidity = lpBalance + 1n;

      await expect(
        amm.connect(addr1).removeLiquidity(excessLiquidity)
      ).to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("x·y=k 恒定乘积模型", function () {
    beforeEach(async function () {
      // 先添加流动性
      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("1000");

      await tokenA.connect(addr1).approve(amm.target, amountA);
      await tokenB.connect(addr1).approve(amm.target, amountB);
      await amm.connect(addr1).addLiquidity(amountA, amountB);
    });

    it("应该验证恒定乘积公式", async function () {
      const [reserveA, reserveB] = await amm.getReserves();
      const k = await amm.getK();
      
      expect(k).to.equal(reserveA * reserveB);
    });

    it("应该在交换后保持恒定乘积（近似）", async function () {
      const kBefore = await amm.getK();

      // 执行多次交换
      for (let i = 0; i < 3; i++) {
        const swapAmount = ethers.parseEther("10");
        await tokenA.connect(addr2).approve(amm.target, swapAmount);
        await amm.connect(addr2).swap(tokenA.target, swapAmount);
      }

      const kAfter = await amm.getK();
      // 由于整数除法，k 可能会有微小变化，允许一定误差
      const diff = kAfter > kBefore ? kAfter - kBefore : kBefore - kAfter;
      expect(diff).to.be.lt(ethers.parseEther("2000"));
    });
  });
});

