import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-lg bg-[#0a0f19] border border-slate-700/70 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-colors">
          {prefix && (
            <span className="pl-3 pr-1 text-xs text-slate-500 font-mono select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
              prefix ? "pl-1" : ""
            } ${suffix ? "pr-1" : ""} ${className}`}
            {...props}
          />
          {suffix && (
            <span className="pr-3 pl-1 text-xs text-slate-500 font-mono select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
