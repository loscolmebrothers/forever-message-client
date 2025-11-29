import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BottleContract } from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { withAuth } from "@/lib/auth/middleware";

export const POST = withAuth(
  async (request: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const bottleId = parseInt(context.params.id, 10);

      if (isNaN(bottleId) || bottleId < 0) {
        return NextResponse.json(
          { error: "Invalid bottle ID" },
          { status: 400 }
        );
      }

      const userId = user.wallet_address;

      const { data: existingLike, error: checkError } = await supabaseAdmin
        .from("likes")
        .select("id")
        .eq("bottle_id", bottleId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        console.error("[API] Error checking existing like:", checkError);
        return NextResponse.json(
          { error: "Failed to check like status", details: checkError.message },
          { status: 500 }
        );
      }

      if (existingLike) {
        // Unlike: Delete the existing like
        const { error: deleteError } = await supabaseAdmin
          .from("likes")
          .delete()
          .eq("bottle_id", bottleId)
          .eq("user_id", userId);

        if (deleteError) {
          console.error("[API] Error removing like:", deleteError);
          return NextResponse.json(
            { error: "Failed to remove like", details: deleteError.message },
            { status: 500 }
          );
        }

        try {
          const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
          const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

          if (rpcUrl && privateKey && contractAddress) {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new BottleContract({
              contractAddress,
              contractABI: FOREVER_MESSAGE_ABI,
              signer: wallet,
            });

            await contract.unlikeBottle(bottleId, userId);
            console.log(
              `[API] Blockchain event emitted: BottleUnliked(${bottleId}, ${userId})`
            );
          }
        } catch (blockchainError) {
          console.error(
            "[API] Failed to emit blockchain event:",
            blockchainError
          );
        }

        const { count, error: countError } = await supabaseAdmin
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("bottle_id", bottleId);

        if (countError) {
          console.error("[API] Error getting like count:", countError);
        }

        console.log(`[API] User ${userId} unliked bottle ${bottleId}`);

        return NextResponse.json({
          success: true,
          liked: false,
          likeCount: count || 0,
          bottleId,
          userId,
        });
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("likes")
          .insert({
            bottle_id: bottleId,
            user_id: userId,
          });

        if (insertError) {
          console.error("[API] Error adding like:", insertError);
          return NextResponse.json(
            { error: "Failed to add like", details: insertError.message },
            { status: 500 }
          );
        }

        try {
          const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
          const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

          if (rpcUrl && privateKey && contractAddress) {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new BottleContract({
              contractAddress,
              contractABI: FOREVER_MESSAGE_ABI,
              signer: wallet,
            });

            await contract.likeBottle(bottleId, userId);
            console.log(
              `[API] Blockchain event emitted: BottleLiked(${bottleId}, ${userId})`
            );
          }
        } catch (blockchainError) {
          console.error(
            "[API] Failed to emit blockchain event:",
            blockchainError
          );
        }

        const { count, error: countError } = await supabaseAdmin
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("bottle_id", bottleId);

        if (countError) {
          console.error("[API] Error getting like count:", countError);
        }

        console.log(`[API] User ${userId} liked bottle ${bottleId}`);

        return NextResponse.json({
          success: true,
          liked: true,
          likeCount: count || 0,
          bottleId,
          userId,
        });
      }
    } catch (error) {
      console.error("[API] Error toggling like:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return NextResponse.json(
        {
          error: "Failed to toggle like",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);

export const GET = withAuth(
  async (request: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const bottleId = parseInt(context.params.id, 10);

      if (isNaN(bottleId) || bottleId < 0) {
        return NextResponse.json(
          { error: "Invalid bottle ID" },
          { status: 400 }
        );
      }

      const userId = user.wallet_address;

      // Get like count
      const { count, error: countError } = await supabaseAdmin
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("bottle_id", bottleId);

      if (countError) {
        console.error("[API] Error getting like count:", countError);
        return NextResponse.json(
          { error: "Failed to get like count", details: countError.message },
          { status: 500 }
        );
      }

      const { data: userLike, error: userLikeError } = await supabaseAdmin
        .from("likes")
        .select("id")
        .eq("bottle_id", bottleId)
        .eq("user_id", userId)
        .maybeSingle();

      if (userLikeError) {
        console.error("[API] Error checking user like:", userLikeError);
        return NextResponse.json(
          {
            error: "Failed to check user like",
            details: userLikeError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        bottleId,
        likeCount: count || 0,
        hasLiked: !!userLike,
        userId,
      });
    } catch (error) {
      console.error("[API] Error getting like info:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return NextResponse.json(
        {
          error: "Failed to get like info",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  }
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
