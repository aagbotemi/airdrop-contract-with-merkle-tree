import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const merkleProof = require("./files/merkle_proof.json")
const claimList = require("./files/claim_list.json")

async function main() {
  const claimer = Object.keys(claimList)[2];
  const _amount_ = claimList[claimer].amount;
  const _proof = merkleProof[claimer].proof;
  
  await helpers.impersonateAccount(claimer);
  const impersonatedSigner = await ethers.getSigner(claimer);

  await helpers.setBalance(impersonatedSigner.address, 100n ** 18n);

  const _AirdropToken_ = await ethers.getContractFactory("AirdropToken");
  const airdropToken_ = await _AirdropToken_.deploy();
  await airdropToken_.deployed();
  console.log(`AirdropToken is deployed to ${airdropToken_.address}`);

  const ClaimAirdrop = await ethers.getContractFactory("ClaimAirdrop");
  const claimAirdrop_ = await ClaimAirdrop.deploy(airdropToken_.address);
  await claimAirdrop_.deployed();
  console.log(`Claim Airdrop is deployed to ${claimAirdrop_.address}`);

  const amount = ethers.utils.parseEther("2000");
  const transfer = await airdropToken_.transferFromContract(claimAirdrop_.address, amount)
  console.log("TRANSFER: ", transfer);

  const _balanceOfUser = await airdropToken_.balanceOf(impersonatedSigner.address);
  console.log(`Balance Of User: ${_balanceOfUser}`)
  
  const _balanceOfClaimAirdrop = await airdropToken_.balanceOf(claimAirdrop_.address);
  console.log(`Balance Of: ${_balanceOfClaimAirdrop}`)
  
  const amount_ = ethers.utils.parseEther(_amount_);
  const _claimAirdrop = await (await claimAirdrop_.connect(impersonatedSigner).claimAirdrop(_proof, _amount_)).wait();
  console.log(`Claim Of: ${_claimAirdrop}`)  
  
  const _balanceOfUser2 = await airdropToken_.balanceOf(impersonatedSigner.address);
  console.log(`Balance Of User: ${_balanceOfUser2}`)

  const _balanceOfClaimAirdrop2 = await airdropToken_.balanceOf(claimAirdrop_.address);
  console.log(`Balance Of Claim: ${_balanceOfClaimAirdrop2}`)

  const _claimAirdrop2 = await (await claimAirdrop_.connect(impersonatedSigner).claimAirdrop(_proof, amount_)).wait();
  console.log(`Claim Of: ${_claimAirdrop2}`)      
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
