const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Deploying AdvancedSolidityDemo Contracts");
  console.log("========================================\n");

  // 1. 部署 SimpleToken (ERC20Like接口实现)
  console.log("1. Deploying SimpleToken...");
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy("SimpleToken", "ST", hre.ethers.parseEther("1000000"));
  await simpleToken.waitForDeployment();
  const simpleTokenAddress = await simpleToken.getAddress();
  console.log(`   SimpleToken deployed to: ${simpleTokenAddress}`);

  // 2. 部署 StorageContract (IStorable接口实现)
  console.log("\n2. Deploying StorageContract...");
  const StorageContract = await hre.ethers.getContractFactory("StorageContract");
  const storageContract = await StorageContract.deploy();
  await storageContract.waitForDeployment();
  const storageContractAddress = await storageContract.getAddress();
  console.log(`   StorageContract deployed to: ${storageContractAddress}`);

  // 3. 部署 WalletContract (多接口实现)
  console.log("\n3. Deploying WalletContract...");
  const WalletContract = await hre.ethers.getContractFactory("WalletContract");
  const walletContract = await WalletContract.deploy();
  await walletContract.waitForDeployment();
  const walletContractAddress = await walletContract.getAddress();
  console.log(`   WalletContract deployed to: ${walletContractAddress}`);

  // 4. 部署 MathContract (Library使用)
  console.log("\n4. Deploying MathContract...");
  const MathContract = await hre.ethers.getContractFactory("MathContract");
  const mathContract = await MathContract.deploy();
  await mathContract.waitForDeployment();
  const mathContractAddress = await mathContract.getAddress();
  console.log(`   MathContract deployed to: ${mathContractAddress}`);

  // 5. 部署 ArrayContract (Library使用)
  console.log("\n5. Deploying ArrayContract...");
  const ArrayContract = await hre.ethers.getContractFactory("ArrayContract");
  const arrayContract = await ArrayContract.deploy();
  await arrayContract.waitForDeployment();
  const arrayContractAddress = await arrayContract.getAddress();
  console.log(`   ArrayContract deployed to: ${arrayContractAddress}`);

  // 6. 部署 StringContract (Library使用)
  console.log("\n6. Deploying StringContract...");
  const StringContract = await hre.ethers.getContractFactory("StringContract");
  const stringContract = await StringContract.deploy();
  await stringContract.waitForDeployment();
  const stringContractAddress = await stringContract.getAddress();
  console.log(`   StringContract deployed to: ${stringContractAddress}`);

  // 7. 部署 AddressContract (Library使用)
  console.log("\n7. Deploying AddressContract...");
  const AddressContract = await hre.ethers.getContractFactory("AddressContract");
  const addressContract = await AddressContract.deploy();
  await addressContract.waitForDeployment();
  const addressContractAddress = await addressContract.getAddress();
  console.log(`   AddressContract deployed to: ${addressContractAddress}`);

  // 8. 部署 OwnableStorage (单继承)
  console.log("\n8. Deploying OwnableStorage...");
  const OwnableStorage = await hre.ethers.getContractFactory("OwnableStorage");
  const ownableStorage = await OwnableStorage.deploy();
  await ownableStorage.waitForDeployment();
  const ownableStorageAddress = await ownableStorage.getAddress();
  console.log(`   OwnableStorage deployed to: ${ownableStorageAddress}`);

  // 9. 部署 OwnablePausableStorage (多继承)
  console.log("\n9. Deploying OwnablePausableStorage...");
  const OwnablePausableStorage = await hre.ethers.getContractFactory("OwnablePausableStorage");
  const ownablePausableStorage = await OwnablePausableStorage.deploy(100);
  await ownablePausableStorage.waitForDeployment();
  const ownablePausableStorageAddress = await ownablePausableStorage.getAddress();
  console.log(`   OwnablePausableStorage deployed to: ${ownablePausableStorageAddress}`);

  // 10. 部署 AdvancedStorage (函数重写)
  console.log("\n10. Deploying AdvancedStorage...");
  const AdvancedStorage = await hre.ethers.getContractFactory("AdvancedStorage");
  const advancedStorage = await AdvancedStorage.deploy(1000, 0);
  await advancedStorage.waitForDeployment();
  const advancedStorageAddress = await advancedStorage.getAddress();
  console.log(`   AdvancedStorage deployed to: ${advancedStorageAddress}`);

  // 11. 部署 ConcreteToken (抽象合约)
  console.log("\n11. Deploying ConcreteToken...");
  const ConcreteToken = await hre.ethers.getContractFactory("ConcreteToken");
  const concreteToken = await ConcreteToken.deploy();
  await concreteToken.waitForDeployment();
  const concreteTokenAddress = await concreteToken.getAddress();
  console.log(`   ConcreteToken deployed to: ${concreteTokenAddress}`);

  // 12. 部署 EventDemo
  console.log("\n12. Deploying EventDemo...");
  const EventDemo = await hre.ethers.getContractFactory("EventDemo");
  const eventDemo = await EventDemo.deploy(hre.ethers.parseEther("1000000"));
  await eventDemo.waitForDeployment();
  const eventDemoAddress = await eventDemo.getAddress();
  console.log(`   EventDemo deployed to: ${eventDemoAddress}`);

  // 13. 部署 EventAdvanced
  console.log("\n13. Deploying EventAdvanced...");
  const EventAdvanced = await hre.ethers.getContractFactory("EventAdvanced");
  const eventAdvanced = await EventAdvanced.deploy();
  await eventAdvanced.waitForDeployment();
  const eventAdvancedAddress = await eventAdvanced.getAddress();
  console.log(`   EventAdvanced deployed to: ${eventAdvancedAddress}`);

  // 14. 部署 AdvancedWallet (综合)
  console.log("\n14. Deploying AdvancedWallet...");
  const AdvancedWallet = await hre.ethers.getContractFactory("AdvancedWallet");
  const advancedWallet = await AdvancedWallet.deploy();
  await advancedWallet.waitForDeployment();
  const advancedWalletAddress = await advancedWallet.getAddress();
  console.log(`   AdvancedWallet deployed to: ${advancedWalletAddress}`);

  // 15. 部署 TokenWallet (综合)
  console.log("\n15. Deploying TokenWallet...");
  const TokenWallet = await hre.ethers.getContractFactory("TokenWallet");
  const tokenWallet = await TokenWallet.deploy("TokenWallet", "TW", hre.ethers.parseEther("1000000"));
  await tokenWallet.waitForDeployment();
  const tokenWalletAddress = await tokenWallet.getAddress();
  console.log(`   TokenWallet deployed to: ${tokenWalletAddress}`);

  // 16. 部署 ContractFactory
  console.log("\n16. Deploying ContractFactory...");
  const ContractFactory = await hre.ethers.getContractFactory("ContractFactory");
  const contractFactory = await ContractFactory.deploy();
  await contractFactory.waitForDeployment();
  const contractFactoryAddress = await contractFactory.getAddress();
  console.log(`   ContractFactory deployed to: ${contractFactoryAddress}`);

  // 17. 部署 InterfaceUser
  console.log("\n17. Deploying InterfaceUser...");
  const InterfaceUser = await hre.ethers.getContractFactory("InterfaceUser");
  const interfaceUser = await InterfaceUser.deploy();
  await interfaceUser.waitForDeployment();
  const interfaceUserAddress = await interfaceUser.getAddress();
  console.log(`   InterfaceUser deployed to: ${interfaceUserAddress}`);

  // 18. 部署 ComprehensiveContract (综合库使用)
  console.log("\n18. Deploying ComprehensiveContract...");
  const ComprehensiveContract = await hre.ethers.getContractFactory("ComprehensiveContract");
  const comprehensiveContract = await ComprehensiveContract.deploy("Demo");
  await comprehensiveContract.waitForDeployment();
  const comprehensiveContractAddress = await comprehensiveContract.getAddress();
  console.log(`   ComprehensiveContract deployed to: ${comprehensiveContractAddress}`);

  console.log("\n========================================");
  console.log("All contracts deployed successfully!");
  console.log("========================================\n");

  // 输出部署摘要
  console.log("Deployment Summary:");
  console.log("===================");
  console.log(`SimpleToken:              ${simpleTokenAddress}`);
  console.log(`StorageContract:         ${storageContractAddress}`);
  console.log(`WalletContract:          ${walletContractAddress}`);
  console.log(`MathContract:            ${mathContractAddress}`);
  console.log(`ArrayContract:           ${arrayContractAddress}`);
  console.log(`StringContract:          ${stringContractAddress}`);
  console.log(`AddressContract:         ${addressContractAddress}`);
  console.log(`OwnableStorage:          ${ownableStorageAddress}`);
  console.log(`OwnablePausableStorage:  ${ownablePausableStorageAddress}`);
  console.log(`AdvancedStorage:         ${advancedStorageAddress}`);
  console.log(`ConcreteToken:           ${concreteTokenAddress}`);
  console.log(`EventDemo:               ${eventDemoAddress}`);
  console.log(`EventAdvanced:           ${eventAdvancedAddress}`);
  console.log(`AdvancedWallet:          ${advancedWalletAddress}`);
  console.log(`TokenWallet:             ${tokenWalletAddress}`);
  console.log(`ContractFactory:         ${contractFactoryAddress}`);
  console.log(`InterfaceUser:           ${interfaceUserAddress}`);
  console.log(`ComprehensiveContract:  ${comprehensiveContractAddress}`);

  // 保存部署地址到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      SimpleToken: simpleTokenAddress,
      StorageContract: storageContractAddress,
      WalletContract: walletContractAddress,
      MathContract: mathContractAddress,
      ArrayContract: arrayContractAddress,
      StringContract: stringContractAddress,
      AddressContract: addressContractAddress,
      OwnableStorage: ownableStorageAddress,
      OwnablePausableStorage: ownablePausableStorageAddress,
      AdvancedStorage: advancedStorageAddress,
      ConcreteToken: concreteTokenAddress,
      EventDemo: eventDemoAddress,
      EventAdvanced: eventAdvancedAddress,
      AdvancedWallet: advancedWalletAddress,
      TokenWallet: tokenWalletAddress,
      ContractFactory: contractFactoryAddress,
      InterfaceUser: interfaceUserAddress,
      ComprehensiveContract: comprehensiveContractAddress
    }
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
