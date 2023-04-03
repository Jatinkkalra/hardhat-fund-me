const networkConfig = {
  // testnet
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  // mainnet
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xf9680d99d6c9589e2a93a78a04a279e509205945",
  },
  // local network (hardhat or localhost)
  31337: {
    name: "localhost",
  },
};

// Chains we can deploy mocks on
const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000;

// exporting so that others scripts can use it:
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
