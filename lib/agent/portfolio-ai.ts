// Portfolio-Aware Analytical Engine for TradePilot AI Agent
import { Holding, PositionsSummary } from "@/types/trading";
import { PortfolioHealthReport, PortfolioRiskItem } from "@/types/agent";
import { analyzeInstrument } from "./analyzer";
import { formatINR, formatPercentage } from "@/lib/utils/format";

export function analyzePortfolioHealth(
  holdings: Holding[],
  positions?: PositionsSummary | null
): PortfolioHealthReport {
  if (!holdings || holdings.length === 0) {
    return {
      totalHoldingsValue: 0,
      holdingCount: 0,
      diversificationScore: 10,
      warnings: [],
      topPerformers: [],
      underPerformers: [],
      holdingsBelowSma50: [],
      holdingsAboveSma50: [],
      summary: "Your portfolio is currently empty. Connect holdings to get AI portfolio health analysis.",
    };
  }

  const totalHoldingsValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const warnings: PortfolioRiskItem[] = [];
  const holdingsBelowSma50: string[] = [];
  const holdingsAboveSma50: string[] = [];

  // Sort by P&L Percentage
  const sortedHoldings = [...holdings].sort((a, b) => b.pnlPercentage - a.pnlPercentage);
  const topPerformers = sortedHoldings.slice(0, 3).map((h) => ({
    symbol: h.symbol,
    pnl: h.pnl,
    returnPct: Number(h.pnlPercentage.toFixed(2)),
  }));

  const underPerformers = sortedHoldings
    .filter((h) => h.pnlPercentage < 0)
    .slice(-3)
    .reverse()
    .map((h) => ({
      symbol: h.symbol,
      pnl: h.pnl,
      returnPct: Number(h.pnlPercentage.toFixed(2)),
    }));

  // Analyze each holding for concentration, SMA50 status, and momentum
  for (const h of holdings) {
    const weightPct = totalHoldingsValue > 0 ? (h.currentValue / totalHoldingsValue) * 100 : 0;

    // 1. Concentration Risk (> 25% in single stock)
    if (weightPct >= 25 && holdings.length > 2) {
      warnings.push({
        symbol: h.symbol,
        issue: "CONCENTRATION_RISK",
        severity: "HIGH",
        details: `High concentration: ${h.symbol} accounts for ${weightPct.toFixed(1)}% of your total holdings.`,
        currentValue: h.currentValue,
        portfolioWeightPct: weightPct,
        pnl: h.pnl,
      });
    } else if (weightPct >= 18 && holdings.length > 4) {
      warnings.push({
        symbol: h.symbol,
        issue: "CONCENTRATION_RISK",
        severity: "MEDIUM",
        details: `${h.symbol} represents ${weightPct.toFixed(1)}% of total portfolio value.`,
        currentValue: h.currentValue,
        portfolioWeightPct: weightPct,
        pnl: h.pnl,
      });
    }

    // 2. Technical status & SMA50 check
    try {
      const analysis = analyzeInstrument(h.symbol);
      const isBelow50 = analysis.indicators.price < analysis.indicators.sma50;

      if (isBelow50) {
        holdingsBelowSma50.push(h.symbol);
        warnings.push({
          symbol: h.symbol,
          issue: "BELOW_SMA50",
          severity: "MEDIUM",
          details: `${h.symbol} has dropped below its 50-day SMA (₹${analysis.indicators.sma50}), indicating softening medium-term trend.`,
          currentValue: h.currentValue,
          portfolioWeightPct: weightPct,
          pnl: h.pnl,
        });
      } else {
        holdingsAboveSma50.push(h.symbol);
      }

      // 3. Momentum deterioration check (RSI < 40 or negative MACD trend)
      if (analysis.indicators.rsi14 < 38) {
        warnings.push({
          symbol: h.symbol,
          issue: "DETERIORATING_MOMENTUM",
          severity: "LOW",
          details: `RSI14 for ${h.symbol} is at ${analysis.indicators.rsi14}, showing weak momentum.`,
          currentValue: h.currentValue,
          portfolioWeightPct: weightPct,
          pnl: h.pnl,
        });
      }
    } catch {
      holdingsAboveSma50.push(h.symbol);
    }
  }

  // Calculate diversification score
  let divScore = 10;
  if (holdings.length < 3) divScore -= 4;
  else if (holdings.length < 5) divScore -= 2;

  const maxWeight = Math.max(...holdings.map((h) => (totalHoldingsValue > 0 ? (h.currentValue / totalHoldingsValue) * 100 : 0)));
  if (maxWeight > 40) divScore -= 3;
  else if (maxWeight > 25) divScore -= 1.5;

  if (warnings.filter((w) => w.severity === "HIGH").length > 0) divScore -= 1.5;
  const diversificationScore = Math.max(1, Math.min(10, Number(divScore.toFixed(1))));

  const summary = `Portfolio of ${holdings.length} stocks valued at ${formatINR(totalHoldingsValue)}. Diversification score: ${diversificationScore}/10. ${
    holdingsBelowSma50.length > 0
      ? `${holdingsBelowSma50.length} holding(s) (${holdingsBelowSma50.join(", ")}) are trading below their 50-day SMA.`
      : "All holdings are trading above their 50-day SMA."
  }`;

  return {
    totalHoldingsValue,
    holdingCount: holdings.length,
    diversificationScore,
    warnings,
    topPerformers,
    underPerformers,
    holdingsBelowSma50,
    holdingsAboveSma50,
    summary,
  };
}
