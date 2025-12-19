require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * Hardhat configuration for Arc Network
 */

function isValidPrivateKey(key) {
  if (!key) return false;
  
  const trimmed = key.trim();
  if (trimmed.startsWith("0x")) {
    return trimmed.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(trimmed);
  }

  return trimmed.length === 64 && /^[0-9a-fA-F]{64}$/.test(trimmed);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Arc Network Testnet
    arc: {
      url: process.env.VITE_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: isValidPrivateKey(process.env.DEPLOYER_PRIVATE_KEY) 
        ? [process.env.DEPLOYER_PRIVATE_KEY.trim()] 
        : [],
    },
    
    // Alias for arcTestnet (backwards compatibility)
    arcTestnet: {
      url: process.env.VITE_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: isValidPrivateKey(process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY) 
        ? [(process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY).trim()] 
        : [],
    },

    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },

  etherscan: {
    apiKey: {
      arcTestnet: process.env.ARCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};



