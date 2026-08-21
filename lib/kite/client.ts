import { getAuthenticatedSession } from "@/lib/auth/session";

const KITE_BASE_URL = "https://api.kite.trade";

export interface KiteClientOptions {
  apiKey: string;
  accessToken: string;
}

export class KiteApiError extends Error {
  code: string;
  statusCode: number;
  data?: any;

  constructor(message: string, code = "KITE_API_ERROR", statusCode = 500, data?: any) {
    super(message);
    this.name = "KiteApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
  }
}

// In-memory rate limiter for safety
class OrderRateLimiter {
  private lastRequestTime = 0;
  private minIntervalMs = 200; // max 5 orders/second

  async acquire(): Promise<void> {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minIntervalMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minIntervalMs - timeSinceLast)
      );
    }
    this.lastRequestTime = Date.now();
  }
}

export const orderRateLimiter = new OrderRateLimiter();

export async function getKiteCredentials(): Promise<KiteClientOptions> {
  const session = await getAuthenticatedSession();
  if (!session || !session.accessToken || !session.apiKey) {
    throw new KiteApiError(
      "Your Kite session has expired. Please login again.",
      "KITE_AUTH_EXPIRED",
      401
    );
  }
  return {
    apiKey: session.apiKey,
    accessToken: session.accessToken,
  };
}

export async function kiteFetch<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, any> | URLSearchParams | string;
    params?: Record<string, string | number | boolean>;
    apiKey?: string;
    accessToken?: string;
  } = {}
): Promise<T> {
  let { apiKey, accessToken } = options;

  if (!apiKey || !accessToken) {
    const creds = await getKiteCredentials();
    apiKey = creds.apiKey;
    accessToken = creds.accessToken;
  }

  let url = `${KITE_BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers: Record<string, string> = {
    "X-Kite-Version": "3",
    Authorization: `token ${apiKey}:${accessToken}`,
  };

  let requestBody: string | undefined = undefined;
  if (options.body) {
    if (typeof options.body === "string") {
      requestBody = options.body;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (options.body instanceof URLSearchParams) {
      requestBody = options.body.toString();
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      const formParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.body)) {
        if (value !== undefined && value !== null) {
          formParams.append(key, String(value));
        }
      }
      requestBody = formParams.toString();
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: requestBody,
      cache: "no-store",
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorType = responseData?.error_type || "GeneralException";
      const message = responseData?.message || `Kite API request failed with status ${response.status}`;

      if (response.status === 403) {
        if (errorType === "TokenException") {
          throw new KiteApiError(
            "Your Kite session has expired. Please login again.",
            "KITE_AUTH_EXPIRED",
            401,
            responseData
          );
        }
        if (errorType === "PermissionException") {
          throw new KiteApiError(
            message || "Access denied for this endpoint or subscription plan.",
            "KITE_PERMISSION_DENIED",
            403,
            responseData
          );
        }
      }

      if (response.status === 429) {
        throw new KiteApiError(
          "Kite API rate limit exceeded. Please wait a moment.",
          "KITE_RATE_LIMIT",
          429,
          responseData
        );
      }

      throw new KiteApiError(message, errorType, response.status, responseData);
    }

    if (responseData?.status === "error") {
      throw new KiteApiError(
        responseData.message || "Kite returned an error status",
        responseData.error_type || "KITE_API_ERROR",
        400,
        responseData
      );
    }

    return responseData?.data as T;
  } catch (error: any) {
    if (error instanceof KiteApiError) {
      throw error;
    }
    throw new KiteApiError(
      error.message || "Failed to communicate with Kite Connect API",
      "NETWORK_ERROR",
      500
    );
  }
}
