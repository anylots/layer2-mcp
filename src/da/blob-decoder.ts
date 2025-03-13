// import { decompress } from '@mongodb-js/zstd';  

const MAX_BLOB_TX_PAYLOAD_SIZE = 4096 * 31; // Maximum payload size calculated  
const MAGIC_NUM = 0x28B52FFD; // Assumed MAGIC_NUM value from Rust code  

async function getOriginBatch(blobData: Uint8Array): Promise<Uint8Array> {
    // Create a new batch_data array initialized with zeros  
    const batchData = new Uint8Array(MAX_BLOB_TX_PAYLOAD_SIZE);

    // Check and transform data  
    for (let i = 0; i < 4096; i++) {
        // Check if the high-order byte of each field element is 0  
        if (blobData[i * 32] !== 0) {
            throw new Error(
                `Invalid blob, found non-zero high order byte ${blobData[i * 32].toString(16)} of field element ${i}`
            );
        }

        // Copy data, skipping the first byte of each 32-byte block  
        batchData.set(
            blobData.slice(i * 32 + 1, i * 32 + 32),
            i * 31
        );
    }

    return decompressBatch(batchData);
}

async function decompressBatch(compressedBatch: Uint8Array): Promise<Uint8Array> {
    // Check if it's an empty batch  
    if (compressedBatch.every(byte => byte === 0)) {
        return new Uint8Array();
    }

    // Create content with magic number  
    const magicNumBuffer = Buffer.alloc(4);
    magicNumBuffer.writeUInt32LE(MAGIC_NUM);

    // Combine magic number and compressed data  
    const content = Buffer.concat([
        magicNumBuffer,
        Buffer.from(compressedBatch)
    ]);



    // const result = await decompress(content);  
    const result = content; // This should be replaced with actual decompression  

    console.log('decompressed_batch:', result.length);

    return new Uint8Array(result);
}

import { Transaction } from 'ethers'

function decodeTransactions(bs: Uint8Array): Transaction[] {
    const txsDecoded: Transaction[] = []

    let offset = 0
    while (offset < bs.length) {
        const firstByte = bs[offset]
        if (firstByte === 0) {
            // zero byte is found after valid tx bytes, break the loop  
            console.log('zero byte')
            break
        }

        let txLenSize: number
        if (firstByte > 0xf7) {
            txLenSize = firstByte - 0xf7
        } else {
            if (firstByte !== 0x01 && firstByte !== 0x02) {
                console.log('not supported tx type')
                break
            }
            txLenSize = bs[offset + 1] - 0xf7
        }

        // Create a 4-byte array to store the transaction length  
        const txLenBytes = new Uint8Array(4)
        if (firstByte > 0xf7) {
            txLenBytes.set(
                bs.slice(offset + 1, offset + txLenSize + 1),
                4 - txLenSize
            )
        } else {
            txLenBytes.set(
                bs.slice(offset + 2, offset + txLenSize + 2),
                4 - txLenSize
            )
        }

        // Convert byte array to number  
        const view = new DataView(txLenBytes.buffer)
        const rlpTxLen = firstByte > 0xf7
            ? 1 + txLenSize + view.getUint32(0, false) // false 表示大端序  
            : 2 + txLenSize + view.getUint32(0, false)

        // Extract transaction bytes  
        const txBytes = bs.slice(offset, offset + rlpTxLen)

        try {
            // Decoding transactions using ethers  
            const txDecoded = Transaction.from(Buffer.from(txBytes).toString('hex'))
            txsDecoded.push(txDecoded)
        } catch (e) {
            console.log('decode_transaction error:', e)
        }

        offset += rlpTxLen
    }

    return txsDecoded
}

// Export functions  
export { getOriginBatch, decompressBatch, decodeTransactions };

// Usage example  
async function example() {
    try {
        // Sample blob data  
        const blobData = new Uint8Array(4096 * 32);

        // Process data  
        const result = await getOriginBatch(blobData);
        console.log('Successfully processed blob data:', result.length);
    } catch (error) {
        console.error('Error processing blob:', error);
    }
}  