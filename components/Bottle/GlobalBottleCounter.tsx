"use client";

import { useGlobalBottleCount } from "@/hooks/useGlobalBottleCount";

export function GlobalBottleCounter() {
  const { remaining, isLoading } = useGlobalBottleCount();

  if (isLoading || remaining === null) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99]">
      <div className="glass-surface shadow-glass text-glass px-4 py-2 text-sm rounded-lg text-center whitespace-nowrap">
        {remaining.toLocaleString()} bottles left to create
      </div>
    </div>
  );
}
