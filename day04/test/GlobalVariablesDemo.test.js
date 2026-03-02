const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GlobalVariablesDemo", function () {
  let globalVariablesDemo;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const GlobalVariablesDemo = await ethers.getContractFactory("GlobalVariablesDemo");
    globalVariablesDemo = await GlobalVariablesDemo.deploy();
    await globalVariablesDemo.waitForDeployment();
  });

  describe("msg 变量", function () {
    it("应该能够获取 msg.sender", async function () {
      const sender = await globalVariablesDemo.connect(owner).getSender();
      expect(sender).to.equal(owner.address);
    });

    it("应该能够获取 msg.value", async function () {
      const value = await globalVariablesDemo.getValue.staticCall();
      expect(value).to.equal(0);
    });

    it("应该能够获取 msg.data", async function () {
      const data = await globalVariablesDemo.getData();
      expect(data).to.be.a("string");
    });

    it("应该能够获取 msg.sig", async function () {
      const sig = await globalVariablesDemo.getSig();
      expect(sig).to.have.lengthOf(10); // 0x + 8 hex chars
    });
  });

  describe("block 变量", function () {
    it("应该能够获取 block.timestamp", async function () {
      const timestamp = await globalVariablesDemo.getTimestamp();
      expect(timestamp).to.be.gt(0);
    });

    it("应该能够获取 block.number", async function () {
      const blockNumber = await globalVariablesDemo.getBlockNumber();
      expect(blockNumber).to.be.gt(0);
    });

    it("应该能够获取 block.coinbase", async function () {
      const coinbase = await globalVariablesDemo.getCoinbase();
      expect(coinbase).to.be.properAddress;
    });

    it("应该能够获取 block.gaslimit", async function () {
      const gasLimit = await globalVariablesDemo.getGasLimit();
      expect(gasLimit).to.be.gt(0);
    });
  });

  describe("tx 变量", function () {
    it("应该能够获取 tx.origin", async function () {
      const origin = await globalVariablesDemo.getOrigin();
      expect(origin).to.be.properAddress;
    });

    it("应该能够获取 tx.gasprice", async function () {
      const gasPrice = await globalVariablesDemo.getGasPrice();
      // 在本地网络中，gasPrice 可能为 0，这是正常的
      expect(gasPrice).to.be.a("bigint");
    });
  });

  describe("综合信息", function () {
    it("应该能够获取所有 msg 信息", async function () {
      const info = await globalVariablesDemo.connect(owner).getAllMsgInfo.staticCall();
      expect(info[0]).to.equal(owner.address); // sender
      expect(info[1]).to.equal(0); // value
    });

    it("应该能够获取所有 block 信息", async function () {
      const info = await globalVariablesDemo.getAllBlockInfo();
      expect(info.timestamp).to.be.gt(0);
      expect(info.number).to.be.gt(0);
      expect(info.coinbase).to.be.properAddress;
    });

    it("应该能够获取所有 tx 信息", async function () {
      const info = await globalVariablesDemo.getAllTxInfo();
      expect(info[0]).to.be.properAddress; // origin
      expect(info[1]).to.be.a("bigint"); // gasPrice (在本地网络中可能为 0)
    });
  });

  describe("交易记录", function () {
    it("应该能够记录交易信息", async function () {
      const amount = ethers.parseEther("0.1");
      await expect(
        globalVariablesDemo.connect(addr1).recordTransaction({ value: amount })
      ).to.emit(globalVariablesDemo, "TransactionRecorded");
      
      const count = await globalVariablesDemo.getTransactionCount();
      expect(count).to.equal(1);
    });

    it("应该能够获取交易记录", async function () {
      const amount = ethers.parseEther("0.1");
      await globalVariablesDemo.connect(addr1).recordTransaction({ value: amount });
      
      const transaction = await globalVariablesDemo.getTransaction(0);
      expect(transaction.sender).to.equal(addr1.address);
      expect(transaction.value).to.equal(amount);
      expect(transaction.timestamp).to.be.gt(0);
      expect(transaction.blockNumber).to.be.gt(0);
    });

    it("接收 ETH 时应该自动记录", async function () {
      const amount = ethers.parseEther("0.1");
      const globalVariablesDemoAddress = await globalVariablesDemo.getAddress();
      await expect(
        addr1.sendTransaction({
          to: globalVariablesDemoAddress,
          value: amount
        })
      ).to.emit(globalVariablesDemo, "TransactionRecorded");
    });
  });
});

