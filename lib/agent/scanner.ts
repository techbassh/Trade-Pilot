// Deterministic Multi-Condition Stock Scanner for TradePilot
import { ScanResultItem, ScanSummary } from "@/types/agent";
import { getUniverseConstituents, UniverseStock } from "./universes";
import { generateSyntheticHistoricalCandles, analyzeInstrumentCandles } from "./analyzer";
import { calculateReturns, detectCrossover, calculateSMA } from "./indicators";
import { resolveNaturalDateRange } from "./dates";

export interface ScannerFilterOptions {
  universe?: string;
  timeframeQuery?: string; // e.g. "3 months", "6 months", "YTD"
  minReturnPct?: number;
  maxReturnPct?: number;
  priceAboveSma20?: boolean;
  priceAboveSma50?: boolean;
  sma20AboveSma50?: boolean;
  sma20CrossoverAboveSma50Lookback?: number; // e.g. 5 sessions
  minRsi?: number;
  maxRsi?: number;
  minVolumeRatio?: number; // e.g. 1.5x or 2.0x
  within52wHighPct?: number; // e.g. 5.0%
  breakout20DayHigh?: boolean;
  limit?: number;
  sortBy?: "return" | "score" | "volume" | "rsi";
}

export function runUniverseScan(options: ScannerFilterOptions = {}): ScanSummary {
  const universeName = options.universe || "NIFTY_500";
  const constituents: UniverseStock[] = getUniverseConstituents(universeName);

  const dateRange = resolveNaturalDateRange(options.timeframeQuery || "3 months");
  const tradingDays = dateRange.tradingDaysEstimate;

  const filtersApplied: string[] = [];
  if (options.timeframeQuery) filtersApplied.push(`Timeframe: ${dateRange.label} (${dateRange.formattedRange})`);
  if (options.minReturnPct !== undefined) filtersApplied.push(`Return >= +${options.minReturnPct}%`);
  if (options.priceAboveSma20) filtersApplied.push("Price > 20 SMA");
  if (options.priceAboveSma50) filtersApplied.push("Price > 50 SMA");
  if (options.sma20AboveSma50) filtersApplied.push("20 SMA > 50 SMA");
  if (options.sma20CrossoverAboveSma50Lookback) filtersApplied.push(`20 SMA crossed above 50 SMA in last ${options.sma20CrossoverAboveSma50Lookback} sessions`);
  if (options.minRsi !== undefined) filtersApplied.push(`RSI >= ${options.minRsi}`);
  if (options.maxRsi !== undefined) filtersApplied.push(`RSI <= ${options.maxRsi}`);
  if (options.minVolumeRatio !== undefined) filtersApplied.push(`Volume >= ${options.minVolumeRatio}x 20-day avg`);
  if (options.within52wHighPct !== undefined) filtersApplied.push(`Within ${options.within52wHighPct}% of 52-Week High`);
  if (options.breakout20DayHigh) filtersApplied.push("20-Day High Breakout");

  const results: ScanResultItem[] = [];

  for (const stock of constituents) {
    // Generate candle history for the stock
    const candleCount = Math.max(120, tradingDays + 50);
    const candles = generateSyntheticHistoricalCandles(stock.symbol, stock.basePrice, candleCount);

    if (candles.length < 20) continue;

    // Returns over the selected date range
    const startIndex = Math.max(0, candles.length - tradingDays);
    const { returnPercentage, startPrice, endPrice } = calculateReturns(candles, startIndex);

    // Filter by Return %
    if (options.minReturnPct !== undefined && returnPercentage < options.minReturnPct) continue;
    if (options.maxReturnPct !== undefined && returnPercentage > options.maxReturnPct) continue;

    // Indicator & Technical Analysis
    const analysis = analyzeInstrumentCandles(
      stock.symbol,
      candles,
      stock.name,
      stock.exchange,
      stock.instrumentToken
    );

    const ind = analysis.indicators;

    // Filter: Price > SMA20
    if (options.priceAboveSma20 && ind.price < ind.sma20) continue;

    // Filter: Price > SMA50
    if (options.priceAboveSma50 && ind.price < ind.sma50) continue;

    // Filter: SMA20 > SMA50
    if (options.sma20AboveSma50 && ind.sma20 < ind.sma50) continue;

    // Filter: Crossover SMA20 over SMA50
    if (options.sma20CrossoverAboveSma50Lookback) {
      const sma20Series = calculateSMA(candles, 20);
      const sma50Series = calculateSMA(candles, 50);
      const cross = detectCrossover(sma20Series, sma50Series, "CROSS_ABOVE", options.sma20CrossoverAboveSma50Lookback);
      if (!cross.hasCrossed) continue;
    }

    // Filter: RSI
    if (options.minRsi !== undefined && ind.rsi14 < options.minRsi) continue;
    if (options.maxRsi !== undefined && ind.rsi14 > options.maxRsi) continue;

    // Filter: Volume ratio
    if (options.minVolumeRatio !== undefined && ind.volumeRatio < options.minVolumeRatio) continue;

    // Filter: 52-week High distance
    if (options.within52wHighPct !== undefined && ind.distanceFrom52wHighPct > options.within52wHighPct) continue;

    // Filter: 20-day high breakout
    if (options.breakout20DayHigh && ind.price < ind.resistanceLevel * 0.99) continue;

    let signalLabel: ScanResultItem["signalLabel"] = "NEUTRAL";
    if (analysis.scoreBreakdown.totalScore >= 8.2) signalLabel = "STRONG_BULLISH";
    else if (analysis.scoreBreakdown.totalScore >= 6.8) signalLabel = "BULLISH";
    else if (analysis.scoreBreakdown.totalScore <= 3.5) signalLabel = "STRONG_BEARISH";
    else if (analysis.scoreBreakdown.totalScore <= 4.8) signalLabel = "BEARISH";

    results.push({
      rank: 0, // Assigned after sorting
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      instrumentToken: stock.instrumentToken,
      startPrice,
      currentPrice: endPrice,
      returnPercentage,
      sma20: ind.sma20,
      sma50: ind.sma50,
      rsi14: ind.rsi14,
      volumeRatio: ind.volumeRatio,
      signalScore: analysis.scoreBreakdown.totalScore,
      signalLabel,
      reasons: analysis.strengths.slice(0, 3),
      riskNotes: analysis.risks.slice(0, 2),
    });
  }

  // Sort results
  const sortBy = options.sortBy || "return";
  results.sort((a, b) => {
    if (sortBy === "score") return b.signalScore - a.signalScore;
    if (sortBy === "volume") return b.volumeRatio - a.volumeRatio;
    if (sortBy === "rsi") return b.rsi14 - a.rsi14;
    return b.returnPercentage - a.returnPercentage;
  });

  // Assign Ranks and trim by limit
  const limit = options.limit || 10;
  const rankedItems = results.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return {
    universe: universeName,
    universeTotalCount: constituents.length,
    scannedCount: constituents.length,
    successfulCount: constituents.length,
    periodLabel: dateRange.label,
    startDate: dateRange.from,
    endDate: dateRange.to,
    filtersApplied: filtersApplied.length > 0 ? filtersApplied : ["Standard Momentum & Performance"],
    items: rankedItems,
  };
}
