import { kiteFetch, orderRateLimiter } from "./client";
import { KiteOrder } from "@/types/kite";
import { Order, PlaceOrderRequest } from "@/types/trading";

export function normalizeOrder(item: KiteOrder): Order {
  return {
    orderId: item.order_id,
    symbol: item.tradingsymbol,
    exchange: item.exchange,
    instrumentToken: item.instrument_token,
    transactionType: item.transaction_type,
    quantity: item.quantity,
    filledQuantity: item.filled_quantity,
    pendingQuantity: item.pending_quantity,
    orderType: item.order_type,
    product: item.product,
    price: item.price,
    triggerPrice: item.trigger_price,
    averagePrice: item.average_price,
    status: item.status,
    statusMessage: item.status_message || item.status_message_raw || null,
    validity: item.validity,
    variety: item.variety,
    orderTimestamp: item.order_timestamp,
    exchangeTimestamp: item.exchange_timestamp,
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const rawOrders = await kiteFetch<KiteOrder[]>("/orders");

  if (!rawOrders || !Array.isArray(rawOrders)) {
    return [];
  }

  // Sort descending by order timestamp (most recent first)
  return rawOrders.map(normalizeOrder).sort((a, b) => {
    const timeA = new Date(a.orderTimestamp).getTime();
    const timeB = new Date(b.orderTimestamp).getTime();
    return timeB - timeA;
  });
}

export async function placeOrder(orderReq: PlaceOrderRequest): Promise<{ orderId: string }> {
  // Acquire rate limit slot before dispatching
  await orderRateLimiter.acquire();

  const variety = orderReq.variety || "regular";
  const endpoint = `/orders/${variety}`;

  const payload: Record<string, any> = {
    exchange: orderReq.exchange,
    tradingsymbol: orderReq.tradingsymbol,
    transaction_type: orderReq.transactionType,
    quantity: orderReq.quantity,
    order_type: orderReq.orderType,
    product: orderReq.product,
    validity: orderReq.validity || "DAY",
  };

  if (orderReq.orderType === "LIMIT" && orderReq.price) {
    payload.price = orderReq.price;
  }

  if (orderReq.triggerPrice) {
    payload.trigger_price = orderReq.triggerPrice;
  }

  const result = await kiteFetch<{ order_id: string }>(endpoint, {
    method: "POST",
    body: payload,
  });

  return {
    orderId: result?.order_id || "",
  };
}

export async function cancelOrder(orderId: string, variety = "regular"): Promise<{ orderId: string }> {
  await orderRateLimiter.acquire();

  const endpoint = `/orders/${variety}/${orderId}`;

  const result = await kiteFetch<{ order_id: string }>(endpoint, {
    method: "DELETE",
  });

  return {
    orderId: result?.order_id || orderId,
  };
}
