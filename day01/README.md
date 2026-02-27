


使用Hardhat 完整流程（带注释）

# 1. 创建目录
  mkdir day01
  mkdir HelloWorld
  cd day01/HelloWorld

  # 2. 初始化项目
  npm init -y

  # 3. 安装 Hardhat 和必要依赖
  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

  # 4.手动创建配置文件
  day01/HelloWorldhardhat.config.js 配置文件
    ```javascript
    require("@nomicfoundation/hardhat-toolbox");

    module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
        }
    },
    networks: {
        hardhat: {
        chainId: 31337
        },
        localhost: {
        url: "http://127.0.0.1:8545",
        chainId: 31337
        }
    }
    };
    ```

  # 5. 创建合约目录
  mkdir contracts

  # 6. 编写智能合约
  contracts/HelloWorld.sol

# 7.编译合约
    ```bash
    npx hardhat compile
    ```

  # 7. 创建测试目录
  mkdir test

  # 8. 编写测试文件
  test/HelloWorld.test.js

  # 9. 运行测试
 npx hardhat test

  # 10. 部署合约
  创建 `scripts/deploy.js`

  ```javascript
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy("Hello, Hardhat Deployment!");
  
  await helloWorld.waitForDeployment();
  const address = await helloWorld.getAddress();
  
  console.log("✅ 合约部署成功！");
  console.log("合约地址:", address);
  console.log("初始消息:", await helloWorld.getMessage());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

  # 11. 部署到本地网络：
  启动本地节点
  npx hardhat node

  # 12. 部署合约（另一个终端窗口）
  npx hardhat run scripts/deploy.js --network localhost

---

## 📋 常用命令

```bash
# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 启动本地节点
npx hardhat node

# 部署合约
npx hardhat run scripts/deploy.js --network localhost

# 清理编译缓存
npx hardhat clean
```
  

