import { NextResponse } from "next/server";
import { fetchPositions } from "@/lib/kite/portfolio";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, PositionsSummary } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const positions = await fetchPositions();
    return NextResponse.json<ApiResponse<PositionsSummary>>({
      success: true,
      data: positions,
    });
  } catch (error: any) {
    console.error("[Positions API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "POSITIONS_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch portfolio positions",
        },
      },
      { status: statusCode }
    );
  }
}
