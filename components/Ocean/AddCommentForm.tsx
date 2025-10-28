"use client";

import { useState } from "react";

interface AddCommentFormProps {
  bottleId: number;
  onSuccess: () => void;
}

export function AddCommentForm({ bottleId, onSuccess }: AddCommentFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 280;
  const remainingChars = maxLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bottles/${bottleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId: "danicolms" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to add comment");
      }

      setMessage("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
      <div style={{ marginBottom: "8px" }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          placeholder="Add a comment..."
          disabled={loading}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "14px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: remainingChars < 20 ? "#ef4444" : "#9ca3af",
            }}
          >
            {remainingChars} characters remaining
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "8px",
            padding: "8px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "4px",
            color: "#dc2626",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !message.trim()}
        style={{
          width: "100%",
          padding: "10px 16px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
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
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
