import { NextRequest, NextResponse } from "next/server";
import { fetchHistoricalCandles } from "@/lib/kite/quotes";
import { HistoricalDataSchema } from "@/lib/utils/validation";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, CandleData } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentToken = searchParams.get("instrumentToken");
    const interval = searchParams.get("interval") || "day";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const validation = HistoricalDataSchema.safeParse({
      instrumentToken,
      interval,
      from,
      to,
    });

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "INVALID_PARAMETERS",
            message: validation.error.errors[0]?.message || "Invalid historical data parameters",
          },
        },
        { status: 400 }
      );
    }

    const { instrumentToken: token, interval: validInterval, from: validFrom, to: validTo } = validation.data;

    const candles = await fetchHistoricalCandles(token, validInterval, validFrom, validTo);

    return NextResponse.json<ApiResponse<CandleData[]>>({
      success: true,
      data: candles,
    });
  } catch (error: any) {
    console.error("[Historical API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "HISTORICAL_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch historical candlestick data",
        },
      },
      { status: statusCode }
    );
  }
}
