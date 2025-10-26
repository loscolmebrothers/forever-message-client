import { getContract } from "./provider";
import type { ContractBottle } from "@loscolmebrothers/forever-message-types";

/**
 * Read bottle data from the blockchain
 * SERVER-SIDE ONLY
 */

/**
 * Get a single bottle by ID from the contract
 */
export async function getBottle(id: number): Promise<ContractBottle | null> {
  try {
    const contract = getContract();
    const rawBottle = await contract.getBottle(id);

    // Check if bottle exists
    if (!rawBottle.exists) {
      return null;
    }

    // Convert from contract format to our type
    return {
      id: Number(rawBottle.id),
      creator: rawBottle.creator,
      ipfsHash: rawBottle.ipfsHash,
      createdAt: new Date(Number(rawBottle.createdAt) * 1000), // Convert from Unix timestamp
      expiresAt: new Date(Number(rawBottle.expiresAt) * 1000),
      isForever: rawBottle.isForever,
      exists: rawBottle.exists,
    };
  } catch (error) {
    console.error(`Error fetching bottle ${id}:`, error);
    return null;
  }
}

/**
 * Get all bottles from the contract
 * Note: This fetches bottles by ID, starting from 1
 */
export async function getAllBottles(): Promise<ContractBottle[]> {
  try {
    const contract = getContract();

    // Get total bottle count
    // Note: The contract doesn't have a nextBottleId public variable,
    // so we'll need to estimate or use events
    // For now, let's try to fetch bottles sequentially until we hit a non-existent one
    const bottles: ContractBottle[] = [];
    let currentId = 1;
    let consecutiveNulls = 0;
    const maxConsecutiveNulls = 5; // Stop after 5 consecutive non-existent bottles

    while (consecutiveNulls < maxConsecutiveNulls) {
      const bottle = await getBottle(currentId);

      if (bottle) {
        bottles.push(bottle);
        consecutiveNulls = 0;
      } else {
        consecutiveNulls++;
      }

      currentId++;

      // Safety limit: max 1000 bottles
      if (currentId > 1000) break;
    }

    return bottles;
  } catch (error) {
    console.error('Error fetching all bottles:', error);
    return [];
  }
}

/**
 * Check if a bottle has expired
 */
export function isBottleExpired(bottle: ContractBottle): boolean {
  if (bottle.isForever) return false;
  return bottle.expiresAt.getTime() < Date.now();
}

/**
 * Get only active (non-expired) bottles
 */
export async function getActiveBottles(): Promise<ContractBottle[]> {
  const allBottles = await getAllBottles();
  return allBottles.filter((bottle) => !isBottleExpired(bottle));
}
