"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

// Periodically re-fetches the current page's data so a screen left open
// (e.g. the tournament display mode, shown on a TV or tablet during play)
// picks up results entered from someone else's phone without needing a
// manual reload.
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
