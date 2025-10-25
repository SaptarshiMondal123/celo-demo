const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1️⃣ Deploy Treasury (needs deployer as owner)
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(deployer.address); // FIXED
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", await treasury.getAddress());

  // 2️⃣ Deploy EchoDAO with Treasury address
  const EchoDAO = await ethers.getContractFactory("EchoDAO");
  const echoDAO = await EchoDAO.deploy(await treasury.getAddress());
  await echoDAO.waitForDeployment();
  console.log("EchoDAO deployed to:", await echoDAO.getAddress());

  // 3️⃣ Transfer Treasury ownership to DAO
  console.log("Transferring Treasury ownership to EchoDAO...");
  const tx = await treasury.transferOwnership(await echoDAO.getAddress());
  await tx.wait();
  console.log("✅ Ownership transferred successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});