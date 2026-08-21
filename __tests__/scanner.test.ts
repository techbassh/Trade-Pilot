import { describe, it, expect } from "vitest";
import { runUniverseScan } from "@/lib/agent/scanner";
import { resolveNaturalDateRange } from "@/lib/agent/dates";
import { parseNaturalLanguageIntent } from "@/lib/agent/planner";
import { analyzeInstrument } from "@/lib/agent/analyzer";

describe("Deterministic Stock Scanner & NLP Intent Parser", () => {
  it("resolves natural language date ranges accurately", () => {
    const range3M = resolveNaturalDateRange("last 3 months");
    expect(range3M.label).toBe("Last 3 Months");
    expect(range3M.from).toBeDefined();
    expect(range3M.to).toBeDefined();

    const range6M = resolveNaturalDateRange("6 months");
    expect(range6M.label).toBe("Last 6 Months");

    const rangeYTD = resolveNaturalDateRange("YTD");
    expect(rangeYTD.label).toBe("Year To Date (YTD)");
    expect(rangeYTD.from).toContain("-01-01");
  });

  it("parses natural language queries into structured tool calls", () => {
    const intent1 = parseNaturalLanguageIntent("Find the best performing Nifty 500 stocks over the last 3 months");
    expect(intent1.name).toBe("scan_universe");
    expect(intent1.args.universe).toBe("NIFTY_500");
    expect(intent1.args.timeframe).toBe("3 months");

    const intent2 = parseNaturalLanguageIntent("Find stocks where SMA20 crossed above SMA50 in last 5 sessions");
    expect(intent2.name).toBe("find_crossovers");
    expect(intent2.args.lookback).toBe(5);

    const intent3 = parseNaturalLanguageIntent("Find stocks with RSI below 30");
    expect(intent3.name).toBe("find_rsi_setups");
    expect(intent3.args.maxRsi).toBe(30);

    const intent4 = parseNaturalLanguageIntent("Analyze RELIANCE");
    expect(intent4.name).toBe("analyze_instrument");
    expect(intent4.args.symbol).toBe("RELIANCE");

    const intent5 = parseNaturalLanguageIntent("How is my portfolio doing?");
    expect(intent5.name).toBe("analyze_portfolio");
  });

  it("runs universe scans deterministically and returns ranked results", () => {
    const scan = runUniverseScan({
      universe: "NIFTY_50",
      timeframeQuery: "3 months",
      limit: 5,
    });

    expect(scan.universe).toBe("NIFTY_50");
    expect(scan.items.length).toBeLessThanOrEqual(5);
    expect(scan.items.length).toBeGreaterThan(0);

    // Verify properties on ranked items
    const firstItem = scan.items[0];
    expect(firstItem.rank).toBe(1);
    expect(firstItem.symbol).toBeDefined();
    expect(firstItem.currentPrice).toBeGreaterThan(0);
    expect(firstItem.signalScore).toBeGreaterThanOrEqual(0);
    expect(firstItem.signalScore).toBeLessThanOrEqual(10);
  });

  it("performs multi-factor technical analysis and scoring", () => {
    const analysis = analyzeInstrument("RELIANCE");
    expect(analysis.symbol).toBe("RELIANCE");
    expect(analysis.indicators.price).toBeGreaterThan(0);
    expect(analysis.indicators.sma20).toBeGreaterThan(0);
    expect(analysis.indicators.sma50).toBeGreaterThan(0);
    expect(analysis.scoreBreakdown.totalScore).toBeGreaterThanOrEqual(0);
    expect(analysis.scoreBreakdown.totalScore).toBeLessThanOrEqual(10);
    expect(analysis.strengths.length).toBeGreaterThan(0);
  });
});
