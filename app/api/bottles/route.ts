import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    console.log(
      `[API] Fetching bottles from Supabase (limit: ${limit}, offset: ${offset})...`
    );

    const { count: totalCount, error: countError } = await supabaseAdmin
      .from("bottles")
      .select("*", { count: "exact", head: true })
      .eq("blockchain_status", "confirmed");

    if (countError) {
      console.error("[API] Error getting total count:", countError);
      throw countError;
    }

    const total = totalCount || 0;

    const { data: bottlesData, error: bottlesError } = await supabaseAdmin
      .from("bottles")
      .select("*")
      .eq("blockchain_status", "confirmed")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (bottlesError) {
      console.error("[API] Error fetching bottles:", bottlesError);
      throw bottlesError;
    }

    const bottleIds = (bottlesData || []).map((b) => b.id);

    const { data: likesData, error: likesError } = await supabaseAdmin
      .from("likes")
      .select("bottle_id")
      .in("bottle_id", bottleIds);

    const likeCounts = (likesData || []).reduce(
      (acc, like) => {
        acc[like.bottle_id] = (acc[like.bottle_id] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const { data: commentsData, error: commentsError } = await supabaseAdmin
      .from("comments")
      .select("bottle_id")
      .in("bottle_id", bottleIds);

    const commentCounts = (commentsData || []).reduce(
      (acc, comment) => {
        acc[comment.bottle_id] = (acc[comment.bottle_id] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const bottles = (bottlesData || []).map((bottle) => ({
      id: bottle.id,
      creator: bottle.creator,
      ipfsHash: bottle.ipfs_hash,
      userId: bottle.user_id || "unknown",
      createdAt: new Date(bottle.created_at),
      expiresAt: new Date(bottle.expires_at),
      isForever: bottle.is_forever,
      likeCount: likeCounts[bottle.id] || 0,
      commentCount: commentCounts[bottle.id] || 0,
    }));

    const hasMore = offset + limit < total;

    console.log(
      `[API] Returning ${bottles.length} bottles (total: ${total}, hasMore: ${hasMore})`
    );

    return NextResponse.json({
      bottles,
      total,
      hasMore,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error fetching bottles:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bottles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Configure route to run on server only (not edge)
 * This is needed for ethers.js compatibility
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Don't cache, always fetch fresh
