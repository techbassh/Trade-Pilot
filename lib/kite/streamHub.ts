import WebSocket from "ws";
import { parseBinaryTickerData } from "./websocket";
import { LiveStreamEvent, LiveQuoteEvent, LiveOrderEvent } from "@/types/trading";

type EventListener = (event: LiveStreamEvent) => void;

class KiteStreamHub {
  private static instance: KiteStreamHub;
  private ws: WebSocket | null = null;
  private subscribers = new Set<EventListener>();
  private subscribedTokens = new Set<number>();
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): KiteStreamHub {
    if (!KiteStreamHub.instance) {
      KiteStreamHub.instance = new KiteStreamHub();
    }
    return KiteStreamHub.instance;
  }

  public connect(apiKey: string, accessToken: string) {
    if (this.apiKey === apiKey && this.accessToken === accessToken && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.reconnect();
  }

  private reconnect() {
    if (this.isConnecting || !this.apiKey || !this.accessToken) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.isConnecting = true;
    const wsUrl = `wss://ws.kite.trade?api_key=${this.apiKey}&access_token=${this.accessToken}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        this.isConnecting = false;
        // Resubscribe active tokens
        if (this.subscribedTokens.size > 0) {
          this.sendSubscription(Array.from(this.subscribedTokens));
        }
      });

      this.ws.on("message", (data: WebSocket.RawData, isBinary: boolean) => {
        try {
          if (isBinary && Buffer.isBuffer(data)) {
            const ticks = parseBinaryTickerData(data);
            for (const tick of ticks) {
              const quoteEvent: LiveQuoteEvent = {
                type: "quote",
                instrumentToken: tick.instrumentToken,
                lastPrice: tick.lastPrice,
                change: tick.change,
                changePercent: tick.changePercent,
                ohlc: tick.ohlc,
                volume: tick.volume,
                timestamp: tick.timestamp,
              };
              this.broadcast(quoteEvent);
            }
          } else {
            // Text message (Order updates or errors)
            const text = data.toString();
            try {
              const json = JSON.parse(text);
              if (json.type === "order" && json.data) {
                const orderData = json.data;
                const orderEvent: LiveOrderEvent = {
                  type: "order",
                  orderId: orderData.order_id,
                  tradingsymbol: orderData.tradingsymbol,
                  status: orderData.status,
                  statusMessage: orderData.status_message,
                  filledQuantity: orderData.filled_quantity || 0,
                  quantity: orderData.quantity || 0,
                  averagePrice: orderData.average_price || 0,
                  transactionType: orderData.transaction_type,
                  timestamp: orderData.order_timestamp || new Date().toISOString(),
                };
                this.broadcast(orderEvent);
              }
            } catch {}
          }
        } catch (err) {
          console.error("[StreamHub] Error parsing ticker message:", err);
        }
      });

      this.ws.on("error", (error) => {
        this.isConnecting = false;
        console.error("[StreamHub] WebSocket error:", error.message);
      });

      this.ws.on("close", () => {
        this.isConnecting = false;
        this.ws = null;
        // Schedule auto-reconnect in 5s if we still have active listeners
        if (this.subscribers.size > 0 && !this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => this.reconnect(), 5000);
        }
      });
    } catch (err) {
      this.isConnecting = false;
      console.error("[StreamHub] Failed to initialize WebSocket:", err);
    }
  }

  public subscribeTokens(tokens: number[]) {
    const newTokens: number[] = [];
    for (const t of tokens) {
      if (!this.subscribedTokens.has(t)) {
        this.subscribedTokens.add(t);
        newTokens.push(t);
      }
    }

    if (newTokens.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscription(newTokens);
    }
  }

  public unsubscribeTokens(tokens: number[]) {
    const toRemove: number[] = [];
    for (const t of tokens) {
      if (this.subscribedTokens.has(t)) {
        this.subscribedTokens.delete(t);
        toRemove.push(t);
      }
    }

    if (toRemove.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ a: "unsubscribe", v: toRemove }));
    }
  }

  private sendSubscription(tokens: number[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ a: "subscribe", v: tokens }));
    this.ws.send(JSON.stringify({ a: "mode", v: ["quote", tokens] }));
  }

  public addListener(listener: EventListener): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
      if (this.subscribers.size === 0) {
        // Disconnect if no active clients
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      }
    };
  }

  public broadcast(event: LiveStreamEvent) {
    for (const listener of this.subscribers) {
      try {
        listener(event);
      } catch (err) {
        console.error("[StreamHub] Error invoking listener:", err);
      }
    }
  }
}

export const streamHub = KiteStreamHub.getInstance();
