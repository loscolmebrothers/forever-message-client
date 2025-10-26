import type {
  ContractBottle,
  IPFSBottle,
  Bottle,
} from "@loscolmebrothers/forever-message-types";
import {
  fetchBottleContent,
  fetchMultipleBottleContents,
} from "@/lib/ipfs/fetch-content";

/**
 * Combine contract data + IPFS data into a complete Bottle
 */
export async function combineBottleData(
  contractBottle: ContractBottle,
): Promise<Bottle | null> {
  try {
    // Fetch IPFS content
    const ipfsData = await fetchBottleContent(contractBottle.ipfsHash);

    if (!ipfsData) {
      console.error(
        `Failed to fetch IPFS data for bottle ${contractBottle.id}`,
      );
      return null;
    }

    // Merge contract + IPFS data
    return {
      // Contract data
      id: contractBottle.id,
      creator: contractBottle.creator,
      ipfsHash: contractBottle.ipfsHash,
      createdAt: contractBottle.createdAt,
      expiresAt: contractBottle.expiresAt,
      isForever: contractBottle.isForever,
      exists: contractBottle.exists,

      // IPFS data
      message: ipfsData.message,
      userId: ipfsData.userId,
      type: ipfsData.type,
      timestamp: ipfsData.timestamp,
      likeCount: ipfsData.likeCount || 0,
      commentCount: ipfsData.commentCount || 0,
    };
  } catch (error) {
    console.error(
      `Error combining bottle data for bottle ${contractBottle.id}:`,
      error,
    );
    return null;
  }
}

/**
 * Combine multiple bottles (in parallel)
 * Fetches all IPFS content in one batch for better performance
 */
export async function combineAllBottles(
  contractBottles: ContractBottle[],
): Promise<Bottle[]> {
  if (contractBottles.length === 0) {
    return [];
  }

  // Extract all CIDs
  const cids = contractBottles.map((bottle) => bottle.ipfsHash);

  // Fetch all IPFS content in parallel
  const ipfsDataArray = await fetchMultipleBottleContents(cids);

  // Combine contract + IPFS data
  const bottles: Bottle[] = [];
  for (let i = 0; i < contractBottles.length; i++) {
    const contractBottle = contractBottles[i];
    const ipfsData = ipfsDataArray[i];

    if (!ipfsData) {
      console.error(
        `Failed to fetch IPFS data for bottle ${contractBottle.id}`,
      );
      continue;
    }

    bottles.push({
      // Contract data
      id: contractBottle.id,
      creator: contractBottle.creator,
      ipfsHash: contractBottle.ipfsHash,
      createdAt: contractBottle.createdAt,
      expiresAt: contractBottle.expiresAt,
      isForever: contractBottle.isForever,
      exists: contractBottle.exists,

      // IPFS data
      message: ipfsData.message,
      userId: ipfsData.userId,
      type: ipfsData.type,
      timestamp: ipfsData.timestamp,
      likeCount: ipfsData.likeCount || 0,
      commentCount: ipfsData.commentCount || 0,
    });
  }

  return bottles;
}
