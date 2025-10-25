const { run } = require("hardhat");

async function main() {
  const treasuryAddress = "0x..."; // 🔁 replace with deployed Treasury address
  const echoDAOAddress = "0x...";  // 🔁 replace with deployed EchoDAO address

  console.log("Verifying Treasury...");
  try {
    await run("verify:verify", {
      address: treasuryAddress,
      constructorArguments: [],
    });
    console.log("✅ Treasury verified successfully");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Treasury already verified.");
    } else console.error(error);
  }

  console.log("Verifying EchoDAO...");
  try {
    await run("verify:verify", {
      address: echoDAOAddress,
      constructorArguments: [treasuryAddress],
    });
    console.log("✅ EchoDAO verified successfully");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("EchoDAO already verified.");
    } else console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});