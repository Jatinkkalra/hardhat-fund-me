const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");

describe("FundMeWithLibrary", function () {
  let fundMe;
  let deployer;
  let MockV3Aggregator;
  beforeEach(async function () {
    // Deploy our fundMeWithLibrary contract using hardhat-deploy

    // const { deployer } = await getNamedAccounts();
    // Another way to get deployer while assigning to a variable:
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]); // .fixture() for reuse of duplicate code in deployment

    fundMe = await ethers.getContract("FundMeWithLibrary", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", async function () {
    it("Sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed;
      assert.equal(response, mockV3Aggregator.address);
    });
  });
});
