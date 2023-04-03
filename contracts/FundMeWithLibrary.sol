// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.7;

// Objective:
// 1.

// Notes:
// A.

// 2. Imports
import "./PriceConverter(ALibrary).sol";

// 3. Error codes // Syntax: error ContractName__ErrorName();
error FundMeWithLibrary__NotOwner();

// 4. Interfaces; 5. Libraries; 6. Contracts

// Natspec syntax for documentation
/** @title A contract for crowd funding
 * @author Jatin Kalra
 * @notice This is a demo funding contract
 * @dev This contract uses price feeds as library
 */
contract FundMeWithLibrary {
    // 6(i). Type Declarations
    using PriceConverter for uint256;

    // 6(ii). State variables
    address[] public funders; // Array(1/2)
    mapping(address => uint256) public addressToAmountFunded; // Mapping(1/2)

    uint256 public constant MINIMUM_USD = 50;

    address public immutable i_Owner; // Global variable
    AggregatorV3Interface public priceFeed; // Global variable

    // 6(iii). Events
    // 6(iv). Modifiers
    // Modifier to ease-up owner process. 2(i)
    modifier onlyOwner() {
        if (msg.sender != i_Owner) {
            revert FundMeWithLibrary__NotOwner();
        }
        _;
    }

    //  6.v.1. constructor
    constructor(address priceFeedAddress) {
        //PriceFeedAddress paramater to easily change chains
        i_Owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //  6.v.2. receive
    receive() external payable {
        fundUSD();
    }

    //  6.v.3. fallback
    fallback() external payable {
        fundUSD();
    }

    //  6.v.4. external
    //  6.v.5. public

    /**
     * @notice fundUSD() function funds this contract
     * @dev This implements price feeds as our library
     */
    function fundUSD() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Minimum is 50 USD!"
        );
        funders.push(msg.sender); // Array(2/2)
        addressToAmountFunded[msg.sender] += msg.value; // Mapping(2/2)
    }

    // 2. Withdraw funds

    /**
     * @notice This withdraws the funds from the contract
     * @dev Array and mapping are emptied and call function is used to withdraw
     */
    function withdraw() public onlyOwner {
        // Resetting mapping
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex = funderIndex++ /*ie funderIndex + 1*/
        ) {
            /* starting index, ending index, step amount */
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // Resetting array (instead of looping and deleting, a complete refresh is done)
        funders = new address[](0);

        // Withdraw the funds (3 ways to do)

        (bool callSuccess /* bytes memory dataReturned */, ) = payable(
            msg.sender
        ).call{value: address(this).balance}(""); // no data taken here
        require(callSuccess, "Call failed");
    }

    // 6.v.6. internal
    // 6.v.7. private
    // 6.v.8. view / pure
}
