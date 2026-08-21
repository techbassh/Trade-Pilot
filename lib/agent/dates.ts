// Natural Language Date Range Resolver for TradePilot Agent

export interface ResolvedDateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  label: string;
  formattedRange: string;
  tradingDaysEstimate: number;
}

export function formatDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function formatHumanDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function resolveNaturalDateRange(query: string, referenceDate = new Date()): ResolvedDateRange {
  const q = query.toLowerCase();
  const toDate = new Date(referenceDate);
  const fromDate = new Date(referenceDate);

  let label = "Last 3 Months";
  let tradingDaysEstimate = 63;

  if (q.includes("1 week") || q.includes("this week") || q.includes("past week") || q.includes("7 days")) {
    fromDate.setDate(toDate.getDate() - 7);
    label = "Last 1 Week";
    tradingDaysEstimate = 5;
  } else if (q.includes("1 month") || q.includes("last month") || q.includes("past month") || q.includes("30 days")) {
    fromDate.setMonth(toDate.getMonth() - 1);
    label = "Last 1 Month";
    tradingDaysEstimate = 21;
  } else if (q.includes("6 months") || q.includes("half year") || q.includes("last 6 month")) {
    fromDate.setMonth(toDate.getMonth() - 6);
    label = "Last 6 Months";
    tradingDaysEstimate = 126;
  } else if (q.includes("1 year") || q.includes("last year") || q.includes("past year") || q.includes("12 months")) {
    fromDate.setFullYear(toDate.getFullYear() - 1);
    label = "Last 1 Year";
    tradingDaysEstimate = 252;
  } else if (q.includes("3 years") || q.includes("last 3 years")) {
    fromDate.setFullYear(toDate.getFullYear() - 3);
    label = "Last 3 Years";
    tradingDaysEstimate = 756;
  } else if (q.includes("5 years") || q.includes("last 5 years")) {
    fromDate.setFullYear(toDate.getFullYear() - 5);
    label = "Last 5 Years";
    tradingDaysEstimate = 1260;
  } else if (q.includes("ytd") || q.includes("year to date") || q.includes("since january") || q.includes("beginning of this year")) {
    fromDate.setMonth(0, 1); // Jan 1st of current year
    label = "Year To Date (YTD)";
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    tradingDaysEstimate = Math.max(1, Math.floor(diffDays * (5 / 7)));
  } else if (q.includes("today") || q.includes("intraday") || q.includes("this session")) {
    label = "Today";
    tradingDaysEstimate = 1;
  } else {
    // Default: 3 months
    fromDate.setMonth(toDate.getMonth() - 3);
    label = "Last 3 Months";
    tradingDaysEstimate = 63;
  }

  const fromStr = formatDateString(fromDate);
  const toStr = formatDateString(toDate);

  return {
    from: fromStr,
    to: toStr,
    label,
    formattedRange: `${formatHumanDate(fromStr)} → ${formatHumanDate(toStr)}`,
    tradingDaysEstimate,
  };
}
