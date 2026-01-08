require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org",  // Hoặc dùng Alchemy/Infura nếu có API key
      accounts: ["YOUR_PRIVATE_KEY_HERE"]  // Thay bằng private key của ví test Sepolia
    }
  }
};
