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

export function CreateBottleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBottleModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [bottleFloat, setBottleFloat] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Animate bottle floating up and down
  useEffect(() => {
    if (!isOpen) return;

    let frame = 0;
    const animate = () => {
      frame += 0.05;
      setBottleFloat(Math.sin(frame) * 10);
      if (isOpen) requestAnimationFrame(animate);
    };
    animate();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setIsAnimating(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    setShowSparkles(true);

    await new Promise(resolve => setTimeout(resolve, 600));

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

      const data = await response.json();

      onSuccess();

      await new Promise(resolve => setTimeout(resolve, 400));
      setShowSparkles(false);
      setIsAnimating(false);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create bottle";
      setError(errorMessage);
      setLoading(false);
      setIsAnimating(false);
      setShowSparkles(false);
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
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (styled like CreateBottleButton) */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "36px",
            height: "36px",
            border: "none",
            background: "#ffffff",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#000000",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "scale(1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
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
            height: "200px",
            padding: "16px",
            border: "none",
            background: "transparent",
            resize: "none",
            outline: "none",
            fontFamily: "'AndreaScript', cursive",
            fontSize: "20px",
            color: "#2c1810",
            lineHeight: "1.6",
            position: "relative",
            zIndex: 1,
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            transition: isAnimating ? "all 0.8s ease-in" : "none",
            transform: isAnimating ? "scale(0.1) translateX(200%)" : "scale(1)",
            opacity: isAnimating ? 0 : 1,
          }}
          disabled={loading}
          autoFocus
        />

        {/* Character counter */}
        <div
          style={{
            marginTop: "8px",
            textAlign: "right",
            fontFamily: "'AndreaScript', cursive",
            fontSize: "16px",
            color: message.length >= MAX_CHARACTERS ? "#8b4513" : "rgba(44, 24, 16, 0.6)",
            position: "relative",
            zIndex: 1,
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            transition: isAnimating ? "all 0.8s ease-in" : "none",
            transform: isAnimating ? "scale(0.1) translateX(200%)" : "scale(1)",
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {message.length}/{MAX_CHARACTERS}
        </div>

        {error && (
          <div
            style={{
              marginTop: "12px",
              color: "#8b4513",
              fontSize: "18px",
              fontFamily: "'AndreaScript', cursive",
              position: "relative",
              zIndex: 1,
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            {error}
          </div>
        )}

      </div>

      {/* Floating bottle positioned outside right of modal */}
      <div
        style={{
          position: "absolute",
          right: isMobile ? "50%" : "calc(50% - 250px - 120px)",
          top: isMobile ? "auto" : "50%",
          bottom: isMobile ? "calc(50% - 200px)" : "auto",
          transform: isMobile
            ? `translateX(50%) translateY(${bottleFloat}px)`
            : `translateY(calc(-50% + ${bottleFloat}px))`,
          transition: "transform 0.1s ease-out",
          pointerEvents: loading || !message.trim() ? "none" : "auto",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: loading || !message.trim() ? 0.5 : 1,
            transition: "opacity 0.3s, filter 0.3s",
            padding: 0,
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
            position: "relative",
            animation: !loading && message.trim() ? "pulse 2s ease-in-out infinite" : "none",
          }}
          onMouseEnter={(e) => {
            if (!loading && message.trim()) {
              e.currentTarget.style.filter = "drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))";
          }}
          title="Cast your message into the ocean"
          aria-label={loading ? "Sealing message..." : "Cast message into the ocean"}
        >
          <img
            src="/assets/bottle-sprites/1.webp"
            alt="Cast bottle"
            style={{
              width: "72px",
              height: "auto",
              transition: "width 0.3s",
            }}
          />
        </button>

        {showSparkles && (
          <SparkleEffect />
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
            }
            50% {
              filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
            }
          }
        `}</style>
      </div>
    </div>
  );
}
