const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMeWithLibrary", function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  // const sendValue = "1000000000000000000";
  const sendValue = ethers.utils.parseEther("1");

  beforeEach(async function () {
    // Deploy our fundMeWithLibrary contract using hardhat-deploy

    // const { deployer } = await getNamedAccounts();
    // Another way to get deployer while assigning to a variable:
    deployer = (await getNamedAccounts()).deployer;

    await deployments.fixture(["all"]); // .fixture() for reuse of duplicate code in deployment

    fundMe = await ethers.getContract("FundMeWithLibrary", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  // Testing constructor function
  describe("constructor", async function () {
    it("Sets the aggregator addresses correctly", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  // Testing Fund function
  describe("fundUSD", async function () {
    it("Fails if amount < 50 USD!", async () => {
      await expect(fundMe.fundUSD()).to.be.revertedWith("Minimum is 50 USD!"); // here fundUSD() is blank, means 0 ETH
    });

    it("Updates Mapped data correctly", async () => {
      await fundMe.fundUSD({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Add funders to Array of funders", async () => {
      await fundMe.fundUSD({ value: sendValue });
      const firstFunder = await fundMe.funders(0);
      assert.equal(firstFunder, deployer);
    });
  });

  // Testing Withdraw function
  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fundUSD({ value: sendValue });
    });

    it("Withdraws ETH from the contract", async () => {
      // Arrange (1/3)
      const startingFundMeBalance = await fundMe.provider.getBalance(
        // == ethers.provider.getBalance(
        fundMe.address
      ); // Fetching contract balance
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      ); // Fetching deployer's balance

      // Act (2/3)
      const transactionResponse = await fundMe.withdraw({
        gasLimit: 300000,
      }); // Calling withdrawal (gas used)
      const transactionReceipt = await transactionResponse.wait(1); // Withdrawal confirmation
      // Fetching and calculating gas cost
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice); // `.mul()` instead of `*` bcoz of BigNumber

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      ); // Fetching updated contract balance
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer); // Fetching updated deployer's balance

      // Assert (3/3)
      assert.equal(endingFundMeBalance, 0); // Contract balance should be 0 now
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(), // `.add` instead of `+` bcoz of BigNumber formatting
        endingDeployerBalance.add(gasCost).toString() // Gas cost spent on `withdraw()` function added here
      ); // Deployer's address balance should have contract's balance added to it
    });

    // it("allows us to withdraw with multiple funders", async () => {});
  });
});
