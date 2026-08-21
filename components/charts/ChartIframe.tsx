// ChartIframe component to embed TradingView chart for a given symbol
import React from "react";

interface ChartIframeProps {
  symbol: string; // e.g., "RELIANCE"
  exchange?: "NSE" | "BSE"; // default NSE
  interval?: "D" | "W" | "M"; // default daily
}

export function ChartIframe({ symbol, exchange = "NSE", interval = "D" }: ChartIframeProps) {
  // Build TradingView widget URL
  const encodedSymbol = encodeURIComponent(`${exchange}:${symbol}`);
  const src = `https://s.tradingview.com/embed-widget/technical-analysis/?symbol=${encodedSymbol}&interval=${interval}&width=100%&height=500&locale=en`;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-800 bg-[#0a0f18]">
      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        allowTransparency={true}
        scrolling="no"
        style={{ border: 0 }}
        title={`${symbol} chart`}
      ></iframe>
    </div>
  );
}

