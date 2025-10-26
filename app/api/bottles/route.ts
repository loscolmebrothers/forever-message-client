import { NextResponse } from 'next/server';
import { getActiveBottles } from '@/lib/blockchain/read-bottles';
import { combineAllBottles } from '@/lib/data/combine-bottle';

/**
 * GET /api/bottles
 * Fetch all active bottles from blockchain + IPFS
 *
 * This is a server-side API route that:
 * 1. Connects to Base L2 via Alchemy (using secret API key)
 * 2. Fetches all non-expired bottles from the smart contract
 * 3. Fetches message content from IPFS for each bottle
 * 4. Combines and returns the full bottle data
 */
export async function GET() {
  try {
    console.log('[API] Fetching bottles from blockchain...');

    // Step 1: Fetch contract data (only active bottles)
    const contractBottles = await getActiveBottles();
    console.log(`[API] Found ${contractBottles.length} active bottles on chain`);

    if (contractBottles.length === 0) {
      return NextResponse.json({ bottles: [] });
    }

    // Step 2: Fetch IPFS data and combine
    console.log('[API] Fetching IPFS content...');
    const bottles = await combineAllBottles(contractBottles);
    console.log(`[API] Successfully combined ${bottles.length} bottles with IPFS data`);

    // Return the bottles
    return NextResponse.json({
      bottles,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API] Error fetching bottles:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch bottles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Configure route to run on server only (not edge)
 * This is needed for ethers.js compatibility
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Don't cache, always fetch fresh
