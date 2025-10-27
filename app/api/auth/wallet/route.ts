import { NextResponse } from "next/server";

export async function GET() {
  try {
    const walletAddress = "0xFC3F3646f5e6AA13991E74250224D82301b618a7";
    const userId = "danicolms";

    return NextResponse.json({
      address: walletAddress,
      userId: userId,
      isCustodial: true,
    });
  } catch (error) {
    console.error("[API] Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet information" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
