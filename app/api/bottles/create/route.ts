import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { withAuth } from "@/lib/auth/middleware";

/**
 * Check and update daily rate limit for user
 * Returns: { allowed: boolean, resetAt: string, bottlesRemaining: number }
 */
async function checkDailyLimit(userId: string): Promise<{
  allowed: boolean;
  resetAt: string;
  bottlesRemaining: number;
}> {
  const now = new Date();

  // Get current limit record
  const { data: limitRecord, error: fetchError } = await supabaseAdmin
    .from("bottle_daily_limits")
    .select("*")
    .eq("user_id", userId)
    .single();

  // If no record exists, create one and allow
  if (fetchError?.code === "PGRST116" || !limitRecord) {
    const { error: insertError } = await supabaseAdmin
      .from("bottle_daily_limits")
      .insert({
        user_id: userId,
        bottles_created: 1,
        last_reset_at: now.toISOString(),
      });

    if (insertError) {
      console.error("[API] Error creating limit record:", insertError);
      throw new Error("Failed to check rate limit");
    }

    const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    return { allowed: true, resetAt, bottlesRemaining: 2 };
  }

  if (fetchError) {
    console.error("[API] Error fetching limit record:", fetchError);
    throw new Error("Failed to check rate limit");
  }

  const lastReset = new Date(limitRecord.last_reset_at);
  const hoursSinceReset =
    (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  // If >24 hours since last reset, reset counter
  if (hoursSinceReset >= 24) {
    const { error: resetError } = await supabaseAdmin
      .from("bottle_daily_limits")
      .update({
        bottles_created: 1,
        last_reset_at: now.toISOString(),
      })
      .eq("user_id", userId);

    if (resetError) {
      console.error("[API] Error resetting limit:", resetError);
      throw new Error("Failed to update rate limit");
    }

    const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    return { allowed: true, resetAt, bottlesRemaining: 2 };
  }

  // Within 24h window - check if limit reached
  if (limitRecord.bottles_created >= 3) {
    const resetAt = new Date(
      lastReset.getTime() + 24 * 60 * 60 * 1000
    ).toISOString();
    return { allowed: false, resetAt, bottlesRemaining: 0 };
  }

  // Increment counter
  const newCount = limitRecord.bottles_created + 1;
  const { error: updateError } = await supabaseAdmin
    .from("bottle_daily_limits")
    .update({ bottles_created: newCount })
    .eq("user_id", userId);

  if (updateError) {
    console.error("[API] Error updating limit:", updateError);
    throw new Error("Failed to update rate limit");
  }

  const resetAt = new Date(
    lastReset.getTime() + 24 * 60 * 60 * 1000
  ).toISOString();
  const bottlesRemaining = 3 - newCount;

  return { allowed: true, resetAt, bottlesRemaining };
}

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { message } = body;
    const userId = user.wallet_address;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Check daily rate limit
    const limitCheck = await checkDailyLimit(userId);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message:
            "You've reached your daily limit of 3 bottles. Create more tomorrow!",
          resetAt: limitCheck.resetAt,
          bottlesRemaining: 0,
        },
        { status: 429 } // 429 Too Many Requests
      );
    }

    const { data: queueItem, error: queueError } = await supabaseAdmin
      .from("bottles_queue")
      .insert({
        message,
        user_id: userId,
        status: "queued",
        progress: 0,
      })
      .select()
      .single();

    if (queueError || !queueItem) {
      throw new Error(`Failed to queue bottle: ${queueError?.message}`);
    }

    console.log("[API] Bottle queued with ID:", queueItem.id);
    console.log("[API] Triggering background processing...");

    const processUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bottles/process`;

    fetch(processUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queueId: queueItem.id,
        message,
        userId,
      }),
    }).catch((error) => {
      console.error("[API] Failed to trigger processing:", error);
    });

    return NextResponse.json({
      success: true,
      queueId: queueItem.id,
      status: "queued",
      message:
        "Bottle creation started. You'll see it appear in the ocean shortly.",
    });
  } catch (error) {
    console.error("[API] Error queueing bottle:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to queue bottle",
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
