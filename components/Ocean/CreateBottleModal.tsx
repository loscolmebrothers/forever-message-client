"use client";

import { useState, useEffect, useRef } from "react";
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

  const handleSubmit = async () => {
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
  };

  if (!isOpen) return null;

  if (!textureLoaded) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5dc",
            borderRadius: "4px",
            padding: "48px 40px",
            maxWidth: "500px",
            width: "100%",
            margin: "0 16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
          }}
        >
          <div
            style={{
              fontFamily: "'AndreaScript', cursive",
              fontSize: "24px",
              color: "#2c1810",
            }}
          >
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={loading ? undefined : onClose}
    >
      <div
        ref={modalRef}
        style={{
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          padding: isMobile ? "24px 20px 48px" : "32px 40px 64px",
          maxWidth: "600px",
          width: "90%",
          margin: "0 16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={loading ? undefined : onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "24px",
            height: "24px",
            border: "none",
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "50%",
            cursor: loading ? "default" : "pointer",
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
            opacity: loading ? 0.3 : 0.6,
          }}
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
          style={{
            width: "100%",
            height: isMobile ? "60px" : "75px",
            padding: "12px 16px",
            border: "none",
            background: "transparent",
            resize: "none",
            outline: "none",
            fontFamily: "'AndreaScript', cursive",
            fontSize: isMobile ? "18px" : "20px",
            color: "#2c1810",
            lineHeight: "1.4",
            position: "relative",
            zIndex: 1,
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          disabled={loading}
          autoFocus
          rows={1}
        />

        <div
          style={{
            marginTop: "8px",
            textAlign: "right",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'ApfelGrotezk', sans-serif",
              fontSize: "11px",
              color:
                message.length >= MAX_CHARACTERS
                  ? "#8b4513"
                  : "rgba(44, 24, 16, 0.4)",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {message.length}/{MAX_CHARACTERS}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: isMobile ? "-48px" : "-64px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            ref={sealRef}
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            style={{
              background: "transparent",
              border: "none",
              cursor: loading || !message.trim() ? "default" : "pointer",
              opacity: loading || !message.trim() ? 0.4 : 1,
              padding: 0,
              filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                anime(e.currentTarget, {
                  scale: 1.15,
                  rotate: 5,
                  duration: 400,
                  ease: "out(elastic(1, .5))",
                });
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && message.trim()) {
                anime(e.currentTarget, {
                  scale: 1,
                  rotate: 0,
                  duration: 400,
                  ease: "out(elastic(1, .5))",
                });
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
              style={{
                width:
                  isBottleFilling || isSparkling || isFlying
                    ? "64px"
                    : isMobile
                      ? "80px"
                      : "96px",
                height: "auto",
                transition: "all 0.6s ease-in-out",
              }}
            />

            {isSparkling && (
              <div ref={sparkleContainerRef}>
                <SparkleEffect />
              </div>
            )}
          </button>

          {showTooltip && message.trim() && !loading && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#2c1810",
                color: "#ffffff",
                padding: "6px 10px",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "'ApfelGrotezk', sans-serif",
                whiteSpace: "nowrap",
                zIndex: 100,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                pointerEvents: "none",
                opacity: 0.5,
              }}
            >
              Seal your message
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: "12px",
              color: "#8b4513",
              fontSize: "16px",
              fontFamily: "'ApfelGrotezk', sans-serif",
              position: "relative",
              zIndex: 1,
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
