import { useState, useEffect, useCallback } from "react";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { useBottleQueue } from "./useBottleQueue";

const PROGRESSIVE_LOADING = {
  BATCH_SIZE: 20,
  BATCH_DELAY: 1500,
} as const;

interface FetchBottlesResponse {
  bottles: any[];
  total: number;
  hasMore: boolean;
}

async function fetchBottlesBatch(
  limit: number,
  offset: number,
): Promise<FetchBottlesResponse> {
  const response = await fetch(`/api/bottles?limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bottles: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    bottles: (data.bottles || []).map((bottle: any) => ({
      ...bottle,
      createdAt: new Date(bottle.createdAt),
      expiresAt: new Date(bottle.expiresAt),
    })),
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

export function useBottles(userId: string = "danicolms") {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Get pending bottles from queue
  const { queueItems, pendingCount } = useBottleQueue(userId);

  const fetchBatch = useCallback(async (offset: number) => {
    try {
      const {
        bottles: newBottles,
        total: totalCount,
        hasMore: moreAvailable,
      } = await fetchBottlesBatch(PROGRESSIVE_LOADING.BATCH_SIZE, offset);

      setBottles((prev) => [...prev, ...newBottles]);
      setTotal(totalCount);
      setHasMore(moreAvailable);

      return { newBottles, hasMore: moreAvailable };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadInitialBatch = async () => {
      try {
        setIsLoading(true);
        await fetchBatch(0);
      } catch (err) {
        if (mounted) {
          console.error("[useBottles] Error loading initial batch:", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialBatch();

    return () => {
      mounted = false;
    };
  }, [fetchBatch]);

  useEffect(() => {
    if (isLoading || !hasMore || isFetchingMore) return;

    const timer = setTimeout(async () => {
      setIsFetchingMore(true);
      try {
        const currentOffset = bottles.length;
        await fetchBatch(currentOffset);
      } catch (err) {
        console.error("[useBottles] Error fetching more bottles:", err);
      } finally {
        setIsFetchingMore(false);
      }
    }, PROGRESSIVE_LOADING.BATCH_DELAY);

    return () => clearTimeout(timer);
  }, [bottles.length, isLoading, hasMore, isFetchingMore, fetchBatch]);

  const mutate = useCallback(async () => {
    // Refresh data in background without clearing existing bottles
    // This prevents the loading screen flash and keeps the ocean visible
    setError(null);

    try {
      const {
        bottles: refreshedBottles,
        total: totalCount,
        hasMore: moreAvailable,
      } = await fetchBottlesBatch(PROGRESSIVE_LOADING.BATCH_SIZE, 0);

      // Replace bottles with fresh data from server
      setBottles(refreshedBottles);
      setTotal(totalCount);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error("[useBottles] Error refreshing bottles:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, []);

  // Create pending bottles from queue items
  const pendingBottles: Bottle[] = queueItems.map((item) => ({
    id: -1, // Temporary ID (negative to distinguish from real bottles)
    creator: userId,
    ipfsHash: item.ipfs_cid || "",
    userId: item.user_id,
    createdAt: new Date(item.created_at),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isForever: false,
    blockchainStatus: "pending" as any, // Custom status for pending bottles
    queueId: item.id, // Include queue ID for tracking
    queueStatus: item.status,
    queueProgress: item.progress,
    queueError: item.error,
  }));

  // Combine pending bottles with confirmed bottles
  const allBottles = [...pendingBottles, ...bottles];

  return {
    bottles: allBottles,
    confirmedBottles: bottles, // Also expose confirmed-only bottles
    pendingBottles,
    pendingCount,
    isLoading,
    error,
    isEmpty: !isLoading && !error && allBottles.length === 0,
    mutate,
    loadingProgress: {
      loaded: bottles.length,
      total,
      isFullyLoaded: !hasMore,
      isFetchingMore,
    },
  };
}
