import { useMemo } from 'react';
import type { Bottle } from '@loscolmebrothers/forever-message-types';
import { mockBottles } from '@/lib/mock-data';

/**
 * Hook to fetch bottles data
 *
 * Phase 1: Returns mock data
 * Phase 2: Will fetch from blockchain + IPFS via API routes
 *
 * @returns Array of bottles to display
 */
export function useBottles(): Bottle[] {
  // Phase 1: Simple mock data return
  // Future: useSWR or React Query for real data fetching
  const bottles = useMemo(() => mockBottles, []);

  return bottles;
}
