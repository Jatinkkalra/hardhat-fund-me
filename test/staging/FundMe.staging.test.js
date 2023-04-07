const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMeWithLibrary", function () {
      let fundMe;
      let deployer;

      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMeWithLibrary", deployer);
      });

      // Testing constructor function
      describe("constructor", async function () {
        it("Sets the aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, fundMe.address);
        });
      });

      // Testing Fund function
      describe("fundUSD", async function () {
        it("Fails if amount < 50 USD!", async () => {
          await expect(fundMe.fundUSD()).to.be.revertedWith(
            "Minimum is 50 USD!"
          ); // here fundUSD() is blank, means 0 ETH
        });

        beforeEach(async function () {
          await fundMe.fundUSD({ value: sendValue });
        });
        it("Updates Mapped data correctly", async () => {
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Add funders to Array of funders", async () => {
          const firstFunder = await fundMe.getFunder(0);
          assert.equal(firstFunder, deployer);
        });
      });

      // Testing Withdraw function
      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fundUSD({ value: sendValue });
        });
        it("Cheaper Way: Withdraws ETH from the contract with multiple funders", async () => {
          // Arrange (1/3)
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedAccount = await fundMe.connect(accounts[i]);
            await fundMeConnectedAccount.fundUSD({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Fetching contract balance
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Fetching deployer's balance

          // Act (2/3)
          const transactionResponse = await fundMe.cheaperWithdraw(); // Calling withdrawal (gas used)
          const transactionReceipt = await transactionResponse.wait(1); // Withdrawal confirmation

          // Fetching and calculating gas cost
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // Fetching updated contract balance
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // Fetching updated deployer's balance

          // Assert (3/3)
          assert.equal(endingFundMeBalance, 0); // Contract balance should be 0 now
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ); // Deployer's address balance should have contract's balance added to it

          // Checking if Array has been reset
          await expect(fundMe.getFunder(0)).to.be.reverted;

          // Checking if Mapping has been reset
          for (i = 1; i < 6; i++)
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];

          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            fundMe,
            "FundMeWithLibrary__NotOwner"
          );
        });
      });
    });
