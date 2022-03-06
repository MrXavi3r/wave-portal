// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    // declare a state variable to store wave count
    uint256 totalWaves;

    // will be usuinng this to create help generate a random number
    uint256 private seed;

    event NewWave(address indexed from, uint256 timestamp, string message);

    // a custom data type. essentially a schema
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    // declare a variable waves that lets me store an array of structs
    // Lets me hold all the waves anyone ever sends to me!
    Wave[] waves;

    // address => uint mapping for storing the address with the last time the user waved at us
    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        console.log("Welcome to WavePortal, Let's wave!");
        // set the initial seed
        seed = (block.timestamp + block.difficulty) % 100;
    }

    // increment wave count when someone waves
    // handles prize distribution
    function wave(string memory _message) public {

        // to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;



        totalWaves++;
        console.log("%s has waved!", msg.sender, _message);

        // store the wave data in the array
        waves.push(Wave(msg.sender, _message, block.timestamp));

        // generate a new seed for next user that waves
        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        // give 15% chnace that users wins some eth
        if (seed <= 15) {
            console.log("%s won!", msg.sender);

            // prize money for wave lottery
            uint256 prizeAmount = 0.0001 ether;

            // checks if we have enough funds to pay the prize
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );

            // withdraws the prize
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            // check if the withdraw was successful
            require(success, "Failed to withdraw money from contract.");
        }

        // emit the NewWave event. which will be stored in transaction logs on the blockchain
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    // will return the struct array, waves,
    // This will make it easy to retrieve the waves from the website!
    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    // getter for total waves
    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}
