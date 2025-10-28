import { formatDistanceToNow } from "date-fns";
import type { Comment } from "@loscolmebrothers/forever-message-types";

interface CommentCardProps {
  comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div
      style={{
        padding: "12px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
        </div>
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#1f2937",
          lineHeight: "1.5",
          wordBreak: "break-word",
        }}
      >
        {comment.message}
      </div>
    </div>
  );
}
