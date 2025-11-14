"use client";

import { useLikes } from "@/hooks/useLikes";
import { UI_COLORS } from "@/lib/constants";

interface LikeButtonProps {
  bottleId: number;
}

export function LikeButton({ bottleId }: LikeButtonProps) {
  const { likeCount, hasLiked, isToggling, toggleLike } = useLikes(bottleId);

  const handleClick = async () => {
    try {
      await toggleLike();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        backgroundColor: hasLiked ? "#FEE2E2" : "#F9FAFB",
        border: hasLiked ? "2px solid #EF4444" : "2px solid #E5E7EB",
        borderRadius: "8px",
        cursor: isToggling ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "500",
        color: hasLiked ? "#DC2626" : UI_COLORS.TEXT_PRIMARY,
        transition: "all 0.2s ease",
        opacity: isToggling ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isToggling) {
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span style={{ fontSize: "18px" }}>{hasLiked ? "❤️" : "🤍"}</span>
      <span>
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </span>
    </button>
  );
}
