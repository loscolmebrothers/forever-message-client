import { CompletionNotification } from "@/lib/notifications/NotificationStore";
import { useState } from "react";

export function BottleProgressToast({
  id,
  message,
  onDismiss,
}: {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  return (
    <div
      className="glass-notification flex items-center gap-3 relative mx-3 my-2"
      style={{
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
      }}
    >
      <div
        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white flex-shrink-0"
        style={{
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span className="text-glass text-sm flex-1">{message}</span>
      <button
        onClick={handleDismiss}
        className="w-5 h-5 flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0 p-0 border-0 bg-transparent text-base"
      >
        ×
      </button>
    </div>
  );
}

export function CompletionToast({
  notification,
  onDismiss,
}: {
  notification: CompletionNotification;
  onDismiss: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const ipfsGateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://storacha.link/ipfs";
  const ipfsUrl = notification.ipfsCid
    ? `${ipfsGateway}/${notification.ipfsCid}`
    : null;
  const blockchainUrl = notification.transactionHash
    ? `https://sepolia.basescan.org/tx/${notification.transactionHash}`
    : null;

  return (
    <div
      className="glass-notification relative mx-3 my-2"
      style={{
        animation: isExiting
          ? "toastExit 0.3s ease-out forwards"
          : "toastEnter 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-glass font-apfel text-sm flex-1">
          {notification.message}
        </span>
        <button
          onClick={handleDismiss}
          className="w-5 h-5 flex items-center justify-center text-glass-text/50 hover:text-glass-text transition-colors duration-200 cursor-pointer flex-shrink-0 p-0 border-0 bg-transparent text-base"
        >
          ×
        </button>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-transparent border-0 py-1 px-0 cursor-pointer flex items-center gap-1.5 font-apfel text-xs text-glass-text/60 hover:text-glass-text transition-colors duration-200"
      >
        <span>Where exactly?</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            d="M2 4 L6 8 L10 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isExpanded && (
        <div
          className="mt-3 pt-3 border-t border-glass-border flex gap-2"
          style={{
            animation: "expandIn 0.2s ease-out",
          }}
        >
          {ipfsUrl && (
            <a
              href={ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-glass-tint border border-glass-border hover:bg-glass-tint-dark hover:border-glass-border-dark rounded-md font-apfel text-xs text-glass-text text-center no-underline transition-all duration-200 font-medium"
            >
              IPFS
            </a>
          )}
          {blockchainUrl && (
            <a
              href={blockchainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-glass-tint border border-glass-border hover:bg-glass-tint-dark hover:border-glass-border-dark rounded-md font-apfel text-xs text-glass-text text-center no-underline transition-all duration-200 font-medium"
            >
              Blockchain
            </a>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
