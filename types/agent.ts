// TradePilot AI Agent Type Definitions

export type AgentMode = "RESEARCH" | "ALERT" | "CONFIRMATION" | "AUTO_EXECUTION";

export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export interface AgentActionStep {
  step: "PLANNING" | "SCANNING" | "CALCULATING" | "EVALUATING" | "ANALYZING" | "COMPLETE" | "ERROR";
  description: string;
  timestamp: number;
}

export interface ScanResultItem {
  rank: number;
  symbol: string;
  name: string;
  exchange: string;
  instrumentToken?: number;
  startPrice: number;
  currentPrice: number;
  returnPercentage: number;
  sma20: number;
  sma50: number;
  rsi14: number;
  volumeRatio: number;
  signalScore: number; // 0 to 10
  signalLabel: "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONG_BEARISH";
  reasons: string[];
  riskNotes: string[];
}

export interface ScanSummary {
  universe: string;
  universeTotalCount: number;
  scannedCount: number;
  successfulCount: number;
  periodLabel: string;
  startDate: string;
  endDate: string;
  filtersApplied: string[];
  items: ScanResultItem[];
}

export interface TechnicalIndicatorSnapshot {
  price: number;
  change: number;
  changePercentage: number;
  sma20: number;
  sma50: number;
  sma200?: number;
  ema9: number;
  ema21: number;
  rsi14: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    trend: "BULLISH_CROSS" | "BEARISH_CROSS" | "BULLISH_EXPANDING" | "BEARISH_EXPANDING" | "NEUTRAL";
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    percentB: number;
    bandwidth: number;
    isSqueeze: boolean;
  };
  atr14: number;
  adx14: number;
  supportLevel: number;
  resistanceLevel: number;
  distanceFrom52wHighPct: number;
  distanceFrom52wLowPct: number;
  volume20Avg: number;
  currentVolume: number;
  volumeRatio: number;
}

export interface TechnicalScoreBreakdown {
  totalScore: number; // 0 to 10
  trendScore: number; // 25% weight
  momentumScore: number; // 20% weight
  volumeScore: number; // 15% weight
  breakoutScore: number; // 15% weight
  relativeStrengthScore: number; // 15% weight
  volatilityScore: number; // 10% weight
  weights: {
    trend: number;
    momentum: number;
    volume: number;
    breakout: number;
    relativeStrength: number;
    volatility: number;
  };
}

export interface InstrumentAnalysis {
  symbol: string;
  name: string;
  exchange: string;
  instrumentToken?: number;
  indicators: TechnicalIndicatorSnapshot;
  scoreBreakdown: TechnicalScoreBreakdown;
  signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  strengths: string[];
  risks: string[];
  summary: string;
}

export interface PortfolioRiskItem {
  symbol: string;
  issue: "CONCENTRATION_RISK" | "BELOW_SMA50" | "DETERIORATING_MOMENTUM" | "UNDERPERFORMER" | "HIGH_DRAWDOWN";
  severity: "HIGH" | "MEDIUM" | "LOW";
  details: string;
  currentValue: number;
  portfolioWeightPct: number;
  pnl: number;
}

export interface PortfolioHealthReport {
  totalHoldingsValue: number;
  holdingCount: number;
  diversificationScore: number; // 0 to 10
  warnings: PortfolioRiskItem[];
  topPerformers: { symbol: string; pnl: number; returnPct: number }[];
  underPerformers: { symbol: string; pnl: number; returnPct: number }[];
  holdingsBelowSma50: string[];
  holdingsAboveSma50: string[];
  summary: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  mode: AgentMode;
  toolCalls?: ToolCall[];
  actionSteps?: AgentActionStep[];
  data?: {
    type: "SCAN_RESULTS" | "ANALYSIS_REPORT" | "PORTFOLIO_REPORT" | "PERMISSION_ERROR" | "GENERAL";
    scanSummary?: ScanSummary;
    analysis?: InstrumentAnalysis;
    portfolioReport?: PortfolioHealthReport;
    errorReason?: string;
  };
  timestamp: string;
}
