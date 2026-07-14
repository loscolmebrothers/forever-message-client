import { NextRequest, NextResponse } from "next/server";
import { BottleContract } from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { supabaseAdmin } from "@/lib/supabase/server";

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(request: NextRequest) {
  let queueId: string | undefined;

  try {
    const body = await request.json();
    const { queueId: parsedQueueId, message, userId } = body;
    queueId = parsedQueueId;

    if (!queueId || !message || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`[Process] Starting bottle creation for queue ${queueId}`);

    // Update status to uploading
    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: "uploading",
        started_at: new Date().toISOString(),
        progress: 10,
      })
      .eq("id", queueId);

    // Upload bottle content to Supabase Storage
    console.log(`[Process ${queueId}] Uploading to Supabase Storage...`);

    const bottleContent = {
      message,
      type: "bottle" as const,
      userId,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const storagePath = `bottles/${queueId}.json`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("forever-message-bottles")
      .upload(storagePath, JSON.stringify(bottleContent), {
        contentType: "application/json",
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload to Supabase Storage: ${uploadError.message}`
      );
    }

    console.log(
      `[Process ${queueId}] Storage upload successful: ${storagePath}`
    );

    // Update status to minting
    await supabaseAdmin
      .from("bottles_queue")
      .update({ status: "minting", ipfs_cid: storagePath, progress: 40 })
      .eq("id", queueId);

    // Create bottle on blockchain
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error("Missing blockchain configuration");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new BottleContract({
      contractAddress,
      contractABI: FOREVER_MESSAGE_ABI,
      signer: wallet,
    });

    const creatorAddress = userId;

    console.log(
      `[Process ${queueId}] Creating bottle on blockchain for creator:`,
      creatorAddress
    );
    const { bottleId, transactionHash } = await contract.createBottle(
      storagePath,
      creatorAddress
    );
    console.log(`[Process ${queueId}] Bottle created with ID:`, bottleId);
    console.log(`[Process ${queueId}] Transaction hash:`, transactionHash);

    // Update status to confirming
    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: "confirming",
        blockchain_id: bottleId,
        transaction_hash: transactionHash,
        progress: 80,
      })
      .eq("id", queueId);

    // Wait for confirmation
    console.log(`[Process ${queueId}] Waiting for confirmation...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Insert into bottles table
    console.log(`[Process ${queueId}] Syncing to bottles table...`);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error: insertError } = await supabaseAdmin.from("bottles").upsert(
      {
        id: bottleId,
        creator: creatorAddress,
        ipfs_hash: storagePath,
        message: message,
        user_id: creatorAddress,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_forever: false,
        blockchain_status: "confirmed",
      },
      {
        onConflict: "id",
      }
    );

    if (insertError) {
      console.error(
        `[Process ${queueId}] Error inserting into bottles:`,
        insertError
      );
      throw insertError;
    }

    // Mark as completed
    await supabaseAdmin
      .from("bottles_queue")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        progress: 100,
      })
      .eq("id", queueId);

    console.log(`[Process ${queueId}] ✅ Processing complete`);

    return NextResponse.json({
      success: true,
      bottleId,
      cid: storagePath,
    });
  } catch (error: any) {
    console.error("[Process] Error:", error);

    if (queueId) {
      try {
        await supabaseAdmin
          .from("bottles_queue")
          .update({
            status: "failed",
            error: error.message,
          })
          .eq("id", queueId);
      } catch (updateError) {
        console.error("[Process] Failed to update error status:", updateError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
