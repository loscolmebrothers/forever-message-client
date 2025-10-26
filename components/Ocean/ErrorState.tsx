"use client";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

/**
 * ErrorState Component
 * Displayed when there's an error fetching bottles
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
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
        padding: "40px",
        textAlign: "center",
        zIndex: 100,
      }}
    >
      <div style={{ fontSize: "96px", marginBottom: "30px" }}>⚠️</div>
      <h2
        style={{
          margin: 0,
          marginBottom: "15px",
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        Oops! Something went wrong
      </h2>
      <p
        style={{
          margin: 0,
          marginBottom: "10px",
          fontSize: "16px",
          maxWidth: "500px",
          opacity: 0.9,
        }}
      >
        We couldn&apos;t load the bottles from the ocean.
      </p>
      <p
        style={{
          margin: 0,
          marginBottom: "30px",
          fontSize: "14px",
          maxWidth: "500px",
          opacity: 0.7,
          fontFamily: "monospace",
        }}
      >
        {error.message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#4682B4",
            background: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
