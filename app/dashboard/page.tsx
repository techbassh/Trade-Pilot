"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { PositionsTable } from "@/components/dashboard/PositionsTable";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { FundsCard } from "@/components/dashboard/FundsCard";
import { TradingChart } from "@/components/charts/TradingChart";
import { OrderPanel } from "@/components/trading/OrderPanel";
import { AgentChatPanel } from "@/components/agent/AgentChatPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SummaryCardSkeleton, TableSkeleton } from "@/components/ui/Loading";
import {
  UserProfile,
  Holding,
  PositionsSummary,
  Funds,
  Order,
  Quote,
  LiveStreamEvent,
} from "@/types/trading";
import { Bell, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

// Fallback instrument tokens for popular Indian equities in Kite
const POPULAR_TOKENS: Record<string, number> = {
  RELIANCE: 738561,
  TCS: 2953217,
  INFY: 408065,
  HDFCBANK: 341249,
  TATAMOTORS: 884737,
  ICICIBANK: 1270529,
  SBIN: 779521,
  ITC: 424961,
};

export default function DashboardPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "orders" | "copilot">("overview");

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(null);

  // Portfolio State
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<PositionsSummary | null>(null);
  const [funds, setFunds] = useState<Funds | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Selected Instrument for Chart & Order Panel
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [selectedExchange, setSelectedExchange] = useState<"NSE" | "BSE">("NSE");
  const [selectedToken, setSelectedToken] = useState<number>(738561);

  // Live quotes map keyed by symbol
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  // Loading & Network States
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial profile & data
  const loadInitialData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Profile
      const profRes = await fetch("/api/kite/profile");
      const profJson = await profRes.json();

      if (!profRes.ok || !profJson.success) {
        router.push("/login?error=KITE_AUTH_EXPIRED");
        return;
      }
      setUser(profJson.data);

      // 2. Fetch Portfolio Data concurrently
      const [holdingsRes, positionsRes, fundsRes, ordersRes] = await Promise.all([
        fetch("/api/kite/holdings").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
        fetch("/api/kite/positions").then((r) => r.json()).catch(() => ({ success: false, data: null })),
        fetch("/api/kite/funds").then((r) => r.json()).catch(() => ({ success: false, data: null })),
        fetch("/api/kite/orders").then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (holdingsRes.success) setHoldings(holdingsRes.data || []);
      if (positionsRes.success) setPositions(positionsRes.data || null);
      if (fundsRes.success) setFunds(fundsRes.data || null);
      if (ordersRes.success) setOrders(ordersRes.data || []);

      // 3. Fetch initial quotes for selected and popular symbols
      const symbolsToFetch = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS"];
      if (holdingsRes.data) {
        holdingsRes.data.forEach((h: Holding) => {
          if (!symbolsToFetch.includes(h.symbol)) symbolsToFetch.push(h.symbol);
        });
      }

      const quotesRes = await fetch(`/api/kite/quotes?symbols=${symbolsToFetch.join(",")}`)
        .then((r) => r.json())
        .catch(() => ({ success: false, data: {} }));

      if (quotesRes.success && quotesRes.data) {
        setQuotes(quotesRes.data);
      }
    } catch (error) {
      console.error("Failed to load initial trading cockpit data:", error);
    } finally {
      setIsLoadingInitial(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Establish SSE connection for real-time normalized ticks and order updates
  useEffect(() => {
    if (!user) return;

    // Collect all tokens to subscribe
    const tokens = new Set<number>();
    if (selectedToken) tokens.add(selectedToken);
    Object.values(POPULAR_TOKENS).forEach((t) => tokens.add(t));
    holdings.forEach((h) => {
      if (h.instrumentToken) tokens.add(h.instrumentToken);
    });

    const tokenQuery = Array.from(tokens).join(",");
    const sseUrl = `/api/kite/stream?tokens=${tokenQuery}`;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setIsSseConnected(true);
    });

    es.addEventListener("quote", (event: MessageEvent) => {
      try {
        const liveQuote = JSON.parse(event.data);
        if (liveQuote && liveQuote.instrumentToken) {
          // Update live quotes state
          setQuotes((prev) => {
            const sym = liveQuote.tradingsymbol || selectedSymbol;
            const existing = prev[sym] || {};
            return {
              ...prev,
              [sym]: {
                ...existing,
                instrumentToken: liveQuote.instrumentToken,
                tradingsymbol: sym,
                exchange: existing.exchange || "NSE",
                lastPrice: liveQuote.lastPrice,
                netChange: liveQuote.change ?? existing.netChange ?? 0,
                percentageChange: liveQuote.changePercent ?? existing.percentageChange ?? 0,
                averagePrice: existing.averagePrice || liveQuote.lastPrice,
                volume: liveQuote.volume ?? existing.volume ?? 0,
                ohlc: liveQuote.ohlc || existing.ohlc || { open: liveQuote.lastPrice, high: liveQuote.lastPrice, low: liveQuote.lastPrice, close: liveQuote.lastPrice },
                timestamp: new Date().toISOString(),
              },
            };
          });

          // Update LTP in holdings if matching
          setHoldings((prev) =>
            prev.map((h) => {
              if (h.instrumentToken === liveQuote.instrumentToken) {
                const newLtp = liveQuote.lastPrice;
                const newCurrent = h.quantity * newLtp;
                const newPnl = newCurrent - h.investedValue;
                const newPnlPct = h.investedValue > 0 ? (newPnl / h.investedValue) * 100 : 0;
                return {
                  ...h,
                  lastPrice: newLtp,
                  currentValue: newCurrent,
                  pnl: newPnl,
                  pnlPercentage: newPnlPct,
                };
              }
              return h;
            })
          );
        }
      } catch (err) {
        console.error("Error parsing live quote event:", err);
      }
    });

    es.addEventListener("order", (event: MessageEvent) => {
      try {
        const orderEvent = JSON.parse(event.data);
        if (orderEvent && orderEvent.orderId) {
          setOrderNotification(
            `Order update: ${orderEvent.tradingsymbol} status is now ${orderEvent.status}`
          );
          // Refresh orders and portfolio data
          loadInitialData();

          setTimeout(() => {
            setOrderNotification(null);
          }, 6000);
        }
      } catch (err) {
        console.error("Error parsing order update event:", err);
      }
    });

    es.onerror = () => {
      setIsSseConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [user, selectedToken, holdings.length, loadInitialData, selectedSymbol]);

  // Handler for selecting an instrument anywhere in the terminal
  const handleSelectInstrument = (symbol: string, exchange: "NSE" | "BSE" = "NSE", token?: number) => {
    setSelectedSymbol(symbol);
    setSelectedExchange(exchange);
    if (token) {
      setSelectedToken(token);
    } else if (POPULAR_TOKENS[symbol]) {
      setSelectedToken(POPULAR_TOKENS[symbol]);
    }
  };

  const handleOrderPlaced = (orderId: string) => {
    setOrderNotification(`Order #${orderId} submitted to Zerodha.`);
    loadInitialData();
    setTimeout(() => {
      setOrderNotification(null);
    }, 5000);
  };

  const currentQuote = quotes[selectedSymbol];
  const currentLtp = currentQuote?.lastPrice;
  const currentChange = currentQuote?.netChange;
  const currentChangePct = currentQuote?.percentageChange;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        user={user}
        isConnected={isSseConnected}
        onRefresh={loadInitialData}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Trading Cockpit */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-5">
        {/* Order Notification Toast */}
        {orderNotification && (
          <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-700 text-cyan-200 text-xs flex items-center justify-between shadow-lg shadow-cyan-950/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span className="font-medium">{orderNotification}</span>
            </div>
            <button
              onClick={() => setOrderNotification(null)}
              className="text-cyan-400 hover:text-cyan-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Portfolio Summary KPI Metrics */}
        {isLoadingInitial ? (
          <SummaryCardSkeleton />
        ) : (
          <PortfolioSummary
            holdings={holdings}
            positions={positions}
            funds={funds}
          />
        )}

        {/* Tab 1: Overview (Main Cockpit: Chart, Order Panel, Holdings, Funds) */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* AI Copilot Quick Launcher Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0d1b2a] to-[#0c121e] border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">TradePilot AI Copilot</span>
                    <Badge variant="info" className="text-[9px]">RESEARCH MODE</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ask natural-language questions to scan NIFTY 500, find crossovers, detect breakouts, or audit portfolio health.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("copilot")}
                className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                <span>Open AI Copilot</span>
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>

            {/* Top Grid: TradingView Chart + Quick Order Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart (2 Cols on desktop) */}
              <div className="lg:col-span-2 min-h-[420px]">
                <TradingChart
                  symbol={selectedSymbol}
                  instrumentToken={selectedToken}
                  livePrice={currentLtp}
                  dayChange={currentChange}
                  dayChangePercentage={currentChangePct}
                  onSymbolSelect={handleSelectInstrument}
                />
              </div>

              {/* Quick Order Terminal & Funds Card (1 Col) */}
              <div className="space-y-4">
                <OrderPanel
                  selectedSymbol={selectedSymbol}
                  selectedExchange={selectedExchange}
                  currentLtp={currentLtp}
                  onOrderPlaced={handleOrderPlaced}
                  onSymbolSelect={handleSelectInstrument}
                />
                <FundsCard funds={funds} />
              </div>
            </div>

            {/* Bottom Grid: Holdings and Positions preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="min-h-[300px]">
                <HoldingsTable
                  holdings={holdings}
                  onSelectInstrument={handleSelectInstrument}
                />
              </div>
              <div className="min-h-[300px]">
                <PositionsTable
                  positionsSummary={positions}
                  onSelectInstrument={handleSelectInstrument}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Portfolio & Positions */}
        {activeTab === "portfolio" && (
          <div className="space-y-5">
            <HoldingsTable
              holdings={holdings}
              onSelectInstrument={handleSelectInstrument}
            />
            <PositionsTable
              positionsSummary={positions}
              onSelectInstrument={handleSelectInstrument}
            />
          </div>
        )}

        {/* Tab 3: Orders Book */}
        {activeTab === "orders" && (
          <div className="space-y-5">
            <OrdersTable
              orders={orders}
              onOrderCancelled={loadInitialData}
              onRefresh={loadInitialData}
            />
          </div>
        )}

        {/* Tab 4: AI Trading Copilot & Scanner (Phase 1) */}
        {activeTab === "copilot" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[600px]">
            <div className="lg:col-span-2 h-[680px]">
              <AgentChatPanel
                onSelectInstrument={(sym, ex) => {
                  handleSelectInstrument(sym, ex || "NSE");
                  setActiveTab("overview");
                }}
              />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Phase 1 AI Capabilities
                </div>
                <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                  <p>
                    • <strong className="text-slate-200">Natural-Language Scanning:</strong> Scan NIFTY 50/100/500 across custom periods (e.g. 1W, 1M, 3M, 6M, 1Y, YTD).
                  </p>
                  <p>
                    • <strong className="text-slate-200">Technical Indicators:</strong> Deterministic computations for SMA (20/50/200), EMA (9/21), RSI14, MACD, Bollinger Bands, ATR, and ADX.
                  </p>
                  <p>
                    • <strong className="text-slate-200">Crossover &amp; Breakout Detection:</strong> Identify recent moving average crossovers and 52-week high breakouts.
                  </p>
                  <p>
                    • <strong className="text-slate-200">Portfolio-Aware Auditing:</strong> Inspect active holdings for concentration risk and moving average posture.
                  </p>
                </div>
              </div>
              <OrderPanel
                selectedSymbol={selectedSymbol}
                selectedExchange={selectedExchange}
                currentLtp={currentLtp}
                onOrderPlaced={handleOrderPlaced}
                onSymbolSelect={handleSelectInstrument}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
