import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/bottles/daily-limit
 * Returns current daily bottle creation limit status for authenticated user
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const userId = user.wallet_address;
    const now = new Date();

    // Fetch user's limit record
    const { data: limitRecord, error: fetchError } = await supabaseAdmin
      .from("bottle_daily_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    // No record = user has never created a bottle
    if (fetchError?.code === "PGRST116" || !limitRecord) {
      return NextResponse.json({
        bottlesCreated: 0,
        bottlesRemaining: 3,
        resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        isLimitReached: false,
      });
    }

    if (fetchError) {
      console.error("[API] Error fetching limit:", fetchError);
      throw new Error("Failed to fetch daily limit");
    }

    const lastReset = new Date(limitRecord.last_reset_at);
    const hoursSinceReset =
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    // If >24 hours, return fresh state (don't reset DB yet - only on creation)
    if (hoursSinceReset >= 24) {
      return NextResponse.json({
        bottlesCreated: 0,
        bottlesRemaining: 3,
        resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        isLimitReached: false,
      });
    }

    // Within 24h window - return current state
    const resetAt = new Date(
      lastReset.getTime() + 24 * 60 * 60 * 1000
    ).toISOString();
    const bottlesCreated = limitRecord.bottles_created;
    const bottlesRemaining = Math.max(0, 3 - bottlesCreated);
    const isLimitReached = bottlesCreated >= 3;

    return NextResponse.json({
      bottlesCreated,
      bottlesRemaining,
      resetAt,
      isLimitReached,
    });
  } catch (error) {
    console.error("[API] Error in daily-limit endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch daily limit",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
