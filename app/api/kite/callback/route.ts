import { NextRequest, NextResponse } from "next/server";
import { exchangeRequestToken, getKiteApiKey } from "@/lib/kite/auth";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestToken = searchParams.get("request_token");
  const status = searchParams.get("status");
  const action = searchParams.get("action");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check if user rejected or cancelled login on Kite
  if (status === "cancelled" || action === "cancelled") {
    return NextResponse.redirect(new URL("/login?error=USER_CANCELLED", baseUrl));
  }

  if (!requestToken) {
    return NextResponse.redirect(
      new URL("/login?error=MISSING_REQUEST_TOKEN&message=No+request+token+received+from+Zerodha", baseUrl)
    );
  }

  try {
    const profile = await exchangeRequestToken(requestToken);

    if (!profile || !profile.access_token) {
      throw new Error("No access token returned from Kite");
    }

    const session = await getServerSession();
    session.isLoggedIn = true;
    session.apiKey = getKiteApiKey();
    session.accessToken = profile.access_token;
    session.publicToken = profile.public_token;
    session.userId = profile.user_id;
    session.userName = profile.user_name;
    session.userShortName = profile.user_shortname || profile.user_name;
    session.email = profile.email;
    session.broker = profile.broker || "ZERODHA";
    session.avatarUrl = profile.avatar_url;
    session.loginTime = new Date().toISOString();

    await session.save();

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (error: any) {
    console.error("[Kite Callback] Authentication error:", error?.message || error);
    const errorMessage = encodeURIComponent(
      error?.message || "Failed to exchange authentication token with Zerodha"
    );
    return NextResponse.redirect(
      new URL(`/login?error=AUTH_FAILED&message=${errorMessage}`, baseUrl)
    );
  }
}
