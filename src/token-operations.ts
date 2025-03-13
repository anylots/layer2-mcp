import { ethers } from 'ethers';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from "dotenv";

config(); // Load environment variables

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const L2_RPC = process.env.ETH_L2_RPC || 'http://localhost:8545';

// Helper function to get project root directory
function getProjectRoot() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let currentDir = __dirname;
    while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
        currentDir = path.dirname(currentDir);
        if (currentDir === path.dirname(currentDir)) { // Reached root directory
            throw new Error('Could not find project root directory');
        }
    }
    return currentDir;
}

const TokenArtifact = getTokenArtifact();

function getTokenArtifact() {
    try {
        const projectRoot = getProjectRoot();
        const tokenPath = path.join(projectRoot, 'artifacts/Token.sol/Token.json');
        return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    } catch (error) {
        console.error('Failed to read token artifact:', error);
        throw new Error('Token artifact not found. Make sure the Token contract is compiled.');
    }
}

// Method 1: Deploy ERC20 token
export async function deployERC20(): Promise<{ address: string; hash: string }> {
    const provider = new ethers.JsonRpcProvider(L2_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const factory = new ethers.ContractFactory(
        TokenArtifact.abi,
        TokenArtifact.bytecode,
        wallet
    );

    const token = await factory.deploy(ethers.parseUnits('1000000000000', 6));

    const receipt = await token.deploymentTransaction()?.wait();

    return {
        address: await token.getAddress(),
        hash: receipt?.hash || ''
    };
}

// Method 2: Transfer tokens to a specific address
export async function transferTokens(
    tokenAddress: string,
    targetAddress: string
): Promise<string> {
    const provider = new ethers.JsonRpcProvider(L2_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const amount = ethers.parseUnits('1', 6); // 10^6 units

    const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, wallet);
    const tx = await token.transfer(targetAddress, amount);
    const receipt = await tx.wait();

    return receipt?.hash || '';
}

// Method 3: Batch transfer tokens to random addresses
export async function batchRandomTransfer(
    tokenAddress: string,
    transactionCount: number,
    totalDurationSeconds: number
): Promise<void> {
    const provider = new ethers.JsonRpcProvider(L2_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, wallet);
    const amount = ethers.parseUnits('1', 6); // 10^6 units

    // Get initial nonce
    let nonce = await provider.getTransactionCount(wallet.address);
    const endTime = Date.now() + (totalDurationSeconds * 1000);
    const pendingTxs: Promise<any>[] = [];

    for (let i = 0; i < transactionCount && Date.now() < endTime; i++) {
        // Generate random address
        const randomWallet = ethers.Wallet.createRandom();
        const randomAddress = randomWallet.address;

        // Create transaction with specific nonce
        const tx = await token.transfer(randomAddress, amount, {
            nonce: nonce++
        });
        console.log(`Transaction ${i + 1} sent. Hash: ${tx.hash}`);

        // Add to pending transactions without waiting
        pendingTxs.push(tx);

        // Optional: Add small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Optionally wait for all transactions at the end
    // await Promise.all(pendingTxs);
    console.log(`Submitted ${pendingTxs.length} transactions`);
}

// Method 4: Transfer ETH to a specific address
export async function transferETH(
    targetAddress: string,
    amountInEther: number
): Promise<string> {
    const provider = new ethers.JsonRpcProvider(L2_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Convert amount to wei (1 ETH = 10^18 wei)
    const amountInWei = ethers.parseEther(amountInEther.toString());

    // Send transaction
    const tx = await wallet.sendTransaction({
        to: targetAddress,
        value: amountInWei
    });

    const receipt = await tx.wait();
    return receipt?.hash || '';
} 