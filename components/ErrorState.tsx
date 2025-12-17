"use client";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-10 text-center z-[100]"
      style={{
        background: "linear-gradient(to bottom, #87CEEB, #4682B4)",
      }}
    >
      <div className="text-[96px] mb-7">⚠️</div>
      <h2 className="m-0 mb-4 text-[32px] font-bold">
        Oops! Something went wrong
      </h2>
      <p className="m-0 mb-2.5 text-base max-w-[500px] opacity-90">
        We couldn&apos;t load the bottles from the ocean.
      </p>
      <p className="m-0 mb-7 text-sm max-w-[500px] opacity-70 font-mono">
        {error.message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 text-base font-bold text-[#4682B4] bg-white border-none rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
