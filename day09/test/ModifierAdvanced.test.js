const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ModifierAdvanced", function () {
  let modifierAdvanced;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ModifierAdvanced = await ethers.getContractFactory("ModifierAdvanced");
    modifierAdvanced = await ModifierAdvanced.deploy();
  });

  describe("带状态修改的 modifier", function () {
    it("应该能够记录调用次数", async function () {
      await modifierAdvanced.setValueWithCooldown(100);
      const callCount = await modifierAdvanced.getCallCount(owner.address);
      expect(callCount).to.equal(1);
    });

    it("应该能够更新最后调用时间", async function () {
      await modifierAdvanced.setValueWithCooldown(100);
      const lastCallTime = await modifierAdvanced.getLastCallTime(owner.address);
      expect(lastCallTime).to.be.greaterThan(0);
    });
  });

  describe("冷却期 modifier", function () {
    it("应该拒绝在冷却期内调用", async function () {
      await modifierAdvanced.setValueWithCooldown(100);
      await expect(
        modifierAdvanced.setValueWithCooldown(200)
      ).to.be.revertedWith("Cooldown period not expired");
    });

    it("应该允许在冷却期后调用", async function () {
      await modifierAdvanced.setValueWithCooldown(100);
      // 设置较短的冷却期以便测试
      await modifierAdvanced.setCooldownPeriod(1);
      // 等待冷却期过期
      await new Promise(resolve => setTimeout(resolve, 2000));
      await modifierAdvanced.setValueWithCooldown(200);
      const value = await modifierAdvanced.value();
      expect(value).to.equal(200);
    });
  });

  describe("限制调用次数的 modifier", function () {
    it("应该允许在限制内调用", async function () {
      await modifierAdvanced.setValueWithLimit(100, 5);
      const value = await modifierAdvanced.value();
      expect(value).to.equal(100);
    });

    it("应该拒绝超过限制的调用", async function () {
      // 先调用几次
      for (let i = 0; i < 3; i++) {
        await modifierAdvanced.setValueWithLimit(100 + i, 3);
      }
      // 第4次应该失败
      await expect(
        modifierAdvanced.setValueWithLimit(200, 3)
      ).to.be.revertedWith("Call limit exceeded");
    });
  });
});

