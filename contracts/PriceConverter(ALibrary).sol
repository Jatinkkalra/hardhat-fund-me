// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Objective:
// Acts as a library for ".contracts/FundMeWithLibrary.sol"
// Refactoring to modularize our code to be chain-agnostic || `priceFeed` use in parameters

// Notes:
// AggregatorV3interface is an interface which gets compiled down to an ABI
// AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306) is ABI and Address, which makes priceFeed a contract
// Global variables are set outside any function and can be called by other contracts via inheritance or library calls.

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // To fetch the chainlink oracle price of ETH/USD Sepolia
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10); // Price feed gives 10 decimal places || type-casting to uint256 for uniformity.
    }

    // To convert msg.value in USD price
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // Ex: 3000 = ETH/USD price; ethAmount = 2_000000000000000000 = 2*1e18
        uint256 ethPrice = getPrice(priceFeed); // 3000_000000000000000000
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // (3000_000000000000000000 * 2_000000000000000000) / 1e18
        return ethAmountInUsd; // 6000_000000000000000000
    }

    // just to check if the interface is imported correctly
    // function getPriceDecimals() internal view returns (uint256){
    //     // AggregatorV3Interface as a type here
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return priceFeed.decimals();
    // }
}
