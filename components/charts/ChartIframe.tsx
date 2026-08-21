// Embeds external chart views (TradingView) with links to Kite — no Kite API/historical data required
import React from "react";
import { ExternalLink } from "lucide-react";

interface ChartIframeProps {
  symbol: string;
  exchange?: "NSE" | "BSE";
  interval?: "D" | "W" | "M";
}

function buildTradingViewEmbedUrl(symbol: string, exchange: "NSE" | "BSE", interval: string) {
  const tvSymbol = encodeURIComponent(`${exchange}:${symbol}`);
  const params = new URLSearchParams({
    symbol: `${exchange}:${symbol}`,
    interval,
    hidesidetoolbar: "0",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#131722",
    enable_publishing: "false",
    allow_symbol_change: "false",
    save_image: "false",
    studies: "[]",
    container_id: `tv_${symbol}`,
  });
  return `https://s.tradingview.com/widgetembed/?${params.toString()}&symbol=${tvSymbol}`;
}

function buildKiteChartUrl(symbol: string, exchange: "NSE" | "BSE") {
  return `https://kite.zerodha.com/markets/chart/web/${encodeURIComponent(symbol)}/${exchange}`;
}

function buildTradingViewUrl(symbol: string, exchange: "NSE" | "BSE") {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(`${exchange}:${symbol}`)}`;
}

export function ChartIframe({ symbol, exchange = "NSE", interval = "D" }: ChartIframeProps) {
  const embedSrc = buildTradingViewEmbedUrl(symbol, exchange, interval);
  const kiteUrl = buildKiteChartUrl(symbol, exchange);
  const tradingViewUrl = buildTradingViewUrl(symbol, exchange);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wide">Live Chart</span>
        <div className="flex items-center gap-2">
          <a
            href={kiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Open in Kite <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={tradingViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            TradingView <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
      <div className="w-full h-[360px] rounded-lg overflow-hidden border border-slate-800 bg-[#0a0f18]">
        <iframe
          src={embedSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          allowTransparency
          scrolling="no"
          style={{ border: 0 }}
          title={`${symbol} chart`}
          loading="lazy"
        />
      </div>
      <p className="text-[10px] text-slate-500">
        Chart via TradingView embed (no Kite historical API needed). Kite opens in a new tab if embed is unavailable.
      </p>
    </div>
  );
}
