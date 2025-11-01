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

      setMessage("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bottle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          backgroundImage: "url('https://assets.loscolmebrothers.com/textures/parchment.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          margin: "0 16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            fontFamily: "'Andrea Script', cursive",
            fontSize: "24px",
            color: "#3d2817",
            lineHeight: "1.6",
          }}
          disabled={loading}
          autoFocus
        />

        {error && (
          <div
            style={{
              marginTop: "12px",
              color: "#8b4513",
              fontSize: "16px",
              fontFamily: "'Andrea Script', cursive",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            style={{
              padding: "12px 32px",
              border: "2px solid #5d4037",
              background: "rgba(139, 69, 19, 0.2)",
              color: "#3d2817",
              cursor: loading || !message.trim() ? "not-allowed" : "pointer",
              opacity: loading || !message.trim() ? 0.5 : 1,
              fontFamily: "'Andrea Script', cursive",
              fontSize: "22px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.background = "rgba(139, 69, 19, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139, 69, 19, 0.2)";
            }}
          >
            {loading ? "Casting..." : "Cast"}
          </button>
        </div>
      </div>
    </div>
  );
}
