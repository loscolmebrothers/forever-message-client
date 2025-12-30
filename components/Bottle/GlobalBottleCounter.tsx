"use client";

import { useGlobalBottleCount } from "@/hooks/useGlobalBottleCount";

export function GlobalBottleCounter() {
  const { remaining, isLoading } = useGlobalBottleCount();

  if (isLoading || remaining === null) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99] pointer-events-none select-none max-w-[calc(100vw-200px)] sm:max-w-none">
      <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-4 py-2 text-sm rounded-lg text-center text-white/80">
        <span className="hidden sm:inline whitespace-nowrap">
          {remaining.toLocaleString()} bottles left to create
        </span>
        <span className="sm:hidden">{remaining.toLocaleString()} left</span>
      </div>
    </div>
  );
}
