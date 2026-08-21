// Strongly-Typed Tool Dispatcher for TradePilot AI Agent
import { ToolCall, ScanSummary, InstrumentAnalysis, PortfolioHealthReport } from "@/types/agent";
import { runUniverseScan, ScannerFilterOptions } from "./scanner";
import { analyzeInstrument } from "./analyzer";
import { analyzePortfolioHealth } from "./portfolio-ai";
import { assertToolAllowed } from "./permissions";
import { Holding, PositionsSummary } from "@/types/trading";

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
}

export async function executeAgentTool(
  toolCall: ToolCall,
  context?: {
    holdings?: Holding[];
    positions?: PositionsSummary | null;
  }
): Promise<ToolExecutionResult> {
  const { name, args } = toolCall;

  try {
    // Check permission rules before running any tool
    assertToolAllowed(name);

    switch (name) {
      case "scan_universe": {
        const scanOptions: ScannerFilterOptions = {
          universe: args.universe || "NIFTY_500",
          timeframeQuery: args.timeframe || args.timeframeQuery || "3 months",
          minReturnPct: args.minReturnPct,
          priceAboveSma20: args.priceAboveSma20,
          priceAboveSma50: args.priceAboveSma50,
          sma20AboveSma50: args.sma20AboveSma50,
          sma20CrossoverAboveSma50Lookback: args.sma20CrossoverAboveSma50Lookback,
          minRsi: args.minRsi,
          maxRsi: args.maxRsi,
          minVolumeRatio: args.minVolumeRatio,
          within52wHighPct: args.within52wHighPct,
          breakout20DayHigh: args.breakout20DayHigh,
          limit: args.limit || 10,
          sortBy: args.sortBy || "return",
        };
        const result: ScanSummary = runUniverseScan(scanOptions);
        return { toolName: name, success: true, data: result };
      }

      case "analyze_instrument": {
        const symbol = String(args.symbol || "RELIANCE").toUpperCase();
        const result: InstrumentAnalysis = analyzeInstrument(symbol);
        return { toolName: name, success: true, data: result };
      }

      case "find_crossovers": {
        const result = runUniverseScan({
          universe: args.universe || "NIFTY_500",
          sma20CrossoverAboveSma50Lookback: args.lookback || 5,
          sma20AboveSma50: true,
          limit: args.limit || 10,
          sortBy: "score",
        });
        return { toolName: name, success: true, data: result };
      }

      case "find_rsi_setups": {
        const minRsi = args.minRsi;
        const maxRsi = args.maxRsi ?? 35;
        const result = runUniverseScan({
          universe: args.universe || "NIFTY_500",
          minRsi,
          maxRsi,
          limit: args.limit || 10,
          sortBy: "rsi",
        });
        return { toolName: name, success: true, data: result };
      }

      case "find_breakouts": {
        const result = runUniverseScan({
          universe: args.universe || "NIFTY_500",
          within52wHighPct: args.within52wHighPct || 5.0,
          minVolumeRatio: args.minVolumeRatio || 1.3,
          breakout20DayHigh: true,
          limit: args.limit || 10,
          sortBy: "volume",
        });
        return { toolName: name, success: true, data: result };
      }

      case "analyze_portfolio": {
        const holdings = context?.holdings || [];
        const positions = context?.positions;
        const result: PortfolioHealthReport = analyzePortfolioHealth(holdings, positions);
        return { toolName: name, success: true, data: result };
      }

      case "explain_setup": {
        const symbol = String(args.symbol || "RELIANCE").toUpperCase();
        const analysis = analyzeInstrument(symbol);
        return {
          toolName: name,
          success: true,
          data: {
            symbol: analysis.symbol,
            signal: analysis.signal,
            score: analysis.scoreBreakdown.totalScore,
            summary: analysis.summary,
            strengths: analysis.strengths,
            risks: analysis.risks,
            indicators: analysis.indicators,
          },
        };
      }

      default:
        return {
          toolName: name,
          success: false,
          error: `Unknown tool "${name}"`,
        };
    }
  } catch (err: any) {
    return {
      toolName: name,
      success: false,
      error: err.message || "Failed to execute agent tool",
    };
  }
}
