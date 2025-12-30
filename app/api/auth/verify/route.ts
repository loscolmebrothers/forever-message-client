import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, address: directAddress, skipSignature } = body;

    let address: string;

    // Handle direct authentication (email/social login)
    if (skipSignature && directAddress) {
      address = directAddress.toLowerCase();
    } else {
      // Handle wallet signature authentication
      if (!message || !signature) {
        return NextResponse.json(
          { error: "Message and signature required" },
          { status: 400 }
        );
      }

      const siweMessage = new SiweMessage(message);

      // Check signature format - if it's clearly wrong (smart contract wallet), skip verification
      const isSmartWalletSignature =
        signature.length > 200 || !signature.startsWith("0x");

      if (isSmartWalletSignature) {
        console.log(
          "[Auth] Smart contract wallet signature detected (length:",
          signature.length,
          "), skipping standard verification"
        );
        address = siweMessage.address.toLowerCase();
      } else {
        try {
          const fields = await siweMessage.verify({ signature });

          if (!fields.success) {
            console.error("Verification error:", fields);
            return NextResponse.json(
              { error: "Invalid signature" },
              { status: 401 }
            );
          }

          address = siweMessage.address.toLowerCase();
        } catch (verifyError: any) {
          console.error("[Auth] Signature verification failed:", {
            code: verifyError?.code,
            argument: verifyError?.argument,
            message: verifyError?.message,
          });

          // Handle smart contract wallet signatures (ERC-1271)
          if (
            verifyError?.code === "INVALID_ARGUMENT" &&
            verifyError?.argument === "signature"
          ) {
            console.log(
              "[Auth] Smart contract wallet error, using address from message"
            );
            address = siweMessage.address.toLowerCase();
          } else {
            throw verifyError;
          }
        }
      }
    }

    const email = `${address}@wallet.local`;

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          wallet_address: address,
        },
      });

    let userId: string;

    if (createError) {
      const { data: allUsers, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError || !allUsers) {
        console.error("Failed to list users:", listError);
        return NextResponse.json(
          { error: "Failed to authenticate" },
          { status: 500 }
        );
      }

      const existingUser = allUsers.users.find((u) => u.email === email);

      if (!existingUser) {
        console.error("User not found after creation error:", createError);
        return NextResponse.json(
          { error: "Failed to authenticate" },
          { status: 500 }
        );
      }

      userId = existingUser.id;
    } else {
      userId = newUser.user!.id;
    }

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData) {
      console.error("Link generation error:", linkError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    const { hashed_token } = linkData.properties;

    if (!hashed_token) {
      console.error("Failed to get hashed_token from generateLink");
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.verifyOtp({
        token_hash: hashed_token,
        type: "magiclink",
      });

    if (sessionError || !sessionData?.session) {
      console.error("Session verification error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: sessionData.session,
      user: sessionData.user,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
