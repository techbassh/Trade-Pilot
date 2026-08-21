import { NextResponse } from "next/server";
import { getKiteLoginUrl } from "@/lib/kite/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const loginUrl = getKiteLoginUrl();
    return NextResponse.redirect(loginUrl);
  } catch (error: any) {
    console.error("Error generating Kite login URL:", error);
    const loginRedirect = new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    loginRedirect.searchParams.set("error", "CONFIG_ERROR");
    loginRedirect.searchParams.set("message", error.message || "Failed to initiate Zerodha login");
    return NextResponse.redirect(loginRedirect);
  }
}
