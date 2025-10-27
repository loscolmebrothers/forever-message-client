"use client";

interface CreateBottleButtonProps {
  onClick: () => void;
}

export function CreateBottleButton({ onClick }: CreateBottleButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        backgroundColor: "#3b82f6",
        color: "white",
        borderRadius: "50%",
        width: "64px",
        height: "64px",
        border: "none",
        cursor: "pointer",
        fontSize: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s",
        zIndex: 50,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#2563eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#3b82f6";
      }}
      aria-label="Create bottle"
    >
      +
    </button>
  );
}
