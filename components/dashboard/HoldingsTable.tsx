"use client";

import React, { useState, useMemo } from "react";
import { Holding } from "@/types/trading";
import { formatINR, formatPercentage, getPnlColor, getPnlBgColor } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Search, TrendingUp, Layers, ArrowUpDown, ArrowRight } from "lucide-react";

interface HoldingsTableProps {
  holdings: Holding[];
  onSelectInstrument: (symbol: string, exchange: "NSE" | "BSE", token?: number) => void;
}

export function HoldingsTable({
  holdings,
  onSelectInstrument,
}: HoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Holding>("currentValue");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((h) =>
        h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.exchange.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [holdings, searchTerm, sortField, sortAsc]);

  const handleSort = (field: keyof Holding) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c121e] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-[#0a0f18]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Holdings ({holdings.length})
          </h3>
        </div>
        <div className="w-48 sm:w-64">
          <Input
            prefix={<Search className="w-3.5 h-3.5" />}
            placeholder="Search holdings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-1 text-xs"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        {filteredHoldings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-slate-300 mb-1">
              {holdings.length === 0 ? "Your portfolio is empty." : "No matching holdings"}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              {holdings.length === 0
                ? "Delivery shares bought in your Zerodha account will appear here."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400 font-medium select-none">
                <th
                  onClick={() => handleSort("symbol")}
                  className="py-2.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("quantity")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  Qty
                </th>
                <th
                  onClick={() => handleSort("averagePrice")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  Avg Price
                </th>
                <th
                  onClick={() => handleSort("lastPrice")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  LTP
                </th>
                <th
                  onClick={() => handleSort("currentValue")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  Current Value
                </th>
                <th
                  onClick={() => handleSort("pnl")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  Overall P&amp;L
                </th>
                <th
                  onClick={() => handleSort("dayChange")}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  Day P&amp;L
                </th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHoldings.map((h) => {
                const totalDayPnl = h.dayChange * h.quantity;
                return (
                  <tr
                    key={`${h.exchange}:${h.symbol}`}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {h.symbol}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px]">
                          {h.exchange}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 font-semibold">
                      {h.quantity.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatINR(h.averagePrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      {formatINR(h.lastPrice)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">
                      {formatINR(h.currentValue)}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${getPnlColor(h.pnl)}`}>
                      <div>{formatINR(h.pnl)}</div>
                      <div className="text-[10px] font-sans">
                        {formatPercentage(h.pnlPercentage)}
                      </div>
                    </td>
                    <td className={`py-3 px-3 text-right ${getPnlColor(totalDayPnl)}`}>
                      <div>{formatINR(totalDayPnl)}</div>
                      <div className="text-[10px] font-sans">
                        {formatPercentage(h.dayChangePercentage)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          onSelectInstrument(
                            h.symbol,
                            h.exchange as "NSE" | "BSE",
                            h.instrumentToken
                          )
                        }
                        className="text-[11px] py-1 px-2 text-cyan-400 hover:text-cyan-300 border-slate-700/60"
                      >
                        Trade
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
