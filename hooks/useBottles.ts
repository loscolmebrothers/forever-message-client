import useSWR from "swr";
import type { Bottle } from "@loscolmebrothers/forever-message-types";

/**
 * Fetcher function for SWR
 */
async function fetchBottles(): Promise<Bottle[]> {
  const response = await fetch("/api/bottles");

  if (!response.ok) {
    throw new Error(`Failed to fetch bottles: ${response.statusText}`);
  }

  const data = await response.json();
  const bottles = data.bottles || [];

  return bottles.map((bottle: any) => ({
    ...bottle,
    createdAt: new Date(bottle.createdAt),
    expiresAt: new Date(bottle.expiresAt),
  }));
}

/**
 * Hook to fetch bottles data
 *
 * Phase 2: Fetches real data from blockchain + IPFS via API route
 * Uses SWR for caching and automatic revalidation
 *
 * @returns Object with bottles array, loading state, and error
 */
export function useBottles() {
  const { data, error, isLoading, mutate } = useSWR<Bottle[]>(
    "bottles", // Cache key
    fetchBottles,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: true, // Refetch when reconnecting
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    },
  );

  return {
    bottles: data ?? [],
    isLoading,
    error,
    isEmpty: !isLoading && !error && (data?.length ?? 0) === 0,
    mutate,
  };
}
