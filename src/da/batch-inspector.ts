// Find the batch where the layer2 transaction is located

import { ethers } from 'ethers';
import { config } from "dotenv";

config(); // Load environment variables

const L2_RPC = process.env.ETH_L2_RPC || 'http://localhost:8545';
const provider = new ethers.JsonRpcProvider(L2_RPC);

const batchInspector = async (txHash: string) => {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
        throw new Error('Transaction not found');
    }
}


