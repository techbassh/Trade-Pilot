/**
 * Utility functions for currency, numbers, dates, and P&L formatting
 */

export function formatINR(amount: number | null | undefined, includeSymbol = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? "₹0.00" : "0.00";
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = absAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const prefix = isNegative ? "-" : "";
  return includeSymbol ? `${prefix}₹${formatted}` : `${prefix}${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(2)} k`;
  }
  return `${sign}₹${abs.toFixed(2)}`;
}

export function formatPercentage(pct: number | null | undefined, includeSign = true): string {
  if (pct === null || pct === undefined || isNaN(pct)) {
    return "0.00%";
  }

  const sign = includeSign && pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatQuantity(qty: number): string {
  return qty.toLocaleString("en-IN");
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

export function getPnlColor(pnl: number | null | undefined): string {
  if (!pnl || pnl === 0) return "text-slate-400";
  return pnl > 0 ? "text-emerald-400" : "text-rose-400";
}

export function getPnlBgColor(pnl: number | null | undefined): string {
  if (!pnl || pnl === 0) return "bg-slate-800/40 text-slate-400 border-slate-700/40";
  return pnl > 0 
    ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" 
    : "bg-rose-950/40 text-rose-400 border-rose-800/40";
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status.toUpperCase()) {
    case "COMPLETE":
      return { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-700/50" };
    case "OPEN":
    case "TRIGGER PENDING":
    case "PUT ORDER REQ RECEIVED":
      return { bg: "bg-sky-950/50", text: "text-sky-400", border: "border-sky-700/50" };
    case "REJECTED":
    case "CANCELLED":
      return { bg: "bg-rose-950/50", text: "text-rose-400", border: "border-rose-700/50" };
    default:
      return { bg: "bg-slate-900/50", text: "text-slate-400", border: "border-slate-700/50" };
  }
}
