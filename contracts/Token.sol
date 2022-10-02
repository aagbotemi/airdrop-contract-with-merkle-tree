// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AirdropToken is ERC20 {
    address owner;

    constructor() ERC20("Airdrop Token", "ADT") {
        owner = msg.sender;
        _mint(address(this), 2000000e18);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "no permission!");
        _;
    }

    function transferFromContract(address _to, uint256 amount) external onlyOwner {
        uint bal = balanceOf(address(this));
        // require(bal >= amount, "You are transferring more than the amount available!");
        assert(bal >= amount);
        _transfer(address(this), _to, amount);
    }

    function mint(uint _amount) external onlyOwner {
        _mint(msg.sender, _amount);
    }
}