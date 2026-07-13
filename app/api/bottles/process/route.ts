import { NextRequest, NextResponse } from "next/server";
import {
  getIPFSService,
  BottleContract,
  FilebaseConfig,
} from "@loscolmebrothers/forever-message-ipfs";
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

    // Upload to IPFS via Filebase
    console.log(`[Process ${queueId}] Uploading to IPFS...`);

    if (
      !process.env.FILEBASE_ACCESS_KEY_ID ||
      !process.env.FILEBASE_SECRET_ACCESS_KEY ||
      !process.env.IPFS_BUCKET_NAME
    ) {
      throw new Error(
        "Missing Filebase credentials. Set FILEBASE_ACCESS_KEY_ID, FILEBASE_SECRET_ACCESS_KEY, and IPFS_BUCKET_NAME env vars."
      );
    }

    // DIAGNOSTIC: Log config (masked) to verify env vars
    console.log(`[Process ${queueId}] === DIAGNOSTIC ===`);
    console.log(
      `[Process ${queueId}] Access Key: ${process.env.FILEBASE_ACCESS_KEY_ID?.substring(0, 6)}...${process.env.FILEBASE_ACCESS_KEY_ID?.slice(-4)}`
    );
    console.log(
      `[Process ${queueId}] Secret Key: ${process.env.FILEBASE_SECRET_ACCESS_KEY ? "***" + process.env.FILEBASE_SECRET_ACCESS_KEY.slice(-4) : "MISSING"}`
    );
    console.log(`[Process ${queueId}] Bucket: ${process.env.IPFS_BUCKET_NAME}`);
    console.log(
      `[Process ${queueId}] Gateway: ${process.env.NEXT_PUBLIC_IPFS_GATEWAY}`
    );

    const config: FilebaseConfig = {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID,
      secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY,
      bucketName: process.env.IPFS_BUCKET_NAME,
      gatewayUrl: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
    };

    // DIAGNOSTIC: Try raw S3 upload first to isolate the issue
    try {
      const { S3Client, PutObjectCommand, ListBucketsCommand } = await import(
        "@aws-sdk/client-s3"
      );
      const diagS3 = new S3Client({
        endpoint: "https://s3.filebase.io",
        region: "us-east-1",
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: true,
        requestChecksumCalculation: "WHEN_REQUIRED" as const,
        responseChecksumValidation: "WHEN_REQUIRED" as const,
      });

      // Test 1: List buckets
      console.log(`[Process ${queueId}] DIAG: Listing buckets...`);
      const listRes = await diagS3.send(new ListBucketsCommand({}));
      const bucketNames = listRes.Buckets?.map((b) => b.Name) || [];
      console.log(
        `[Process ${queueId}] DIAG: Buckets found: ${JSON.stringify(bucketNames)}`
      );

      // Test 2: Direct upload
      const diagKey = `diag-${Date.now()}`;
      console.log(
        `[Process ${queueId}] DIAG: Uploading test object "${diagKey}" to bucket "${config.bucketName}"...`
      );
      const putRes = await diagS3.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: diagKey,
          Body: JSON.stringify({ test: true }),
          ContentType: "application/json",
        })
      );
      console.log(
        `[Process ${queueId}] DIAG: Direct upload SUCCESS (HTTP ${putRes.$metadata.httpStatusCode})`
      );
    } catch (diagError: any) {
      console.error(
        `[Process ${queueId}] DIAG: Direct upload FAILED:`,
        diagError.Code || diagError.name,
        "-",
        diagError.message
      );
      console.error(
        `[Process ${queueId}] DIAG: HTTP ${diagError.$metadata?.httpStatusCode}`
      );
      console.error(
        `[Process ${queueId}] DIAG: Full error:`,
        JSON.stringify(diagError, null, 2)
      );
    }

    const ipfs = await getIPFSService(config);

    const uploadResult = await ipfs.uploadBottle(message, userId);
    console.log(
      `[Process ${queueId}] IPFS upload successful:`,
      uploadResult.cid
    );

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

    // Use the authenticated user's wallet address as the creator
    // (deployer wallet pays gas, but user's address is the creator)
    const creatorAddress = userId;

    console.log(
      `[Process ${queueId}] Creating bottle on blockchain for creator:`,
      creatorAddress
    );
    const { bottleId, transactionHash } = await contract.createBottle(
      uploadResult.cid,
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

    // Insert into bottles table (use upsert to handle retries/duplicates)
    console.log(`[Process ${queueId}] Syncing to bottles table...`);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: insertError } = await supabaseAdmin.from("bottles").upsert(
      {
        id: bottleId,
        creator: creatorAddress, // Authenticated user's wallet address
        ipfs_hash: uploadResult.cid,
        message: message,
        user_id: creatorAddress, // Same as creator (wallet address)
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_forever: false,
        blockchain_status: "confirmed",
      },
      {
        onConflict: "id", // On duplicate ID, update instead of error
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
      cid: uploadResult.cid,
    });
  } catch (error: any) {
    console.error("[Process] Error:", error);

    // Try to update queue status if we have queueId
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
