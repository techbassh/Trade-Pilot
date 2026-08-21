import { NextRequest, NextResponse } from "next/server";
import { processAgentMessage } from "@/lib/agent/agent";
import { fetchHoldings, fetchPositions } from "@/lib/kite/portfolio";
import { ApiResponse } from "@/types/trading";
import { AgentMessage } from "@/types/agent";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.message) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "MISSING_MESSAGE",
            message: "Message string is required in request body",
          },
        },
        { status: 400 }
      );
    }

    // Best-effort fetching of user's active holdings & positions for portfolio context
    let holdings: any[] = [];
    let positions: any = null;

    try {
      holdings = await fetchHoldings().catch(() => []);
      positions = await fetchPositions().catch(() => null);
    } catch {
      // If unauthenticated or offline, use empty context
    }

    const responseMessage: AgentMessage = await processAgentMessage({
      message: String(body.message),
      history: body.history || [],
      holdings,
      positions,
      mode: "RESEARCH", // Enforced in Phase 1
    });

    return NextResponse.json<ApiResponse<AgentMessage>>({
      success: true,
      data: responseMessage,
    });
  } catch (error: any) {
    console.error("[Agent Chat API] Error processing agent query:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "AGENT_PROCESSING_ERROR",
          message: error.message || "Failed to process AI trading query",
        },
      },
      { status: 500 }
    );
  }
}
