import { NextResponse } from "next/server";
import { getActiveBottles } from "@/lib/blockchain/read-bottles";
import { combineAllBottles } from "@/lib/data/combine-bottle";

export async function GET() {
  try {
    console.log("[API] Fetching bottles from blockchain...");

    const contractBottles = await getActiveBottles();
    console.log(
      `[API] Found ${contractBottles.length} active bottles on chain`,
    );

    if (contractBottles.length === 0) {
      return NextResponse.json({ bottles: [] });
    }

    console.log("[API] Fetching IPFS content...");
    const bottles = await combineAllBottles(contractBottles);
    console.log(
      `[API] Successfully combined ${bottles.length} bottles with IPFS data`,
    );

    return NextResponse.json({
      bottles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error fetching bottles:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bottles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Configure route to run on server only (not edge)
 * This is needed for ethers.js compatibility
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Don't cache, always fetch fresh
