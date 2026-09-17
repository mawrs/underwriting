"use client";

import type { FocusEvent, KeyboardEvent } from "react";

export function FloatInput({
  label,
  value,
  onChange,
  readOnly,
  autoFocus,
  onKeyDown,
  onFocus,
  onBlur,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}) {
  const filled = value.trim().length > 0;

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
        onFocus={onFocus}
        onBlur={onBlur}
        className={`peer h-[60px] w-full rounded-xs border border-gray-light px-md pt-[22px] pb-sm text-base text-black outline-none placeholder:text-transparent focus:border-primary ${
          readOnly ? "bg-gray-lightest" : "bg-white"
        }`}
      />
      <span
        className={`pointer-events-none absolute left-[15px] whitespace-nowrap text-gray-dark transition-all duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          filled
            ? "top-[6px] text-[10px] leading-[1.4]"
            : "top-[18px] text-base leading-[1.4] group-focus-within:top-[6px] group-focus-within:text-[10px]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
