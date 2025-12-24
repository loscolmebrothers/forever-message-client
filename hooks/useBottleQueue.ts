import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import { useNotifications } from "@/lib/notifications/NotificationStore";

export type QueueStatus =
  | "queued"
  | "uploading"
  | "minting"
  | "confirming"
  | "completed"
  | "failed";

export interface BottleWithQueue extends Bottle {
  queueId?: string;
  queueStatus?: QueueStatus;
  queueProgress?: number;
  queueError?: string | null;
}

export function isPendingBottle(bottle: Bottle): bottle is BottleWithQueue {
  return (bottle as any).blockchainStatus === "pending";
}

export interface QueueItem {
  id: string;
  message: string;
  user_id: string;
  status: QueueStatus;
  progress: number;
  ipfs_cid: string | null;
  blockchain_id: number | null;
  transaction_hash: string | null;
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
  const { addLoadingToast, removeLoadingToast, addCompletionNotification } = useNotifications();

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
    if (!userId) {
      setQueueItems([]);
      setIsLoading(false);
      return;
    }

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
          if (payload.eventType === "INSERT") {
            const newItem = payload.new as QueueItem;
            setQueueItems((prev) => [newItem, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedItem = payload.new as QueueItem;
            setQueueItems((prev) =>
              prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              )
            );

            if (updatedItem.status === "completed") {
              removeLoadingToast(updatedItem.id);
              addCompletionNotification({
                id: updatedItem.id,
                message: updatedItem.blockchain_id
                  ? `Bottle #${updatedItem.blockchain_id} has been cast into the ocean!`
                  : "Your bottle has been cast into the ocean!",
                bottleId: updatedItem.blockchain_id,
                ipfsCid: updatedItem.ipfs_cid,
                transactionHash: updatedItem.transaction_hash,
              });
              setTimeout(() => {
                setQueueItems((prev) =>
                  prev.filter((item) => item.id !== updatedItem.id)
                );
              }, 1000);
            } else if (updatedItem.status === "failed") {
              removeLoadingToast(updatedItem.id);
              setTimeout(() => {
                setQueueItems((prev) =>
                  prev.filter((item) => item.id !== updatedItem.id)
                );
              }, 1000);
            } else if (updatedItem.status === "queued") {
              addLoadingToast(updatedItem.id, "Sealing your message...");
            } else if (updatedItem.status === "uploading") {
              addLoadingToast(updatedItem.id, "Sealing your message...");
            } else if (updatedItem.status === "minting") {
              addLoadingToast(
                updatedItem.id,
                "Casting your bottle into the ocean..."
              );
            } else if (updatedItem.status === "confirming") {
              addLoadingToast(updatedItem.id, "Almost there...");
            }
          } else if (payload.eventType === "DELETE") {
            const deletedItem = payload.old as QueueItem;
            setQueueItems((prev) =>
              prev.filter((item) => item.id !== deletedItem.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchQueueItems, addLoadingToast, removeLoadingToast, addCompletionNotification]);

  const pendingCount = queueItems.filter((item) =>
    ["queued", "uploading", "minting", "confirming"].includes(item.status)
  ).length;

  return {
    queueItems,
    pendingCount,
    isLoading,
    error,
  };
}
