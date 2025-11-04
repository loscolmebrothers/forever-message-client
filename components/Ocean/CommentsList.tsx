"use client";

import { useComments } from "@/hooks/useComments";
import { CommentCard } from "./CommentCard";
import type { LoadingComment } from "./AddCommentForm";

interface CommentsListProps {
  bottleId: number;
  loadingComments?: LoadingComment[];
}

export function CommentsList({
  bottleId,
  loadingComments = [],
}: CommentsListProps) {
  const { comments, isLoading, error, isEmpty } = useComments(bottleId);

  if (isLoading) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "#ef4444",
          fontSize: "14px",
        }}
      >
        Failed to load comments
      </div>
    );
  }

  if (isEmpty && loadingComments.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
      }}
    >
      {loadingComments.map((loadingComment) => (
        <div
          key={loadingComment.id}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            opacity: 0.6,
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              👤
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {loadingComment.userId}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  fontStyle: "italic",
                }}
              >
                Posting...
              </span>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#6b7280",
              lineHeight: "1.5",
              paddingLeft: "40px",
            }}
          >
            {loadingComment.message}
          </p>
        </div>
      ))}
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
