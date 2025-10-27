import type {
  ContractBottle,
  IPFSBottle,
  Bottle,
} from "@loscolmebrothers/forever-message-types";
import {
  fetchBottleContent,
  fetchMultipleBottleContents,
} from "@/lib/ipfs/fetch-content";

export async function combineBottleData(
  contractBottle: ContractBottle,
): Promise<Bottle | null> {
  try {
    const ipfsData = await fetchBottleContent(contractBottle.ipfsHash);

    if (!ipfsData) {
      console.error(
        `Failed to fetch IPFS data for bottle ${contractBottle.id}`,
      );
      return null;
    }

    return {
      id: contractBottle.id,
      creator: contractBottle.creator,
      ipfsHash: contractBottle.ipfsHash,
      createdAt: contractBottle.createdAt,
      expiresAt: contractBottle.expiresAt,
      isForever: contractBottle.isForever,
      exists: contractBottle.exists,
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

export async function combineAllBottles(
  contractBottles: ContractBottle[],
): Promise<Bottle[]> {
  if (contractBottles.length === 0) {
    return [];
  }

  const cids = contractBottles.map((bottle) => bottle.ipfsHash);
  const ipfsDataArray = await fetchMultipleBottleContents(cids);
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
      id: contractBottle.id,
      creator: contractBottle.creator,
      ipfsHash: contractBottle.ipfsHash,
      createdAt: contractBottle.createdAt,
      expiresAt: contractBottle.expiresAt,
      isForever: contractBottle.isForever,
      exists: contractBottle.exists,
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
