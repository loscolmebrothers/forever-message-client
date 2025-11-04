import { NextRequest, NextResponse } from "next/server";
import {
  createIPFSService,
  BottleContract,
} from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { supabaseAdmin } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueId, message, userId } = body;

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

    // Upload to IPFS
    console.log(`[Process ${queueId}] Uploading to IPFS...`);

    if (!process.env.STORACHA_PRINCIPAL_KEY) {
      throw new Error("Missing Storacha credentials");
    }

    const proofPath = path.join(process.cwd(), "storacha-forever-message-proof.txt");
    const proof = fs.readFileSync(proofPath, "utf-8").trim();

    const ipfs = await createIPFSService({
      principalKey: process.env.STORACHA_PRINCIPAL_KEY,
      proof,
      gatewayUrl:
        process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs",
    });

    const uploadResult = await ipfs.uploadBottle(message, userId);
    console.log(`[Process ${queueId}] IPFS upload successful:`, uploadResult.cid);

    // Update status to minting
    await supabaseAdmin
      .from("bottles_queue")
      .update({ status: "minting", ipfs_cid: uploadResult.cid, progress: 40 })
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

    const userAddress = "0xFC3F3646f5e6AA13991E74250224D82301b618a7";

    console.log(`[Process ${queueId}] Creating bottle on blockchain...`);
    const bottleId = await contract.createBottle(uploadResult.cid, userAddress);
    console.log(`[Process ${queueId}] Bottle created with ID:`, bottleId);

    // Update status to confirming
    await supabaseAdmin
      .from("bottles_queue")
      .update({ status: "confirming", blockchain_id: bottleId, progress: 80 })
      .eq("id", queueId);

    // Wait for confirmation
    console.log(`[Process ${queueId}] Waiting for confirmation...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

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
      cid: uploadResult.cid,
    });
  } catch (error: any) {
    console.error("[Process] Error:", error);

    // Try to update queue status
    try {
      const body = await request.json();
      await supabaseAdmin
        .from("bottles_queue")
        .update({
          status: "failed",
          error: error.message,
        })
        .eq("id", body.queueId);
    } catch (updateError) {
      console.error("[Process] Failed to update error status:", updateError);
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
