import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { withAuth } from "@/lib/auth/middleware";

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

    console.log("[API] Queueing bottle for user:", userId);
    console.log("[API] Message length:", message.length);

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
