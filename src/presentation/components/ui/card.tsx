import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_32px_-16px_rgba(0,0,0,0.18)] ${className}`}
      {...props}
    />
  );
}
