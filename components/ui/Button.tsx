import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const variants: Record<ButtonVariant, string> = {
  primary: "border border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover",
  secondary:
    "border border-gray-dark bg-white text-gray-dark hover:bg-gray-lightest",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return [
    "inline-flex items-center justify-center gap-sm rounded-xs px-[17px] py-[5px] text-sm",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
