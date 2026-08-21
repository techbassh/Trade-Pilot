import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "buy" | "sell" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2 w-9 h-9",
    }[size];

    const variantStyles = {
      primary:
        "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm focus:ring-cyan-500 shadow-cyan-950/40",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 focus:ring-slate-500",
      buy: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm focus:ring-emerald-500 shadow-emerald-950/40",
      sell: "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm focus:ring-rose-500 shadow-rose-950/40",
      danger:
        "bg-rose-700 hover:bg-rose-600 text-white focus:ring-rose-500",
      ghost:
        "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-600",
      outline:
        "bg-transparent border border-slate-700 hover:bg-slate-800/40 text-slate-200 focus:ring-slate-600",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
