import { kiteFetch } from "./client";
import { KiteHolding, KitePositionsResponse, KiteMarginsResponse, KitePosition } from "@/types/kite";
import { Holding, Position, PositionsSummary, Funds } from "@/types/trading";

export async function fetchHoldings(): Promise<Holding[]> {
  const rawHoldings = await kiteFetch<KiteHolding[]>("/portfolio/holdings");

  if (!rawHoldings || !Array.isArray(rawHoldings)) {
    return [];
  }

  return rawHoldings.map((item) => {
    const totalQty = item.quantity + (item.t1_quantity || 0);
    const invested = totalQty * item.average_price;
    const current = totalQty * (item.last_price || item.average_price);
    const pnl = item.pnl ?? (current - invested);
    const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0;

    return {
      symbol: item.tradingsymbol,
      exchange: item.exchange,
      instrumentToken: item.instrument_token,
      isin: item.isin,
      product: item.product,
      quantity: totalQty,
      averagePrice: item.average_price,
      lastPrice: item.last_price || item.average_price,
      closePrice: item.close_price || item.last_price,
      investedValue: invested,
      currentValue: current,
      pnl: pnl,
      pnlPercentage: pnlPercentage,
      dayChange: item.day_change || 0,
      dayChangePercentage: item.day_change_percentage || 0,
    };
  });
}

function normalizePosition(item: KitePosition): Position {
  const invested = item.quantity * item.average_price;
  const current = item.quantity * (item.last_price || item.average_price);
  const pnl = item.pnl || (item.m2m ?? 0);
  const pnlPercentage = invested !== 0 ? (pnl / Math.abs(invested)) * 100 : 0;

  return {
    symbol: item.tradingsymbol,
    exchange: item.exchange,
    instrumentToken: item.instrument_token,
    product: item.product,
    quantity: item.quantity,
    averagePrice: item.average_price,
    lastPrice: item.last_price || item.average_price,
    closePrice: item.close_price || item.last_price,
    pnl: pnl,
    pnlPercentage: pnlPercentage,
    dayPnl: item.m2m || 0,
    buyQuantity: item.buy_quantity,
    buyPrice: item.buy_price,
    sellQuantity: item.sell_quantity,
    sellPrice: item.sell_price,
    value: item.value || current,
    isOvernight: item.overnight_quantity !== 0,
  };
}

export async function fetchPositions(): Promise<PositionsSummary> {
  const rawPositions = await kiteFetch<KitePositionsResponse>("/portfolio/positions");

  const net = (rawPositions?.net || []).map(normalizePosition);
  const day = (rawPositions?.day || []).map(normalizePosition);

  const totalPnl = net.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalDayPnl = day.reduce((acc, pos) => acc + pos.dayPnl, 0);

  return {
    net,
    day,
    totalPnl,
    totalDayPnl,
  };
}

export async function fetchFunds(): Promise<Funds> {
  const rawMargins = await kiteFetch<KiteMarginsResponse>("/user/margins");
  const equity = rawMargins?.equity;

  return {
    availableCash: equity?.available?.cash ?? 0,
    availableCollateral: equity?.available?.collateral ?? 0,
    usedMargin: equity?.utilised?.debits ?? 0,
    netAvailable: equity?.net ?? (equity?.available?.cash ?? 0),
    openingBalance: equity?.available?.opening_balance ?? 0,
    payin: equity?.available?.intraday_payin ?? 0,
    spanMargin: equity?.utilised?.span ?? 0,
    exposureMargin: equity?.utilised?.exposure ?? 0,
  };
}
