"use client";

import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  formatTimeUntilReset,
  type DailyLimitStatus,
} from "@/hooks/useDailyLimit";
import { useGlobalBottleCount } from "@/hooks/useGlobalBottleCount";

interface CreateBottleButtonProps {
  onClick: () => void;
  limitStatus: DailyLimitStatus | null;
  timeUntilReset: number | null;
}

export function CreateBottleButton({
  onClick,
  limitStatus,
  timeUntilReset,
}: CreateBottleButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { isConnected } = useAccount();
  const { isLimitReached: globalLimitReached } = useGlobalBottleCount();

  return (
    <div className="relative">
      <div
        onMouseEnter={() => {
          if (!isConnected || limitStatus?.isLimitReached) {
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2"
      >
        <button
          onClick={
            isConnected &&
            limitStatus &&
            !limitStatus.isLimitReached &&
            !globalLimitReached
              ? onClick
              : undefined
          }
          disabled={
            !isConnected ||
            !limitStatus ||
            limitStatus.isLimitReached ||
            globalLimitReached
          }
          className={`glass-surface rounded-full w-20 h-20 flex items-center justify-center p-2 transition-all duration-300 ease-out ${
            isConnected &&
            limitStatus &&
            !limitStatus.isLimitReached &&
            !globalLimitReached
              ? "cursor-pointer opacity-100 hover:scale-105 active:scale-100"
              : "cursor-not-allowed opacity-60"
          }`}
          style={{
            boxShadow: isConnected
              ? "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)"
              : "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
          onMouseEnter={(e) => {
            if (isConnected) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 25px rgba(127, 255, 212, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (isConnected) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)";
            }
          }}
          onMouseDown={(e) => {
            if (isConnected) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 0 0.5px rgba(0, 0, 0, 0.25), 0 16px 40px rgba(0, 0, 0, 0.25), 0 0 35px rgba(127, 255, 212, 0.55)";
            }
          }}
          onMouseUp={(e) => {
            if (isConnected) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 25px rgba(127, 255, 212, 0.35)";
            }
          }}
          aria-label="Create bottle"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/assets/bottle-sprites/1.webp"
              alt="Bottle"
              width={48}
              height={48}
              className="w-12 h-auto object-contain"
            />
            <div
              className="shadow-glass absolute -bottom-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center text-white text-base backdrop-blur-glass border border-glass-border-dark"
              style={{
                background:
                  "linear-gradient(135deg, rgba(64, 224, 208, 0.35) 0%, rgba(32, 178, 170, 0.45) 100%)",
                fontWeight: 500,
              }}
            >
              +
            </div>
          </div>
        </button>

        {isConnected && limitStatus && !globalLimitReached && (
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-3 py-1.5 text-xs whitespace-nowrap rounded-lg text-center text-white/80 pointer-events-none select-none">
            {limitStatus.bottlesRemaining} bottle
            {limitStatus.bottlesRemaining !== 1 ? "s" : ""} left today
          </div>
        )}

        {globalLimitReached && (
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-3 py-1.5 text-xs rounded-lg text-center whitespace-nowrap text-white/80 pointer-events-none select-none">
            Beta complete — All bottles created
          </div>
        )}
      </div>

      {showTooltip && (!isConnected || limitStatus?.isLimitReached) && (
        <div className="glass-surface shadow-glass text-glass animate-fade-in fixed bottom-[120px] right-8 px-4 py-3 text-sm whitespace-nowrap z-[51] pointer-events-none rounded-lg">
          {!isConnected
            ? "Please connect your wallet to create a bottle"
            : limitStatus?.isLimitReached
              ? `Daily limit reached. Resets in ${formatTimeUntilReset(timeUntilReset || 0)}`
              : "Create a bottle"}
          <div
            className="absolute -bottom-1.5 right-8 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent"
            style={{
              borderTopColor: "rgba(64, 224, 208, 0.12)",
            }}
          />
        </div>
      )}
    </div>
  );
}
