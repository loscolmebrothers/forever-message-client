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

    const config: FilebaseConfig = {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID,
      secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY,
      bucketName: process.env.IPFS_BUCKET_NAME,
      gatewayUrl: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
    };

    // DIAGNOSTIC: Deep Filebase S3 analysis from Lambda environment
    try {
      const {
        S3Client,
        PutObjectCommand,
        GetObjectCommand,
        ListObjectsV2Command,
      } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const diagS3 = new S3Client({
        endpoint: "https://s3.filebase.io",
        region: "us-east-1",
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: true,
      });

      // Test 1: GET (read) via presigned URL
      const getUrl = await getSignedUrl(
        diagS3,
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: `diag-read-${Date.now()}`,
        }),
        { expiresIn: 60 }
      );
      console.log(
        `[Process ${queueId}] DIAG-GET: Trying read via presigned URL...`
      );
      const getRes = await fetch(getUrl);
      console.log(`[Process ${queueId}] DIAG-GET: HTTP ${getRes.status}`);
      console.log(
        `[Process ${queueId}] DIAG-GET: Headers:`,
        JSON.stringify(Object.fromEntries(getRes.headers.entries()))
      );

      // Test 2: PUT (write) via presigned URL
      const putUrl = await getSignedUrl(
        diagS3,
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: `diag-write-${Date.now()}`,
          ContentType: "application/json",
        }),
        { expiresIn: 60 }
      );
      console.log(
        `[Process ${queueId}] DIAG-PUT: Trying write via presigned URL...`
      );
      const putRes = await fetch(putUrl, {
        method: "PUT",
        body: JSON.stringify({ test: true }),
        headers: { "Content-Type": "application/json" },
      });
      console.log(`[Process ${queueId}] DIAG-PUT: HTTP ${putRes.status}`);
      console.log(
        `[Process ${queueId}] DIAG-PUT: Headers:`,
        JSON.stringify(Object.fromEntries(putRes.headers.entries()))
      );
      const putBody = await putRes.text();
      console.log(
        `[Process ${queueId}] DIAG-PUT: Body: ${putBody.substring(0, 500)}`
      );

      // Test 3: List objects via presigned URL
      const listUrl = await getSignedUrl(
        diagS3,
        new ListObjectsV2Command({
          Bucket: config.bucketName,
          MaxKeys: 1,
        }),
        { expiresIn: 60 }
      );
      console.log(
        `[Process ${queueId}] DIAG-LIST: Trying list via presigned URL...`
      );
      const listRes = await fetch(listUrl);
      console.log(`[Process ${queueId}] DIAG-LIST: HTTP ${listRes.status}`);
      console.log(
        `[Process ${queueId}] DIAG-LIST: Headers:`,
        JSON.stringify(Object.fromEntries(listRes.headers.entries()))
      );
      const listBody = await listRes.text();
      console.log(
        `[Process ${queueId}] DIAG-LIST: Body: ${listBody.substring(0, 500)}`
      );

      // Test 4: Check our external IP from Lambda
      console.log(
        `[Process ${queueId}] DIAG-IP: Checking Lambda external IP...`
      );
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      console.log(
        `[Process ${queueId}] DIAG-IP: Lambda external IP: ${ipData.ip}`
      );
    } catch (diagError: any) {
      console.error(`[Process ${queueId}] DIAG: Error:`, diagError.message);
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

    // Insert into bottles table
    console.log(`[Process ${queueId}] Syncing to bottles table...`);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error: insertError } = await supabaseAdmin.from("bottles").upsert(
      {
        id: bottleId,
        creator: creatorAddress,
        ipfs_hash: uploadResult.cid,
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
      cid: uploadResult.cid,
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
