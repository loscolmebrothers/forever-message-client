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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
        hasLiked
          ? "bg-red-50 border-red-500 text-red-600"
          : "bg-gray-50 border-gray-200"
      } ${isToggling ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105"}`}
      style={{
        color: hasLiked ? "#DC2626" : UI_COLORS.TEXT_PRIMARY,
      }}
    >
      <span className="text-lg">{hasLiked ? "❤️" : "🤍"}</span>
      <span>
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </span>
    </button>
  );
}
