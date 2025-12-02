"use client";

import Image from "next/image";
import { useState } from "react";

interface CreateBottleButtonProps {
  onClick: () => void;
  isAuthenticated: boolean;
}

export function CreateBottleButton({
  onClick,
  isAuthenticated,
}: CreateBottleButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        onMouseEnter={() => {
          if (!isAuthenticated) {
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={isAuthenticated ? onClick : undefined}
          disabled={!isAuthenticated}
          className={`glass-surface rounded-full w-20 h-20 flex items-center justify-center p-2 transition-all duration-300 ease-out ${
            isAuthenticated
              ? "cursor-pointer opacity-100 hover:scale-105 active:scale-100"
              : "cursor-not-allowed opacity-60"
          }`}
          style={{
            boxShadow: isAuthenticated
              ? "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)"
              : "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
          onMouseEnter={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 25px rgba(127, 255, 212, 0.35)";
            }
          }}
          onMouseLeave={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 rgba(127, 255, 212, 0)";
            }
          }}
          onMouseDown={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 0 0.5px rgba(0, 0, 0, 0.25), 0 16px 40px rgba(0, 0, 0, 0.25), 0 0 35px rgba(127, 255, 212, 0.55)";
            }
          }}
          onMouseUp={(e) => {
            if (isAuthenticated) {
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
                fontWeight: 600,
              }}
            >
              +
            </div>
          </div>
        </button>
      </div>

      {showTooltip && !isAuthenticated && (
        <div className="glass-surface shadow-glass text-glass animate-fade-in fixed bottom-[120px] right-8 px-4 py-3 text-sm whitespace-nowrap z-[51] pointer-events-none rounded-lg">
          Please connect your wallet to create a bottle
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
