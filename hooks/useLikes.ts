import useSWR from "swr";
import { useState } from "react";

interface LikeInfo {
  bottleId: number;
  likeCount: number;
  hasLiked: boolean;
  userId: string;
}

interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
  bottleId: number;
  userId: string;
}

const fetcher = async (url: string): Promise<LikeInfo> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch like info: ${response.statusText}`);
  }
  return response.json();
};

export function useLikes(bottleId: number, userId: string = "danicolms") {
  const [isToggling, setIsToggling] = useState(false);

  const { data, error, mutate, isLoading } = useSWR<LikeInfo>(
    `/api/bottles/${bottleId}/like?userId=${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const toggleLike = async () => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      const currentLikeCount = data?.likeCount || 0;
      const currentHasLiked = data?.hasLiked || false;

      await mutate(
        {
          bottleId,
          likeCount: currentHasLiked
            ? currentLikeCount - 1
            : currentLikeCount + 1,
          hasLiked: !currentHasLiked,
          userId,
        },
        false,
      );

      const response = await fetch(`/api/bottles/${bottleId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.statusText}`);
      }

      const result: LikeResponse = await response.json();

      await mutate({
        bottleId: result.bottleId,
        likeCount: result.likeCount,
        hasLiked: result.liked,
        userId: result.userId,
      });

      return result;
    } catch (error) {
      console.error("Error toggling like:", error);
      await mutate();
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  return {
    likeCount: data?.likeCount || 0,
    hasLiked: data?.hasLiked || false,
    isLoading,
    isToggling,
    error,
    toggleLike,
    mutate,
  };
}
