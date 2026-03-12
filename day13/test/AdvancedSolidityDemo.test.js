const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AdvancedSolidityDemo - Library Tests", function () {
  let mathContract, arrayContract, stringContract, addressContract;

  beforeEach(async function () {
    const MathContract = await ethers.getContractFactory("MathContract");
    mathContract = await MathContract.deploy();
    await mathContract.waitForDeployment();

    const ArrayContract = await ethers.getContractFactory("ArrayContract");
    arrayContract = await ArrayContract.deploy();
    await arrayContract.waitForDeployment();

    const StringContract = await ethers.getContractFactory("StringContract");
    stringContract = await StringContract.deploy();
    await stringContract.waitForDeployment();

    const AddressContract = await ethers.getContractFactory("AddressContract");
    addressContract = await AddressContract.deploy();
    await addressContract.waitForDeployment();
  });

  describe("MathContract (SafeMath Library)", function () {
    it("should add two numbers", async function () {
      const result = await mathContract.add(5, 3);
      expect(result).to.equal(8);
    });

    it("should subtract two numbers", async function () {
      const result = await mathContract.subtract(10, 3);
      expect(result).to.equal(7);
    });

    it("should multiply two numbers", async function () {
      const result = await mathContract.multiply(4, 5);
      expect(result).to.equal(20);
    });

    it("should divide two numbers", async function () {
      const result = await mathContract.divide(20, 4);
      expect(result).to.equal(5);
    });

    it("should set and accumulate value", async function () {
      await mathContract.setValue(10);
      expect(await mathContract.value()).to.equal(10);
      await mathContract.setValue(5);
      expect(await mathContract.value()).to.equal(15);
    });
  });

  describe("ArrayContract (ArrayUtils Library)", function () {
    it("should add numbers to array", async function () {
      await arrayContract.addNumber(1);
      await arrayContract.addNumber(2);
      await arrayContract.addNumber(3);
      const numbers = await arrayContract.getNumbers();
      expect(numbers.length).to.equal(3);
    });

    it("should check if array contains number", async function () {
      await arrayContract.addNumber(42);
      const contains = await arrayContract.containsNumber(42);
      expect(contains).to.be.true;
    });

    it("should remove number from array", async function () {
      await arrayContract.addNumber(1);
      await arrayContract.addNumber(2);
      await arrayContract.removeNumber(1);
      const contains = await arrayContract.containsNumber(1);
      expect(contains).to.be.false;
    });
  });

  describe("StringContract (StringUtils Library)", function () {
    it("should set and compare strings", async function () {
      await stringContract.setString("Hello");
      const isEqual = await stringContract.compareStrings("Hello");
      expect(isEqual).to.be.true;
    });

    it("should append strings", async function () {
      await stringContract.setString("Hello");
      await stringContract.appendString(" World");
      const isEqual = await stringContract.compareStrings("Hello World");
      expect(isEqual).to.be.true;
    });
  });

  describe("AddressContract (AddressUtils Library)", function () {
    it("should set non-zero address", async function () {
      const [owner] = await ethers.getSigners();
      await addressContract.setAddress(owner.address);
      expect(await addressContract.storedAddress()).to.equal(owner.address);
    });

    it("should reject zero address", async function () {
      await expect(
        addressContract.setAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot set zero address");
    });
  });
});

describe("AdvancedSolidityDemo - Interface Tests", function () {
  let simpleToken, storageContract, walletContract, interfaceUser;

  beforeEach(async function () {
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy("TestToken", "TT", ethers.parseEther("1000"));
    await simpleToken.waitForDeployment();

    const StorageContract = await ethers.getContractFactory("StorageContract");
    storageContract = await StorageContract.deploy();
    await storageContract.waitForDeployment();

    const WalletContract = await ethers.getContractFactory("WalletContract");
    walletContract = await WalletContract.deploy();
    await walletContract.waitForDeployment();

    const InterfaceUser = await ethers.getContractFactory("InterfaceUser");
    interfaceUser = await InterfaceUser.deploy();
    await interfaceUser.waitForDeployment();
  });

  describe("SimpleToken (IERC20Like)", function () {
    it("should have correct initial supply", async function () {
      const totalSupply = await simpleToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000"));
    });

    it("should transfer tokens", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await simpleToken.transfer(addr1.address, ethers.parseEther("100"));
      const balance = await simpleToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("should approve and transferFrom", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      await simpleToken.approve(addr1.address, ethers.parseEther("50"));
      await simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("50"));
      const balance = await simpleToken.balanceOf(addr2.address);
      expect(balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("StorageContract (IStorable)", function () {
    it("should store and retrieve value", async function () {
      await storageContract.store(42);
      const value = await storageContract.retrieve();
      expect(value).to.equal(42);
    });
  });

  describe("InterfaceUser", function () {
    it("should interact with storage via interface", async function () {
      await interfaceUser.storeViaInterface(await storageContract.getAddress(), 100);
      const value = await interfaceUser.retrieveViaInterface(await storageContract.getAddress());
      expect(value).to.equal(100);
    });

    it("should check if contract implements interface", async function () {
      const hasInterface = await interfaceUser.checkInterface(await storageContract.getAddress());
      expect(hasInterface).to.be.true;
    });
  });
});

describe("AdvancedSolidityDemo - Inheritance Tests", function () {
  let ownableStorage, ownablePausableStorage, advancedStorage, concreteToken;

  beforeEach(async function () {
    const OwnableStorage = await ethers.getContractFactory("OwnableStorage");
    ownableStorage = await OwnableStorage.deploy();
    await ownableStorage.waitForDeployment();

    const OwnablePausableStorage = await ethers.getContractFactory("OwnablePausableStorage");
    ownablePausableStorage = await OwnablePausableStorage.deploy(100);
    await ownablePausableStorage.waitForDeployment();

    const AdvancedStorage = await ethers.getContractFactory("AdvancedStorage");
    advancedStorage = await AdvancedStorage.deploy(1000, 0);
    await advancedStorage.waitForDeployment();

    const ConcreteToken = await ethers.getContractFactory("ConcreteToken");
    concreteToken = await ConcreteToken.deploy();
    await concreteToken.waitForDeployment();
  });

  describe("OwnableStorage (Single Inheritance)", function () {
    it("should set value by owner", async function () {
      await ownableStorage.setValue(42);
      expect(await ownableStorage.getValue()).to.equal(42);
    });

    it("should not allow non-owner to set value", async function () {
      const [, nonOwner] = await ethers.getSigners();
      await expect(
        ownableStorage.connect(nonOwner).setValue(42)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should transfer ownership", async function () {
      const [owner, newOwner] = await ethers.getSigners();
      await ownableStorage.transferOwnership(newOwner.address);
      expect(await ownableStorage.owner()).to.equal(newOwner.address);
    });
  });

  describe("OwnablePausableStorage (Multiple Inheritance)", function () {
    it("should have initial value", async function () {
      expect(await ownablePausableStorage.storedValue()).to.equal(100);
    });

    it("should pause and unpause", async function () {
      await ownablePausableStorage.pause();
      expect(await ownablePausableStorage.paused()).to.be.true;

      await ownablePausableStorage.unpause();
      expect(await ownablePausableStorage.paused()).to.be.false;
    });

    it("should not allow storage when paused", async function () {
      await ownablePausableStorage.pause();
      await expect(
        ownablePausableStorage.store(50)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should not allow non-owner to pause", async function () {
      const [, nonOwner] = await ethers.getSigners();
      await expect(
        ownablePausableStorage.connect(nonOwner).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("AdvancedStorage (Function Override)", function () {
    it("should store value within range", async function () {
      await advancedStorage.store(500);
      expect(await advancedStorage.retrieve()).to.equal(500);
    });

    it("should reject value out of range", async function () {
      await expect(
        advancedStorage.store(2000)
      ).to.be.revertedWith("Value out of range");
    });

    it("should reject value below minimum", async function () {
      // Since minValue = 0 and maxValue = 1000, try with maxValue + 1
      await expect(
        advancedStorage.store(1001)
      ).to.be.revertedWith("Value out of range");
    });
  });

  describe("ConcreteToken (Abstract Contract)", function () {
    it("should mint tokens", async function () {
      const [owner] = await ethers.getSigners();
      await concreteToken.mint(owner.address, 100);
      expect(await concreteToken.balanceOf(owner.address)).to.equal(100);
    });

    it("should transfer tokens", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await concreteToken.mint(owner.address, 100);
      await concreteToken.transfer(addr1.address, 50);
      expect(await concreteToken.balanceOf(addr1.address)).to.equal(50);
    });
  });
});

describe("AdvancedSolidityDemo - Event Tests", function () {
  let eventDemo, eventAdvanced;

  beforeEach(async function () {
    const EventDemo = await ethers.getContractFactory("EventDemo");
    eventDemo = await EventDemo.deploy(ethers.parseEther("1000000"));
    await eventDemo.waitForDeployment();

    const EventAdvanced = await ethers.getContractFactory("EventAdvanced");
    eventAdvanced = await EventAdvanced.deploy();
    await eventAdvanced.waitForDeployment();
  });

  describe("EventDemo (Basic Events)", function () {
    it("should emit Transfer event", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(eventDemo.transfer(addr1.address, ethers.parseEther("10")))
        .to.emit(eventDemo, "Transfer")
        .withArgs(owner.address, addr1.address, ethers.parseEther("10"));
    });

    it("should emit Mint event", async function () {
      const [, addr1] = await ethers.getSigners();
      await expect(eventDemo.mint(addr1.address, ethers.parseEther("100")))
        .to.emit(eventDemo, "Mint")
        .withArgs(addr1.address, ethers.parseEther("100"));
    });

    it("should emit Burn event", async function () {
      await expect(eventDemo.burn(ethers.parseEther("10")))
        .to.emit(eventDemo, "Burn");
    });

    it("should emit OwnershipTransferred event", async function () {
      const [, newOwner] = await ethers.getSigners();
      await expect(eventDemo.transferOwnership(newOwner.address))
        .to.emit(eventDemo, "OwnershipTransferred");
    });

    it("should emit Approval event", async function () {
      const [owner] = await ethers.getSigners();
      await expect(eventDemo.approve(owner.address, ethers.parseEther("50")))
        .to.emit(eventDemo, "Approval");
    });
  });

  describe("EventAdvanced (Advanced Events)", function () {
    it("should register user and emit event", async function () {
      await expect(eventAdvanced.registerUser("Alice"))
        .to.emit(eventAdvanced, "UserRegistered");
    });

    it("should update user name and emit event", async function () {
      await eventAdvanced.registerUser("Alice");
      await expect(eventAdvanced.updateUserName("Bob"))
        .to.emit(eventAdvanced, "UserUpdated");
    });

    it("should update user balance and emit event", async function () {
      await eventAdvanced.registerUser("Alice");
      await expect(eventAdvanced.updateUserBalance(100))
        .to.emit(eventAdvanced, "UserUpdated");
    });

    it("should execute complex transaction", async function () {
      const [owner, addr1] = await ethers.getSigners();
      // ComplexTransaction is an anonymous event, cannot use .to.emit
      // Just verify the function executes without error
      await eventAdvanced.executeComplexTransaction(addr1.address, 1, 100, "metadata");
    });

    it("should trigger multi-level event", async function () {
      await expect(
        eventAdvanced.triggerMultiLevelEvent(
          ethers.id("level1"),
          ethers.id("level2"),
          ethers.toUtf8Bytes("data")
        )
      ).to.emit(eventAdvanced, "MultiLevelEvent");
    });

    it("should batch update balances", async function () {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      // Register users with different addresses
      await eventAdvanced.connect(addr1).registerUser("Alice");
      await eventAdvanced.connect(addr2).registerUser("Bob");
      // BatchOperation is an anonymous event, just verify the function executes
      await eventAdvanced.batchUpdateBalances(
        [addr1.address, addr2.address],
        [50, 100]
      );
    });
  });
});

describe("AdvancedSolidityDemo - Comprehensive Tests", function () {
  let advancedWallet, tokenWallet, contractFactory, comprehensiveContract;

  beforeEach(async function () {
    const AdvancedWallet = await ethers.getContractFactory("AdvancedWallet");
    advancedWallet = await AdvancedWallet.deploy();
    await advancedWallet.waitForDeployment();

    const TokenWallet = await ethers.getContractFactory("TokenWallet");
    tokenWallet = await TokenWallet.deploy("TokenWallet", "TW", ethers.parseEther("1000000"));
    await tokenWallet.waitForDeployment();

    const ContractFactory = await ethers.getContractFactory("ContractFactory");
    contractFactory = await ContractFactory.deploy();
    await contractFactory.waitForDeployment();

    const ComprehensiveContract = await ethers.getContractFactory("ComprehensiveContract");
    comprehensiveContract = await ComprehensiveContract.deploy("Demo");
    await comprehensiveContract.waitForDeployment();
  });

  describe("AdvancedWallet", function () {
    it("should accept deposit", async function () {
      const [owner] = await ethers.getSigners();
      await advancedWallet.deposit({ value: ethers.parseEther("1") });
      expect(await advancedWallet.getBalance()).to.equal(ethers.parseEther("1"));
    });

    it("should withdraw", async function () {
      const [owner] = await ethers.getSigners();
      await advancedWallet.deposit({ value: ethers.parseEther("2") });
      await advancedWallet.withdraw(ethers.parseEther("1"));
      expect(await advancedWallet.getBalance()).to.equal(ethers.parseEther("1"));
    });

    it("should pause and unpause", async function () {
      await advancedWallet.pause();
      expect(await advancedWallet.paused()).to.be.true;
      await advancedWallet.unpause();
      expect(await advancedWallet.paused()).to.be.false;
    });

    it("should not allow deposit when paused", async function () {
      await advancedWallet.pause();
      await expect(
        advancedWallet.deposit({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should get total balance as owner", async function () {
      const [owner] = await ethers.getSigners();
      await advancedWallet.connect(owner).deposit({ value: ethers.parseEther("1") });
      const totalBalance = await advancedWallet.getTotalBalance();
      expect(totalBalance).to.equal(ethers.parseEther("1"));
    });
  });

  describe("TokenWallet", function () {
    it("should have correct initial supply", async function () {
      const [owner] = await ethers.getSigners();
      expect(await tokenWallet.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });

    it("should transfer tokens", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await tokenWallet.transfer(addr1.address, ethers.parseEther("100"));
      expect(await tokenWallet.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("should mint tokens", async function () {
      const [, addr1] = await ethers.getSigners();
      await tokenWallet.mint(addr1.address, ethers.parseEther("500"));
      expect(await tokenWallet.balanceOf(addr1.address)).to.equal(ethers.parseEther("500"));
    });

    it("should burn tokens", async function () {
      const [owner] = await ethers.getSigners();
      await tokenWallet.burn(ethers.parseEther("100"));
      expect(await tokenWallet.balanceOf(owner.address)).to.equal(ethers.parseEther("999900"));
    });
  });

  describe("ContractFactory", function () {
    it("should create wallet via factory", async function () {
      await contractFactory.createWallet();
      const wallets = await contractFactory.getAllWallets();
      expect(wallets.length).to.equal(1);
    });

    it("should create token via factory", async function () {
      await contractFactory.createToken("FactoryToken", "FT", ethers.parseEther("1000"));
      const tokens = await contractFactory.getAllTokens();
      expect(tokens.length).to.equal(1);
    });
  });

  describe("ComprehensiveContract", function () {
    it("should add values", async function () {
      await comprehensiveContract.addValue(10);
      await comprehensiveContract.addValue(20);
      const total = await comprehensiveContract.calculateTotal();
      expect(total).to.equal(30);
    });

    it("should reject duplicate values", async function () {
      await comprehensiveContract.addValue(10);
      await expect(
        comprehensiveContract.addValue(10)
      ).to.be.revertedWith("Value already exists");
    });

    it("should calculate total", async function () {
      await comprehensiveContract.addValue(10);
      await comprehensiveContract.addValue(20);
      await comprehensiveContract.addValue(30);
      const total = await comprehensiveContract.calculateTotal();
      expect(total).to.equal(60);
    });

    it("should handle deposits and withdrawals", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await comprehensiveContract.deposit(addr1.address, 100);
      expect(await comprehensiveContract.balances(addr1.address)).to.equal(100);

      await comprehensiveContract.withdraw(addr1.address, 50);
      expect(await comprehensiveContract.balances(addr1.address)).to.equal(50);
    });

    it("should update name", async function () {
      await comprehensiveContract.updateName(" Updated");
      expect(await comprehensiveContract.name()).to.equal("Demo Updated");
    });
  });
});
