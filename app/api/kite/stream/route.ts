import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { streamHub } from "@/lib/kite/streamHub";
import { LiveStreamEvent } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAuthenticatedSession();

  if (!session || !session.accessToken || !session.apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "KITE_AUTH_EXPIRED",
          message: "Authentication required for live stream",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Connect stream hub to Kite WebSocket
  streamHub.connect(session.apiKey, session.accessToken);

  const { searchParams } = new URL(request.url);
  const rawTokens = searchParams.get("tokens");
  if (rawTokens) {
    const tokens = rawTokens
      .split(",")
      .map((t) => parseInt(t.trim(), 10))
      .filter((t) => !isNaN(t) && t > 0);

    if (tokens.length > 0) {
      streamHub.subscribeTokens(tokens);
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      const initialMessage = `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Listener for live ticks and order updates
      const unsubscribe = streamHub.addListener((event: LiveStreamEvent) => {
        try {
          const dataStr = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(dataStr));
        } catch {
          // Client disconnected
        }
      });

      // Heartbeat interval to prevent proxy timeouts
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({
            timestamp: Date.now(),
          })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
