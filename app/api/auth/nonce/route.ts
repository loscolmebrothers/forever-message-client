import { NextResponse } from "next/server";
import { generateNonce } from "siwe";

export async function GET() {
  try {
    const nonce = generateNonce();
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
