import React, { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "danger" | "warning" | "info" | "neutral" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className = "",
  variant = "neutral",
  size = "sm",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 font-semibold",
  }[size];

  const variantStyles = {
    success: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50",
    danger: "bg-rose-950/60 text-rose-400 border border-rose-800/50",
    warning: "bg-amber-950/60 text-amber-400 border border-amber-800/50",
    info: "bg-sky-950/60 text-sky-400 border border-sky-800/50",
    neutral: "bg-slate-800/70 text-slate-300 border border-slate-700/50",
    outline: "bg-transparent text-slate-400 border border-slate-700",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md uppercase ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
