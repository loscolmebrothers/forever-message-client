"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextImage from "next/image";
import { supabase } from "@/lib/supabase/client";
import { SparkleEffect } from "./SparkleEffect";
import { animate as anime } from "animejs";

interface CreateBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARACTERS = 120;

type AnimationPhase =
  | "idle"
  | "rolling"
  | "bottle-filling"
  | "sparkling"
  | "flying";

export function CreateBottleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBottleModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const sparkleContainerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "https://assets.loscolmebrothers.com/textures/parchment.jpg";
    img.onload = () => setTextureLoaded(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setLoading(false);
      setError(null);
      setAnimationPhase("idle");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose, loading]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || loading || !modalRef.current || !sealRef.current)
      return;

    setLoading(true);
    setError(null);

    setAnimationPhase("rolling");

    if (modalRef.current) {
      await new Promise<void>((resolve) => {
        anime(modalRef.current!, {
          scaleY: 0.1,
          duration: 800,
          ease: "inOut(quad)",
          complete: () => resolve(),
        });
      });
    }

    setAnimationPhase("bottle-filling");

    if (sealRef.current) {
      anime(sealRef.current, {
        scale: [0.5, 1.5],
        opacity: [0, 1],
        duration: 600,
        ease: "out(elastic(1, .6))",
        filter: [
          "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))",
          "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))",
        ],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    setAnimationPhase("sparkling");

    if (sealRef.current) {
      anime(sealRef.current, {
        opacity: 1,
        filter:
          "drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))",
        duration: 300,
        ease: "out(quad)",
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in to create a bottle");
      }

      const response = await fetch("/api/bottles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to create bottle");
      }

      setAnimationPhase("flying");

      const modalTargets = [modalRef.current, sealRef.current].filter(Boolean);

      if (modalTargets.length > 0) {
        await new Promise<void>((resolve) => {
          anime(modalTargets, {
            translateY: -200,
            opacity: 0,
            duration: 600,
            ease: "in(quad)",
            complete: () => resolve(),
          });
        });
      }

      onClose();
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create bottle";
      setError(errorMessage);
      setLoading(false);
      setAnimationPhase("idle");

      if (modalRef.current) {
        anime(modalRef.current, {
          scaleY: 1,
          duration: 300,
          ease: "out(quad)",
        });
      }
    }
  }, [message, loading, onClose, onSuccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !loading) {
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, loading, handleSubmit]);

  if (!isOpen) return null;

  if (!textureLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-parchment-modal rounded shadow-[0_20px_60px_rgba(0,0,0,0.5)] py-12 px-10 max-w-[500px] w-full mx-4 flex items-center justify-center min-h-[300px]">
          <div className="font-['AndreaScript',cursive] text-2xl text-ink">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const isRolling = animationPhase === "rolling";
  const isBottleFilling = animationPhase === "bottle-filling";
  const isSparkling = animationPhase === "sparkling";
  const isFlying = animationPhase === "flying";

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={loading ? undefined : onClose}
    >
      <div
        ref={modalRef}
        className={`relative bg-parchment-modal rounded shadow-[0_10px_30px_rgba(0,0,0,0.2)] max-w-[600px] w-[90%] mx-4 ${
          isMobile ? "pt-6 px-5 pb-12" : "pt-8 px-10 pb-16"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={loading ? undefined : onClose}
          disabled={loading}
          className={`absolute top-2 right-2 w-6 h-6 border-none bg-black/50 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] scale-100 transition-[transform,background,opacity] duration-200 z-10 ${
            loading ? "opacity-30 cursor-default" : "opacity-60 cursor-pointer"
          }`}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
              e.currentTarget.style.opacity = "1";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
              e.currentTarget.style.opacity = "0.6";
            }
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none rounded"
          style={{
            backgroundImage:
              "url('https://assets.loscolmebrothers.com/textures/parchment.jpg')",
          }}
        />
        <style jsx>{`
          textarea::placeholder {
            color: rgba(44, 24, 16, 0.4);
            opacity: 1;
          }
        `}</style>
        <textarea
          value={message}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\n/g, "");
            if (newValue.length <= MAX_CHARACTERS) {
              setMessage(newValue);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          placeholder="Write your message..."
          className={`w-full py-3 px-4 border-none bg-transparent resize-none outline-none font-['AndreaScript',cursive] text-ink leading-[1.4] relative z-[1] text-shadow-[0_1px_2px_rgba(255,255,255,0.5)] overflow-hidden whitespace-nowrap ${
            isMobile ? "h-[60px] text-lg" : "h-[75px] text-xl"
          }`}
          disabled={loading}
          autoFocus
          rows={1}
        />

        <div className="mt-2 text-right relative z-[1]">
          <div
            className="font-['ApfelGrotezk',sans-serif] text-[11px] text-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
            style={{
              color:
                message.length >= MAX_CHARACTERS
                  ? "#8b4513"
                  : "rgba(44, 24, 16, 0.4)",
            }}
          >
            {message.length}/{MAX_CHARACTERS}
          </div>
        </div>

        <div
          className={`absolute left-1/2 -translate-x-1/2 z-20 ${
            isMobile ? "-bottom-12" : "-bottom-16"
          }`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            ref={sealRef}
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className={`bg-transparent border-none p-0 relative ${
              loading || !message.trim() ? "cursor-default" : "cursor-pointer"
            } ${
              isBottleFilling || isSparkling || isFlying
                ? "opacity-100"
                : loading || !message.trim()
                  ? "opacity-40"
                  : "opacity-100"
            }`}
            style={{
              transition:
                "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              }
            }}
            aria-label={loading ? "Sealing message..." : "Seal your message"}
          >
            <NextImage
              src={
                isBottleFilling || isSparkling || isFlying
                  ? "/assets/bottle-sprites/1.webp"
                  : "/assets/wax-seal.png"
              }
              alt={
                isBottleFilling || isSparkling || isFlying
                  ? "Bottle"
                  : "Wax seal"
              }
              width={96}
              height={96}
              className="h-auto transition-all duration-[600ms] ease-in-out object-contain bg-transparent"
              style={{
                width:
                  isBottleFilling || isSparkling || isFlying
                    ? "64px"
                    : isMobile
                      ? "80px"
                      : "96px",
              }}
            />

            {isSparkling && (
              <div ref={sparkleContainerRef}>
                <SparkleEffect />
              </div>
            )}
          </button>

          {message.trim() && !loading && (
            <div
              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-ink text-white py-1.5 px-2.5 rounded text-[11px] font-['ApfelGrotezk',sans-serif] whitespace-nowrap z-[100] shadow-[0_4px_12px_rgba(0,0,0,0.3)] pointer-events-none transition-opacity duration-150 ease-[ease]"
              style={{ opacity: showTooltip ? 1 : 0 }}
            >
              Seal your message
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 text-[#8b4513] text-base font-['ApfelGrotezk',sans-serif] relative z-[1] text-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
