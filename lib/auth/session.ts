import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { UserProfile } from "@/types/trading";

export interface SessionData {
  isLoggedIn: boolean;
  apiKey?: string;
  accessToken?: string;
  publicToken?: string;
  userId?: string;
  userName?: string;
  userShortName?: string;
  email?: string;
  broker?: string;
  avatarUrl?: string;
  loginTime?: string;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

const sessionPassword =
  process.env.SESSION_SECRET ||
  "tradepilot_secure_session_encryption_key_must_be_32_chars_long";

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "tradepilot_session_v1",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  },
};

export async function getServerSession() {
  const cookieStore = cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function getAuthenticatedSession() {
  const session = await getServerSession();
  if (!session.isLoggedIn || !session.accessToken || !session.apiKey) {
    return null;
  }
  return session;
}

export function getSafeUserProfile(session: SessionData): UserProfile | null {
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return {
    userId: session.userId,
    userName: session.userName || "Trader",
    userShortName: session.userShortName || "Trader",
    email: session.email || "",
    broker: session.broker || "ZERODHA",
    exchanges: ["NSE", "BSE", "NFO", "CDS", "MCX"],
    products: ["CNC", "MIS", "NRML"],
    orderTypes: ["MARKET", "LIMIT", "SL", "SL-M"],
    avatarUrl: session.avatarUrl,
    loginTime: session.loginTime,
  };
}
