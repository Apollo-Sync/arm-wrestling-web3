require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();  // Thêm dòng này

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY || "https://rpc.sepolia.org",  // Dùng Infura nếu có, fallback rpc công cộng
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};
