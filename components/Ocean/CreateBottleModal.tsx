"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CreateBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

  useEffect(() => {
    const img = new Image();
    img.src = "https://assets.loscolmebrothers.com/textures/parchment.jpg";
    img.onload = () => setTextureLoaded(true);
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

      // Notification is handled by useBottleQueue which tracks status changes
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create bottle";
      setError(errorMessage);
      setLoading(false);
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
        {/* Quirky close button (X) */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "36px",
            height: "36px",
            border: "3px solid #8b4513",
            background: "#f5f5dc",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#8b4513",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            transform: "rotate(0deg)",
            transition: "all 0.3s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
            e.currentTarget.style.backgroundColor = "#8b4513";
            e.currentTarget.style.color = "#f5f5dc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            e.currentTarget.style.backgroundColor = "#f5f5dc";
            e.currentTarget.style.color = "#8b4513";
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
          onChange={(e) => setMessage(e.target.value)}
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
          }}
          disabled={loading}
          autoFocus
        />

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

        {/* Floating bottle "submit" button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            style={{
              background: "transparent",
              border: "none",
              cursor: loading || !message.trim() ? "not-allowed" : "pointer",
              opacity: loading || !message.trim() ? 0.5 : 1,
              transform: `translateY(${bottleFloat}px)`,
              transition: "transform 0.1s ease-out, opacity 0.3s, filter 0.3s",
              padding: 0,
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.filter = "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))";
            }}
            aria-label={loading ? "Casting bottle..." : "Cast bottle"}
          >
            <img
              src="/assets/bottle-sprites/1.webp"
              alt="Cast bottle"
              style={{
                width: loading ? "100px" : "120px",
                height: "auto",
                transition: "width 0.3s",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
