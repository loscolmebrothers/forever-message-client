import { NextRequest, NextResponse } from "next/server";
import {
  createIPFSService,
  BottleContract,
} from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { supabaseAdmin } from "@/lib/supabase/server";

async function processBottleCreation(
  queueId: string,
  message: string,
  userId: string,
) {
  try {
    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: "uploading",
        started_at: new Date().toISOString(),
        progress: 10,
      })
      .eq("id", queueId);

    console.log(`[Queue ${queueId}] Uploading to IPFS...`);

    if (!process.env.STORACHA_PRINCIPAL_KEY || !process.env.STORACHA_PROOF) {
      throw new Error(
        "Missing Storacha credentials. Set STORACHA_PRINCIPAL_KEY and STORACHA_PROOF environment variables."
      );
    }

    const ipfs = await createIPFSService({
      principalKey: process.env.STORACHA_PRINCIPAL_KEY,
      proof: process.env.STORACHA_PROOF,
      gatewayUrl:
        process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs",
    });

    const uploadResult = await ipfs.uploadBottle(message, userId);
    console.log(`[Queue ${queueId}] IPFS upload successful:`, uploadResult.cid);

    await supabaseAdmin
      .from("bottles_queue")
      .update({ status: "minting", ipfs_cid: uploadResult.cid, progress: 40 })
      .eq("id", queueId);

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new BottleContract({
      contractAddress,
      contractABI: FOREVER_MESSAGE_ABI,
      signer: wallet,
    });

    const userAddress = "0xFC3F3646f5e6AA13991E74250224D82301b618a7";

    console.log(`[Queue ${queueId}] Creating bottle on blockchain...`);
    const bottleId = await contract.createBottle(uploadResult.cid, userAddress);
    console.log(`[Queue ${queueId}] Bottle created with ID:`, bottleId);

    // Update status: confirming
    await supabaseAdmin
      .from("bottles_queue")
      .update({ status: "confirming", blockchain_id: bottleId, progress: 80 })
      .eq("id", queueId);

    console.log(`[Queue ${queueId}] Syncing bottle to Supabase...`);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: insertError } = await supabaseAdmin.from("bottles").insert({
      id: bottleId,
      creator: userAddress,
      ipfs_hash: uploadResult.cid,
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_forever: false,
      blockchain_status: "confirmed",
    });

    if (insertError) {
      console.error(
        `[Queue ${queueId}] Error syncing to Supabase:`,
        insertError,
      );
      throw insertError;
    }

    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        progress: 100,
      })
      .eq("id", queueId);

    console.log(`[Queue ${queueId}] Bottle creation completed successfully`);
  } catch (error) {
    console.error(`[Queue ${queueId}] Error processing bottle:`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const { data: queueItem } = await supabaseAdmin
      .from("bottles_queue")
      .select("attempts, max_attempts")
      .eq("id", queueId)
      .single();

    const currentAttempts = (queueItem?.attempts || 0) + 1;
    const maxAttempts = queueItem?.max_attempts || 3;

    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: currentAttempts >= maxAttempts ? "failed" : "queued",
        error: errorMessage,
        attempts: currentAttempts,
      })
      .eq("id", queueId);

    // If we can retry, schedule another attempt
    if (currentAttempts < maxAttempts) {
      console.log(
        `[Queue ${queueId}] Retrying (attempt ${currentAttempts}/${maxAttempts})...`,
      );
      // Re-trigger processing after a delay
      setTimeout(() => processBottleCreation(queueId, message, userId), 5000);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = "danicolms" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    console.log("[API] Queueing bottle for user:", userId);
    console.log("[API] Message length:", message.length);

    // Insert into queue and return immediately
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

    processBottleCreation(queueItem.id, message, userId).catch((error) => {
      console.error("[API] Background processing failed:", error);
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
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
