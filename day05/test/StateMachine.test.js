const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StateMachine", function () {
  let stateMachine;
  let owner, reviewer, addr1;

  beforeEach(async function () {
    [owner, reviewer, addr1] = await ethers.getSigners();

    const StateMachine = await ethers.getContractFactory("StateMachine");
    stateMachine = await StateMachine.deploy(reviewer.address);
    await stateMachine.waitForDeployment();
  });

  describe("初始状态", function () {
    it("应该正确初始化", async function () {
      expect(await stateMachine.owner()).to.equal(owner.address);
      expect(await stateMachine.reviewer()).to.equal(reviewer.address);
      expect(await stateMachine.getCurrentState()).to.equal(0); // Draft
    });

    it("应该记录初始状态转换", async function () {
      const transitionCount = await stateMachine.getTransitionCount();
      expect(transitionCount).to.equal(1);
    });
  });

  describe("状态转换流程", function () {
    it("应该能够完成完整的状态转换流程", async function () {
      // Draft -> Review
      await stateMachine.submitForReview();
      expect(await stateMachine.getCurrentState()).to.equal(1); // Review
      
      // Review -> Approved
      await stateMachine.connect(reviewer).approve();
      expect(await stateMachine.getCurrentState()).to.equal(2); // Approved
      
      // Approved -> Active
      await stateMachine.activate();
      expect(await stateMachine.getCurrentState()).to.equal(3); // Active
    });

    it("应该拒绝无效的状态转换", async function () {
      await expect(stateMachine.activate()).to.be.revertedWith("Invalid state");
    });

    it("应该拒绝非 owner 提交审核", async function () {
      await expect(
        stateMachine.connect(addr1).submitForReview()
      ).to.be.revertedWith("Only owner");
    });

    it("应该拒绝非 reviewer 批准", async function () {
      await stateMachine.submitForReview();
      await expect(
        stateMachine.connect(addr1).approve()
      ).to.be.revertedWith("Only reviewer");
    });
  });

  describe("状态查询", function () {
    it("应该能够检查是否在特定状态", async function () {
      expect(await stateMachine.isInState(0)).to.equal(true); // Draft
      expect(await stateMachine.isInState(1)).to.equal(false); // Review
    });

    it("应该能够检查是否可以转换到指定状态", async function () {
      expect(await stateMachine.canTransitionTo(1)).to.equal(true); // Draft -> Review
      expect(await stateMachine.canTransitionTo(3)).to.equal(false); // Draft -> Active
    });

    it("应该能够获取可能的下一个状态", async function () {
      const nextStates = await stateMachine.getPossibleNextStates();
      expect(nextStates.length).to.equal(1);
      expect(nextStates[0]).to.equal(1); // Review
    });
  });

  describe("状态转换历史", function () {
    it("应该记录状态转换历史", async function () {
      await stateMachine.submitForReview();
      
      const transition = await stateMachine.getTransition(1);
      expect(transition.fromState).to.equal(0); // Draft
      expect(transition.toState).to.equal(1); // Review
      expect(transition.triggeredBy).to.equal(owner.address);
    });
  });

  describe("暂停和恢复", function () {
    it("应该能够暂停和恢复", async function () {
      // 先激活
      await stateMachine.submitForReview();
      await stateMachine.connect(reviewer).approve();
      await stateMachine.activate();
      
      // 暂停
      await stateMachine.suspend();
      expect(await stateMachine.getCurrentState()).to.equal(4); // Suspended
      
      // 恢复
      await stateMachine.resume();
      expect(await stateMachine.getCurrentState()).to.equal(3); // Active
    });
  });

  describe("终止", function () {
    it("应该能够终止合约", async function () {
      await stateMachine.submitForReview();
      await stateMachine.connect(reviewer).approve();
      await stateMachine.terminate();
      
      expect(await stateMachine.getCurrentState()).to.equal(5); // Terminated
    });
  });
});

