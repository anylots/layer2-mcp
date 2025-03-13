# Layer2 MCP Server ![MCP Implementation](https://img.shields.io/badge/MCP-Implementation-blue)

A model context protocol server for interacting with the Ethereum layer 2 network for development and use, which provides a standardized interface for AI models to interact with blockchain networks, deploy tokens, and manage transactions.

## Overview

The MCP Layer2 server implements the [Model Context Protocol](https://modelcontextprotocol.io) specification, providing AI models with tools to:

1. Basic
- Deploy new ERC20 token contracts
- Transfer ETH to specific addresses
- Transfer ERC20 tokens to specific addresses
- Perform batch transfers to random addresses for testing and simulation
2. Advance
- L1 Settlement & Data Availability Verification
- Support cross-chain

This implementation enables AI assistants to directly interact with blockchain networks through a standardized protocol, making it easier to integrate blockchain capabilities into AI workflows.

## Example Usage

Here's an example of how an AI assistant might use these tools:

1. Deploy a new ERC20 token contract:
   ```
   👤You: Deploy a new ERC20 token

   🤖AI: I'll deploy a new ERC20 token contract for you.
   [Tool call: deployToken]
   Result: Token deployed successfully!
           Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
           Transaction Hash: 0xd4ec9bf7ca67a581e78a8637974cd84c9c3524a75efe8851b808f0d58879ebd9
   ```
2. Transfer tokens to an address:
   ```
   👤You: Transfer 100 erc20 tokens to the address 0x6ea5e8971eC8cf32d43AeB18a6999aFc3a3ec65d

   🤖AI: I need to deploy an ERC20 token contract before I can transfer 100 ERC20 tokens to a specified address.
   [Tool call: deployToken]
   Result: Token deployed successfully!
           Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
           Transaction Hash: 0xd4ec9bf7ca67a581e78a8637974cd84c9c3524a75efe8851b808f0d58879ebd9

   🤖AI: Now I will use the ERC20 token contract I just deployed to transfer 100 tokens to the address 0x6ea5e8971eC8cf32d43AeB18a6999aFc3a3ec65d.

   [Tool call: transferToken with tokenAddress=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 
               targetAddress=0x6ea5e8971eC8cf32d43AeB18a6999aFc3a3ec65d]
               
   🤖AI: ERC20 token transfer has been successfully completed!
   Details:
   Token contract address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   Receiving address: 0x6ea5e8971eC8cf32d43AeB18a6999aFc3a3ec65d
   Transfer transaction hash: 0x82b7bdc69ffebfc946ab5101cf853a06e64d5aceaf96ca4fe70622fcee89d83e
   The token has been successfully transferred to the specified address. Do you need to perform other operations?
   ```

3. Transfer ETH to an address:
   ```
   🤖AI: I'll transfer 10 ETH to the specified address.
   [Tool call: transferETH with targetAddress=0x6ea5e8971eC8cf32d43AeB18a6999aFc3a3ec65d, amount=10]
   Result: ETH transfer successful!
           Transaction Hash: 0x9f46076f1c9b84d49c7314d8b8586e20c5c5b389ec56931e510408b3f6052bac
   ```



4. Perform batch transfers:
   ```
   🤖AI: I'll execute 100 token transfers over 10 seconds.
   [Tool call: batchTransfer with tokenAddress=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, 
               transactionCount=100, durationSeconds=10]
   Result: Batch transfer initiated!
           Processing 100 transactions over 10 seconds.
   ```




## Installation

```bash
# Clone the repository
git clone https://github.com/anylots/layer2-mcp.git
cd layer2-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## How to use

### Configuration

Create a `.env` file in the root directory with the following variables:

```
PRIVATE_KEY=your_ethereum_private_key
ETH_L2_RPC=your_layer2_rpc_url
```

### Using with Cursor
Add a command type mcp server in the cursor mcp setting panel and fill in the execution command, for example: ```node \\wsl.localhost\Ubuntu-22.04\root\xxxx\xxxx\layer2-dev\build\index.js```

### Using with Claude Desktop

1. Install Claude Desktop
2. Add a new MCP server with the following configuration:
   ```json
    "layer2-mcp": {
      "command": "node",
      "args": [
        "/path-to-layer2-mcp/build/src/index.js"
      ],
      "env": {
        "PRIVATE_KEY": "<<your eth-wallet private key>>",
        "ETH_L2_RPC": "<<The layer2 chain rpc you want to interact with>>"
      }
    }
   ```
3. The tools will now be available in your Claude conversations





### Testing with MCP Inspector

1. Install the MCP Inspector:
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. In another terminal, run the inspector:
   ```bash
   mcp-inspector
   ```

4. Open http://localhost:5173 in your browser to interact with the tools

## Available Tools

### Token Operations
- `deployToken`: Deploy a new ERC20 token contract
  - Returns the contract address and transaction hash

- `transferETH`: Transfer ETH to a specific address
  - Parameters:
    - `targetAddress`: The address to receive the ETH
    - `amount`: Amount of ETH to transfer (1 = 1 ETH)
  - Returns the transaction hash

- `transferToken`: Transfer tokens to a specific address
  - Parameters:
    - `tokenAddress`: The address of the deployed ERC20 token contract
    - `targetAddress`: The address to receive the tokens
  - Returns the transaction hash

- `batchTransfer`: Perform batch transfers to random addresses
  - Parameters:
    - `tokenAddress`: The address of the deployed ERC20 token contract
    - `transactionCount`: Number of transactions to perform
    - `durationSeconds`: Total duration in seconds for the batch operation
  - Executes the specified number of transactions over the given time period


## Network Support

The server is configured to work with any Ethereum-compatible network, including:
- Ethereum Mainnet
- Layer 2 networks (Optimism, Arbitrum, etc.)
- Local development networks (Hardhat, Ganache)

Configure the network by setting the `ETH_L2_RPC` environment variable to the appropriate RPC URL.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start the server
npm start
```

## Contributing

Issues and pull requests are welcome on GitHub.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details. 