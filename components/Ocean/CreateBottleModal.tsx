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
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          maxWidth: "448px",
          width: "100%",
          margin: "0 16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Cast a Bottle
        </h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          style={{
            width: "100%",
            height: "128px",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
          disabled={loading}
          autoFocus
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow =
              "0 0 0 2px rgba(59, 130, 246, 0.5)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {error && (
          <div style={{ marginTop: "8px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: loading || !message.trim() ? "not-allowed" : "pointer",
              opacity: loading || !message.trim() ? 0.5 : 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6";
            }}
          >
            {loading ? "Creating..." : "Cast Bottle"}
          </button>
        </div>
      </div>
    </div>
  );
}
