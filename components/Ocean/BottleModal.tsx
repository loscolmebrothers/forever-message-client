"use client";

import { useEffect } from "react";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { UI_COLORS } from "@/lib/constants";
import { CommentsList } from "./CommentsList";
import { AddCommentForm } from "./AddCommentForm";
import { useComments } from "@/hooks/useComments";

interface BottleModalProps {
  bottle: Bottle | null;
  onClose: () => void;
}

export function BottleModal({ bottle, onClose }: BottleModalProps) {
  const { mutate } = useComments(bottle?.id ?? 0);

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

  const handleCommentSuccess = () => {
    mutate();
  };

  const daysUntilExpiration = bottle.isForever
    ? Infinity
    : Math.ceil(
        (bottle.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

  const isExpiringSoon = daysUntilExpiration <= 3 && !bottle.isForever;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: UI_COLORS.BACKDROP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: UI_COLORS.MODAL_BACKGROUND,
          borderRadius: "16px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: `0 8px 32px ${UI_COLORS.SHADOW}`,
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px",
            borderBottom: `1px solid #E5E7EB`,
            position: "relative",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: UI_COLORS.TEXT_PRIMARY,
              paddingRight: "40px",
            }}
          >
            Message in a Bottle {bottle.isForever && "✨"}
          </h2>

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: UI_COLORS.TEXT_SECONDARY,
              padding: "4px 8px",
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: UI_COLORS.TEXT_PRIMARY,
              margin: "0 0 24px 0",
              whiteSpace: "pre-wrap",
            }}
          >
            {bottle.message}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#F9FAFB",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{ fontSize: "14px", color: UI_COLORS.TEXT_SECONDARY }}
              >
                📅 Posted:
              </span>
              <span style={{ fontSize: "14px", color: UI_COLORS.TEXT_PRIMARY }}>
                {bottle.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {bottle.isForever ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{ fontSize: "14px", color: UI_COLORS.TEXT_SECONDARY }}
                >
                  ⏳ Status:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#10B981",
                  }}
                >
                  FOREVER ✨ (100+ likes & 4+ comments)
                </span>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{ fontSize: "14px", color: UI_COLORS.TEXT_SECONDARY }}
                >
                  ⏳ Expires in:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: isExpiringSoon ? "bold" : "normal",
                    color: isExpiringSoon ? "#EF4444" : UI_COLORS.TEXT_PRIMARY,
                  }}
                >
                  {daysUntilExpiration > 0
                    ? `${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}`
                    : "Expired"}
                  {isExpiringSoon && " ⚠️"}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "16px",
                paddingTop: "8px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>❤️</span>
                <span
                  style={{ fontSize: "14px", color: UI_COLORS.TEXT_PRIMARY }}
                >
                  {bottle.likeCount} {bottle.likeCount === 1 ? "like" : "likes"}
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>💬</span>
                <span
                  style={{ fontSize: "14px", color: UI_COLORS.TEXT_PRIMARY }}
                >
                  {bottle.commentCount}{" "}
                  {bottle.commentCount === 1 ? "comment" : "comments"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            borderTop: "1px solid #E5E7EB",
            backgroundColor: "#ffffff",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: UI_COLORS.TEXT_PRIMARY,
            }}
          >
            Comments
          </h3>

          <CommentsList bottleId={bottle.id} />

          <AddCommentForm
            bottleId={bottle.id}
            onSuccess={handleCommentSuccess}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
