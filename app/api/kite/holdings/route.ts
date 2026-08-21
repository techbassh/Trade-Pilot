import { NextResponse } from "next/server";
import { fetchHoldings } from "@/lib/kite/portfolio";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, Holding } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const holdings = await fetchHoldings();
    return NextResponse.json<ApiResponse<Holding[]>>({
      success: true,
      data: holdings,
    });
  } catch (error: any) {
    console.error("[Holdings API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "HOLDINGS_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch portfolio holdings",
        },
      },
      { status: statusCode }
    );
  }
}
