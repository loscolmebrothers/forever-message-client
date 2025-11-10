"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { SparkleEffect } from "./SparkleEffect";

interface CreateBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CHARACTERS = 200;

type AnimationPhase = "idle" | "rolling" | "bottle-filling" | "sparkling" | "flying";

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
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);

    setAnimationPhase("rolling");
    await new Promise(resolve => setTimeout(resolve, 800));

    setAnimationPhase("bottle-filling");
    await new Promise(resolve => setTimeout(resolve, 600));

    setAnimationPhase("sparkling");
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in to create a bottle");
      }

      const response = await fetch("/api/bottles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to create bottle");
      }

      onSuccess();

      setAnimationPhase("flying");
      await new Promise(resolve => setTimeout(resolve, 600));

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create bottle";
      setError(errorMessage);
      setLoading(false);
      setAnimationPhase("idle");
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
        style={{
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          padding: isMobile ? "24px 20px" : "32px 40px",
          maxWidth: "600px",
          width: "90%",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          transition: "all 0.8s ease-in-out",
          transform: isRolling ? "scaleY(0.1)" : "scaleY(1)",
          opacity: isFlying ? 0 : 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={loading ? undefined : onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "36px",
            height: "36px",
            border: "none",
            background: "#000000",
            borderRadius: "50%",
            cursor: loading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#ffffff",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
            transform: "scale(1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            zIndex: 10,
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)";
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
            const newValue = e.target.value;
            if (newValue.length <= MAX_CHARACTERS) {
              setMessage(newValue);
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
          }}
          disabled={loading}
          autoFocus
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "'ApfelGrotezk', sans-serif",
              fontSize: "14px",
              color: message.length >= MAX_CHARACTERS ? "#8b4513" : "rgba(44, 24, 16, 0.6)",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {message.length}/{MAX_CHARACTERS}
          </div>

          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {showTooltip && message.trim() && !loading && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  right: "0",
                  backgroundColor: "#2c1810",
                  color: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "'ApfelGrotezk', sans-serif",
                  whiteSpace: "nowrap",
                  zIndex: 100,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  pointerEvents: "none",
                }}
              >
                Seal your message
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
              style={{
                background: "transparent",
                border: "none",
                cursor: loading || !message.trim() ? "default" : "pointer",
                opacity: loading || !message.trim() ? 0.4 : 1,
                transition: "all 0.3s",
                padding: 0,
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
                position: "relative",
                transform: isBottleFilling ? "scale(1.5)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!loading && message.trim()) {
                  e.currentTarget.style.filter = "drop-shadow(0 0 20px rgba(220, 38, 38, 0.6)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))";
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && message.trim()) {
                  e.currentTarget.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
              aria-label={loading ? "Sealing message..." : "Seal your message"}
            >
              <img
                src={isBottleFilling || isSparkling || isFlying ? "/assets/bottle-sprites/1.webp" : "/assets/effects/wax-seal.png"}
                alt={isBottleFilling || isSparkling || isFlying ? "Bottle" : "Wax seal"}
                style={{
                  width: isBottleFilling || isSparkling || isFlying ? "48px" : "64px",
                  height: "auto",
                  transition: "all 0.6s ease-in-out",
                }}
              />

              {isSparkling && (
                <SparkleEffect />
              )}
            </button>
          </div>
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
