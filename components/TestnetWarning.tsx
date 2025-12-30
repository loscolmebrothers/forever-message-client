"use client";

import { useState } from "react";

export function TestnetWarning() {
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const [isEmailExpanded, setIsEmailExpanded] = useState(false);

  return (
    <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[99] flex items-center gap-2">
      {/* Email Button */}
      <a
        href="mailto:forever@loscolmebrothers.com"
        className="glass-surface shadow-glass backdrop-blur-sm border border-cyan-400/40 bg-cyan-500/20 rounded-lg transition-all duration-300 ease-in-out overflow-hidden hover:bg-cyan-500/30"
        onMouseEnter={() => setIsEmailExpanded(true)}
        onMouseLeave={() => setIsEmailExpanded(false)}
      >
        <div
          className={`px-3 py-2 transition-all duration-300 ease-in-out ${
            isEmailExpanded ? "w-[140px]" : "w-[44px]"
          }`}
        >
          <p
            className={`text-cyan-200 text-xs font-medium whitespace-nowrap transition-opacity duration-300 ${
              isEmailExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isEmailExpanded ? "✉️ Get in touch" : "✉️"}
          </p>
          {!isEmailExpanded && (
            <p className="text-cyan-200 text-sm font-medium absolute top-2 left-3">
              ✉️
            </p>
          )}
        </div>
      </a>

      {/* Warning Icon */}
      <div
        className="glass-surface shadow-glass backdrop-blur-sm border border-amber-400/40 bg-amber-500/20 rounded-lg transition-all duration-300 ease-in-out overflow-hidden"
        onMouseEnter={() => setIsWarningExpanded(true)}
        onMouseLeave={() => setIsWarningExpanded(false)}
      >
        <div
          className={`px-3 py-2 transition-all duration-300 ease-in-out ${
            isWarningExpanded ? "w-[200px]" : "w-[44px]"
          }`}
        >
          <p
            className={`text-amber-200 text-xs font-medium whitespace-nowrap transition-opacity duration-300 ${
              isWarningExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isWarningExpanded ? "⚠️ Beta — Running on Base Sepolia" : "⚠️"}
          </p>
          {!isWarningExpanded && (
            <p className="text-amber-200 text-sm font-medium absolute top-2 left-3">
              ⚠️
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
