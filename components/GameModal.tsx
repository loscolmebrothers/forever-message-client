"use client";

interface GameModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export function GameModal({ isOpen, onContinue }: GameModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: "fadeIn 0.5s ease-in",
      }}
    >
      <div
        style={{
          width: "clamp(300px, 80vw, 500px)",
          padding: "clamp(30px, 6vw, 60px)",
          backgroundImage:
            "url(https://assets.loscolmebrothers.com/textures/parchment.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "12px",
          border: "3px solid #8b4513",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <h1
          style={{
            fontFamily: "ApfelGrotezk, sans-serif",
            fontSize: "clamp(28px, 6vw, 42px)",
            color: "#2c3e50",
            margin: 0,
            textAlign: "center",
          }}
        >
          Forever Message
        </h1>
        <button
          onClick={onContinue}
          style={{
            fontFamily: "ApfelGrotezk, sans-serif",
            fontSize: "clamp(16px, 3vw, 20px)",
            padding: "12px 40px",
            backgroundColor: "#8b4513",
            color: "#f5f5dc",
            border: "2px solid #654321",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#654321";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8b4513";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Continue
        </button>
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
      `}</style>
    </div>
  );
}
