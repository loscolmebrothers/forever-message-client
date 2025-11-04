"use client";

import { useEffect } from "react";
import { UI_COLORS } from "@/lib/constants";

interface TechnicalDetailsModalProps {
  bottleId: number | null;
  ipfsCid: string | null;
  createdAt: string;
  completedAt: string | null;
  onClose: () => void;
}

export function TechnicalDetailsModal({
  bottleId,
  ipfsCid,
  createdAt,
  completedAt,
  onClose,
}: TechnicalDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x401F06DC3593B3c0cBC977F30c4936588401a4dE";

  const ipfsGatewayUrl = ipfsCid
    ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${ipfsCid}`
    : null;
  const baseScanUrl = `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: UI_COLORS.BACKDROP,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          padding: "20px",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: UI_COLORS.MODAL_BACKGROUND,
            borderRadius: "16px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: `0 8px 32px ${UI_COLORS.SHADOW}`,
            animation: "slideUp 0.3s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid #E5E7EB`,
              position: "relative",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "bold",
                color: UI_COLORS.TEXT_PRIMARY,
                paddingRight: "40px",
              }}
            >
              Technical Details
            </h2>

            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: UI_COLORS.TEXT_SECONDARY,
                padding: "4px 8px",
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div style={{ padding: "24px" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Blockchain ID */}
              {bottleId !== null && (
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: UI_COLORS.TEXT_PRIMARY,
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    Blockchain ID:
                  </strong>
                  <div
                    style={{
                      color: UI_COLORS.TEXT_SECONDARY,
                      fontSize: "14px",
                      fontFamily: "monospace",
                      backgroundColor: "#F3F4F6",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    {bottleId}
                  </div>
                  <a
                    href={baseScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      color: UI_COLORS.ACCENT,
                      fontSize: "13px",
                      textDecoration: "none",
                    }}
                  >
                    View on Base Sepolia →
                  </a>
                </div>
              )}

              {/* IPFS CID */}
              {ipfsCid && (
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: UI_COLORS.TEXT_PRIMARY,
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    IPFS CID:
                  </strong>
                  <div
                    style={{
                      color: UI_COLORS.TEXT_SECONDARY,
                      fontSize: "12px",
                      fontFamily: "monospace",
                      backgroundColor: "#F3F4F6",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      wordBreak: "break-all",
                    }}
                  >
                    {ipfsCid}
                  </div>
                  {ipfsGatewayUrl && (
                    <a
                      href={ipfsGatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "8px",
                        color: UI_COLORS.ACCENT,
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      View on IPFS →
                    </a>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div>
                <strong
                  style={{
                    display: "block",
                    color: UI_COLORS.TEXT_PRIMARY,
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Created:
                </strong>
                <div
                  style={{
                    color: UI_COLORS.TEXT_SECONDARY,
                    fontSize: "14px",
                  }}
                >
                  {formatDate(createdAt)}
                </div>
              </div>

              {completedAt && (
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: UI_COLORS.TEXT_PRIMARY,
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    Completed:
                  </strong>
                  <div
                    style={{
                      color: UI_COLORS.TEXT_SECONDARY,
                      fontSize: "14px",
                    }}
                  >
                    {formatDate(completedAt)}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid #E5E7EB",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  backgroundColor: UI_COLORS.TEXT_PRIMARY,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
