"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLikes } from "@/hooks/useLikes";

interface BottleModalProps {
  bottle: Bottle | null;
  onClose: () => void;
}

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
};

export function BottleModal({ bottle, onClose }: BottleModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();
  const { likeCount, hasLiked, toggleLike, isToggling } = useLikes(
    bottle?.id || 0
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (bottle) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [bottle, onClose]);

  if (!bottle) {
    return null;
  }

  const handleLikeClick = async () => {
    if (!isAuthenticated || isToggling) return;
    try {
      await toggleLike();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in ${isMobile ? "p-4" : "p-5"}`}
      onClick={onClose}
    >
      <div
        className="parchment-modal w-full max-w-[500px] animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none rounded-parchment-md z-0"
          style={{
            backgroundImage:
              "url('https://assets.loscolmebrothers.com/textures/parchment.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 border-0 bg-black/50 hover:bg-black/80 rounded-full cursor-pointer flex items-center justify-center text-sm font-bold text-white shadow-sm opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200 z-10"
          aria-label="Close"
        >
          ×
        </button>

        <div
          className={`relative z-10 ${isMobile ? "p-8 px-6" : "py-12 px-8"}`}
        >
          <div
            className={`font-[AndreaScript,cursive] text-ink-dark text-center leading-relaxed mb-6 max-h-[200px] overflow-auto break-words ${isMobile ? "text-2xl" : "text-[28px]"}`}
            style={{
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {bottle.message}
          </div>

          <div className="border-t border-ink/10 pt-4 mt-4">
            <div className="font-apfel text-sm text-ink/70 mb-4 text-center">
              {formatRelativeTime(bottle.timestamp)}
            </div>

            {isAuthenticated && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={handleLikeClick}
                  disabled={isToggling}
                  className={`bg-transparent border-0 cursor-pointer p-2 flex items-center gap-2 transition-transform duration-200 ${isToggling ? "cursor-not-allowed" : ""} ${hasLiked ? "scale-110" : "scale-100"} hover:scale-105`}
                  aria-label={
                    hasLiked ? "Unlike this bottle" : "Like this bottle"
                  }
                >
                  <NextImage
                    src="/assets/like-heart.png"
                    alt="Like"
                    width={32}
                    height={32}
                    className={`w-8 h-8 transition-[filter] duration-200 ${hasLiked ? "" : "grayscale brightness-50"}`}
                  />
                  <span className="font-apfel text-lg font-bold text-ink">
                    {likeCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
