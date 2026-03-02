const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractTypeDemo", function () {
  let contractTypeDemo;
  let token;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // 部署 SimpleToken
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    token = await SimpleToken.deploy(ethers.parseEther("1000000"));
    await token.waitForDeployment();

    // 部署 ContractTypeDemo
    const ContractTypeDemo = await ethers.getContractFactory("ContractTypeDemo");
    contractTypeDemo = await ContractTypeDemo.deploy();
    await contractTypeDemo.waitForDeployment();
  });

  describe("合约类型引用", function () {
    it("应该能够设置合约引用", async function () {
      const tokenAddress = await token.getAddress();
      await contractTypeDemo.setToken(tokenAddress);
      expect(await contractTypeDemo.isTokenSet()).to.equal(true);
      expect(await contractTypeDemo.getTokenAddress()).to.equal(tokenAddress);
    });

    it("应该拒绝设置零地址", async function () {
      await expect(
        contractTypeDemo.setToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("应该能够获取代币信息", async function () {
      const tokenAddress = await token.getAddress();
      await contractTypeDemo.setToken(tokenAddress);
      
      const name = await contractTypeDemo.getTokenName();
      const symbol = await contractTypeDemo.getTokenSymbol();
      const totalSupply = await contractTypeDemo.getTokenTotalSupply();
      
      expect(name).to.equal("Simple Token");
      expect(symbol).to.equal("ST");
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("调用其他合约", function () {
    beforeEach(async function () {
      const tokenAddress = await token.getAddress();
      await contractTypeDemo.setToken(tokenAddress);
    });

    it("应该能够获取账户余额", async function () {
      const balance = await contractTypeDemo.getTokenBalance(owner.address);
      expect(balance).to.equal(ethers.parseEther("1000000"));
    });

    it("应该能够通过合约转账代币", async function () {
      // 注意：这需要 ContractTypeDemo 合约有代币余额
      // 先给 ContractTypeDemo 转账一些代币
      const amount = ethers.parseEther("100");
      const contractTypeDemoAddress = await contractTypeDemo.getAddress();
      await token.transfer(contractTypeDemoAddress, amount);
      
      // 然后通过 ContractTypeDemo 转账
      await contractTypeDemo.transferToken(addr1.address, amount);
      
      const balance = await token.balanceOf(addr1.address);
      expect(balance).to.equal(amount);
    });
  });

  describe("部署新合约", function () {
    it("应该能够部署新的 SimpleToken", async function () {
      const initialSupply = ethers.parseEther("500000");
      const tx = await contractTypeDemo.createToken(initialSupply);
      const receipt = await tx.wait();
      
      // 查找 TokenCreated 事件 (ethers v6 使用 logs 和 interface)
      const event = receipt.logs.find(log => {
        try {
          const parsed = contractTypeDemo.interface.parseLog(log);
          return parsed && parsed.name === "TokenCreated";
        } catch (e) {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
      
      const parsedEvent = contractTypeDemo.interface.parseLog(event);
      const newTokenAddress = parsedEvent.args.tokenAddress;
      expect(newTokenAddress).to.not.equal(ethers.ZeroAddress);
      
      // 验证新代币
      const newToken = await ethers.getContractAt("SimpleToken", newTokenAddress);
      expect(await newToken.totalSupply()).to.equal(initialSupply);
    });

    it("部署后应该自动设置为当前 token", async function () {
      const initialSupply = ethers.parseEther("500000");
      await contractTypeDemo.createToken(initialSupply);
      
      expect(await contractTypeDemo.isTokenSet()).to.equal(true);
      const tokenName = await contractTypeDemo.getTokenName();
      expect(tokenName).to.equal("Simple Token");
    });
  });

  describe("多个合约引用", function () {
    it("应该能够设置多个合约引用", async function () {
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token1 = await SimpleToken.deploy(ethers.parseEther("1000000"));
      await token1.waitForDeployment();
      
      const token2 = await SimpleToken.deploy(ethers.parseEther("2000000"));
      await token2.waitForDeployment();
      
      const token1Address = await token1.getAddress();
      const token2Address = await token2.getAddress();
      await contractTypeDemo.setTokens(token1Address, token2Address);
      
      const balances = await contractTypeDemo.getMultipleTokenBalances(owner.address);
      expect(balances.balance1).to.equal(ethers.parseEther("1000000"));
      expect(balances.balance2).to.equal(ethers.parseEther("2000000"));
    });
  });
});

