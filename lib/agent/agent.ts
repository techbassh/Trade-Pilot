// Main Orchestrator for TradePilot AI Agent (Phase 1)
import { AgentMessage, AgentMode, AgentActionStep, ToolCall } from "@/types/agent";
import { executeAgentTool, ToolExecutionResult } from "./tools";
import { planIntentWithGemini, synthesizeResponseWithGemini } from "./gemini";
import { Holding, PositionsSummary } from "@/types/trading";
import { formatINR, formatPercentage } from "@/lib/utils/format";

export interface ProcessAgentQueryOptions {
  message: string;
  history?: AgentMessage[];
  holdings?: Holding[];
  positions?: PositionsSummary | null;
  mode?: AgentMode;
}

function buildScanFallback(toolCall: ToolCall, scan: any): string {
  const topCount = scan.items.length;
  let text = `I scanned **${scan.universeTotalCount}** eligible instruments in **${scan.universe.replace(/_/g, " ")}** over **${scan.periodLabel}** (${scan.startDate} → ${scan.endDate}).\n\n`;
  if (topCount === 0) {
    text += `No instruments currently match all requested conditions. Try widening your criteria or timeframe.`;
  } else {
    text += `Found **${topCount}** matching candidates ranked by ${toolCall.args.sortBy || "performance"}:`;
  }
  return text;
}

function buildAnalysisFallback(analysis: any): string {
  const ind = analysis.indicators || analysis;
  return (
    `### Technical Analysis: ${analysis.symbol}\n` +
    `**Signal Score**: **${analysis.scoreBreakdown?.totalScore || analysis.score}/10** (${(analysis.signal || "NEUTRAL").replace(/_/g, " ")})\n\n` +
    `**Key Observations**:\n` +
    analysis.strengths.map((s: string) => `• ✅ ${s}`).join("\n") +
    "\n\n" +
    `**Risk Factors**:\n` +
    analysis.risks.map((r: string) => `• ⚠️ ${r}`).join("\n") +
    "\n\n" +
    `*Price: ₹${ind.price} | 20 SMA: ₹${ind.sma20} | 50 SMA: ₹${ind.sma50} | RSI: ${ind.rsi14} | Vol Ratio: ${ind.volumeRatio}x*`
  );
}

function buildPortfolioFallback(report: any): string {
  let text =
    `### Portfolio Health Overview\n` +
    `**Total Value**: ${formatINR(report.totalHoldingsValue)} across **${report.holdingCount}** holdings.\n` +
    `**Diversification Score**: **${report.diversificationScore}/10**\n\n`;

  if (report.warnings.length > 0) {
    text +=
      `**Risk Warnings & Moving Average Alerts**:\n` +
      report.warnings.map((w: any) => `• ⚠️ **${w.symbol}**: ${w.details}`).join("\n") +
      "\n\n";
  } else {
    text += `✅ All holdings are maintaining healthy technical posture above their 50-day SMA.\n\n`;
  }

  if (report.topPerformers.length > 0) {
    text +=
      `**Top Performers**: ` +
      report.topPerformers.map((p: any) => `${p.symbol} (${formatPercentage(p.returnPct)})`).join(", ") +
      "\n";
  }
  return text;
}

export async function processAgentMessage(
  options: ProcessAgentQueryOptions
): Promise<AgentMessage> {
  const { message, history = [], holdings = [], positions, mode = "RESEARCH" } = options;
  const steps: AgentActionStep[] = [];

  const addStep = (step: AgentActionStep["step"], description: string) => {
    steps.push({ step, description, timestamp: Date.now() });
  };

  addStep("PLANNING", `Analyzing query with Gemini: "${message}"`);

  const plan = await planIntentWithGemini(message, history);
  if (plan.usedGemini) {
    addStep("PLANNING", "Gemini mapped query to research intent.");
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (!plan.toolCall && plan.directResponse) {
    addStep("COMPLETE", "Gemini answered directly (no tool required).");
    return {
      id: messageId,
      role: "assistant",
      mode,
      actionSteps: steps,
      content: plan.directResponse,
      data: { type: "GENERAL" },
      timestamp: new Date().toISOString(),
    };
  }

  const toolCall = plan.toolCall!;
  addStep("CALCULATING", `Executing deterministic tool: ${toolCall.name}`);

  const executionResult: ToolExecutionResult = await executeAgentTool(toolCall, {
    holdings,
    positions,
  });

  if (!executionResult.success) {
    addStep("ERROR", executionResult.error || "Permission or execution error");
    return {
      id: messageId,
      role: "assistant",
      mode,
      toolCalls: [toolCall],
      actionSteps: steps,
      content: `⚠️ **Action Prohibited in ${mode} Mode**\n\n${executionResult.error}\n\n*TradePilot operates in read-only analysis and scanner mode during Phase 1 to guarantee absolute capital safety.*`,
      data: {
        type: "PERMISSION_ERROR",
        errorReason: executionResult.error,
      },
      timestamp: new Date().toISOString(),
    };
  }

  addStep("EVALUATING", "Synthesizing response with Gemini from tool results.");

  if (
    toolCall.name === "scan_universe" ||
    toolCall.name === "find_crossovers" ||
    toolCall.name === "find_rsi_setups" ||
    toolCall.name === "find_breakouts"
  ) {
    const scan = executionResult.data;
    const fallback = buildScanFallback(toolCall, scan);
    const { content } = await synthesizeResponseWithGemini({
      userMessage: message,
      toolCall,
      toolResult: scan,
      fallbackContent: fallback,
    });

    addStep("COMPLETE", `Generated ${scan.items.length} scan results.`);

    return {
      id: messageId,
      role: "assistant",
      mode,
      toolCalls: [toolCall],
      actionSteps: steps,
      content,
      data: { type: "SCAN_RESULTS", scanSummary: scan },
      timestamp: new Date().toISOString(),
    };
  }

  if (toolCall.name === "analyze_instrument" || toolCall.name === "explain_setup") {
    const analysis = executionResult.data;
    const fallback = buildAnalysisFallback(analysis);
    const { content } = await synthesizeResponseWithGemini({
      userMessage: message,
      toolCall,
      toolResult: analysis,
      fallbackContent: fallback,
    });

    addStep("COMPLETE", `Completed technical scoring for ${analysis.symbol}.`);

    return {
      id: messageId,
      role: "assistant",
      mode,
      toolCalls: [toolCall],
      actionSteps: steps,
      content,
      data: { type: "ANALYSIS_REPORT", analysis },
      timestamp: new Date().toISOString(),
    };
  }

  if (toolCall.name === "analyze_portfolio") {
    const report = executionResult.data;
    const fallback = buildPortfolioFallback(report);
    const { content } = await synthesizeResponseWithGemini({
      userMessage: message,
      toolCall,
      toolResult: report,
      fallbackContent: fallback,
    });

    addStep("COMPLETE", "Portfolio health analysis complete.");

    return {
      id: messageId,
      role: "assistant",
      mode,
      toolCalls: [toolCall],
      actionSteps: steps,
      content,
      data: { type: "PORTFOLIO_REPORT", portfolioReport: report },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: messageId,
    role: "assistant",
    mode,
    toolCalls: [toolCall],
    actionSteps: steps,
    content: "I have processed your request.",
    data: { type: "GENERAL" },
    timestamp: new Date().toISOString(),
  };
}
