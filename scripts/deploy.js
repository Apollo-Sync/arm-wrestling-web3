const hre = require("hardhat");

async function main() {
  const ArmWrestling = await hre.ethers.getContractFactory("ArmWrestling");
  const aw = await ArmWrestling.deploy();

  // Thay đổi ở đây: dùng waitForDeployment thay vì deployed()
  await aw.waitForDeployment();

  const address = await aw.getAddress();
  console.log("ArmWrestling deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
