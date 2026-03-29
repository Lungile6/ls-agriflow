import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  solidity: {
    compilers: [
      { version: "0.8.19" }, // For LSAgriFlow
      { version: "0.8.28" }  // For Counter
    ]
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};