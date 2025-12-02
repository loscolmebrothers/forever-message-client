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
          className="glass-surface shadow-glass-lg transition-all duration-300 rounded-full w-20 h-20 flex items-center justify-center p-2 hover:scale-110"
          style={{
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            opacity: isAuthenticated ? 1 : 0.6,
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
