import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, getKiteLoginUrl } from "@/lib/kite/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const loginUrl = getKiteLoginUrl(request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  } catch (error: any) {
    console.error("Error generating Kite login URL:", error);
    const loginRedirect = new URL("/login", getAppBaseUrl(request.nextUrl.origin));
    loginRedirect.searchParams.set("error", "CONFIG_ERROR");
    loginRedirect.searchParams.set("message", error.message || "Failed to initiate Zerodha login");
    return NextResponse.redirect(loginRedirect);
  }
}
