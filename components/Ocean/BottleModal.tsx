"use client";

import { useEffect, useState } from "react";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { UI_COLORS } from "@/lib/constants";
import { CommentsList } from "./CommentsList";
import { AddCommentForm, type LoadingComment } from "./AddCommentForm";
import { LikeButton } from "./LikeButton";
import { useComments } from "@/hooks/useComments";
import { fetchBottleContent } from "@/lib/ipfs/fetch-content";

interface BottleModalProps {
  bottle: Bottle | null;
  onClose: () => void;
}

export function BottleModal({ bottle, onClose }: BottleModalProps) {
  const { mutate } = useComments(bottle?.id ?? 0);
  const [message, setMessage] = useState<string>("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [loadingComments, setLoadingComments] = useState<LoadingComment[]>([]);

  useEffect(() => {
    if (!bottle) {
      setMessage("");
      return;
    }

    const loadMessage = async () => {
      setIsLoadingMessage(true);
      try {
        const ipfsContent = await fetchBottleContent(bottle.ipfsHash);
        if (ipfsContent?.message) {
          setMessage(ipfsContent.message);
        } else {
          setMessage("Failed to load message from IPFS");
        }
      } catch (error) {
        console.error("Error loading message from IPFS:", error);
        setMessage("Failed to load message");
      } finally {
        setIsLoadingMessage(false);
      }
    };

    loadMessage();
  }, [bottle]);

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
          position: "relative",
          backgroundColor: "#f5f5dc",
          borderRadius: "4px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s ease-out",
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

        <div style={{ padding: "24px", position: "relative", zIndex: 1 }}>
          {isLoadingMessage ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "3px solid #E5E7EB",
                  borderTop: "3px solid #5d4037",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ color: UI_COLORS.TEXT_SECONDARY }}>
                Loading message from IPFS...
              </span>
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'AndreaScript', cursive",
                fontSize: "20px",
                lineHeight: "1.6",
                color: "#2c1810",
                margin: "0 0 24px 0",
                whiteSpace: "pre-wrap",
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {message}
            </p>
          )}

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
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: "16px" }}>
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

              <LikeButton bottleId={bottle.id} />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            borderTop: "1px solid #E5E7EB",
            backgroundColor: "#ffffff",
            position: "relative",
            zIndex: 1,
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

          <CommentsList
            bottleId={bottle.id}
            loadingComments={loadingComments}
          />

          <AddCommentForm
            bottleId={bottle.id}
            onSuccess={handleCommentSuccess}
            onLoadingCommentAdd={(comment) => {
              setLoadingComments((prev) => [...prev, comment]);
            }}
            onLoadingCommentRemove={(id) => {
              setLoadingComments((prev) =>
                prev.filter((comment) => comment.id !== id),
              );
            }}
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
