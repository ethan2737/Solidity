const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ModifierInheritance", function () {
  let inheritedContract;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const InheritedContract = await ethers.getContractFactory("InheritedContract");
    inheritedContract = await InheritedContract.deploy();
  });

  describe("继承的 modifier", function () {
    it("应该能够使用继承的 onlyOwner modifier", async function () {
      await inheritedContract.setValue(100);
      const value = await inheritedContract.value();
      expect(value).to.equal(100);
    });

    it("应该拒绝非 owner 调用", async function () {
      await expect(
        inheritedContract.connect(addr1).setValue(100)
      ).to.be.revertedWith("BaseContract: Only owner");
    });

    it("应该能够使用继承的多个 modifier", async function () {
      await inheritedContract.setValueWhenNotPaused(200);
      const value = await inheritedContract.value();
      expect(value).to.equal(200);
    });

    it("应该拒绝在暂停时调用", async function () {
      await inheritedContract.pause();
      await expect(
        inheritedContract.setValueWhenNotPaused(200)
      ).to.be.revertedWith("BaseContract: Contract is paused");
    });
  });
});

