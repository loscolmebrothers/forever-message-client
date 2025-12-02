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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in"
      style={{ padding: isMobile ? "16px" : "20px" }}
      onClick={onClose}
    >
      <div
        className="parchment-modal w-full max-w-[500px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url('https://assets.loscolmebrothers.com/textures/parchment.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            pointerEvents: "none",
            borderRadius: "4px",
            zIndex: 0,
          }}
        />

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "24px",
            height: "24px",
            border: "none",
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#ffffff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
            transform: "scale(1)",
            transition: "transform 0.2s, background 0.2s, opacity 0.2s",
            zIndex: 10,
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
            e.currentTarget.style.opacity = "0.6";
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          style={{
            padding: isMobile ? "32px 24px" : "48px 32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: isMobile ? "24px" : "28px",
              color: "#2c1810",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
              lineHeight: "1.5",
              textAlign: "center",
              marginBottom: "24px",
              maxHeight: "200px",
              overflow: "auto",
              wordWrap: "break-word",
            }}
          >
            {bottle.message}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(44, 24, 16, 0.1)",
              paddingTop: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "'ApfelGrotezk', sans-serif",
                fontSize: "14px",
                color: "rgba(44, 24, 16, 0.7)",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              {formatRelativeTime(bottle.timestamp)}
            </div>

            {isAuthenticated && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "16px",
                }}
              >
                <button
                  onClick={handleLikeClick}
                  disabled={isToggling}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: isToggling ? "not-allowed" : "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "transform 0.2s ease",
                    transform: hasLiked ? "scale(1.1)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isToggling) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToggling) {
                      e.currentTarget.style.transform = hasLiked
                        ? "scale(1.1)"
                        : "scale(1)";
                    }
                  }}
                  aria-label={
                    hasLiked ? "Unlike this bottle" : "Like this bottle"
                  }
                >
                  <NextImage
                    src="/assets/like-heart.png"
                    alt="Like"
                    width={32}
                    height={32}
                    style={{
                      width: "32px",
                      height: "32px",
                      filter: hasLiked
                        ? "none"
                        : "grayscale(100%) brightness(0.5)",
                      transition: "filter 0.2s ease",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'ApfelGrotezk', sans-serif",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#2c1810",
                    }}
                  >
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
