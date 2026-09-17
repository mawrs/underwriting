"use client";

import type { KeyboardEvent } from "react";

export function FloatInput({
  label,
  value,
  onChange,
  readOnly,
  autoFocus,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="group relative min-w-0 w-full flex-1">
      <input
        aria-label={label}
        value={value}
        readOnly={readOnly}
        autoFocus={autoFocus}
        placeholder=" "
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={onKeyDown}
        className={`peer h-[60px] w-full rounded-xs border border-gray-light px-md pt-[22px] pb-sm text-base text-black outline-none placeholder:text-transparent focus:border-primary ${
          readOnly ? "bg-gray-lightest" : "bg-white"
        }`}
      />
      <span className="pointer-events-none absolute top-[6px] left-[15px] origin-top-left translate-y-[12px] scale-100 text-base leading-[1.4] text-gray-dark transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] group-focus-within:translate-y-0 group-focus-within:scale-[0.625] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.625]">
        {label}
      </span>
    </label>
  );
}
