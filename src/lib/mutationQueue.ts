import { supabase } from "@/integrations/supabase/client";

interface QueuedMutation {
  id: string;
  timestamp: number;
  table: string;
  operation: "insert" | "update" | "delete" | "upsert";
  payload: Record<string, unknown>;
  filter?: Record<string, unknown>;
}

const STORAGE_KEY = "ep_mutation_queue";
const MAX_QUEUE_SIZE = 500;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setQueue(queue: QueuedMutation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage quota exceeded — drop oldest entries and retry
    const trimmed = queue.slice(-Math.floor(MAX_QUEUE_SIZE / 2));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch {}
  }
}

/** Remove mutations older than MAX_AGE_MS */
function pruneStale(queue: QueuedMutation[]): QueuedMutation[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  return queue.filter((m) => m.timestamp > cutoff);
}

export function enqueueMutation(
  mutation: Omit<QueuedMutation, "id" | "timestamp">
): void {
  let queue = pruneStale(getQueue());
  // Enforce size limit — drop oldest if full
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue = queue.slice(-(MAX_QUEUE_SIZE - 1));
  }
  queue.push({
    ...mutation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  setQueue(queue);
  window.dispatchEvent(new CustomEvent("mutation-queue-changed"));
}

export function getPendingCount(): number {
  return pruneStale(getQueue()).length;
}

export async function flushMutationQueue(): Promise<{
  succeeded: number;
  failed: number;
}> {
  const queue = pruneStale(getQueue());
  if (queue.length === 0) {
    setQueue([]);
    return { succeeded: 0, failed: 0 };
  }

  // Check auth session before replaying — stale tokens cause silent failures
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    if (import.meta.env.DEV) {
      console.warn("[MutationQueue] No active session — skipping flush");
    }
    return { succeeded: 0, failed: queue.length };
  }

  let succeeded = 0;
  let failed = 0;
  const remaining: QueuedMutation[] = [];

  for (const mutation of queue) {
    try {
      let query: any = supabase.from(mutation.table);

      switch (mutation.operation) {
        case "insert":
          query = query.insert(mutation.payload);
          break;
        case "upsert":
          query = query.upsert(mutation.payload);
          break;
        case "update": {
          query = query.update(mutation.payload);
          if (mutation.filter) {
            for (const [col, val] of Object.entries(mutation.filter)) {
              query = query.eq(col, val);
            }
          }
          break;
        }
        case "delete": {
          query = query.delete();
          if (mutation.filter) {
            for (const [col, val] of Object.entries(mutation.filter)) {
              query = query.eq(col, val);
            }
          }
          break;
        }
      }

      const { error } = await query;
      if (error) {
        if (import.meta.env.DEV) {
          console.error("[MutationQueue] Failed to replay:", mutation, error);
        }
        remaining.push(mutation);
        failed++;
      } else {
        succeeded++;
      }
    } catch {
      remaining.push(mutation);
      failed++;
    }
  }

  setQueue(remaining);
  window.dispatchEvent(new CustomEvent("mutation-queue-changed"));
  if (import.meta.env.DEV && succeeded > 0) {
    console.log(`[MutationQueue] Synced ${succeeded} queued mutations`);
  }
  return { succeeded, failed };
}

// Auto-flush on reconnection
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushMutationQueue();
  });

  // Safari fallback: also flush when app returns to foreground while online
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && navigator.onLine) {
      flushMutationQueue();
    }
  });
}
