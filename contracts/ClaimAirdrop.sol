// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ClaimAirdrop {

    bytes32 public merkleRoot = 0x7551e943dbd1a05306d81f4f844e846d52d2757df26d7d6abb956a905ac2ff40;
    address tokenAddress;

    mapping(address => bool) airdropTokenClaimed;

    constructor(address _addr) {
        tokenAddress = _addr;
    }

    error YouAreNotEligible();
    error ClaimedAlready();

    function checkInWhitelist(bytes32[] calldata proof, uint256 airdropAmount) public view returns (bool verified) {
        if(airdropTokenClaimed[msg.sender]) {
            revert ClaimedAlready();
        }
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, airdropAmount));
        verified = MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function claimAirdrop(bytes32[] calldata _merkleProof, uint256 airdropAmount) external returns(bool) {
        bool status = checkInWhitelist(_merkleProof, airdropAmount);


        if(!status) {
            revert YouAreNotEligible();
        }

        IERC20(tokenAddress).transfer(msg.sender, airdropAmount * 10**18);

        airdropTokenClaimed[msg.sender] = true;

        return true;
    }
}