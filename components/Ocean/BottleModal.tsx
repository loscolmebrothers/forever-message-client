"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLikes } from "@/hooks/useLikes";
import { animate as anime } from "animejs";

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
  const [isClosing, setIsClosing] = useState(false);
  const { isAuthenticated } = useAuth();
  const { likeCount, hasLiked, toggleLike, isToggling } = useLikes(
    bottle?.id || 0
  );
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  const heartRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(async () => {
    if (isClosing) return;
    setIsClosing(true);

    if (modalContainerRef.current && modalContentRef.current) {
      anime(modalContainerRef.current, {
        opacity: [1, 0],
        duration: 200,
        ease: "out(quad)",
      });

      await new Promise<void>((resolve) => {
        anime(modalContentRef.current!, {
          scale: [1, 0.95],
          duration: 200,
          ease: "out(quad)",
          complete: () => resolve(),
        });
      });
    }

    onClose();
  }, [isClosing, onClose]);

  useEffect(() => {
    if (bottle) {
      setIsClosing(false);
    }
  }, [bottle]);

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
        handleClose();
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
  }, [bottle, handleClose]);

  useEffect(() => {
    if (bookmarkRef.current) {
      anime(bookmarkRef.current, {
        translateY: [-3, 0],
        rotate: [2, 0],
        duration: 2000,
        ease: "inOut(sine)",
        loop: true,
        direction: "alternate",
      });
    }

    if (heartRef.current) {
      anime(heartRef.current, {
        scale: [1, 1.05],
        duration: 2500,
        ease: "inOut(sine)",
        loop: true,
        direction: "alternate",
      });
    }
  }, [bottle]);

  if (!bottle) {
    return null;
  }

  const handleLikeClick = async () => {
    if (!isAuthenticated || isToggling) return;
    try {
      await toggleLike();
      if (heartRef.current) {
        heartRef.current.style.transform = "";
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div
      ref={modalContainerRef}
      className={`fixed inset-0 flex items-center justify-center z-[1000] animate-fade-in ${isMobile ? "p-4" : "p-5"}`}
      onClick={handleClose}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(32, 178, 170, 0.15) 0%, rgba(15, 40, 56, 0.85) 60%, rgba(0, 0, 0, 0.95) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        ref={modalContentRef}
        className="w-full max-w-[500px] animate-slide-up relative bg-parchment rounded-parchment-md p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 0 1px rgba(139, 69, 19, 0.2), 0 8px 24px rgba(139, 69, 19, 0.25), 0 0 40px rgba(255, 223, 186, 0.3)",
        }}
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
          ref={bookmarkRef}
          onClick={handleClose}
          className="absolute top-2 right-3 w-7 h-[34px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-10"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
            e.currentTarget.style.filter =
              "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.filter =
              "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(1.05) rotate(3deg)";
            e.currentTarget.style.filter =
              "drop-shadow(0 6px 12px rgba(139, 69, 19, 0.5)) drop-shadow(0 0 16px rgba(255, 223, 186, 0.8))";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
            e.currentTarget.style.filter =
              "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
          }}
          aria-label="Close"
        >
          {/* Bookmark flag shape */}
          <svg
            width="28"
            height="34"
            viewBox="0 0 28 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none"
          >
            {/* Flag body */}
            <path
              d="M0 0 L28 0 L28 34 L14 27 L0 34 Z"
              fill="#d4cfb5"
              stroke="#8b4513"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            {/* X symbol */}
            <text
              x="14"
              y="16"
              fontSize="16"
              fontWeight="bold"
              fill="rgba(44, 24, 16, 0.4)"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Arial, sans-serif"
            >
              ×
            </text>
          </svg>
        </button>

        <div
          className={`relative z-10 ${isMobile ? "p-8 px-6" : "py-12 px-8"}`}
        >
          <div
            className={`font-[AndreaScript,cursive] text-ink-dark text-center leading-relaxed mb-6 break-words ${isMobile ? "text-2xl" : "text-[28px]"}`}
            style={{
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {bottle.message}
          </div>

          <div className="border-t border-ink/10 pt-4 mt-4">
            <div className="font-apfel text-sm text-ink/70 text-center">
              {formatRelativeTime(bottle.timestamp)}
            </div>
          </div>
        </div>

        {/* Like button with badge */}
        {isAuthenticated && (
          <button
            ref={heartRef}
            onClick={handleLikeClick}
            disabled={isToggling}
            className={`absolute top-[11px] right-12 w-7 h-7 flex items-center justify-center transition-all duration-300 z-10 ${
              isToggling ? "cursor-wait" : "cursor-pointer"
            }`}
            style={{
              filter: isToggling
                ? "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.2))"
                : "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))",
            }}
            onMouseEnter={(e) => {
              if (!isToggling) {
                e.currentTarget.style.transform = "scale(1.15) rotate(-5deg)";
                e.currentTarget.style.filter =
                  "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
              }
            }}
            onMouseLeave={(e) => {
              if (!isToggling) {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.filter =
                  "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))";
              }
            }}
            onMouseDown={(e) => {
              if (!isToggling) {
                e.currentTarget.style.transform = "scale(1.05) rotate(-3deg)";
                e.currentTarget.style.filter =
                  "drop-shadow(0 6px 12px rgba(139, 69, 19, 0.5)) drop-shadow(0 0 16px rgba(255, 223, 186, 0.8))";
              }
            }}
            onMouseUp={(e) => {
              if (!isToggling) {
                e.currentTarget.style.transform = "scale(1.15) rotate(-5deg)";
                e.currentTarget.style.filter =
                  "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
              }
            }}
            aria-label={hasLiked ? "Unlike this bottle" : "Like this bottle"}
          >
            <div className="relative w-7 h-7">
              <NextImage
                src="/assets/like-heart.png"
                alt="Like"
                width={28}
                height={28}
                className={`w-7 h-7 transition-all duration-200 ${
                  hasLiked ? "" : "grayscale brightness-50"
                } ${isToggling ? "opacity-50 scale-90" : "opacity-100"}`}
              />
            </div>
            {likeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-apfel font-bold shadow-md">
                {likeCount > 9 ? "9+" : likeCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
