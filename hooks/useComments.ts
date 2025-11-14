import useSWR from "swr";
import type { Comment } from "@loscolmebrothers/forever-message-types";

async function fetchComments(bottleId: number): Promise<Comment[]> {
  const response = await fetch(`/api/bottles/${bottleId}/comments`);

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  const data = await response.json();
  const comments = data.comments || [];

  return comments.map((comment: any) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  }));
}

export function useComments(bottleId: number) {
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    bottleId ? `comments-${bottleId}` : null,
    () => fetchComments(bottleId),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    comments: data ?? [],
    isLoading,
    error,
    isEmpty: !isLoading && !error && (data?.length ?? 0) === 0,
    mutate,
  };
}
