import type { ReactNode } from "react";

export function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      <span aria-hidden="true" className="opacity-40">
        {icon}
      </span>
      <p className="max-w-xs text-sm text-muted">{message}</p>
    </div>
  );
}
