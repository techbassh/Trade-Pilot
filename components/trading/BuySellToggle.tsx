import React from "react";

interface BuySellToggleProps {
  value: "BUY" | "SELL";
  onChange: (value: "BUY" | "SELL") => void;
}

export function BuySellToggle({ value, onChange }: BuySellToggleProps) {
  return (
    <div className="grid grid-cols-2 p-1 bg-[#090d16] rounded-xl border border-slate-800">
      <button
        type="button"
        onClick={() => onChange("BUY")}
        className={`py-2 text-xs font-bold tracking-wider rounded-lg transition-all ${
          value === "BUY"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
        }`}
      >
        BUY
      </button>
      <button
        type="button"
        onClick={() => onChange("SELL")}
        className={`py-2 text-xs font-bold tracking-wider rounded-lg transition-all ${
          value === "SELL"
            ? "bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-1 ring-rose-400/40"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
        }`}
      >
        SELL
      </button>
    </div>
  );
}
