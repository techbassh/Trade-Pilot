// Deterministic Technical Indicator Engine for TradePilot
import { CandleData } from "@/types/trading";

export interface PricePoint {
  time: string | number;
  value: number;
}

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(candles: CandleData[], period: number): (number | null)[] {
  if (!candles || candles.length === 0 || period <= 0) return [];
  const result: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push(Number((sum / period).toFixed(2)));
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: CandleData[], period: number): (number | null)[] {
  if (!candles || candles.length === 0 || period <= 0) return [];
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);

  let prevEma: number | null = null;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      // First EMA is the simple average of the first `period` candles
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[j].close;
      }
      prevEma = sum / period;
      result.push(Number(prevEma.toFixed(2)));
      continue;
    }

    const currentEma: number = candles[i].close * k + (prevEma as number) * (1 - k);
    prevEma = currentEma;
    result.push(Number(currentEma.toFixed(2)));
  }

  return result;
}

/**
 * Weighted Moving Average (WMA)
 */
export function calculateWMA(candles: CandleData[], period: number): (number | null)[] {
  if (!candles || candles.length === 0 || period <= 0) return [];
  const result: (number | null)[] = [];
  const denominator = (period * (period + 1)) / 2;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    let numerator = 0;
    let weight = 1;
    for (let j = i - period + 1; j <= i; j++) {
      numerator += candles[j].close * weight;
      weight++;
    }
    result.push(Number((numerator / denominator).toFixed(2)));
  }

  return result;
}

/**
 * Relative Strength Index (RSI) using Wilder's Smoothing
 */
export function calculateRSI(candles: CandleData[], period = 14): (number | null)[] {
  if (!candles || candles.length <= period) {
    return Array(candles.length).fill(null);
  }

  const result: (number | null)[] = [null]; // First candle has no diff
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value at index `period`
  for (let i = 1; i < period; i++) {
    result.push(null);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  result.push(Number(rsi.toFixed(2)));

  // Wilder's smoothing for subsequent candles
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    result.push(Number(rsi.toFixed(2)));
  }

  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 */
export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  candles: CandleData[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(Number(((fastEMA[i] as number) - (slowEMA[i] as number)).toFixed(2)));
    }
  }

  // Calculate Signal line (EMA of MACD line)
  const validMacdIndices = macdLine.map((val, idx) => ({ val, idx })).filter((x) => x.val !== null);
  const signalLine: (number | null)[] = Array(candles.length).fill(null);
  const histogram: (number | null)[] = Array(candles.length).fill(null);

  if (validMacdIndices.length >= signalPeriod) {
    const k = 2 / (signalPeriod + 1);
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) {
      sum += validMacdIndices[i].val as number;
    }
    let prevSignal = sum / signalPeriod;
    const firstSignalIdx = validMacdIndices[signalPeriod - 1].idx;
    signalLine[firstSignalIdx] = Number(prevSignal.toFixed(2));
    histogram[firstSignalIdx] = Number(((macdLine[firstSignalIdx] as number) - prevSignal).toFixed(2));

    for (let i = signalPeriod; i < validMacdIndices.length; i++) {
      const originalIdx = validMacdIndices[i].idx;
      const currentMacd = validMacdIndices[i].val as number;
      const currentSignal: number = currentMacd * k + prevSignal * (1 - k);
      prevSignal = currentSignal;

      signalLine[originalIdx] = Number(currentSignal.toFixed(2));
      histogram[originalIdx] = Number((currentMacd - currentSignal).toFixed(2));
    }
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram,
  };
}

/**
 * Bollinger Bands
 */
export interface BollingerBandsResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  percentB: (number | null)[];
  bandwidth: (number | null)[];
}

export function calculateBollingerBands(
  candles: CandleData[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBandsResult {
  const sma = calculateSMA(candles, period);
  const upper: (number | null)[] = [];
  const middle = sma;
  const lower: (number | null)[] = [];
  const percentB: (number | null)[] = [];
  const bandwidth: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
      percentB.push(null);
      bandwidth.push(null);
      continue;
    }

    const mean = sma[i] as number;
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSq += Math.pow(candles[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(sumSq / period);
    const u = Number((mean + stdDevMultiplier * stdDev).toFixed(2));
    const l = Number((mean - stdDevMultiplier * stdDev).toFixed(2));
    const bw = mean > 0 ? Number((((u - l) / mean) * 100).toFixed(2)) : 0;
    const pb = u !== l ? Number(((candles[i].close - l) / (u - l)).toFixed(2)) : 0.5;

    upper.push(u);
    lower.push(l);
    bandwidth.push(bw);
    percentB.push(pb);
  }

  return { upper, middle, lower, percentB, bandwidth };
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(candles: CandleData[], period = 14): (number | null)[] {
  if (!candles || candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    tr.push(Math.max(tr1, tr2, tr3));
  }

  const result: (number | null)[] = [];
  let prevAtr = 0;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += tr[j];
      prevAtr = sum / period;
      result.push(Number(prevAtr.toFixed(2)));
      continue;
    }

    const currentAtr = (prevAtr * (period - 1) + tr[i]) / period;
    prevAtr = currentAtr;
    result.push(Number(currentAtr.toFixed(2)));
  }

  return result;
}

/**
 * Average Directional Index (ADX)
 */
export function calculateADX(candles: CandleData[], period = 14): (number | null)[] {
  if (!candles || candles.length < period * 2) {
    return Array(candles.length).fill(null);
  }

  const plusDM: number[] = [0];
  const minusDM: number[] = [0];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const highDiff = candles[i].high - candles[i - 1].high;
    const lowDiff = candles[i - 1].low - candles[i].low;

    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

    const trVal = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    tr.push(trVal);
  }

  // Smooth TR, +DM, -DM
  const smoothedTR: number[] = [];
  const smoothedPlusDM: number[] = [];
  const smoothedMinusDM: number[] = [];

  let trSum = 0, pDmSum = 0, mDmSum = 0;
  for (let i = 0; i < period; i++) {
    trSum += tr[i];
    pDmSum += plusDM[i];
    mDmSum += minusDM[i];
  }

  smoothedTR.push(trSum);
  smoothedPlusDM.push(pDmSum);
  smoothedMinusDM.push(mDmSum);

  const dx: (number | null)[] = Array(period - 1).fill(null);
  const pDi = (pDmSum / trSum) * 100;
  const mDi = (mDmSum / trSum) * 100;
  const firstDx = pDi + mDi > 0 ? (Math.abs(pDi - mDi) / (pDi + mDi)) * 100 : 0;
  dx.push(firstDx);

  for (let i = period; i < candles.length; i++) {
    const sTr = smoothedTR[smoothedTR.length - 1] - smoothedTR[smoothedTR.length - 1] / period + tr[i];
    const sPdm = smoothedPlusDM[smoothedPlusDM.length - 1] - smoothedPlusDM[smoothedPlusDM.length - 1] / period + plusDM[i];
    const sMdm = smoothedMinusDM[smoothedMinusDM.length - 1] - smoothedMinusDM[smoothedMinusDM.length - 1] / period + minusDM[i];

    smoothedTR.push(sTr);
    smoothedPlusDM.push(sPdm);
    smoothedMinusDM.push(sMdm);

    const curPdi = (sPdm / sTr) * 100;
    const curMdi = (sMdm / sTr) * 100;
    const curDx = curPdi + curMdi > 0 ? (Math.abs(curPdi - curMdi) / (curPdi + curMdi)) * 100 : 0;
    dx.push(curDx);
  }

  // Calculate ADX (SMA of DX)
  const adxResult: (number | null)[] = Array(candles.length).fill(null);
  let dxSum = 0;
  let count = 0;

  for (let i = 0; i < dx.length; i++) {
    if (dx[i] !== null) {
      dxSum += dx[i] as number;
      count++;
      if (count === period) {
        let adx = dxSum / period;
        adxResult[i] = Number(adx.toFixed(2));
        for (let j = i + 1; j < dx.length; j++) {
          adx = (adx * (period - 1) + (dx[j] as number)) / period;
          adxResult[j] = Number(adx.toFixed(2));
        }
        break;
      }
    }
  }

  return adxResult;
}

/**
 * Volume Weighted Average Price (VWAP)
 */
export function calculateVWAP(candles: CandleData[]): (number | null)[] {
  if (!candles || candles.length === 0) return [];
  const result: (number | null)[] = [];

  let cumulativePriceVolume = 0;
  let cumulativeVolume = 0;

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume || 1;
    cumulativePriceVolume += typicalPrice * vol;
    cumulativeVolume += vol;

    const vwap = cumulativeVolume > 0 ? cumulativePriceVolume / cumulativeVolume : typicalPrice;
    result.push(Number(vwap.toFixed(2)));
  }

  return result;
}

/**
 * Moving average crossover detection
 * Checks if seriesA crossed ABOVE or BELOW seriesB within the last `lookback` candles
 */
export function detectCrossover(
  seriesA: (number | null)[],
  seriesB: (number | null)[],
  direction: "CROSS_ABOVE" | "CROSS_BELOW" = "CROSS_ABOVE",
  lookback = 5
): { hasCrossed: boolean; sessionIndexAgo?: number } {
  if (!seriesA || !seriesB || seriesA.length === 0 || seriesB.length === 0) {
    return { hasCrossed: false };
  }

  const len = Math.min(seriesA.length, seriesB.length);
  if (len < 2) return { hasCrossed: false };

  const currentA = seriesA[len - 1];
  const currentB = seriesB[len - 1];

  if (currentA === null || currentB === null) return { hasCrossed: false };

  // For CROSS_ABOVE: currentA > currentB and previously seriesA <= seriesB
  // For CROSS_BELOW: currentA < currentB and previously seriesA >= seriesB
  const isCurrentlyInDirection = direction === "CROSS_ABOVE" ? currentA > currentB : currentA < currentB;

  if (!isCurrentlyInDirection) {
    return { hasCrossed: false };
  }

  const maxLookback = Math.min(lookback, len - 1);
  for (let k = 1; k <= maxLookback; k++) {
    const prevA = seriesA[len - 1 - k];
    const prevB = seriesB[len - 1 - k];

    if (prevA !== null && prevB !== null) {
      if (direction === "CROSS_ABOVE" && prevA <= prevB) {
        return { hasCrossed: true, sessionIndexAgo: k };
      }
      if (direction === "CROSS_BELOW" && prevA >= prevB) {
        return { hasCrossed: true, sessionIndexAgo: k };
      }
    }
  }

  return { hasCrossed: false };
}

/**
 * Support & Resistance Levels (Pivot Highs/Lows)
 */
export function calculateSupportResistance(
  candles: CandleData[],
  lookback = 20
): { support: number; resistance: number } {
  if (!candles || candles.length === 0) return { support: 0, resistance: 0 };
  const slice = candles.slice(-Math.min(lookback, candles.length));

  const resistance = Math.max(...slice.map((c) => c.high));
  const support = Math.min(...slice.map((c) => c.low));

  return {
    support: Number(support.toFixed(2)),
    resistance: Number(resistance.toFixed(2)),
  };
}

/**
 * Percentage Return Calculation
 */
export function calculateReturns(
  candles: CandleData[],
  startIndex = 0,
  endIndex?: number
): { returnPercentage: number; startPrice: number; endPrice: number } {
  if (!candles || candles.length === 0) {
    return { returnPercentage: 0, startPrice: 0, endPrice: 0 };
  }

  const validStart = Math.max(0, Math.min(startIndex, candles.length - 1));
  const validEnd = endIndex !== undefined ? Math.min(endIndex, candles.length - 1) : candles.length - 1;

  const startPrice = candles[validStart].close;
  const endPrice = candles[validEnd].close;

  const returnPercentage = startPrice > 0 ? Number((((endPrice - startPrice) / startPrice) * 100).toFixed(2)) : 0;

  return { returnPercentage, startPrice, endPrice };
}
