import { kiteFetch, KiteApiError } from "./client";
import { KiteQuotesMap, KiteHistoricalDataResponse, KiteQuote } from "@/types/kite";
import { Quote, CandleData } from "@/types/trading";

export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  // Format symbols to include exchange prefix if missing
  const formattedSymbols = symbols.map((sym) =>
    sym.includes(":") ? sym : `NSE:${sym}`
  );

  const params: Record<string, string> = {};
  formattedSymbols.forEach((sym, idx) => {
    params[`i[${idx}]`] = sym;
  });

  // Kite endpoint supports multiple `i` query parameters
  const queryPairs = formattedSymbols.map((sym) => `i=${encodeURIComponent(sym)}`).join("&");
  const rawQuotes = await kiteFetch<KiteQuotesMap>(`/quote?${queryPairs}`);

  if (!rawQuotes) {
    return {};
  }

  const result: Record<string, Quote> = {};

  for (const [key, q] of Object.entries(rawQuotes)) {
    const cleanSymbol = key.includes(":") ? key.split(":")[1] : key;
    const exchange = key.includes(":") ? key.split(":")[0] : "NSE";
    const netChange = q.net_change || (q.ohlc?.close ? q.last_price - q.ohlc.close : 0);
    const pctChange = q.ohlc?.close && q.ohlc.close > 0 ? (netChange / q.ohlc.close) * 100 : 0;

    result[cleanSymbol] = {
      instrumentToken: q.instrument_token,
      tradingsymbol: cleanSymbol,
      exchange,
      lastPrice: q.last_price,
      netChange: netChange,
      percentageChange: pctChange,
      averagePrice: q.average_price,
      volume: q.volume,
      ohlc: {
        open: q.ohlc?.open || q.last_price,
        high: q.ohlc?.high || q.last_price,
        low: q.ohlc?.low || q.last_price,
        close: q.ohlc?.close || q.last_price,
      },
      timestamp: q.timestamp || new Date().toISOString(),
    };
  }

  return result;
}

export async function fetchHistoricalCandles(
  instrumentToken: number,
  interval: "minute" | "3minute" | "5minute" | "15minute" | "30minute" | "60minute" | "day" = "day",
  from: string,
  to: string
): Promise<CandleData[]> {
  try {
    const rawData = await kiteFetch<KiteHistoricalDataResponse>(
      `/instruments/historical/${instrumentToken}/${interval}`,
      {
        params: {
          from,
          to,
        },
      }
    );

    if (!rawData || !Array.isArray(rawData.candles)) {
      return [];
    }

    return rawData.candles.map(([timeStr, open, high, low, close, volume]) => {
      // If daily candle, time can be "YYYY-MM-DD"
      // If intraday candle, time can be unix timestamp in seconds
      let formattedTime: string | number = timeStr;
      if (interval === "day") {
        formattedTime = typeof timeStr === "string" ? timeStr.split("T")[0] : timeStr;
      } else {
        formattedTime = Math.floor(new Date(timeStr).getTime() / 1000);
      }

      return {
        time: formattedTime,
        open,
        high,
        low,
        close,
        volume: volume || 0,
      };
    });
  } catch (error: any) {
    if (error instanceof KiteApiError && error.code === "KITE_PERMISSION_DENIED") {
      throw new KiteApiError(
        "Historical market data is unavailable for this Kite Connect API subscription plan.",
        "HISTORICAL_DATA_UNAVAILABLE",
        403
      );
    }
    throw error;
  }
}
