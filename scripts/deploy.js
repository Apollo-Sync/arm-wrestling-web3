const hre = require("hardhat");

async function main() {
  const ArmWrestling = await hre.ethers.getContractFactory("ArmWrestling");
  const aw = await ArmWrestling.deploy();
  await aw.deployed();
  console.log("ArmWrestling deployed to:", aw.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
