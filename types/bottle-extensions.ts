// TODO: Do we need a types/ folder, it's just three types in total,
// I'm pretty certain they can be moved elsewhere and we can remove a folder.
//
import type { Bottle } from "@loscolmebrothers/forever-message-types";
import type { QueueStatus } from "@/hooks/useBottleQueue";

export interface BottleWithQueue extends Bottle {
  queueId?: string;
  queueStatus?: QueueStatus;
  queueProgress?: number;
  queueError?: string | null;
}

export function isPendingBottle(bottle: Bottle): bottle is BottleWithQueue {
  return (bottle as any).blockchainStatus === "pending";
}
