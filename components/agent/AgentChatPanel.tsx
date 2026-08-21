"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentMessage, ScanResultItem, InstrumentAnalysis, PortfolioHealthReport } from "@/types/agent";
import { formatINR, formatPercentage, getPnlColor } from "@/lib/utils/format";
import { ChartIframe } from "@/components/charts/ChartIframe";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Search,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface AgentChatPanelProps {
  onSelectInstrument?: (symbol: string, exchange?: "NSE" | "BSE") => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const QUICK_SUGGESTIONS = [
  "Scan NIFTY 500 top 10 performers (3 months)",
  "Find stocks that gained > 20% in 6 months & above 20/50 SMA",
  "Find stocks where SMA20 crossed above SMA50 in last 5 sessions",
  "Find stocks with RSI below 30",
  "Find stocks within 5% of 52-week high with high volume",
  "Analyze RELIANCE",
  "How is my portfolio doing?",
];

const INITIAL_GREETING: AgentMessage = {
  id: "greeting",
  role: "assistant",
  mode: "RESEARCH",
  content:
    "👋 Hello! I am your **TradePilot AI Copilot**.\n\nI can scan universes like NIFTY 500, calculate technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, ADX), evaluate moving-average crossovers, analyze setups, and audit your portfolio health.\n\n*Note: In Phase 1, I operate strictly in **RESEARCH MODE** (Read-Only / No Live Orders).*",
  timestamp: new Date().toISOString(),
};

export function AgentChatPanel({
  onSelectInstrument,
  isOpen = true,
  onClose,
}: AgentChatPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([INITIAL_GREETING]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chartInfo, setChartInfo] = useState<{ symbol: string; exchange?: "NSE" | "BSE" } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMessage: AgentMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      mode: "RESEARCH",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to get AI agent response");
      }

      setMessages((prev) => [...prev, json.data]);
    } catch (err: any) {
      const errorMessage: AgentMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        mode: "RESEARCH",
        content: `⚠️ Error: ${err.message || "Failed to process request."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleAnalyzeSymbol = (sym: string) => {
    handleSendMessage(`Analyze ${sym}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c121e] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0a0f18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">TradePilot Copilot</h3>
              <Badge variant="info" className="text-[9px] font-mono">RESEARCH MODE</Badge>
            </div>
            <span className="text-[10px] text-slate-400">Deterministic Market Scanner &amp; AI Analysis</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMessages([INITIAL_GREETING])}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close chat drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-cyan-500" /> Prompts:
        </span>
        {QUICK_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickChip(s)}
            disabled={isLoading}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-800/60 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[92%] rounded-xl p-3.5 space-y-3 ${
                msg.role === "user"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/40 rounded-tr-xs"
                  : "bg-[#0f172a]/95 border border-slate-800 text-slate-200 shadow-md shadow-black/40 rounded-tl-xs"
              }`}
            >
              {/* Text message content */}
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="whitespace-pre-line leading-relaxed text-xs">
                {msg.content}
              </ReactMarkdown>

              {/* Scan Results Table Payload */}
              {msg.data?.type === "SCAN_RESULTS" && msg.data.scanSummary && (
                <div className="mt-3 rounded-lg border border-slate-800 bg-[#090d16] overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0c121e] text-slate-400 font-sans">
                        <th className="py-2 px-2.5 text-center">#</th>
                        <th className="py-2 px-3">Symbol</th>
                        <th className="py-2 px-2.5 text-right">Start</th>
                        <th className="py-2 px-2.5 text-right">Current</th>
                        <th className="py-2 px-2.5 text-right">Return</th>
                        <th className="py-2 px-2.5 text-right">20 SMA</th>
                        <th className="py-2 px-2.5 text-right">50 SMA</th>
                        <th className="py-2 px-2 text-right">RSI</th>
                        <th className="py-2 px-2 text-right">Vol</th>
                        <th className="py-2 px-2.5 text-center">Score</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {msg.data.scanSummary.items.map((item: ScanResultItem) => (
                        <tr key={item.symbol} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="py-2 px-2.5 text-center font-bold text-slate-500">{item.rank}</td>
                          <td className="py-2 px-3 font-sans">
                            <span className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                              {item.symbol}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-right text-slate-400">{formatINR(item.startPrice)}</td>
                          <td className="py-2 px-2.5 text-right font-semibold text-slate-200">{formatINR(item.currentPrice)}</td>
                          <td className={`py-2 px-2.5 text-right font-bold ${getPnlColor(item.returnPercentage)}`}>
                            {item.returnPercentage > 0 ? "+" : ""}{item.returnPercentage}%
                          </td>
                          <td className="py-2 px-2.5 text-right text-slate-300">{formatINR(item.sma20)}</td>
                          <td className="py-2 px-2.5 text-right text-slate-300">{formatINR(item.sma50)}</td>
                          <td className="py-2 px-2 text-right text-slate-300 font-semibold">{item.rsi14}</td>
                          <td className="py-2 px-2 text-right text-slate-300">{item.volumeRatio}x</td>
                          <td className="py-2 px-2.5 text-center font-sans">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                              {item.signalScore}/10
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  onSelectInstrument && onSelectInstrument(item.symbol, item.exchange as "NSE" | "BSE");
                                  setChartInfo({ symbol: item.symbol, exchange: item.exchange as "NSE" | "BSE" });
                                }}
                                title="Open in Chart & Terminal"
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-[10px] transition-colors"
                              >
                                Chart
                              </button>
                              <button
                                onClick={() => handleAnalyzeSymbol(item.symbol)}
                                title="Deep dive analysis"
                                className="px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700 text-cyan-400 text-[10px] transition-colors"
                              >
                                Analyze
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Single Instrument Technical Analysis Breakdown Payload */}
              {msg.data?.type === "ANALYSIS_REPORT" && msg.data.analysis && (
                <div className="mt-3 p-3.5 rounded-xl border border-slate-800 bg-[#090d16] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{msg.data.analysis.symbol}</span>
                      <Badge variant="outline">{msg.data.analysis.exchange}</Badge>
                      <Badge variant={msg.data.analysis.signal.includes("BUY") ? "success" : "neutral"}>
                        {msg.data.analysis.signal}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Signal Score: </span>
                      <span className="text-sm font-mono font-bold text-cyan-400">{msg.data.analysis.scoreBreakdown.totalScore}/10</span>
                    </div>
                  </div>

                  {/* Indicator Metric Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">Current Price</div>
                      <div className="font-bold text-slate-200">{formatINR(msg.data.analysis.indicators.price)}</div>
                    </div>
                    {chartInfo && (
                      <div className="mt-4">
                        <ChartIframe symbol={chartInfo.symbol} exchange={chartInfo.exchange} />
                      </div>
                    )}
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">20 SMA</div>
                      <div className="font-semibold text-slate-300">{formatINR(msg.data.analysis.indicators.sma20)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">50 SMA</div>
                      <div className="font-semibold text-slate-300">{formatINR(msg.data.analysis.indicators.sma50)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">RSI (14)</div>
                      <div className="font-semibold text-slate-300">{msg.data.analysis.indicators.rsi14}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">MACD Trend</div>
                      <div className="font-semibold text-cyan-400 text-[10px]">{msg.data.analysis.indicators.macd.trend}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">Volume 20-Avg</div>
                      <div className="font-semibold text-slate-300">{msg.data.analysis.indicators.volumeRatio}x</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">52W High Dist</div>
                      <div className="font-semibold text-slate-300">{msg.data.analysis.indicators.distanceFrom52wHighPct}%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-sans">Support / Resist</div>
                      <div className="font-semibold text-slate-300">₹{msg.data.analysis.indicators.supportLevel} / ₹{msg.data.analysis.indicators.resistanceLevel}</div>
                    </div>
                  </div>

                  {/* Action */}
                  {onSelectInstrument && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onSelectInstrument(msg.data!.analysis!.symbol, msg.data!.analysis!.exchange as "NSE" | "BSE")
                      }
                      className="w-full text-xs text-cyan-400 hover:text-cyan-300 py-1.5 mt-2 border-slate-700"
                    >
                      <span>Load {msg.data.analysis.symbol} on Terminal &amp; Chart</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  )}
                </div>
              )}

              {/* Portfolio Health Report Payload */}
              {msg.data?.type === "PORTFOLIO_REPORT" && msg.data.portfolioReport && (
                <div className="mt-3 p-3.5 rounded-xl border border-slate-800 bg-[#090d16] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-200">
                      Holdings Audit ({msg.data.portfolioReport.holdingCount} stocks)
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">
                      Diversification: {msg.data.portfolioReport.diversificationScore}/10
                    </span>
                  </div>
                  {msg.data.portfolioReport.warnings.map((w: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold">{w.symbol}: </span>
                        <span>{w.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-cyan-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-xl p-3.5 bg-[#0f172a] border border-slate-800 text-slate-300 flex items-center gap-2.5 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning universe &amp; calculating indicators deterministically...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#0a0f18] border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1">
            <Input
              prefix={<Search className="w-3.5 h-3.5 text-slate-500" />}
              placeholder="Ask Copilot e.g. 'Top Nifty 500 performers over 3 months' or 'Analyze RELIANCE'..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="text-xs py-2 bg-[#060911]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2 shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500" 
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Deterministic math &amp; Zero live execution in Phase 1
          </span>
          <span className="font-mono">RESEARCH MODE</span>
        </div>
      </div>
    </div>
  );
}
