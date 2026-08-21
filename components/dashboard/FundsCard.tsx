import React from "react";
import { Funds } from "@/types/trading";
import { formatINR } from "@/lib/utils/format";
import { Wallet, ShieldCheck, PieChart, Coins } from "lucide-react";

interface FundsCardProps {
  funds: Funds | null;
}

export function FundsCard({ funds }: FundsCardProps) {
  const netAvailable = funds?.netAvailable ?? 0;
  const availableCash = funds?.availableCash ?? 0;
  const collateral = funds?.availableCollateral ?? 0;
  const usedMargin = funds?.usedMargin ?? 0;
  const spanMargin = funds?.spanMargin ?? 0;
  const exposureMargin = funds?.exposureMargin ?? 0;

  return (
    <div className="flex flex-col bg-[#0c121e] rounded-xl border border-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Funds &amp; Margins
          </h3>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
          Equity
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Net Available Highlight */}
        <div className="p-3 rounded-lg bg-[#080d16] border border-cyan-950/80">
          <div className="text-[11px] font-sans text-slate-400 mb-0.5">
            Total Net Available Margin
          </div>
          <div className="text-lg font-bold text-cyan-400">
            {formatINR(netAvailable)}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="divide-y divide-slate-800/60">
          <div className="flex items-center justify-between py-2">
            <span className="font-sans text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-slate-500" />
              Available Cash
            </span>
            <span className="font-semibold text-slate-200">
              {formatINR(availableCash)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="font-sans text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              Collateral Margin
            </span>
            <span className="font-semibold text-slate-200">
              {formatINR(collateral)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="font-sans text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-slate-500" />
              Used Margin (Debits)
            </span>
            <span className="font-semibold text-amber-400">
              {formatINR(usedMargin)}
            </span>
          </div>

          {(spanMargin > 0 || exposureMargin > 0) && (
            <>
              <div className="flex items-center justify-between py-2 text-[11px]">
                <span className="font-sans text-slate-400">SPAN Margin</span>
                <span className="text-slate-300">{formatINR(spanMargin)}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-[11px]">
                <span className="font-sans text-slate-400">Exposure Margin</span>
                <span className="text-slate-300">{formatINR(exposureMargin)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
