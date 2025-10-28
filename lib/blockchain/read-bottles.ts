import { getContract } from "./provider";
import type { ContractBottle } from "@loscolmebrothers/forever-message-types";

export async function getBottle(id: number): Promise<ContractBottle | null> {
  try {
    const contract = getContract();
    const rawBottle = await contract.getBottle(id);

    if (!rawBottle.exists) {
      return null;
    }

    return {
      id: Number(rawBottle.id),
      creator: rawBottle.creator,
      ipfsHash: rawBottle.ipfsHash,
      createdAt: new Date(Number(rawBottle.createdAt) * 1000),
      expiresAt: new Date(Number(rawBottle.expiresAt) * 1000),
      isForever: rawBottle.isForever,
      exists: rawBottle.exists,
    };
  } catch (error) {
    console.error(`Error fetching bottle ${id}:`, error);
    return null;
  }
}

export async function getAllBottles(): Promise<ContractBottle[]> {
  try {
    const contract = getContract();

    const nextBottleId = await contract.nextBottleId();
    const totalBottles = Number(nextBottleId) - 1;

    const bottles: ContractBottle[] = [];

    for (let currentId = 1; currentId <= totalBottles; currentId++) {
      const bottle = await getBottle(currentId);

      if (bottle) {
        bottles.push(bottle);
      }
    }

    return bottles;
  } catch (error) {
    console.error("Error fetching all bottles:", error);
    return [];
  }
}

export function isBottleExpired(bottle: ContractBottle): boolean {
  if (bottle.isForever) return false;
  return bottle.expiresAt.getTime() < Date.now();
}

export async function getActiveBottles(): Promise<ContractBottle[]> {
  const allBottles = await getAllBottles();
  return allBottles.filter((bottle) => !isBottleExpired(bottle));
}
