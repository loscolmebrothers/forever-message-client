import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { Bottle } from "@loscolmebrothers/forever-message-types";

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
  error: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface TechnicalDetails {
  bottleId: number | null;
  ipfsCid: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface UseBottleQueueResult {
  queueItems: QueueItem[];
  pendingCount: number;
  isLoading: boolean;
  error: Error | null;
  technicalDetails: TechnicalDetails | null;
  setTechnicalDetails: (details: TechnicalDetails | null) => void;
}

export function useBottleQueue(userId: string): UseBottleQueueResult {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [technicalDetails, setTechnicalDetails] =
    useState<TechnicalDetails | null>(null);

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
    // Don't fetch or subscribe if userId is empty/undefined
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
              toast.success("Your bottle is floating in the ocean!", {
                id: updatedItem.id,
                duration: 15000,
                dismissible: true,
                action: {
                  label: "Where exactly?",
                  onClick: () => {
                    toast.info(
                      "We're working on making this feature even more special. Check back soon!",
                      { duration: 5000 }
                    );
                  },
                },
              });
              setTimeout(() => {
                setQueueItems((prev) =>
                  prev.filter((item) => item.id !== updatedItem.id)
                );
              }, 2000);
            } else if (updatedItem.status === "failed") {
              toast.error("Couldn't cast your bottle. Please try again.", {
                id: updatedItem.id,
                duration: 5000,
                dismissible: true,
                closeButton: true,
                description: updatedItem.error || undefined,
              });
              setTimeout(() => {
                setQueueItems((prev) =>
                  prev.filter((item) => item.id !== updatedItem.id)
                );
              }, 2000);
            } else if (updatedItem.status === "uploading") {
              toast.loading("Sealing your message...", {
                id: updatedItem.id,
                dismissible: true,
              });
            } else if (updatedItem.status === "minting") {
              toast.loading("Casting your bottle into the ocean...", {
                id: updatedItem.id,
                dismissible: true,
              });
            } else if (updatedItem.status === "confirming") {
              toast.loading("Almost there...", {
                id: updatedItem.id,
                dismissible: true,
              });
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
  }, [userId, fetchQueueItems]);

  const pendingCount = queueItems.filter((item) =>
    ["queued", "uploading", "minting", "confirming"].includes(item.status)
  ).length;

  return {
    queueItems,
    pendingCount,
    isLoading,
    error,
    technicalDetails,
    setTechnicalDetails,
  };
}
