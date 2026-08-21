import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils/format";
import { ValidatedPlaceOrder } from "@/lib/utils/validation";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: ValidatedPlaceOrder | null;
  currentLtp?: number;
  isSubmitting: boolean;
}

export function OrderConfirmation({
  isOpen,
  onClose,
  onConfirm,
  order,
  currentLtp,
  isSubmitting,
}: OrderConfirmationProps) {
  if (!order) return null;

  const isBuy = order.transactionType === "BUY";
  const executionPrice = order.orderType === "LIMIT" && order.price ? order.price : currentLtp || 0;
  const estimatedTotal = executionPrice > 0 ? executionPrice * order.quantity : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Order Execution"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            isBuy
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : "bg-rose-950/40 border-rose-800/50 text-rose-300"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white ${
              isBuy ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {order.transactionType}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100">
                {order.tradingsymbol}
              </span>
              <Badge variant="outline">{order.exchange}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {order.quantity} shares &bull; {order.product === "CNC" ? "Delivery (CNC)" : "Intraday (MIS)"} &bull; {order.orderType}
            </p>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="rounded-xl bg-[#090d16] border border-slate-800/80 divide-y divide-slate-800/60 text-xs">
          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Transaction</span>
            <span className={`font-bold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
              {order.transactionType}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Quantity</span>
            <span className="font-mono font-semibold text-slate-200">
              {order.quantity.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Order Type</span>
            <span className="font-medium text-slate-200">{order.orderType}</span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Product</span>
            <span className="font-medium text-slate-200">
              {order.product === "CNC" ? "Cash & Carry (CNC)" : "Margin Intraday (MIS)"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Price</span>
            <span className="font-mono font-semibold text-slate-200">
              {order.orderType === "LIMIT" && order.price ? formatINR(order.price) : "MARKET (LTP)"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5">
            <span className="text-slate-400">Validity</span>
            <span className="font-medium text-slate-200">{order.validity}</span>
          </div>

          {estimatedTotal > 0 && (
            <div className="flex justify-between items-center py-3 px-3.5 bg-slate-900/50">
              <span className="font-medium text-slate-300">Approx. Order Value</span>
              <span className="font-mono font-bold text-sm text-cyan-400">
                {formatINR(estimatedTotal)}
              </span>
            </div>
          )}
        </div>

        {/* Safety Warning */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            This order will be transmitted directly to Zerodha Kite Connect server-side.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isBuy ? "buy" : "sell"}
            onClick={onConfirm}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Confirm & Place {order.transactionType}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
