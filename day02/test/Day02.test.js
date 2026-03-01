const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * SimpleToken 合约测试套件
 */
describe("SimpleToken", function () {
  let simpleToken;
  let owner;
  let addr1;
  let addr2;

  const initialSupply = ethers.parseEther("1000000"); // 100 万代币

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(
      "Simple Token",
      "STK",
      18,
      initialSupply
    );
    await simpleToken.waitForDeployment();
  });

  describe("部署", function () {
    it("应该成功部署合约", async function () {
      const address = await simpleToken.getAddress();
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("应该正确设置代币信息", async function () {
      expect(await simpleToken.name()).to.equal("Simple Token");
      expect(await simpleToken.symbol()).to.equal("STK");
      expect(await simpleToken.decimals()).to.equal(18);
      expect(await simpleToken.totalSupply()).to.equal(initialSupply);
    });

    it("应该将所有代币分配给部署者", async function () {
      const balance = await simpleToken.balanceOf(owner.address);
      expect(balance).to.equal(initialSupply);
    });
  });

  describe("transfer()", function () {
    it("应该允许转账", async function () {
      const transferAmount = ethers.parseEther("100");
      await simpleToken.transfer(addr1.address, transferAmount);

      const addr1Balance = await simpleToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("应该减少发送方余额", async function () {
      const transferAmount = ethers.parseEther("100");
      await simpleToken.transfer(addr1.address, transferAmount);

      const ownerBalance = await simpleToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply - transferAmount);
    });

    it("当余额不足时应该失败", async function () {
      const transferAmount = ethers.parseEther("1000001");
      await expect(
        simpleToken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("当转账到零地址时应该失败", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(
        simpleToken.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Invalid address");
    });

    it("应该触发 Transfer 事件", async function () {
      const transferAmount = ethers.parseEther("100");
      await expect(simpleToken.transfer(addr1.address, transferAmount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });
  });

  describe("approve() 和 transferFrom()", function () {
    it("应该允许授权", async function () {
      const approveAmount = ethers.parseEther("100");
      await simpleToken.approve(addr1.address, approveAmount);

      const allowance = await simpleToken.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("应该允许被授权的地址转账", async function () {
      const approveAmount = ethers.parseEther("100");
      await simpleToken.approve(addr1.address, approveAmount);

      await simpleToken.connect(addr1).transferFrom(
        owner.address,
        addr2.address,
        approveAmount
      );

      const addr2Balance = await simpleToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(approveAmount);
    });

    it("应该减少授权额度", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");

      await simpleToken.approve(addr1.address, approveAmount);
      await simpleToken.connect(addr1).transferFrom(
        owner.address,
        addr2.address,
        transferAmount
      );

      const remainingAllowance = await simpleToken.allowance(owner.address, addr1.address);
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });

    it("当授权额度不足时应该失败", async function () {
      const approveAmount = ethers.parseEther("50");
      const transferAmount = ethers.parseEther("100");

      await simpleToken.approve(addr1.address, approveAmount);
      await expect(
        simpleToken.connect(addr1).transferFrom(
          owner.address,
          addr2.address,
          transferAmount
        )
      ).to.be.revertedWith("Insufficient allowance");
    });
  });
});

/**
 * GasDemo 合约测试套件
 */
describe("GasDemo", function () {
  let gasDemo;

  beforeEach(async function () {
    const GasDemo = await ethers.getContractFactory("GasDemo");
    gasDemo = await GasDemo.deploy();
    await gasDemo.waitForDeployment();
  });

  describe("Storage vs Memory vs Calldata", function () {
    it("应该更新 Storage 值", async function () {
      await gasDemo.updateStorage(100);
      expect(await gasDemo.storageValue()).to.equal(100);
    });

    it("应该使用 Memory 计算", async function () {
      const result = await gasDemo.useMemory(50);
      expect(result).to.equal(100); // 50 * 2
    });

    it("应该使用 Calldata 计算", async function () {
      const result = await gasDemo.useCalldata(50);
      expect(result).to.equal(150); // 50 * 3
    });

    it("应该更新余额映射", async function () {
      const [owner] = await ethers.getSigners();
      await gasDemo.updateBalance(owner.address, 1000);
      expect(await gasDemo.balances(owner.address)).to.equal(1000);
    });
  });
});

/**
 * AccountInfo 合约测试套件
 */
describe("AccountInfo", function () {
  let accountInfo;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const AccountInfo = await ethers.getContractFactory("AccountInfo");
    accountInfo = await AccountInfo.deploy();
    await accountInfo.waitForDeployment();
  });

  describe("账户信息记录", function () {
    it("应该记录账户信息", async function () {
      await accountInfo.recordAccountInfo();

      const count = await accountInfo.getHistoryCount(owner.address);
      expect(count).to.equal(1);
    });

    it("应该获取当前账户信息", async function () {
      const info = await accountInfo.getCurrentAccountInfo();
      expect(info.account).to.equal(owner.address);
      expect(info.blockNumber).to.be.greaterThan(0);
    });

    it("应该获取历史记录", async function () {
      await accountInfo.recordAccountInfo();
      await accountInfo.recordAccountInfo();

      const count = await accountInfo.getHistoryCount(owner.address);
      expect(count).to.equal(2);

      const record = await accountInfo.getHistory(owner.address, 0);
      expect(record.account).to.equal(owner.address);
    });
  });
});
