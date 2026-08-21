"use client";

import React, { useState, useEffect } from "react";
import { BuySellToggle } from "./BuySellToggle";
import { OrderConfirmation } from "./OrderConfirmation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils/format";
import { ValidatedPlaceOrder, PlaceOrderSchema } from "@/lib/utils/validation";
import { CheckCircle2, AlertCircle, TrendingUp, Sparkles } from "lucide-react";

interface OrderPanelProps {
  selectedSymbol?: string;
  selectedExchange?: "NSE" | "BSE";
  currentLtp?: number;
  onOrderPlaced?: (orderId: string) => void;
  onSymbolSelect?: (symbol: string) => void;
}

const POPULAR_WATCHLIST = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "TATAMOTORS",
  "ICICIBANK",
  "SBIN",
  "ITC",
];

export function OrderPanel({
  selectedSymbol = "RELIANCE",
  selectedExchange = "NSE",
  currentLtp,
  onOrderPlaced,
  onSymbolSelect,
}: OrderPanelProps) {
  const [exchange, setExchange] = useState<"NSE" | "BSE">(selectedExchange);
  const [tradingsymbol, setTradingsymbol] = useState(selectedSymbol);
  const [transactionType, setTransactionType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [product, setProduct] = useState<"CNC" | "MIS">("CNC");
  const [limitPrice, setLimitPrice] = useState<string>("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<ValidatedPlaceOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync symbol changes from external selection (e.g. clicking a holding or position)
  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== tradingsymbol) {
      setTradingsymbol(selectedSymbol);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    if (currentLtp && orderType === "LIMIT" && !limitPrice) {
      setLimitPrice(currentLtp.toString());
    }
  }, [currentLtp, orderType]);

  const handleReviewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const priceNum = orderType === "LIMIT" ? parseFloat(limitPrice) : undefined;

    const rawPayload = {
      exchange,
      tradingsymbol: tradingsymbol.trim().toUpperCase(),
      transactionType,
      quantity: Number(quantity),
      orderType,
      product,
      price: priceNum,
      validity: "DAY",
      variety: "regular",
    };

    const parseResult = PlaceOrderSchema.safeParse(rawPayload);

    if (!parseResult.success) {
      const errorText = parseResult.error.errors[0]?.message || "Please check your order inputs";
      setErrorMessage(errorText);
      return;
    }

    setPendingOrder(parseResult.data);
    setIsConfirmOpen(true);
  };

  const handleExecuteOrder = async () => {
    if (!pendingOrder) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/kite/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingOrder),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to execute order with Kite");
      }

      setSuccessMessage(
        `Order placed successfully! Order ID: ${json.data.orderId}`
      );
      setIsConfirmOpen(false);
      setPendingOrder(null);

      if (onOrderPlaced) {
        onOrderPlaced(json.data.orderId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to place order");
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectivePrice = orderType === "LIMIT" && limitPrice ? parseFloat(limitPrice) || 0 : currentLtp || 0;
  const approxValue = effectivePrice * quantity;

  return (
    <div className="flex flex-col bg-[#0c121e] rounded-xl border border-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Quick Order Terminal
        </h3>
        <Badge variant={transactionType === "BUY" ? "success" : "danger"}>
          {transactionType} {orderType}
        </Badge>
      </div>

      <form onSubmit={handleReviewOrder} className="space-y-4">
        {/* Buy / Sell Toggle */}
        <BuySellToggle value={transactionType} onChange={setTransactionType} />

        {/* Symbol and Exchange */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Symbol"
                value={tradingsymbol}
                onChange={(e) => setTradingsymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Exchange
              </label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value as "NSE" | "BSE")}
                className="w-full bg-[#0a0f19] border border-slate-700/70 text-slate-100 text-xs rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          </div>

          {/* Quick symbol chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {POPULAR_WATCHLIST.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  setTradingsymbol(sym);
                  if (onSymbolSelect) onSymbolSelect(sym);
                }}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors font-mono ${
                  tradingsymbol === sym
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-700"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Product Type (CNC vs MIS) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Product
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProduct("CNC")}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                product === "CNC"
                  ? "bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-[#0a0f19] border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              CNC (Delivery)
            </button>
            <button
              type="button"
              onClick={() => setProduct("MIS")}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                product === "MIS"
                  ? "bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-[#0a0f19] border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              MIS (Intraday)
            </button>
          </div>
        </div>

        {/* Order Type (MARKET vs LIMIT) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400">
            Order Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType("MARKET")}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                orderType === "MARKET"
                  ? "bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-[#0a0f19] border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              MARKET
            </button>
            <button
              type="button"
              onClick={() => setOrderType("LIMIT")}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                orderType === "LIMIT"
                  ? "bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-[#0a0f19] border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              LIMIT
            </button>
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Quantity"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            required
          />

          {orderType === "LIMIT" ? (
            <Input
              label="Limit Price (₹)"
              type="number"
              min={0.05}
              step={0.05}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentLtp ? currentLtp.toString() : "0.00"}
              required
            />
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Price
              </label>
              <div className="h-[38px] flex items-center px-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
                {currentLtp ? `LTP: ${formatINR(currentLtp)}` : "Market Price"}
              </div>
            </div>
          )}
        </div>

        {/* Estimated Value & Summary */}
        <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Estimated Value</span>
          <span className="font-mono font-bold text-slate-100">
            {formatINR(approxValue)}
          </span>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Review & Execute Order Button */}
        <Button
          type="submit"
          variant={transactionType === "BUY" ? "buy" : "sell"}
          size="lg"
          className="w-full"
        >
          Review {transactionType} Order
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <OrderConfirmation
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteOrder}
        order={pendingOrder}
        currentLtp={currentLtp}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
