"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";
import { formatINR, formatPercentage, getPnlColor } from "@/lib/utils/format";
import { LoadingSpinner } from "@/components/ui/Loading";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { CandleData } from "@/types/trading";

interface TradingChartProps {
  symbol: string;
  instrumentToken?: number;
  livePrice?: number;
  dayChange?: number;
  dayChangePercentage?: number;
  onSymbolSelect?: (symbol: string) => void;
}

type Timeframe = "1D" | "1W" | "1M" | "1Y";

export function TradingChart({
  symbol,
  instrumentToken,
  livePrice,
  dayChange,
  dayChangePercentage,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlanRestricted, setIsPlanRestricted] = useState(false);
  const [hasData, setHasData] = useState(false);

  const calculateDateRange = useCallback((tf: Timeframe) => {
    const to = new Date();
    const from = new Date();

    switch (tf) {
      case "1D":
        from.setDate(to.getDate() - 1);
        return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0], interval: "5minute" as const };
      case "1W":
        from.setDate(to.getDate() - 7);
        return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0], interval: "30minute" as const };
      case "1M":
        from.setMonth(to.getMonth() - 1);
        return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0], interval: "day" as const };
      case "1Y":
        from.setFullYear(to.getFullYear() - 1);
        return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0], interval: "day" as const };
    }
  }, []);

  const loadCandles = useCallback(async () => {
    if (!instrumentToken) return;

    setIsLoading(true);
    setErrorMsg(null);
    setIsPlanRestricted(false);

    try {
      const { from, to, interval } = calculateDateRange(timeframe);
      const url = `/api/kite/historical?instrumentToken=${instrumentToken}&interval=${interval}&from=${from}&to=${to}`;
      
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.error?.code === "HISTORICAL_DATA_UNAVAILABLE" || res.status === 403) {
          setIsPlanRestricted(true);
          setHasData(false);
        } else {
          setErrorMsg(json.error?.message || "Failed to load historical candles");
        }
        return;
      }

      const candles: CandleData[] = json.data || [];

      if (candles.length === 0) {
        setHasData(false);
        return;
      }

      setHasData(true);

      if (candlestickSeriesRef.current) {
        const formattedCandles: CandlestickData<Time>[] = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candlestickSeriesRef.current.setData(formattedCandles);
      }

      if (volumeSeriesRef.current) {
        const formattedVolume = candles.map((c) => ({
          time: c.time as Time,
          value: c.volume || 0,
          color: c.close >= c.open ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)",
        }));
        volumeSeriesRef.current.setData(formattedVolume);
      }

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch historical chart data");
    } finally {
      setIsLoading(false);
    }
  }, [instrumentToken, timeframe, calculateDateRange]);

  // Initialize TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0c121e" },
        textColor: "#94a3b8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.6)" },
        horzLines: { color: "rgba(30, 41, 59, 0.6)" },
      },
      crosshair: {
        vertLine: {
          color: "rgba(148, 163, 184, 0.4)",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.4)",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderUpColor: "#10b981",
      borderDownColor: "#f43f5e",
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // Overlay volume on chart
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Fetch candle data on token or timeframe change
  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // Update current live price if chart data exists
  useEffect(() => {
    if (livePrice && candlestickSeriesRef.current && hasData) {
      // In a real session, update last bar's close price
    }
  }, [livePrice, hasData]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0c121e] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Chart Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-[#0a0f18]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-100">
              {symbol}
            </span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              NSE
            </span>
          </div>

          {livePrice !== undefined && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="text-base font-mono font-semibold text-slate-100">
                {formatINR(livePrice)}
              </span>
              {dayChange !== undefined && (
                <span className={`text-xs font-mono font-medium ${getPnlColor(dayChange)}`}>
                  {dayChange > 0 ? "+" : ""}
                  {dayChange.toFixed(2)} ({formatPercentage(dayChangePercentage)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-[#070b13] p-1 rounded-lg border border-slate-800">
          {(["1D", "1W", "1M", "1Y"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === tf
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tf}
            </button>
          ))}
          <button
            onClick={loadCandles}
            title="Refresh chart"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Chart Canvas & States */}
      <div className="relative flex-1 min-h-[340px] w-full">
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0c121e]/80 backdrop-blur-xs z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isPlanRestricted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0c121e]/95 z-10">
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-800/60 flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Historical Market Data Add-on Required
            </h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              Historical candlestick data is an optional subscription add-on in the Zerodha Kite Connect developer console. Live market quotes and manual trading remain fully operational.
            </p>
            {livePrice && (
              <div className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                Current Live Price: <span className="font-mono font-semibold text-cyan-400">{formatINR(livePrice)}</span>
              </div>
            )}
          </div>
        )}

        {errorMsg && !isPlanRestricted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0c121e]/90 z-10">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
            <p className="text-xs text-rose-300 max-w-sm mb-3">{errorMsg}</p>
            <button
              onClick={loadCandles}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry Loading
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
