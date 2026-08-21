import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { invalidateKiteSession } from "@/lib/kite/auth";
import { ApiResponse } from "@/types/trading";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession();

    if (session.isLoggedIn && session.accessToken && session.apiKey) {
      // Best-effort invalidation of upstream Kite session
      await invalidateKiteSession(session.accessToken, session.apiKey).catch(() => {});
    }

    session.destroy();

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Successfully logged out" },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[Logout] Error during logout:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: error.message || "Failed to complete logout",
        },
      },
      { status: 500 }
    );
  }
}
