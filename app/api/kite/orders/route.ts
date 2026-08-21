import { NextRequest, NextResponse } from "next/server";
import { fetchOrders, placeOrder } from "@/lib/kite/orders";
import { PlaceOrderSchema } from "@/lib/utils/validation";
import { KiteApiError } from "@/lib/kite/client";
import { ApiResponse, Order } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await fetchOrders();
    return NextResponse.json<ApiResponse<Order[]>>({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("[Orders API - GET] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "ORDERS_FETCH_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to fetch orders",
        },
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST_BODY",
            message: "Request body is required",
          },
        },
        { status: 400 }
      );
    }

    const validationResult = PlaceOrderSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Validation failed";
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError,
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const orderParams = validationResult.data;
    const result = await placeOrder({
      exchange: orderParams.exchange,
      tradingsymbol: orderParams.tradingsymbol,
      transactionType: orderParams.transactionType,
      quantity: orderParams.quantity,
      orderType: orderParams.orderType,
      product: orderParams.product,
      price: orderParams.price ?? undefined,
      triggerPrice: orderParams.triggerPrice ?? undefined,
      validity: orderParams.validity,
      variety: orderParams.variety,
    });

    return NextResponse.json<ApiResponse<{ orderId: string }>>({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[Orders API - POST] Error:", error.message);
    const statusCode = error instanceof KiteApiError ? error.statusCode : 500;
    const errorCode = error instanceof KiteApiError ? error.code : "ORDER_PLACEMENT_FAILED";

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: errorCode,
          message: error.message || "Failed to place order with Zerodha",
        },
      },
      { status: statusCode }
    );
  }
}
