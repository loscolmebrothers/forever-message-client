import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BottleContract } from "@loscolmebrothers/forever-message-ipfs";
import { ethers } from "ethers";
import { FOREVER_MESSAGE_ABI } from "@/lib/blockchain/contract-abi";
import { withAuth } from "@/lib/auth/middleware";

export const POST = withAuth(
  async (_: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const bottleId = parseInt(context.params.id, 10);

      if (isNaN(bottleId) || bottleId < 0) {
        return NextResponse.json(
          { error: "Invalid bottle ID" },
          { status: 400 }
        );
      }

      // Bottle #0 is special and cannot be liked
      if (bottleId === 0) {
        return NextResponse.json(
          { error: "This special bottle cannot be liked" },
          { status: 403 }
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

        const likeCount = count || 0;

        // Track if bottle becomes forever as a result of this like
        let becameForever = false;
        let isForever = false;

        try {
          const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
          const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

          console.log("[API] FOREVER CHECK - Environment vars check:", {
            hasRpcUrl: !!rpcUrl,
            hasPrivateKey: !!privateKey,
            hasContractAddress: !!contractAddress,
            contractAddress,
          });

          if (rpcUrl && privateKey && contractAddress) {
            console.log(
              `[API] FOREVER CHECK - Initializing contract for bottle ${bottleId} with ${likeCount} likes`
            );

            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new BottleContract({
              contractAddress,
              contractABI: FOREVER_MESSAGE_ABI,
              signer: wallet,
            });

            // Get bottle state BEFORE checking forever
            const bottleDataBefore = await contract.getBottle(bottleId);
            const wasForeverBefore = bottleDataBefore.isForever;

            console.log(
              `[API] FOREVER CHECK - About to call checkIsForever(${bottleId}, ${likeCount})`
            );
            await contract.checkIsForever(bottleId, likeCount);
            console.log(
              `[API] FOREVER CHECK - checkIsForever completed successfully`
            );

            console.log(
              `[API] FOREVER CHECK - About to call getBottle(${bottleId})`
            );
            const bottleData = await contract.getBottle(bottleId);
            isForever = bottleData.isForever;

            console.log(`[API] FOREVER CHECK - getBottle result:`, {
              wasForeverBefore,
              isForeverNow: isForever,
              bottleId,
              likeCount,
              fullBottleData: bottleData,
            });

            // Bottle became forever if it wasn't before but is now
            becameForever = !wasForeverBefore && isForever;

            if (isForever) {
              console.log(
                `[API] FOREVER CHECK - Bottle ${bottleId} IS FOREVER! ${becameForever ? "(JUST BECAME FOREVER!)" : "(Already was forever)"} Updating database...`
              );
              const { data: updateData, error: updateError } =
                await supabaseAdmin
                  .from("bottles")
                  .update({ is_forever: true })
                  .eq("id", bottleId)
                  .select();

              if (updateError) {
                console.error(
                  `[API] FOREVER CHECK - Database update FAILED:`,
                  updateError
                );
              } else {
                console.log(
                  `[API] FOREVER CHECK - Database updated successfully:`,
                  updateData
                );
              }
            } else {
              console.log(
                `[API] FOREVER CHECK - Bottle ${bottleId} is NOT forever yet (likes: ${likeCount})`
              );
            }
          } else {
            console.error(
              "[API] FOREVER CHECK - Missing environment variables!",
              {
                hasRpcUrl: !!rpcUrl,
                hasPrivateKey: !!privateKey,
                hasContractAddress: !!contractAddress,
              }
            );
          }
        } catch (foreverCheckError) {
          console.error(
            "[API] FOREVER CHECK FAILED - Error details:",
            foreverCheckError
          );
          console.error("[API] FOREVER CHECK FAILED - Error stack:", {
            name:
              foreverCheckError instanceof Error
                ? foreverCheckError.name
                : "Unknown",
            message:
              foreverCheckError instanceof Error
                ? foreverCheckError.message
                : String(foreverCheckError),
            stack:
              foreverCheckError instanceof Error
                ? foreverCheckError.stack
                : undefined,
          });
        }

        console.log(
          `[API] User ${userId} liked bottle ${bottleId}${becameForever ? " - BOTTLE BECAME FOREVER!" : ""}`
        );

        return NextResponse.json({
          success: true,
          liked: true,
          likeCount,
          bottleId,
          userId,
          becameForever,
          isForever,
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
  async (_: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const bottleId = parseInt(context.params.id, 10);

      if (isNaN(bottleId) || bottleId < 0) {
        return NextResponse.json(
          { error: "Invalid bottle ID" },
          { status: 400 }
        );
      }

      const userId = user.wallet_address;

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
