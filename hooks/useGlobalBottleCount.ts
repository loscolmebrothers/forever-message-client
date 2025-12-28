import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const MAX_BOTTLES = 3000;

export function useGlobalBottleCount() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const { count: bottleCount, error } = await supabase
        .from("bottles")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("[GlobalBottleCount] Error fetching count:", error);
        return;
      }

      setCount(bottleCount || 0);
    } catch (error) {
      console.error("[GlobalBottleCount] Error fetching count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimistically increment count (called when user creates a bottle)
  const incrementCount = useCallback(() => {
    setCount((prev) => (prev !== null ? prev + 1 : null));
  }, []);

  useEffect(() => {
    let queueChannel: RealtimeChannel | null = null;
    let bottlesChannel: RealtimeChannel | null = null;

    // Initial fetch
    fetchCount();

    // Subscribe to bottles_queue for immediate feedback
    queueChannel = supabase
      .channel(`bottles-queue-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bottles_queue",
        },
        () => {
          // Optimistically increment when bottle is queued
          incrementCount();
        }
      )
      .subscribe();

    // Also subscribe to bottles table to sync with reality
    // (in case queue items fail or to correct any drift)
    bottlesChannel = supabase
      .channel(`bottles-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bottles",
        },
        () => {
          // Sync with actual count to correct any optimistic errors
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      if (queueChannel) {
        supabase.removeChannel(queueChannel);
      }
      if (bottlesChannel) {
        supabase.removeChannel(bottlesChannel);
      }
    };
  }, [fetchCount, incrementCount]);

  return {
    count,
    maxBottles: MAX_BOTTLES,
    remaining: count !== null ? MAX_BOTTLES - count : null,
    isLimitReached: count !== null && count >= MAX_BOTTLES,
    isLoading,
  };
}
