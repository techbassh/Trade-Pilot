"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, ShieldCheck, Zap, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    if (!error) return null;
    if (message) return decodeURIComponent(message);

    switch (error) {
      case "MISSING_REQUEST_TOKEN":
        return "Authentication token was missing in the Zerodha callback.";
      case "AUTH_FAILED":
        return "Failed to complete token exchange with Kite Connect.";
      case "USER_CANCELLED":
        return "Login was cancelled on the Zerodha authentication page.";
      case "KITE_AUTH_EXPIRED":
        return "Your previous Kite session expired. Please log in again.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#070a12]">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Card */}
        <div className="p-8 rounded-2xl bg-[#0c121e]/90 border border-slate-800 shadow-2xl backdrop-blur-md text-center space-y-6">
          {/* Logo & Title */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                TradePilot
              </h1>
              <p className="text-xs font-medium tracking-widest text-cyan-400 uppercase mt-0.5">
                See. Decide. Trade.
              </p>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Your personal trading cockpit for Zerodha Kite Connect v3.
            </p>
          </div>

          {/* Error Alert if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-semibold block">Authentication Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Action */}
          <div className="space-y-3">
            <a href="/api/kite/login" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-950/60 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Login with Zerodha</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <p className="text-[11px] text-slate-500">
              You will be securely redirected to Zerodha to authorize access.
            </p>
          </div>

          {/* Security Features */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Zero client credentials storage</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Server-side Kite v3 authentication</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Real-time WebSocket &amp; SSE feed</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Order execution with confirmation safeguards</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-600">
          TradePilot Personal Terminal &bull; Single-User Edition
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070a12]" />}>
      <LoginContent />
    </Suspense>
  );
}
