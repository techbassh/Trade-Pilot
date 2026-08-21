import { NextRequest, NextResponse } from "next/server";
import { cancelOrder } from "@/lib/kite/orders";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "MISSING_ORDER_ID",
            message: "Order ID parameter is required",
          },
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const variety = searchParams.get("variety") || "regular";

    const result = await cancelOrder(orderId, variety);

    return NextResponse.json<ApiResponse<{ orderId: string }>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[Cancel Order API] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "ORDER_CANCELLATION_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to cancel order",
        },
      },
      { status: statusCode }
    );
  }
}
