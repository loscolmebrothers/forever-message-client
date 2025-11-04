import { NextRequest, NextResponse } from "next/server";
import {
  createIPFSService,
  BottleContract,
} from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { combineCommentsForBottle } from "@/lib/data/combine-comment";
import { supabaseAdmin } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const bottleId = parseInt(params.id, 10);

    if (isNaN(bottleId) || bottleId < 1) {
      return NextResponse.json({ error: "Invalid bottle ID" }, { status: 400 });
    }

    // Check if bottle exists in Supabase
    const { data: bottle, error: bottleError } = await supabaseAdmin
      .from("bottles")
      .select("id")
      .eq("id", bottleId)
      .eq("blockchain_status", "confirmed")
      .single();

    if (bottleError || !bottle) {
      return NextResponse.json({ error: "Bottle not found" }, { status: 404 });
    }

    console.log(`[API] Fetching comments for bottle ${bottleId}...`);
    const comments = await combineCommentsForBottle(bottleId);
    console.log(`[API] Found ${comments.length} comments`);

    return NextResponse.json({
      comments,
      count: comments.length,
      bottleId,
    });
  } catch (error) {
    console.error("[API] Error fetching comments:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const bottleId = parseInt(params.id, 10);

    if (isNaN(bottleId) || bottleId < 1) {
      return NextResponse.json({ error: "Invalid bottle ID" }, { status: 400 });
    }

    // Check if bottle exists and get its expiration info
    const { data: bottle, error: bottleError } = await supabaseAdmin
      .from("bottles")
      .select("id, is_forever, expires_at")
      .eq("id", bottleId)
      .eq("blockchain_status", "confirmed")
      .single();

    if (bottleError || !bottle) {
      return NextResponse.json({ error: "Bottle not found" }, { status: 404 });
    }

    const expiresAt = new Date(bottle.expires_at);
    if (!bottle.is_forever && expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Cannot comment on expired bottle" },
        { status: 400 },
      );
    }

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

    console.log(`[API] Adding comment to bottle ${bottleId} by ${userId}`);
    console.log("[API] Message length:", message.length);

    console.log("[API] Uploading comment to IPFS...");

    if (!process.env.STORACHA_PRINCIPAL_KEY) {
      throw new Error(
        "Missing Storacha credentials. Set STORACHA_PRINCIPAL_KEY environment variable."
      );
    }

    const proofPath = path.join(process.cwd(), "storacha-forever-message-proof.txt");
    const proof = fs.readFileSync(proofPath, "utf-8").trim();

    const ipfs = await createIPFSService({
      principalKey: process.env.STORACHA_PRINCIPAL_KEY,
      proof,
      gatewayUrl:
        process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs",
    });

    const uploadResult = await ipfs.uploadComment(message, bottleId, userId);
    console.log("[API] IPFS upload successful:", uploadResult.cid);

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

    console.log("[API] Adding comment to blockchain...");
    const commentId = await contract.addComment(
      bottleId,
      uploadResult.cid,
      userAddress,
    );
    console.log("[API] Comment created with ID:", commentId);

    return NextResponse.json({
      success: true,
      commentId,
      bottleId,
      cid: uploadResult.cid,
      url: uploadResult.url,
      message: "Comment added successfully.",
    });
  } catch (error) {
    console.error("[API] Error adding comment:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to add comment",
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
