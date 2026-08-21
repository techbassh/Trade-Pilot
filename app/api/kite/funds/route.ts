import { NextResponse } from "next/server";
import { fetchFunds } from "@/lib/kite/portfolio";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, Funds } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const funds = await fetchFunds();
    return NextResponse.json<ApiResponse<Funds>>({
      success: true,
      data: funds,
    });
  } catch (error: any) {
    console.error("[Funds API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "FUNDS_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch account funds and margins",
        },
      },
      { status: statusCode }
    );
  }
}
