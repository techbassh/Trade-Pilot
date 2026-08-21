import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes } from "@/lib/kite/quotes";
import { QuotesQuerySchema } from "@/lib/utils/validation";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, Quote } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbols = searchParams.get("symbols");

    const validation = QuotesQuerySchema.safeParse({ symbols: rawSymbols });

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "INVALID_SYMBOLS",
            message: validation.error.errors[0]?.message || "Invalid symbols parameter",
          },
        },
        { status: 400 }
      );
    }

    const quotes = await fetchQuotes(validation.data.symbols);

    return NextResponse.json<ApiResponse<Record<string, Quote>>>({
      success: true,
      data: quotes,
    });
  } catch (error: any) {
    console.error("[Quotes API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "QUOTES_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch market quotes",
        },
      },
      { status: statusCode }
    );
  }
}
