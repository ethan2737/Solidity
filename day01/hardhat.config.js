require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 *
 * Hardhat 配置文件
 * 用于设置 Solidity 编译器版本、网络配置、路径等
 */
module.exports = {
  // Solidity 编译器配置
  solidity: {
    version: "0.8.24",  // 使用 0.8.24 版本
    settings: {
      // 优化器配置
      optimizer: {
        enabled: true,   // 启用优化器
        runs: 200        // 优化目标：预计函数调用次数
      }
    }
  },
  // 网络配置
  networks: {
    // Hardhat 内置网络（用于测试）
    hardhat: {
      chainId: 31337,
      // 初始账户配置
      accounts: {
        count: 10,  // 10 个测试账户
        accountsBalance: "10000000000000000000000" // 每个账户 10000 ETH
      }
    },
    // 本地 Hardhat 节点
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  // 路径配置
  paths: {
    sources: "./contracts",    // 合约源码目录
    tests: "./test",           // 测试文件目录
    cache: "./cache",          // 缓存目录
    artifacts: "./artifacts"   // 编译产物目录
  },
  // Mocha 测试框架配置
  mocha: {
    timeout: 40000  // 测试超时时间（毫秒）
  }
};
