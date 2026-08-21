"use client";

import React, { useState } from "react";
import { UserProfile } from "@/types/trading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Compass,
  Radio,
  LogOut,
  User,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: UserProfile | null;
  isConnected: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeTab: "overview" | "portfolio" | "orders" | "copilot";
  onTabChange: (tab: "overview" | "portfolio" | "orders" | "copilot") => void;
}

export function Header({
  user,
  isConnected,
  onRefresh,
  isRefreshing,
  activeTab,
  onTabChange,
}: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/kite/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070a12]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950/40">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">
                  TradePilot
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  v3
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider">
                See. Decide. Trade.
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <button
              onClick={() => onTabChange("overview")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "overview"
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange("portfolio")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "portfolio"
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Portfolio & Positions
            </button>
            <button
              onClick={() => onTabChange("orders")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === "orders"
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => onTabChange("copilot")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "copilot"
                  ? "bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-700/60 shadow-sm"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Copilot
            </button>
          </nav>
        </div>

        {/* Right Section: Connection status, User badge, Refresh & Logout */}
        <div className="flex items-center gap-3">
          {/* Live Feed Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <Radio
              className={`w-3.5 h-3.5 ${
                isConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"
              }`}
            />
            <span className="text-slate-400">
              {isConnected ? (
                <span className="text-emerald-400 font-medium">Kite Live</span>
              ) : (
                <span className="text-amber-400">Connecting</span>
              )}
            </span>
          </div>

          {/* Refresh Action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            title="Refresh portfolio data"
            className="text-slate-400 hover:text-slate-100"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>

          {/* User Profile Pill */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {user.userShortName?.charAt(0) || "U"}
              </div>
              <span className="font-medium text-slate-200">{user.userShortName || user.userName}</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                {user.userId}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
