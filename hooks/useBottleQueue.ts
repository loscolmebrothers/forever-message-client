import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type QueueStatus =
  | "queued"
  | "uploading"
  | "minting"
  | "confirming"
  | "completed"
  | "failed";

export interface QueueItem {
  id: string;
  message: string;
  user_id: string;
  status: QueueStatus;
  progress: number;
  ipfs_cid: string | null;
  blockchain_id: number | null;
  error: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface UseBottleQueueResult {
  queueItems: QueueItem[];
  pendingCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useBottleQueue(userId: string): UseBottleQueueResult {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQueueItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("bottles_queue")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["queued", "uploading", "minting", "confirming"])
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setQueueItems(data || []);
    } catch (err) {
      console.error("[useBottleQueue] Error fetching queue items:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQueueItems();

    const channel = supabase
      .channel(`queue:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bottles_queue",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[useBottleQueue] Realtime update:", payload);

          if (payload.eventType === "INSERT") {
            const newItem = payload.new as QueueItem;
            setQueueItems((prev) => [newItem, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedItem = payload.new as QueueItem;
            setQueueItems((prev) =>
              prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
              ),
            );

            if (
              updatedItem.status === "completed" ||
              updatedItem.status === "failed"
            ) {
              setTimeout(() => {
                setQueueItems((prev) =>
                  prev.filter((item) => item.id !== updatedItem.id),
                );
              }, 2000);
            }
          } else if (payload.eventType === "DELETE") {
            const deletedItem = payload.old as QueueItem;
            setQueueItems((prev) =>
              prev.filter((item) => item.id !== deletedItem.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchQueueItems]);

  const pendingCount = queueItems.filter((item) =>
    ["queued", "uploading", "minting", "confirming"].includes(item.status),
  ).length;

  return {
    queueItems,
    pendingCount,
    isLoading,
    error,
  };
}
