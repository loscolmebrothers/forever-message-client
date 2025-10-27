import { NextRequest, NextResponse } from "next/server";
import {
  createIPFSService,
  BottleContract,
} from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";

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

    console.log("[API] Creating bottle for user:", userId);
    console.log("[API] Message length:", message.length);

    console.log("[API] Uploading to IPFS...");
    const ipfs = await createIPFSService({
      gatewayUrl:
        process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs",
    });

    const uploadResult = await ipfs.uploadBottle(message, userId);
    console.log("[API] IPFS upload successful:", uploadResult.cid);

    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

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

    console.log("[API] Creating bottle on blockchain...");
    const bottleId = await contract.createBottle(uploadResult.cid, userAddress);
    console.log("[API] Bottle created with ID:", bottleId);

    return NextResponse.json({
      success: true,
      bottleId,
      cid: uploadResult.cid,
      url: uploadResult.url,
      message:
        "Bottle created successfully. Refetch bottles to see it in the ocean.",
    });
  } catch (error) {
    console.error("[API] Error creating bottle:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to create bottle",
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
