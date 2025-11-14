"use client";

/**
 * LoadingState Component
 * Displayed while fetching bottles from blockchain + IPFS
 */
export function LoadingState() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, #87CEEB, #4682B4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontSize: "64px",
          marginBottom: "20px",
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🌊
      </div>
      <h2 style={{ margin: 0, marginBottom: "10px", fontSize: "24px" }}>
        Loading bottles from the ocean...
      </h2>
      <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
        Fetching from Base L2 blockchain
      </p>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
