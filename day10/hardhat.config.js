// SPDX-License-Identifier: MIT
/**
 * @title Hardhat Configuration
 * @notice Hardhat 配置文件
 */
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            // 启用优化器
            optimizer: {
                enabled: true,
                runs: 200
            },
            // 启用 EVM 版本
            evmVersion: "paris"
        }
    },

    // 网络配置
    networks: {
        // 本地 Hardhat 网络
        hardhat: {
            chainId: 31337
        },

        // 本地节点（需要先运行 npm run node）
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },

        // Sepolia 测试网
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111
        },

        // Mainnet
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1
        }
    },

    //  etherscan/blockscout 验证配置
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY || "",
            mainnet: process.env.ETHERSCAN_API_KEY || ""
        }
    },

    // Gas 报告配置
    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "ETH",
        gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
    },

    // 路径配置
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },

    // 编译器配置
    mocha: {
        timeout: 60000
    }
};
