"use client";

import React, { useState } from "react";
import { Order } from "@/types/trading";
import { formatINR, formatDateTime, getStatusColor } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ClipboardList, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onOrderCancelled?: (orderId: string) => void;
  onRefresh?: () => void;
}

export function OrdersTable({
  orders,
  onOrderCancelled,
  onRefresh,
}: OrdersTableProps) {
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(
        `/api/kite/orders/${selectedOrderToCancel.orderId}?variety=${selectedOrderToCancel.variety || "regular"}`,
        { method: "DELETE" }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to cancel order with Zerodha");
      }

      setSelectedOrderToCancel(null);
      if (onOrderCancelled) {
        onOrderCancelled(selectedOrderToCancel.orderId);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const isOpenStatus = (status: string) => {
    const s = status.toUpperCase();
    return s === "OPEN" || s === "TRIGGER PENDING" || s === "PUT ORDER REQ RECEIVED";
  };

  return (
    <div className="flex flex-col h-full bg-[#0c121e] rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0a0f18]">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Order Book ({orders.length})
          </h3>
        </div>
      </div>

      {/* Orders Table Content */}
      <div className="flex-1 overflow-x-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium text-slate-300 mb-1">
              No orders placed today.
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Orders submitted through TradePilot will show real-time status and execution reports here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400 font-medium select-none">
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Order Price</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {orders.map((o) => {
                const statusStyle = getStatusColor(o.status);
                const isBuy = o.transactionType === "BUY";
                const canCancel = isOpenStatus(o.status);

                return (
                  <tr
                    key={o.orderId}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      {formatDateTime(o.orderTimestamp)}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">
                          {o.symbol}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {o.exchange}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                          isBuy
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                            : "bg-rose-950 text-rose-400 border border-rose-800/50"
                        }`}
                      >
                        {o.transactionType} {o.orderType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-200">
                      {o.filledQuantity} / {o.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {o.price > 0 ? formatINR(o.price) : "MARKET"}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {o.averagePrice > 0 ? formatINR(o.averagePrice) : "-"}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <Badge variant="neutral">{o.product}</Badge>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        title={o.statusMessage || undefined}
                      >
                        {o.status}
                      </span>
                      {o.statusMessage && (
                        <p className="text-[10px] text-slate-500 font-sans truncate max-w-[120px]" title={o.statusMessage}>
                          {o.statusMessage}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {canCancel ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setSelectedOrderToCancel(o)}
                          className="text-[11px] py-1 px-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedOrderToCancel)}
        onClose={() => setSelectedOrderToCancel(null)}
        title="Confirm Order Cancellation"
      >
        {selectedOrderToCancel && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                Are you sure you want to cancel open order{" "}
                <span className="font-mono font-bold text-white">
                  #{selectedOrderToCancel.orderId}
                </span>{" "}
                for <span className="font-bold">{selectedOrderToCancel.quantity} {selectedOrderToCancel.symbol}</span>?
              </div>
            </div>

            {cancelError && (
              <p className="text-xs text-rose-400">{cancelError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedOrderToCancel(null)}
                disabled={isCancelling}
              >
                Keep Order
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
