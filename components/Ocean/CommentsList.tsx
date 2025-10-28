"use client";

import { useComments } from "@/hooks/useComments";
import { CommentCard } from "./CommentCard";

interface CommentsListProps {
  bottleId: number;
}

export function CommentsList({ bottleId }: CommentsListProps) {
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

  if (isEmpty) {
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
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
