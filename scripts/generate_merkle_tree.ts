const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const csv = require("csv-parser");
const fs = require("fs");
var utils = require("ethers").utils;

function main() {
  // create web3 instance (no provider needed)
  let root: any;

  ///files for each ardrop
  // import distribution from this file
  const filename = __dirname + "/files/address_list.csv";

  // what file should we write the merkel proofs too?
  const output_file = __dirname + "/files/merkle_proof.json";

  //file that has the user claim list
  const userclaimFile = __dirname + "/files/claim_list.json";

  //contract of items being sent out
  // const airdropContract = "0x027Ffd3c119567e85998f4E6B9c3d83D5702660c";

  // used to store one leaf for each line in the distribution file
  const token_dist: Array<any> = [];

  // used for tracking user_id of each leaf so we can write to proofs file accordingly
  const user_dist_list: Array<any>  = [];

  // open distribution csv
  fs.createReadStream(filename)
    .pipe(csv())
    .on("data", (row: any) => {
      const user_dist = [row["user_address"], row["amount"]]; // create record to track user_id of leaves
      const leaf_hash = utils.solidityKeccak256(
        ["address", "uint256"],
        [row["user_address"], row["amount"]]
      ); // encode base data like solidity abi.encode
      user_dist_list.push(user_dist); // add record to index tracker
      token_dist.push(leaf_hash); // add leaf hash to distribution
    })
    .on("end", () => {
      // create merkle tree from token distribution
      const merkle_tree = new MerkleTree(token_dist, keccak256, {
        sortPairs: true,
      });
      // get root of our tree
      root = merkle_tree.getHexRoot();
      // create proof file
      write_leaves(merkle_tree, user_dist_list, token_dist, root);
    });

  // write leaves & proofs to json file
  function write_leaves(merkle_tree: any, user_dist_list: any, token_dist: any, root: any) {
    console.log("Begin writing leaves to file...");
    const full_dist: any = {};
    const full_user_claim: any = {};
    for (let line = 0; line < user_dist_list.length; line++) {
      // generate leaf hash from raw data
      const leaf = token_dist[line];

      // create dist object
      const user_dist = {
        leaf: leaf,
        proof: merkle_tree.getHexProof(leaf),
      };
      // add record to our distribution
      full_dist[user_dist_list[line][0]] = user_dist;
    }

    fs.writeFile(output_file, JSON.stringify(full_dist, null, 4), (err: any) => {
      if (err) {
        console.error(err);
        return;
      }

      let dropObjs = {
        dropDetails: {
          // contractAddress: airdropContract,
          merkleroot: root,
        },
      };

      for (let line = 0; line < user_dist_list.length; line++) {
        const other = user_dist_list[line];
        // console.log(gotchi_dist_list[line])
        const user_claim = {
          address: other[0],
          amount: other[1],
        };
        full_user_claim[user_dist_list[line][0]] = user_claim;
      }
      let newObj = Object.assign(full_user_claim, dropObjs);
      //append to airdrop list to have comprehensive overview
      fs.writeFile(userclaimFile, JSON.stringify(newObj, null, 4), (err: any) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      console.log(output_file, "has been written with a root hash of:\n", root);
    });

    // return root;
  }
}
main();

//exports.allOps=write_leaves();
