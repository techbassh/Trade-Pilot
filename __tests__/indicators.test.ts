import { describe, it, expect } from "vitest";
import {
  calculateSMA,
  calculateEMA,
  calculateWMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateADX,
  calculateVWAP,
  detectCrossover,
  calculateReturns,
} from "@/lib/agent/indicators";
import { CandleData } from "@/types/trading";

// Deterministic test fixture
const mockCandles: CandleData[] = [
  { time: "2026-01-01", open: 100, high: 105, low: 95, close: 102, volume: 1000 },
  { time: "2026-01-02", open: 102, high: 108, low: 101, close: 106, volume: 1200 },
  { time: "2026-01-03", open: 106, high: 110, low: 104, close: 108, volume: 1100 },
  { time: "2026-01-04", open: 108, high: 112, low: 105, close: 110, volume: 1500 },
  { time: "2026-01-05", open: 110, high: 115, low: 109, close: 114, volume: 1800 },
  { time: "2026-01-06", open: 114, high: 116, low: 111, close: 112, volume: 1300 },
  { time: "2026-01-07", open: 112, high: 118, low: 110, close: 116, volume: 1600 },
  { time: "2026-01-08", open: 116, high: 120, low: 114, close: 118, volume: 1900 },
  { time: "2026-01-09", open: 118, high: 122, low: 116, close: 120, volume: 2000 },
  { time: "2026-01-10", open: 120, high: 125, low: 118, close: 122, volume: 2200 },
  { time: "2026-01-11", open: 122, high: 126, low: 121, close: 124, volume: 2100 },
  { time: "2026-01-12", open: 124, high: 128, low: 122, close: 126, volume: 2300 },
  { time: "2026-01-13", open: 126, high: 130, low: 125, close: 128, volume: 2400 },
  { time: "2026-01-14", open: 128, high: 132, low: 127, close: 130, volume: 2500 },
  { time: "2026-01-15", open: 130, high: 134, low: 129, close: 132, volume: 2600 },
  { time: "2026-01-16", open: 132, high: 135, low: 128, close: 130, volume: 2400 },
  { time: "2026-01-17", open: 130, high: 132, low: 126, close: 128, volume: 2100 },
  { time: "2026-01-18", open: 128, high: 130, low: 124, close: 125, volume: 2000 },
  { time: "2026-01-19", open: 125, high: 128, low: 122, close: 124, volume: 1800 },
  { time: "2026-01-20", open: 124, high: 126, low: 120, close: 122, volume: 1600 },
];

describe("Deterministic Technical Indicator Engine", () => {
  it("calculates SMA correctly", () => {
    const sma5 = calculateSMA(mockCandles, 5);
    expect(sma5.length).toBe(mockCandles.length);
    expect(sma5[0]).toBeNull();
    expect(sma5[3]).toBeNull();

    // 5-period sum: (102 + 106 + 108 + 110 + 114) / 5 = 108.00
    expect(sma5[4]).toBe(108);
  });

  it("calculates EMA correctly", () => {
    const ema5 = calculateEMA(mockCandles, 5);
    expect(ema5.length).toBe(mockCandles.length);
    expect(ema5[4]).toBe(108); // First EMA equals SMA
    expect(ema5[5]).toBeGreaterThan(108);
  });

  it("calculates WMA with linear weights", () => {
    const wma3 = calculateWMA(mockCandles.slice(0, 3), 3);
    // (102*1 + 106*2 + 108*3) / (1+2+3) = (102 + 212 + 324) / 6 = 638 / 6 = 106.33
    expect(wma3[2]).toBe(106.33);
  });

  it("calculates RSI correctly", () => {
    const rsi14 = calculateRSI(mockCandles, 14);
    expect(rsi14.length).toBe(mockCandles.length);
    // Steady uptrend in first 15 candles produces RSI > 60
    expect(rsi14[14]).toBeGreaterThan(60);
  });

  it("calculates Bollinger Bands correctly", () => {
    const bb = calculateBollingerBands(mockCandles, 5, 2);
    expect(bb.upper.length).toBe(mockCandles.length);
    expect(bb.middle.length).toBe(mockCandles.length);
    expect(bb.lower.length).toBe(mockCandles.length);

    if (bb.upper[4] && bb.middle[4] && bb.lower[4]) {
      expect(bb.upper[4]).toBeGreaterThan(bb.middle[4]);
      expect(bb.middle[4]).toBeGreaterThan(bb.lower[4]);
    }
  });

  it("calculates ATR for volatility", () => {
    const atr = calculateATR(mockCandles, 5);
    expect(atr.length).toBe(mockCandles.length);
    expect(atr[4]).toBeGreaterThan(0);
  });

  it("detects moving average crossovers accurately", () => {
    const fastSeries = [null, null, 10, 12, 15, 18, 22];
    const slowSeries = [null, null, 14, 14, 15, 16, 17];

    const cross = detectCrossover(fastSeries, slowSeries, "CROSS_ABOVE", 5);
    expect(cross.hasCrossed).toBe(true);
    expect(cross.sessionIndexAgo).toBeDefined();
  });

  it("calculates percentage returns between date indices", () => {
    const { returnPercentage, startPrice, endPrice } = calculateReturns(mockCandles, 0, 4);
    // start: 102, end: 114 -> ((114 - 102) / 102) * 100 = 11.76%
    expect(startPrice).toBe(102);
    expect(endPrice).toBe(114);
    expect(returnPercentage).toBe(11.76);
  });
});
