const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config.chainId;

  // Only deploy when there is no priceFeed contract available
  if (developmentChains.includes(network.name)) {
    // || if (chainId == "31337") {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });

    log("Mocks Deployed!");
    log("----------------------------------------------");
  }
};

// tags help in executing only specific scripts: `yarn hardhat deploy --tags mocks`
module.exports.tags = ["all", "mocks"];
