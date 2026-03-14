// SPDX-License-Identifier: MIT
/**
 * @title Hardhat 配置文件
 * @notice 用于编译、测试和部署智能合约
 */
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Solidity 编译器配置
  solidity: {
    version: "0.8.24",
    settings: {
      // 启用优化器，减少部署成本
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  // 网络配置
  networks: {
    // 本地 Hardhat 节点
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Hardhat 内置测试网络
    hardhat: {
      chainId: 31337
    }
  },

  // Etherscan/BscScan 验证插件配置（可选）
  etherscan: {
    apiKey: {
      // 替换为实际的 API key
      mainnet: "",
      sepolia: ""
    }
  }
};
