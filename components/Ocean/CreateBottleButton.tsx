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
        backgroundColor: "#ffffff",
        borderRadius: "50%",
        width: "80px",
        height: "80px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.3s, box-shadow 0.3s",
        zIndex: 50,
        padding: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow =
          "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
      }}
      aria-label="Create bottle"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/assets/bottle-sprites/1.png"
          alt="Bottle"
          style={{
            width: "48px",
            height: "auto",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          +
        </div>
      </div>
    </button>
  );
}
