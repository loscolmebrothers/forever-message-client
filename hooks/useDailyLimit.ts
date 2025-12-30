import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export interface DailyLimitStatus {
  bottlesCreated: number;
  bottlesRemaining: number;
  resetAt: string;
  isLimitReached: boolean;
}

interface UseDailyLimitResult {
  status: DailyLimitStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  timeUntilReset: number | null; // milliseconds
}

export function useDailyLimit(userId: string | null): UseDailyLimitResult {
  const [status, setStatus] = useState<DailyLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setTimeUntilReset(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Not authenticated yet - this is normal during initial connection
        setStatus(null);
        setTimeUntilReset(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/bottles/daily-limit", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch daily limit");
      }

      const data: DailyLimitStatus = await response.json();
      setStatus(data);

      // Calculate time until reset
      const resetTime = new Date(data.resetAt).getTime();
      const now = Date.now();
      setTimeUntilReset(Math.max(0, resetTime - now));
    } catch (err) {
      console.error("[useDailyLimit] Error fetching status:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Listen for auth state changes and refetch when user signs in
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // User just signed in, refetch the limit status
        fetchStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStatus]);

  // Client-side countdown timer (updates every minute)
  useEffect(() => {
    if (!status) return;

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Update countdown every minute
    timerRef.current = setInterval(() => {
      const resetTime = new Date(status.resetAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, resetTime - now);

      setTimeUntilReset(remaining);

      // If countdown reached 0, refetch status
      if (remaining === 0) {
        fetchStatus();
      }
    }, 60000); // Update every 60 seconds

    // Immediate update
    const resetTime = new Date(status.resetAt).getTime();
    const now = Date.now();
    setTimeUntilReset(Math.max(0, resetTime - now));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    timeUntilReset,
  };
}

/**
 * Format time until reset as human-readable string
 * Example: "3h 24m" or "45m" or "< 1m"
 */
export function formatTimeUntilReset(milliseconds: number): string {
  if (milliseconds <= 0) return "Soon";

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));

  if (totalMinutes < 1) return "< 1m";
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
