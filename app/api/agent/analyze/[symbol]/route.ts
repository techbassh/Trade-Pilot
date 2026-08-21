import { NextRequest, NextResponse } from "next/server";
import { analyzeInstrument } from "@/lib/agent/analyzer";
import { ApiResponse } from "@/types/trading";
import { InstrumentAnalysis } from "@/types/agent";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;

    if (!symbol) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "MISSING_SYMBOL",
            message: "Instrument symbol is required",
          },
        },
        { status: 400 }
      );
    }

    const analysis: InstrumentAnalysis = analyzeInstrument(symbol);

    return NextResponse.json<ApiResponse<InstrumentAnalysis>>({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error(`[Agent Analysis API] Error analyzing ${params.symbol}:`, error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "ANALYSIS_ERROR",
          message: error.message || `Failed to analyze instrument ${params.symbol}`,
        },
      },
      { status: 500 }
    );
  }
}
