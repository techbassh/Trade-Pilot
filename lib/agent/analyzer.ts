// Deterministic Instrument Analyzer & Multi-Factor Scoring Engine
import { CandleData } from "@/types/trading";
import {
  InstrumentAnalysis,
  TechnicalIndicatorSnapshot,
  TechnicalScoreBreakdown,
} from "@/types/agent";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateADX,
  calculateReturns,
  calculateSupportResistance,
} from "./indicators";
import { getUniverseConstituents } from "./universes";

/**
 * Deterministically generates consistent daily candles for an instrument if historical API access is not available
 */
export function generateSyntheticHistoricalCandles(
  symbol: string,
  basePrice: number,
  days = 120
): CandleData[] {
  const candles: CandleData[] = [];
  const now = new Date();

  // Create consistent pseudo-random seed based on symbol characters
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed * 31 + symbol.charCodeAt(i)) % 10000;
  }

  // Generate a realistic trend profile (e.g. slight upward drift for leaders)
  const isHighPerformer = ["TRENT", "DIXON", "MAZDOCK", "PERSISTENT", "COCHINSHIP", "BHARTIARTL", "HAL", "BEL", "RELIANCE"].includes(symbol);
  const trendFactor = isHighPerformer ? 0.0018 : 0.0004;

  let currentPrice = basePrice * (isHighPerformer ? 0.75 : 0.9);

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280.0; // 0 to 1

    const dailyPctChange = (rnd - 0.48) * 0.035 + trendFactor;
    const open = currentPrice;
    const close = Number((open * (1 + dailyPctChange)).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + rnd * 0.015)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - (1 - rnd) * 0.015)).toFixed(2));
    const volume = Math.floor(500000 + rnd * 2500000 * (isHighPerformer ? 1.5 : 1));

    candles.push({
      time: d.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

export function analyzeInstrumentCandles(
  symbol: string,
  candles: CandleData[],
  name = symbol,
  exchange: "NSE" | "BSE" = "NSE",
  instrumentToken?: number
): InstrumentAnalysis {
  if (!candles || candles.length === 0) {
    throw new Error(`No candle data available to analyze ${symbol}`);
  }

  const currentCandle = candles[candles.length - 1];
  const prevCandle = candles.length > 1 ? candles[candles.length - 2] : currentCandle;

  const currentPrice = currentCandle.close;
  const change = Number((currentPrice - prevCandle.close).toFixed(2));
  const changePct = prevCandle.close > 0 ? Number(((change / prevCandle.close) * 100).toFixed(2)) : 0;

  // Compute Indicators
  const sma20Series = calculateSMA(candles, 20);
  const sma50Series = calculateSMA(candles, 50);
  const sma200Series = calculateSMA(candles, Math.min(200, candles.length));
  const ema9Series = calculateEMA(candles, 9);
  const ema21Series = calculateEMA(candles, 21);
  const rsiSeries = calculateRSI(candles, 14);
  const macdData = calculateMACD(candles, 12, 26, 9);
  const bbData = calculateBollingerBands(candles, 20, 2);
  const atrSeries = calculateATR(candles, 14);
  const adxSeries = calculateADX(candles, 14);
  const { support, resistance } = calculateSupportResistance(candles, 20);

  // Latest indicator values
  const sma20 = sma20Series[sma20Series.length - 1] ?? currentPrice;
  const sma50 = sma50Series[sma50Series.length - 1] ?? currentPrice;
  const sma200 = sma200Series[sma200Series.length - 1] ?? currentPrice;
  const ema9 = ema9Series[ema9Series.length - 1] ?? currentPrice;
  const ema21 = ema21Series[ema21Series.length - 1] ?? currentPrice;
  const rsi14 = rsiSeries[rsiSeries.length - 1] ?? 50;

  const latestMacd = macdData.macd[macdData.macd.length - 1] ?? 0;
  const latestSignal = macdData.signal[macdData.signal.length - 1] ?? 0;
  const latestHist = macdData.histogram[macdData.histogram.length - 1] ?? 0;
  const prevHist = macdData.histogram.length > 1 ? macdData.histogram[macdData.histogram.length - 2] ?? 0 : 0;

  let macdTrend: TechnicalIndicatorSnapshot["macd"]["trend"] = "NEUTRAL";
  if (latestMacd > latestSignal && latestHist > prevHist) macdTrend = "BULLISH_EXPANDING";
  else if (latestMacd > latestSignal) macdTrend = "BULLISH_CROSS";
  else if (latestMacd < latestSignal && latestHist < prevHist) macdTrend = "BEARISH_EXPANDING";
  else if (latestMacd < latestSignal) macdTrend = "BEARISH_CROSS";

  const bbUpper = bbData.upper[bbData.upper.length - 1] ?? currentPrice * 1.05;
  const bbMiddle = bbData.middle[bbData.middle.length - 1] ?? currentPrice;
  const bbLower = bbData.lower[bbData.lower.length - 1] ?? currentPrice * 0.95;
  const bbPercentB = bbData.percentB[bbData.percentB.length - 1] ?? 0.5;
  const bbBandwidth = bbData.bandwidth[bbData.bandwidth.length - 1] ?? 10;
  const isSqueeze = bbBandwidth < 8;

  const atr14 = atrSeries[atrSeries.length - 1] ?? currentPrice * 0.02;
  const adx14 = adxSeries[adxSeries.length - 1] ?? 22;

  // 52-week High/Low calculations
  const allHighs = candles.map((c) => c.high);
  const allLows = candles.map((c) => c.low);
  const high52w = Math.max(...allHighs);
  const low52w = Math.min(...allLows);
  const distFrom52wHigh = high52w > 0 ? Number((((high52w - currentPrice) / high52w) * 100).toFixed(2)) : 0;
  const distFrom52wLow = low52w > 0 ? Number((((currentPrice - low52w) / low52w) * 100).toFixed(2)) : 0;

  // Volume Analysis
  const volSlice = candles.slice(-20).map((c) => c.volume || 1);
  const avgVol20 = volSlice.reduce((a, b) => a + b, 0) / volSlice.length;
  const curVol = currentCandle.volume || avgVol20;
  const volumeRatio = avgVol20 > 0 ? Number((curVol / avgVol20).toFixed(2)) : 1.0;

  const snapshot: TechnicalIndicatorSnapshot = {
    price: currentPrice,
    change,
    changePercentage: changePct,
    sma20,
    sma50,
    sma200,
    ema9,
    ema21,
    rsi14,
    macd: {
      macd: latestMacd,
      signal: latestSignal,
      histogram: latestHist,
      trend: macdTrend,
    },
    bollingerBands: {
      upper: bbUpper,
      middle: bbMiddle,
      lower: bbLower,
      percentB: bbPercentB,
      bandwidth: bbBandwidth,
      isSqueeze,
    },
    atr14,
    adx14,
    supportLevel: support,
    resistanceLevel: resistance,
    distanceFrom52wHighPct: distFrom52wHigh,
    distanceFrom52wLowPct: distFrom52wLow,
    volume20Avg: Math.round(avgVol20),
    currentVolume: curVol,
    volumeRatio,
  };

  // Deterministic Multi-Factor Scoring (0 to 10 scale)
  let trendScore = 5.0;
  if (currentPrice > sma20 && sma20 > sma50) trendScore = 9.5;
  else if (currentPrice > sma20) trendScore = 7.5;
  else if (currentPrice < sma20 && sma20 < sma50) trendScore = 2.0;
  else if (currentPrice < sma20) trendScore = 3.5;

  let momentumScore = 5.0;
  if (rsi14 >= 55 && rsi14 <= 70 && latestMacd > latestSignal) momentumScore = 9.0;
  else if (rsi14 >= 50 && rsi14 <= 75) momentumScore = 7.5;
  else if (rsi14 < 30) momentumScore = 6.0; // Oversold potential bounce
  else if (rsi14 > 80) momentumScore = 4.0; // Extremely overbought
  else if (latestMacd < latestSignal) momentumScore = 3.0;

  let volumeScore = 5.0;
  if (volumeRatio >= 2.0 && changePct > 0) volumeScore = 9.5;
  else if (volumeRatio >= 1.3 && changePct > 0) volumeScore = 8.0;
  else if (volumeRatio >= 1.0) volumeScore = 6.0;
  else volumeScore = 4.0;

  let breakoutScore = 5.0;
  if (distFrom52wHigh <= 3.0 && currentPrice >= resistance * 0.99) breakoutScore = 9.5;
  else if (distFrom52wHigh <= 7.0) breakoutScore = 8.0;
  else if (currentPrice > resistance) breakoutScore = 8.5;
  else breakoutScore = 4.5;

  let relativeStrengthScore = 5.0;
  const { returnPercentage: threeMonthReturn } = calculateReturns(candles, Math.max(0, candles.length - 63));
  if (threeMonthReturn >= 25) relativeStrengthScore = 9.5;
  else if (threeMonthReturn >= 12) relativeStrengthScore = 8.0;
  else if (threeMonthReturn >= 0) relativeStrengthScore = 6.0;
  else relativeStrengthScore = 3.0;

  let volatilityScore = 6.0;
  const atrPct = (atr14 / currentPrice) * 100;
  if (atrPct <= 2.5 && !isSqueeze) volatilityScore = 8.5;
  else if (atrPct <= 4.0) volatilityScore = 6.5;
  else volatilityScore = 4.5;

  const weights = {
    trend: 0.25,
    momentum: 0.20,
    volume: 0.15,
    breakout: 0.15,
    relativeStrength: 0.15,
    volatility: 0.10,
  };

  const totalScore = Number(
    (
      trendScore * weights.trend +
      momentumScore * weights.momentum +
      volumeScore * weights.volume +
      breakoutScore * weights.breakout +
      relativeStrengthScore * weights.relativeStrength +
      volatilityScore * weights.volatility
    ).toFixed(1)
  );

  const scoreBreakdown: TechnicalScoreBreakdown = {
    totalScore,
    trendScore,
    momentumScore,
    volumeScore,
    breakoutScore,
    relativeStrengthScore,
    volatilityScore,
    weights,
  };

  let signal: InstrumentAnalysis["signal"] = "NEUTRAL";
  if (totalScore >= 8.2) signal = "STRONG_BUY";
  else if (totalScore >= 6.8) signal = "BUY";
  else if (totalScore <= 3.2) signal = "STRONG_SELL";
  else if (totalScore <= 4.5) signal = "SELL";

  const strengths: string[] = [];
  const risks: string[] = [];

  if (currentPrice > sma20 && sma20 > sma50) strengths.push("Strong bullish trend (Price > SMA20 > SMA50)");
  if (rsi14 >= 50 && rsi14 <= 70) strengths.push(`Healthy momentum (RSI14 = ${rsi14})`);
  if (volumeRatio >= 1.4) strengths.push(`Above-average volume participation (${volumeRatio}x 20-day avg)`);
  if (distFrom52wHigh <= 5.0) strengths.push(`Trading near 52-week high (within ${distFrom52wHigh}%)`);
  if (latestMacd > latestSignal) strengths.push("MACD line above signal line");

  if (rsi14 >= 75) risks.push(`RSI indicates overbought conditions (${rsi14})`);
  if (currentPrice < sma50) risks.push("Price trading below 50-day SMA");
  if (currentPrice > sma20 * 1.08) risks.push("Price extended significantly above 20-day SMA");
  if (atrPct > 4.0) risks.push(`Elevated daily volatility (ATR = ${atr14} / ${atrPct.toFixed(1)}%)`);

  if (strengths.length === 0) strengths.push("Consolidating near baseline levels");
  if (risks.length === 0) risks.push("Maintain standard stop-loss discipline");

  const summary = `${symbol} scores ${totalScore}/10 (${signal.replace("_", " ")}). Price is ${
    currentPrice >= sma20 ? "above" : "below"
  } 20 SMA (₹${sma20}) with RSI at ${rsi14}. 20-day Volume ratio is ${volumeRatio}x.`;

  return {
    symbol,
    name,
    exchange,
    instrumentToken,
    indicators: snapshot,
    scoreBreakdown,
    signal,
    strengths,
    risks,
    summary,
  };
}

export function analyzeInstrument(symbol: string): InstrumentAnalysis {
  const cleanSymbol = symbol.trim().toUpperCase();
  const allStocks = getUniverseConstituents("NIFTY_500");
  const found = allStocks.find((s) => s.symbol === cleanSymbol);

  const basePrice = found?.basePrice || 1000.0;
  const name = found?.name || cleanSymbol;
  const exchange = found?.exchange || "NSE";
  const instrumentToken = found?.instrumentToken;

  const candles = generateSyntheticHistoricalCandles(cleanSymbol, basePrice, 120);
  return analyzeInstrumentCandles(cleanSymbol, candles, name, exchange, instrumentToken);
}
