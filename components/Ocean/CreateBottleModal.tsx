"use client";

import { useState, useEffect } from "react";

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

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bottles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId: "danicolms" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to create bottle");
      }

      const data = await response.json();

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bottle");
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
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
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
            fontSize: "28px",
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
              padding: "12px 32px",
              border: "2px solid #5d4037",
              background: "rgba(139, 69, 19, 0.3)",
              color: "#2c1810",
              cursor: loading || !message.trim() ? "not-allowed" : "pointer",
              opacity: loading || !message.trim() ? 0.5 : 1,
              fontFamily: "'AndreaScript', cursive",
              fontSize: "24px",
              transition: "all 0.3s",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.background = "rgba(139, 69, 19, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139, 69, 19, 0.3)";
            }}
          >
            {loading ? "Casting..." : "Cast"}
          </button>
        </div>
      </div>
    </div>
  );
}
