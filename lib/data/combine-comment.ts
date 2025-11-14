import type {
  ContractComment,
  Comment,
} from "@loscolmebrothers/forever-message-types";
import {
  fetchCommentContent,
  fetchMultipleCommentContents,
} from "@/lib/ipfs/fetch-content";
import { getCommentsForBottle } from "@/lib/blockchain/read-comments";

export async function combineCommentData(
  contractComment: ContractComment
): Promise<Comment | null> {
  try {
    const ipfsData = await fetchCommentContent(contractComment.ipfsHash);

    if (!ipfsData) {
      console.error(
        `Failed to fetch IPFS data for comment ${contractComment.id}`
      );
      return null;
    }

    return {
      id: contractComment.id,
      bottleId: contractComment.bottleId,
      commenter: contractComment.commenter,
      ipfsHash: contractComment.ipfsHash,
      createdAt: contractComment.createdAt,
      exists: contractComment.exists,
      message: ipfsData.message,
      userId: ipfsData.userId,
      type: ipfsData.type,
      timestamp: ipfsData.timestamp,
    };
  } catch (error) {
    console.error(
      `Error combining comment data for comment ${contractComment.id}:`,
      error
    );
    return null;
  }
}

export async function combineCommentsForBottle(
  bottleId: number
): Promise<Comment[]> {
  try {
    const contractComments = await getCommentsForBottle(bottleId);

    if (contractComments.length === 0) {
      return [];
    }

    const cids = contractComments.map((comment) => comment.ipfsHash);
    const ipfsDataArray = await fetchMultipleCommentContents(cids);
    const comments: Comment[] = [];

    for (let i = 0; i < contractComments.length; i++) {
      const contractComment = contractComments[i];
      const ipfsData = ipfsDataArray[i];

      if (!ipfsData) {
        console.error(
          `Failed to fetch IPFS data for comment ${contractComment.id}`
        );
        continue;
      }

      comments.push({
        id: contractComment.id,
        bottleId: contractComment.bottleId,
        commenter: contractComment.commenter,
        ipfsHash: contractComment.ipfsHash,
        createdAt: contractComment.createdAt,
        exists: contractComment.exists,
        message: ipfsData.message,
        userId: ipfsData.userId,
        type: ipfsData.type,
        timestamp: ipfsData.timestamp,
      });
    }

    return comments.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  } catch (error) {
    console.error(`Error combining comments for bottle ${bottleId}:`, error);
    return [];
  }
}
