
import * as ethers from 'ethers';

export default async function readERC20Contract(tokenAddress, provider) {
    // The minimum ABI to get ERC20 Token balance
    let minABI = `[
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "name": "",
              "type": "uint8"
            }
          ],
          "payable": false,
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "_owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "name": "balance",
              "type": "uint256"
            }
          ],
          "payable": false,
          "type": "function"
        }
      ]`;

    let contract = new ethers.Contract(tokenAddress, minABI, provider);
    return contract;
};
