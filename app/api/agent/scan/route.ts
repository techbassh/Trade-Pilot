import { NextRequest, NextResponse } from "next/server";
import { runUniverseScan, ScannerFilterOptions } from "@/lib/agent/scanner";
import { ApiResponse } from "@/types/trading";
import { ScanSummary } from "@/types/agent";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: ScannerFilterOptions = await request.json().catch(() => ({}));
    const scanSummary: ScanSummary = runUniverseScan(body);

    return NextResponse.json<ApiResponse<ScanSummary>>({
      success: true,
      data: scanSummary,
    });
  } catch (error: any) {
    console.error("[Agent Scanner API] Error executing universe scan:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "SCAN_EXECUTION_ERROR",
          message: error.message || "Failed to execute universe scan",
        },
      },
      { status: 500 }
    );
  }
}
