import useSWR from "swr";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

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

const createAuthenticatedFetcher = async (url: string): Promise<LikeInfo> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${session.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch like info: ${response.statusText}`);
  }
  return response.json();
};

export function useLikes(bottleId: number) {
  const [isToggling, setIsToggling] = useState(false);
  const { address, isAuthenticated } = useAuth();

  const { data, error, mutate, isLoading } = useSWR<LikeInfo>(
    isAuthenticated ? `/api/bottles/${bottleId}/like` : null,
    createAuthenticatedFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const toggleLike = async () => {
    if (isToggling || !isAuthenticated) return;

    setIsToggling(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const currentLikeCount = data?.likeCount || 0;
      const currentHasLiked = data?.hasLiked || false;

      await mutate(
        {
          bottleId,
          likeCount: currentHasLiked
            ? currentLikeCount - 1
            : currentLikeCount + 1,
          hasLiked: !currentHasLiked,
          userId: address || "",
        },
        false,
      );

      const response = await fetch(`/api/bottles/${bottleId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({}),
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
