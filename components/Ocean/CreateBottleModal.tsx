"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextImage from "next/image";
import { supabase } from "@/lib/supabase/client";
import { animate as anime } from "animejs";
import { useAuth } from "@/lib/auth/AuthContext";

interface CreateBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARACTERS = 120;

type AnimationPhase = "idle" | "bottle-filling" | "flying";

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const bookmarkRef = useRef<HTMLButtonElement>(null);

  const { isAuthenticated, signIn } = useAuth();

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

  useEffect(() => {
    if (isOpen && bookmarkRef.current) {
      anime(bookmarkRef.current, {
        translateY: [-3, 0],
        rotate: [2, 0],
        duration: 2000,
        ease: "inOut(sine)",
        loop: true,
        direction: "alternate",
      });
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || loading || !modalRef.current || !sealRef.current)
      return;

    setLoading(true);
    setError(null);

    setAnimationPhase("bottle-filling");

    if (sealRef.current) {
      anime(sealRef.current, {
        scale: [1, 1.1, 1],
        duration: 1000,
        ease: "inOut(sine)",
        loop: true,
      });
    }

    try {
      // Auto-authenticate if not already authenticated
      if (!isAuthenticated) {
        await signIn();
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Authentication failed");
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
            opacity: 0,
            scale: 0.95,
            duration: 300,
            ease: "out(quad)",
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
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(32, 178, 170, 0.15) 0%, rgba(15, 40, 56, 0.85) 60%, rgba(0, 0, 0, 0.95) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="bg-parchment rounded-parchment-md py-12 px-10 max-w-[500px] w-full mx-4 flex items-center justify-center min-h-[300px]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(139, 69, 19, 0.2), 0 8px 24px rgba(139, 69, 19, 0.25), 0 0 40px rgba(255, 223, 186, 0.3)",
          }}
        >
          <div className="font-['AndreaScript',cursive] text-2xl text-ink">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const isBottleFilling = animationPhase === "bottle-filling";
  const isFlying = animationPhase === "flying";

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={loading ? undefined : onClose}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(32, 178, 170, 0.15) 0%, rgba(15, 40, 56, 0.85) 60%, rgba(0, 0, 0, 0.95) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        ref={modalRef}
        className={`relative bg-parchment rounded-parchment-md max-w-[600px] w-[90%] mx-4 ${
          isMobile ? "pt-6 px-5 pb-12" : "pt-8 px-10 pb-16"
        } z-[60]`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 0 1px rgba(139, 69, 19, 0.2), 0 8px 24px rgba(139, 69, 19, 0.25), 0 0 40px rgba(255, 223, 186, 0.3)",
        }}
      >
        <button
          ref={bookmarkRef}
          onClick={loading ? undefined : onClose}
          disabled={loading}
          className={`absolute top-2 right-3 w-7 h-[34px] flex flex-col items-center justify-center transition-all duration-300 z-[70] ${
            loading ? "opacity-30 cursor-default" : "opacity-100 cursor-pointer"
          }`}
          style={{
            filter: loading
              ? "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.2))"
              : "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
              e.currentTarget.style.filter =
                "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter =
                "drop-shadow(0 2px 4px rgba(139, 69, 19, 0.3))";
            }
          }}
          onMouseDown={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.05) rotate(3deg)";
              e.currentTarget.style.filter =
                "drop-shadow(0 6px 12px rgba(139, 69, 19, 0.5)) drop-shadow(0 0 16px rgba(255, 223, 186, 0.8))";
            }
          }}
          onMouseUp={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
              e.currentTarget.style.filter =
                "drop-shadow(0 4px 8px rgba(139, 69, 19, 0.4)) drop-shadow(0 0 12px rgba(255, 223, 186, 0.6))";
            }
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
          className={`w-full py-3 px-4 border-none bg-transparent resize-none outline-none font-['AndreaScript',cursive] text-ink leading-relaxed relative z-[1] text-shadow-[0_1px_2px_rgba(255,255,255,0.5)] break-words overflow-hidden ${
            isMobile ? "min-h-[300px] text-2xl" : "min-h-[250px] text-[28px]"
          }`}
          disabled={loading}
          autoFocus
          rows={1}
        />

        <div className="mt-2 text-right relative z-[1]">
          <div
            className="font-['ApfelGrotezk',sans-serif] text-base font-medium text-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
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
              isBottleFilling || isFlying
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
                isBottleFilling || isFlying
                  ? "/assets/bottle-sprites/1.webp"
                  : "/assets/wax-seal.png"
              }
              alt={isBottleFilling || isFlying ? "Bottle" : "Wax seal"}
              width={96}
              height={96}
              className="h-auto transition-all duration-[600ms] ease-in-out object-contain bg-transparent"
              style={{
                width:
                  isBottleFilling || isFlying
                    ? "64px"
                    : isMobile
                      ? "80px"
                      : "96px",
              }}
            />
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
