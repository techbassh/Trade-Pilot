import React, { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "bordered";
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  variant = "default",
  hoverable = false,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-[#0c121e]/90 border border-slate-800/80 shadow-md shadow-black/40",
    elevated: "bg-[#0f172a] border border-slate-700/70 shadow-lg shadow-black/60",
    flat: "bg-[#0b0f17] border border-slate-800/40",
    bordered: "bg-transparent border border-slate-800",
  }[variant];

  const hoverStyles = hoverable
    ? "transition-all duration-200 hover:border-slate-700 hover:shadow-cyan-950/20"
    : "";

  return (
    <div
      className={`rounded-xl backdrop-blur-sm ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-3 border-b border-slate-800/60 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
