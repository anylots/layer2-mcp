import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { config } from "dotenv";

import { deployERC20, transferTokens, batchRandomTransfer, transferETH } from "./token-operations.js";

config(); // Load environment variables

const server = new Server(
    {
        name: "token-operations-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Tool definitions
const tools = [
    {
        name: "deployToken",
        description: "Deploy a new ERC20 token contract",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "transferETH",
        description: "Transfer ETH to a specific address",
        inputSchema: {
            type: "object",
            properties: {
                targetAddress: {
                    type: "string",
                    description: "The address to receive the ETH",
                },
                amount: {
                    type: "number",
                    description: "Amount of ETH to transfer (1 = 1 ETH)",
                },
            },
            required: ["targetAddress", "amount"],
        },
    },
    {
        name: "transferToken",
        description: "Transfer tokens to a specific address",
        inputSchema: {
            type: "object",
            properties: {
                tokenAddress: {
                    type: "string",
                    description: "The address of the deployed erc20 token contract",
                },
                targetAddress: {
                    type: "string",
                    description: "The address to receive the tokens",
                },
            },
            required: ["tokenAddress", "targetAddress"],
        },
    },
    {
        name: "batchTransfer",
        description: "Perform batch transfers to random addresses",
        inputSchema: {
            type: "object",
            properties: {
                tokenAddress: {
                    type: "string",
                    description: "The address of the deployed erc20 token contract",
                },
                transactionCount: {
                    type: "number",
                    description: "Number of transactions to perform",
                },
                durationSeconds: {
                    type: "number",
                    description: "Total duration in seconds for the batch operation",
                },
            },
            required: ["tokenAddress", "transactionCount", "durationSeconds"],
        },
    },
];

// Define tool handlers
const toolHandlers = {
    deployToken: async () => {
        try {
            const result = await deployERC20();
            return {
                content: [{
                    type: "text",
                    text: `Token deployed successfully!\nContract Address: ${result.address}\nTransaction Hash: ${result.hash}`
                }]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Token deployment failed: ${error instanceof Error ? error.message : String(error)}` }]
            };
        }
    },

    transferETH: async (args: unknown) => {
        const schema = z.object({
            targetAddress: z.string(),
            amount: z.number(),
        });
        const { targetAddress, amount } = schema.parse(args);

        try {
            const txHash = await transferETH(targetAddress, amount);
            return {
                content: [{
                    type: "text",
                    text: `ETH transfer successful!\nTransaction Hash: ${txHash}`
                }]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `ETH transfer failed: ${error instanceof Error ? error.message : String(error)}` }]
            };
        }
    },

    transferToken: async (args: unknown) => {
        const schema = z.object({
            tokenAddress: z.string(),
            targetAddress: z.string(),
        });
        const { tokenAddress, targetAddress } = schema.parse(args);

        try {
            const txHash = await transferTokens(tokenAddress, targetAddress);
            return {
                content: [{
                    type: "text",
                    text: `Token transfer successful!\nTransaction Hash: ${txHash}`
                }]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Token transfer failed: ${error instanceof Error ? error.message : String(error)}` }]
            };
        }
    },

    batchTransfer: async (args: unknown) => {
        const schema = z.object({
            tokenAddress: z.string(),
            transactionCount: z.number(),
            durationSeconds: z.number(),
        });
        const { tokenAddress, transactionCount, durationSeconds } = schema.parse(args);

        try {
            await batchRandomTransfer(tokenAddress, transactionCount, durationSeconds);
            return {
                content: [{
                    type: "text",
                    text: `Batch transfer initiated!\nProcessing ${transactionCount} transactions over ${durationSeconds} seconds.`
                }]
            };
        } catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: `Batch transfer failed: ${error instanceof Error ? error.message : String(error)}` }]
            };
        }
    },
};

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        const handler = toolHandlers[name as keyof typeof toolHandlers];
        if (!handler) {
            throw new Error(`Tool not found: ${name}`);
        }
        return await handler(args);
    } catch (error: any) {
        return {
            isError: true,
            content: [{ type: "text", text: `Error processing the request: ${error.message}` }]
        };
    }
});

export async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.info("Token operations server running on stdio");
    console.log("ETH_L2_RPC: " + process.env.ETH_L2_RPC);
}

// Start the server
startServer().catch(console.error);
