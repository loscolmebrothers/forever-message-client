import { getContract } from "./provider";
import type { ContractComment } from "@loscolmebrothers/forever-message-types";

export async function getComment(
  id: number,
): Promise<ContractComment | null> {
  try {
    const contract = getContract();
    const rawComment = await contract.comments(id);

    if (!rawComment.exists) {
      return null;
    }

    return {
      id: Number(rawComment.id),
      bottleId: Number(rawComment.bottleId),
      commenter: rawComment.commenter,
      ipfsHash: rawComment.ipfsHash,
      createdAt: new Date(Number(rawComment.createdAt) * 1000),
      exists: rawComment.exists,
    };
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    return null;
  }
}

export async function getCommentsForBottle(
  bottleId: number,
): Promise<ContractComment[]> {
  try {
    const contract = getContract();

    const commentIds = await contract.getBottleComments(bottleId);

    const comments: ContractComment[] = [];

    for (const commentId of commentIds) {
      const comment = await getComment(Number(commentId));
      if (comment) {
        comments.push(comment);
      }
    }

    return comments;
  } catch (error) {
    console.error(`Error fetching comments for bottle ${bottleId}:`, error);
    return [];
  }
}
