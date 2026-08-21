// Intent Planner & Natural Language Parser for TradePilot AI Agent
import { ToolCall } from "@/types/agent";

export function parseNaturalLanguageIntent(query: string): ToolCall {
  const q = query.trim();
  const lower = q.toLowerCase();

  // 1. Order execution attempt (Must be flagged and handled safely)
  if (
    lower.startsWith("buy ") ||
    lower.startsWith("sell ") ||
    lower.includes("place order") ||
    lower.includes("execute trade") ||
    lower.includes("place the order")
  ) {
    // Return restricted tool to trigger explicit permission gatekeeper
    const symbolMatch = q.match(/\b([A-Z]{2,12})\b/);
    const qtyMatch = q.match(/\b(\d+)\b/);
    return {
      name: "place_order",
      args: {
        symbol: symbolMatch ? symbolMatch[1] : "RELIANCE",
        quantity: qtyMatch ? parseInt(qtyMatch[1], 10) : 1,
      },
    };
  }

  // 2. Portfolio health & holdings inspection
  if (
    lower.includes("portfolio") ||
    lower.includes("my holdings") ||
    lower.includes("underperforming") ||
    lower.includes("holdings below sma50") ||
    lower.includes("concentration") ||
    lower.includes("how is my account")
  ) {
    return {
      name: "analyze_portfolio",
      args: {},
    };
  }

  // 3. Single Instrument Deep Dive / Explanation
  const analyzeMatch = lower.match(/(?:analyze|review|check|evaluate|inspect|setup for|why did)\s+([a-z0-9&-]+)/i);
  if (analyzeMatch && analyzeMatch[1] && !["the", "my", "all", "top", "stocks", "nifty"].includes(analyzeMatch[1].toLowerCase())) {
    const symbol = analyzeMatch[1].toUpperCase();
    return {
      name: "analyze_instrument",
      args: { symbol },
    };
  }

  // Single word symbol check e.g. "RELIANCE" or "TCS?"
  const singleSymbolMatch = q.match(/^[A-Za-z]{2,10}\??$/);
  if (singleSymbolMatch && !["SCAN", "HELP", "BUY", "SELL", "TEST", "PORTFOLIO"].includes(q.toUpperCase())) {
    return {
      name: "analyze_instrument",
      args: { symbol: q.replace("?", "").toUpperCase() },
    };
  }

  // 4. Moving Average Crossovers
  if (
    (lower.includes("crossover") || lower.includes("crossed above") || lower.includes("cross above")) &&
    (lower.includes("sma") || lower.includes("ema") || lower.includes("20") || lower.includes("50"))
  ) {
    const lookbackMatch = lower.match(/(\d+)\s*(?:session|day|candle)/);
    const lookback = lookbackMatch ? parseInt(lookbackMatch[1], 10) : 5;
    return {
      name: "find_crossovers",
      args: {
        universe: lower.includes("50") && !lower.includes("500") ? "NIFTY_50" : "NIFTY_500",
        lookback,
      },
    };
  }

  // 5. RSI Condition Scans (e.g. RSI < 30, oversold, improving momentum)
  if (lower.includes("rsi") || lower.includes("oversold")) {
    let minRsi: number | undefined = undefined;
    let maxRsi: number | undefined = undefined;

    const underMatch = lower.match(/(?:below|under|<|less than)\s*(\d+)/);
    const betweenMatch = lower.match(/between\s*(\d+)\s*and\s*(\d+)/);

    if (betweenMatch) {
      minRsi = parseInt(betweenMatch[1], 10);
      maxRsi = parseInt(betweenMatch[2], 10);
    } else if (underMatch) {
      maxRsi = parseInt(underMatch[1], 10);
    } else if (lower.includes("oversold")) {
      maxRsi = 30;
    }

    return {
      name: "find_rsi_setups",
      args: {
        universe: "NIFTY_500",
        minRsi,
        maxRsi: maxRsi || 35,
      },
    };
  }

  // 6. Breakouts / 52-Week High
  if (lower.includes("breakout") || lower.includes("52-week high") || lower.includes("52 week high") || lower.includes("near high")) {
    const pctMatch = lower.match(/within\s*(\d+)%/);
    const within52wHighPct = pctMatch ? parseFloat(pctMatch[1]) : 5.0;

    return {
      name: "find_breakouts",
      args: {
        universe: "NIFTY_500",
        within52wHighPct,
        minVolumeRatio: 1.3,
      },
    };
  }

  // 7. Multi-Condition Scanner with Timeframe & Moving Averages
  let universe = "NIFTY_500";
  if (lower.includes("nifty 50") && !lower.includes("500")) universe = "NIFTY_50";
  else if (lower.includes("next 50")) universe = "NIFTY_NEXT_50";
  else if (lower.includes("nifty 100")) universe = "NIFTY_100";

  let timeframe = "3 months";
  if (lower.includes("1 week") || lower.includes("7 days")) timeframe = "1 week";
  else if (lower.includes("1 month")) timeframe = "1 month";
  else if (lower.includes("6 month")) timeframe = "6 months";
  else if (lower.includes("1 year") || lower.includes("12 month")) timeframe = "1 year";
  else if (lower.includes("ytd") || lower.includes("since january")) timeframe = "YTD";

  const minReturnMatch = lower.match(/(?:gained|gain|up|more than|return >|>)\s*(\d+)%/);
  const minReturnPct = minReturnMatch ? parseFloat(minReturnMatch[1]) : undefined;

  const priceAboveSma20 = lower.includes("above") && (lower.includes("20 sma") || lower.includes("sma 20") || lower.includes("sma20") || lower.includes("20 and 50"));
  const priceAboveSma50 = lower.includes("above") && (lower.includes("50 sma") || lower.includes("sma 50") || lower.includes("sma50") || lower.includes("20 and 50"));
  const sma20AboveSma50 = lower.includes("sma20 is above sma50") || lower.includes("sma20 above sma50") || lower.includes("20 sma above 50 sma");

  const minVolumeRatio = lower.includes("volume") && (lower.includes("2x") || lower.includes("double")) ? 2.0 : lower.includes("volume") ? 1.3 : undefined;

  return {
    name: "scan_universe",
    args: {
      universe,
      timeframe,
      minReturnPct,
      priceAboveSma20: priceAboveSma20 || undefined,
      priceAboveSma50: priceAboveSma50 || undefined,
      sma20AboveSma50: sma20AboveSma50 || undefined,
      minVolumeRatio,
      limit: 10,
      sortBy: lower.includes("score") || lower.includes("best setup") ? "score" : "return",
    },
  };
}
