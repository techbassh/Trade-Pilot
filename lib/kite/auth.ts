import crypto from "crypto";
import { KiteProfile, KiteApiResponse } from "@/types/kite";
import { KiteApiError } from "./client";

export function getKiteApiKey(): string {
  const key = process.env.KITE_API_KEY;
  if (!key) {
    throw new Error("Missing KITE_API_KEY environment variable");
  }
  return key;
}

export function getKiteApiSecret(): string {
  const secret = process.env.KITE_API_SECRET;
  if (!secret) {
    throw new Error("Missing KITE_API_SECRET environment variable");
  }
  return secret;
}

export function getKiteLoginUrl(): string {
  const apiKey = getKiteApiKey();
  const redirectUrl = process.env.KITE_REDIRECT_URL;
  let url = `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}`;
  if (redirectUrl) {
    url += `&redirect_url=${encodeURIComponent(redirectUrl)}`;
  }
  return url;
}

export function generateChecksum(apiKey: string, requestToken: string, apiSecret: string): string {
  const rawString = `${apiKey}${requestToken}${apiSecret}`;
  return crypto.createHash("sha256").update(rawString).digest("hex");
}

export async function exchangeRequestToken(requestToken: string): Promise<KiteProfile> {
  const apiKey = getKiteApiKey();
  const apiSecret = getKiteApiSecret();

  if (!requestToken || typeof requestToken !== "string") {
    throw new KiteApiError("Invalid or missing request token", "INVALID_REQUEST_TOKEN", 400);
  }

  const checksum = generateChecksum(apiKey, requestToken, apiSecret);

  const formParams = new URLSearchParams({
    api_key: apiKey,
    request_token: requestToken,
    checksum: checksum,
  });

  try {
    const response = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "X-Kite-Version": "3",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams.toString(),
      cache: "no-store",
    });

    const data: KiteApiResponse<KiteProfile> = await response.json();

    if (!response.ok || data.status === "error" || !data.data) {
      throw new KiteApiError(
        data.message || "Failed to exchange request token with Kite",
        data.error_type || "TOKEN_EXCHANGE_FAILED",
        response.status || 400,
        data
      );
    }

    return data.data;
  } catch (error: any) {
    if (error instanceof KiteApiError) throw error;
    throw new KiteApiError(
      error.message || "Network error during token exchange",
      "TOKEN_EXCHANGE_ERROR",
      500
    );
  }
}

export async function invalidateKiteSession(accessToken: string, apiKey: string): Promise<boolean> {
  try {
    const url = new URL("https://api.kite.trade/session/token");
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("access_token", accessToken);

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "X-Kite-Version": "3",
        Authorization: `token ${apiKey}:${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error invalidating Kite session upstream:", error);
    return false;
  }
}
