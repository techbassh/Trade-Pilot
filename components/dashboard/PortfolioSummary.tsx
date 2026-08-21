import React from "react";
import { Holding, PositionsSummary, Funds } from "@/types/trading";
import { Card } from "@/components/ui/Card";
import { formatINR, formatPercentage, getPnlColor, getPnlBgColor } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Wallet } from "lucide-react";

interface PortfolioSummaryProps {
  holdings: Holding[];
  positions: PositionsSummary | null;
  funds: Funds | null;
}

export function PortfolioSummary({
  holdings,
  positions,
  funds,
}: PortfolioSummaryProps) {
  // Aggregate Holdings
  const totalHoldingsCurrentValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalHoldingsInvestedValue = holdings.reduce((acc, h) => acc + h.investedValue, 0);
  const totalHoldingsPnl = holdings.reduce((acc, h) => acc + h.pnl, 0);
  const totalHoldingsPnlPercentage =
    totalHoldingsInvestedValue > 0
      ? (totalHoldingsPnl / totalHoldingsInvestedValue) * 100
      : 0;

  // Day P&L (Holdings Day Change + Positions Day P&L)
  const holdingsDayChange = holdings.reduce((acc, h) => acc + (h.dayChange * h.quantity), 0);
  const positionsDayPnl = positions?.totalDayPnl || 0;
  const combinedDayPnl = holdingsDayChange + positionsDayPnl;

  // Available margin
  const availableFunds = funds?.netAvailable ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Portfolio / Holdings Value */}
      <Card className="p-4 bg-[#0c121e] border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Holdings Value</span>
          <PieChart className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 mb-1">
          {formatINR(totalHoldingsCurrentValue)}
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Invested:</span>
          <span className="font-mono text-slate-300">
            {formatINR(totalHoldingsInvestedValue)}
          </span>
        </div>
      </Card>

      {/* Today's P&L */}
      <Card className="p-4 bg-[#0c121e] border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Today&apos;s P&amp;L</span>
          {combinedDayPnl >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <div className={`text-xl font-bold font-mono mb-1 ${getPnlColor(combinedDayPnl)}`}>
          {formatINR(combinedDayPnl)}
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Positions + Holdings:</span>
          <span className={`font-mono text-[11px] font-medium ${getPnlColor(combinedDayPnl)}`}>
            {combinedDayPnl >= 0 ? "+" : ""}
            {totalHoldingsCurrentValue > 0
              ? formatPercentage((combinedDayPnl / totalHoldingsCurrentValue) * 100)
              : "0.00%"}
          </span>
        </div>
      </Card>

      {/* Overall P&L */}
      <Card className="p-4 bg-[#0c121e] border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Overall Holdings P&amp;L</span>
          {totalHoldingsPnl >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <div className={`text-xl font-bold font-mono mb-1 ${getPnlColor(totalHoldingsPnl)}`}>
          {formatINR(totalHoldingsPnl)}
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Return:</span>
          <span className={`font-mono text-[11px] font-semibold ${getPnlColor(totalHoldingsPnl)}`}>
            {formatPercentage(totalHoldingsPnlPercentage)}
          </span>
        </div>
      </Card>

      {/* Available Margin / Funds */}
      <Card className="p-4 bg-[#0c121e] border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Available Funds</span>
          <Wallet className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold font-mono text-cyan-400 mb-1">
          {formatINR(availableFunds)}
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Used Margin:</span>
          <span className="font-mono text-slate-300">
            {formatINR(funds?.usedMargin ?? 0)}
          </span>
        </div>
      </Card>
    </div>
  );
}
