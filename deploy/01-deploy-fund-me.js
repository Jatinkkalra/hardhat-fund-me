// Import (Layout 1/3)
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

// Function (Layout 2/3)
// Basic format for default execution:
// function deployFunc(hre) {
//   console.log("Hi!");
// }
// module.exports.default = deployFunc;

// One-liner format for default execution (anon function):
// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre; //Fetching two things from hre || Or: hre.getNamedAccounts(), hre.deployments
// };

// One-liner format for default execution with hre:
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // if chainId is X, use address Y || Used "../helper-hardhat-config.js" here.
  // Using `if` to deploy scripts on either mock or testnet/mainnet
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // if contract address doesn't exist (local networks like hardhat or localhost), we deploy a minimal version for local testing

  // Deploy code (Layout 3/3)
  // Syntax: const - contractName = await importedFunction_deploy("ContractName", {/*listOfOverrides*/});
  const FundMeWithLibrary = await deploy("FundMeWithLibrary", {
    contract: "FundMeWithLibrary",
    from: deployer,
    args: [ethUsdPriceFeedAddress], // Constructor arguments, ie, priceFeedAddress
    log: true, // custom logging; No need for console.log now. Also returns more data on execution.
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Auto-verification
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(FundMeWithLibrary.address, ethUsdPriceFeedAddress);
  }

  log("-----------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
