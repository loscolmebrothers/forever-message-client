"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface LoadingComment {
  id: string;
  message: string;
  userId: string;
}

interface AddCommentFormProps {
  bottleId: number;
  onSuccess: () => void;
  onLoadingCommentAdd?: (comment: LoadingComment) => void;
  onLoadingCommentRemove?: (id: string) => void;
}

export function AddCommentForm({
  bottleId,
  onSuccess,
  onLoadingCommentAdd,
  onLoadingCommentRemove,
}: AddCommentFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 280;
  const remainingChars = maxLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const toastId = `comment-${bottleId}-${Date.now()}`;
    const loadingCommentId = toastId;
    const messageToPost = message;

    setLoading(true);
    setError(null);
    setMessage("");

    const loadingComment: LoadingComment = {
      id: loadingCommentId,
      message: messageToPost,
      userId: "danicolms",
    };

    onLoadingCommentAdd?.(loadingComment);

    toast.loading("Uploading your comment...", {
      id: toastId,
      dismissible: true,
    });

    try {
      const response = await fetch(`/api/bottles/${bottleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToPost, userId: "danicolms" }),
      });

      toast.loading("Posting to blockchain...", {
        id: toastId,
        dismissible: true,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || "Failed to add comment");
      }

      toast.success("Comment posted!", {
        id: toastId,
        duration: 3000,
        dismissible: true,
        closeButton: true,
      });

      onLoadingCommentRemove?.(loadingCommentId);
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add comment";

      toast.error("Failed to post comment", {
        id: toastId,
        duration: 5000,
        dismissible: true,
        closeButton: true,
        description: errorMessage,
      });

      onLoadingCommentRemove?.(loadingCommentId);
      setMessage(messageToPost);
      setError(errorMessage);
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
