require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 30000000000,  // 30 gwei để transaction được ưu tiên nhanh
      timeout: 120000,  // Tăng timeout lên 2 phút để tránh lỗi chờ lâu
    }
  }
};
