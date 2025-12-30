import { useState, useEffect, useCallback } from "react";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { useBottleQueue, BottleWithQueue } from "./useBottleQueue";
import { useAccount } from "wagmi";

const PROGRESSIVE_LOADING = {
  BATCH_SIZE: 100, // Batch size for loading more
  INITIAL_LOAD: 300, // Load first 300 bottles initially
  MAX_LOADED: 800, // Maximum bottles to keep in memory (prevents lag)
} as const;

interface FetchBottlesResponse {
  bottles: any[];
  total: number;
  hasMore: boolean;
}

async function fetchBottlesBatch(
  limit: number,
  offset: number
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

export function useBottles() {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadedRange, setLoadedRange] = useState({ start: 0, end: 0 }); // Track what we've loaded
  const { address } = useAccount();
  const lowercaseAddress = address ? address.toLowerCase() : "";
  const { queueItems, pendingCount } = useBottleQueue(lowercaseAddress);

  const fetchBatch = useCallback(
    async (offset: number) => {
      try {
        const {
          bottles: newBottles,
          total: totalCount,
          hasMore: moreAvailable,
        } = await fetchBottlesBatch(PROGRESSIVE_LOADING.BATCH_SIZE, offset);

        setBottles((prev) => {
          const combined = [...prev, ...newBottles];

          // Implement sliding window: keep only the most recent MAX_LOADED bottles
          if (combined.length > PROGRESSIVE_LOADING.MAX_LOADED) {
            const excess = combined.length - PROGRESSIVE_LOADING.MAX_LOADED;
            return combined.slice(excess); // Remove oldest bottles
          }

          return combined;
        });

        setTotal(totalCount);
        setHasMore(moreAvailable);
        setLoadedRange((prev) => ({
          start: prev.start,
          end: offset + newBottles.length,
        }));

        return { newBottles, hasMore: moreAvailable };
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const loadInitialBatch = async () => {
      try {
        setIsLoading(true);
        // Load initial batch (300 bottles)
        const {
          bottles: newBottles,
          total: totalCount,
          hasMore: moreAvailable,
        } = await fetchBottlesBatch(PROGRESSIVE_LOADING.INITIAL_LOAD, 0);

        if (mounted) {
          setBottles(newBottles);
          setTotal(totalCount);
          setHasMore(moreAvailable);
          setLoadedRange({ start: 0, end: newBottles.length });
        }
      } catch (err) {
        if (mounted) {
          console.error("[useBottles] Error loading initial batch:", err);
          setError(err instanceof Error ? err : new Error("Unknown error"));
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
  }, []);

  // Manual load more function (call this instead of automatic loading)
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const currentOffset = bottles.length;
      await fetchBatch(currentOffset);
    } catch (err) {
      console.error("[useBottles] Error fetching more bottles:", err);
    } finally {
      setIsFetchingMore(false);
    }
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

  const pendingBottles: BottleWithQueue[] = queueItems.map((item) => ({
    id: -1, // Temporary ID (negative to distinguish from real bottles)
    creator: item.user_id, // Wallet address from queue
    ipfsHash: item.ipfs_cid || "",
    userId: item.user_id, // Same as creator (wallet address)
    createdAt: new Date(item.created_at),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isForever: false,
    blockchainStatus: "pending",
    queueId: item.id,
    queueStatus: item.status,
    queueProgress: item.progress,
    queueError: item.error,
    message: item.message || "",
    type: "bottle",
    likeCount: 0,
    timestamp: 0,
    exists: true,
  }));

  // Combine pending bottles with confirmed bottles
  const allBottles = [...pendingBottles, ...bottles];

  return {
    bottles: allBottles,
    confirmedBottles: bottles,
    pendingBottles,
    pendingCount,
    isLoading,
    error,
    isEmpty: !isLoading && !error && allBottles.length === 0,
    mutate,
    loadMore, // Manual load more function
    loadingProgress: {
      loaded: bottles.length,
      total,
      isFullyLoaded: !hasMore,
      isFetchingMore,
    },
  };
}
