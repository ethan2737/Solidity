const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Verifying AdvancedSolidityDemo Contracts");
  console.log("========================================\n");

  // 读取部署信息
  const fs = require("fs");
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json", "utf8"));
  } catch (e) {
    console.log("No deployments.json found. Deploy contracts first.");
    return;
  }

  const contracts = deploymentInfo.contracts;

  // 1. 验证 SimpleToken
  console.log("1. Verifying SimpleToken...");
  const simpleToken = await ethers.getContractAt("SimpleToken", contracts.SimpleToken);
  const name = await simpleToken.name();
  const symbol = await simpleToken.symbol();
  console.log(`   Name: ${name}, Symbol: ${symbol}`);

  // 2. 验证 StorageContract
  console.log("\n2. Verifying StorageContract...");
  const storageContract = await ethers.getContractAt("StorageContract", contracts.StorageContract);
  await storageContract.store(12345);
  const value = await storageContract.retrieve();
  console.log(`   Stored value: ${value}`);

  // 3. 验证 MathContract
  console.log("\n3. Verifying MathContract...");
  const mathContract = await ethers.getContractAt("MathContract", contracts.MathContract);
  const addResult = await mathContract.add(100, 200);
  console.log(`   100 + 200 = ${addResult}`);

  // 4. 验证 ArrayContract
  console.log("\n4. Verifying ArrayContract...");
  const arrayContract = await ethers.getContractAt("ArrayContract", contracts.ArrayContract);
  await arrayContract.addNumber(1);
  await arrayContract.addNumber(2);
  await arrayContract.addNumber(3);
  const contains = await arrayContract.containsNumber(2);
  console.log(`   Contains 2: ${contains}`);

  // 5. 验证 StringContract
  console.log("\n5. Verifying StringContract...");
  const stringContract = await ethers.getContractAt("StringContract", contracts.StringContract);
  await stringContract.setString("Hello");
  const isEqual = await stringContract.compareStrings("Hello");
  console.log(`   String equals "Hello": ${isEqual}`);

  // 6. 验证 AddressContract
  console.log("\n6. Verifying AddressContract...");
  const addressContract = await ethers.getContractAt("AddressContract", contracts.AddressContract);
  const [owner] = await ethers.getSigners();
  await addressContract.setAddress(owner.address);
  const address = await addressContract.storedAddress();
  console.log(`   Address set to: ${address}`);

  // 7. 验证 OwnableStorage
  console.log("\n7. Verifying OwnableStorage...");
  const ownableStorage = await ethers.getContractAt("OwnableStorage", contracts.OwnableStorage);
  await ownableStorage.setValue(42);
  const storageValue = await ownableStorage.getValue();
  console.log(`   Value: ${storageValue}`);
  console.log(`   Owner: ${await ownableStorage.owner()}`);

  // 8. 验证 OwnablePausableStorage
  console.log("\n8. Verifying OwnablePausableStorage...");
  const ownablePausableStorage = await ethers.getContractAt("OwnablePausableStorage", contracts.OwnablePausableStorage);
  console.log(`   Initial value: ${await ownablePausableStorage.storedValue()}`);
  await ownablePausableStorage.store(50);
  console.log(`   After store(50): ${await ownablePausableStorage.storedValue()}`);

  // 9. 验证 AdvancedStorage
  console.log("\n9. Verifying AdvancedStorage...");
  const advancedStorage = await ethers.getContractAt("AdvancedStorage", contracts.AdvancedStorage);
  console.log(`   Max value: ${await advancedStorage.maxValue()}`);
  console.log(`   Min value: ${await advancedStorage.minValue()}`);

  // 10. 验证 EventDemo
  console.log("\n10. Verifying EventDemo...");
  const eventDemo = await ethers.getContractAt("EventDemo", contracts.EventDemo);
  console.log(`   Owner: ${await eventDemo.owner()}`);
  console.log(`   Total Supply: ${await eventDemo.totalSupply()}`);

  // 11. 验证 EventAdvanced
  console.log("\n11. Verifying EventAdvanced...");
  const eventAdvanced = await ethers.getContractAt("EventAdvanced", contracts.EventAdvanced);
  await eventAdvanced.registerUser("TestUser");
  const userCount = await eventAdvanced.userCount();
  console.log(`   User count: ${userCount}`);

  // 12. 验证 AdvancedWallet
  console.log("\n12. Verifying AdvancedWallet...");
  const advancedWallet = await ethers.getContractAt("AdvancedWallet", contracts.AdvancedWallet);
  console.log(`   Owner: ${await advancedWallet.owner()}`);

  // 13. 验证 TokenWallet
  console.log("\n13. Verifying TokenWallet...");
  const tokenWallet = await ethers.getContractAt("TokenWallet", contracts.TokenWallet);
  console.log(`   Name: ${await tokenWallet.name()}`);
  console.log(`   Symbol: ${await tokenWallet.symbol()}`);
  console.log(`   Total Supply: ${await tokenWallet.totalSupply()}`);

  // 14. 验证 ContractFactory
  console.log("\n14. Verifying ContractFactory...");
  const contractFactory = await ethers.getContractAt("ContractFactory", contracts.ContractFactory);
  console.log(`   Owner: ${await contractFactory.owner()}`);

  // 15. 验证 ComprehensiveContract
  console.log("\n15. Verifying ComprehensiveContract...");
  const comprehensiveContract = await ethers.getContractAt("ComprehensiveContract", contracts.ComprehensiveContract);
  console.log(`   Name: ${await comprehensiveContract.name()}`);

  console.log("\n========================================");
  console.log("All contracts verified successfully!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
