import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  error?: string;
};

const baseInputClass =
  "w-full rounded-xl border border-[#e1e5f0] bg-white px-4 py-3 text-base text-[#2c2f48] placeholder:text-[#8a8ea3] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4c82ff]";

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    { label, hideLabel = true, error, className, ...props },
    ref
  ) {
    const inputClass = className
      ? `${baseInputClass} ${className}`
      : baseInputClass;

    return (
      <label className="block text-left text-sm font-medium text-[#2c2f48]">
        <span className={hideLabel ? "sr-only" : "mb-2 block"}>{label}</span>
        <input
          ref={ref}
          className={inputClass}
          aria-label={hideLabel ? label : undefined}
          {...props}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-500">{error}</span>
        )}
      </label>
    );
  }
);
