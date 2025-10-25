// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Treasury
 * @dev Holds funds and allows release only when called by the owner (EchoDAO contract).
 */
contract Treasury is Ownable {
    // --- Events ---
    event FundsReleased(address indexed to, uint256 amount);
    event Received(address indexed sender, uint256 amount);

    // --- Constructor ---
    constructor(address initialOwner) Ownable(initialOwner) {}

    // Fallback to receive ETH
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Releases funds to a specified address.
     */
    function releaseFunds(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");

        emit FundsReleased(_to, _amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}