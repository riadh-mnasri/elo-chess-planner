import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger-outline";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-border text-foreground hover:bg-border/40",
  "danger-outline": "border border-danger/40 text-danger hover:bg-danger/10",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  className = "",
): string {
  return `inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
