import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "accent" | "gold" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-border/60 text-foreground",
  accent: "bg-accent/15 text-accent ring-1 ring-accent/20",
  gold: "bg-gold/15 text-gold-strong ring-1 ring-gold/25",
  danger: "bg-danger/15 text-danger ring-1 ring-danger/20",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
