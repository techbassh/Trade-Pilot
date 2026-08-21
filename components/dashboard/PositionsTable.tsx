"use client";

import React, { useState } from "react";
import { Position, PositionsSummary } from "@/types/trading";
import { formatINR, formatPercentage, getPnlColor } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, ArrowRight, ArrowUpDown } from "lucide-react";

interface PositionsTableProps {
  positionsSummary: PositionsSummary | null;
  onSelectInstrument: (symbol: string, exchange: "NSE" | "BSE", token?: number) => void;
}

export function PositionsTable({
  positionsSummary,
  onSelectInstrument,
}: PositionsTableProps) {
  const [viewType, setViewType] = useState<"net" | "day">("net");

  const positions = viewType === "net"
    ? positionsSummary?.net || []
    : positionsSummary?.day || [];

  return (
    <div className="flex flex-col h-full bg-[#0c121e] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Table Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-[#0a0f18]">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Positions ({positions.length})
          </h3>
        </div>

        {/* View Switcher: Net vs Day */}
        <div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewType("net")}
            className={`px-3 py-1 rounded transition-colors font-medium ${
              viewType === "net"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Net Positions ({positionsSummary?.net?.length || 0})
          </button>
          <button
            onClick={() => setViewType("day")}
            className={`px-3 py-1 rounded transition-colors font-medium ${
              viewType === "day"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Day Positions ({positionsSummary?.day?.length || 0})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-slate-300 mb-1">
              No open positions.
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Intraday or overnight positions will appear here once executed.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400 font-medium select-none">
                <th className="py-2.5 px-4">Symbol</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Net Qty</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">LTP</th>
                <th className="py-2.5 px-3 text-right">P&amp;L</th>
                <th className="py-2.5 px-3 text-right">Buy / Sell Qty</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {positions.map((p) => (
                <tr
                  key={`${p.exchange}:${p.symbol}:${p.product}`}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {p.symbol}
                      </span>
                      <Badge variant="outline" className="font-mono text-[9px]">
                        {p.exchange}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <Badge variant={p.product === "MIS" ? "warning" : "info"}>
                      {p.product}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    <span className={p.quantity > 0 ? "text-emerald-400" : p.quantity < 0 ? "text-rose-400" : "text-slate-400"}>
                      {p.quantity.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatINR(p.averagePrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-100">
                    {formatINR(p.lastPrice)}
                  </td>
                  <td className={`py-3 px-3 text-right font-semibold ${getPnlColor(p.pnl)}`}>
                    <div>{formatINR(p.pnl)}</div>
                    <div className="text-[10px] font-sans">
                      {formatPercentage(p.pnlPercentage)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-[11px] text-slate-400">
                    <span className="text-emerald-400">{p.buyQuantity}</span> / <span className="text-rose-400">{p.sellQuantity}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onSelectInstrument(
                          p.symbol,
                          p.exchange as "NSE" | "BSE",
                          p.instrumentToken
                        )
                      }
                      className="text-[11px] py-1 px-2 text-cyan-400 hover:text-cyan-300 border-slate-700/60"
                    >
                      Trade
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
