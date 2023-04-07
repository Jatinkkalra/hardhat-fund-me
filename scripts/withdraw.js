const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const fundMe = await ethers.getContract("FundMeWithLibrary", deployer);
  console.log("Withdrawing from Contract............");
  const transactionResponse = await fundMe.cheaperWithdraw();
  await transactionResponse.wait(1);
  console.log("Funds Withdrawn!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
