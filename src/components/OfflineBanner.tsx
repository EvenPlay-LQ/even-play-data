import { useState, useEffect } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getPendingCount } from "@/lib/mutationQueue";

export default function OfflineBanner() {
  const { isOnline, wasOffline, clearWasOffline } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingCount);

  // Track pending mutation count
  useEffect(() => {
    const update = () => setPendingCount(getPendingCount());
    window.addEventListener("mutation-queue-changed", update);
    return () => window.removeEventListener("mutation-queue-changed", update);
  }, []);

  // Show "Back online!" briefly when reconnecting
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      setDismissed(false);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, clearWasOffline]);

  const showOffline = !isOnline && !dismissed;
  const showOnline = showReconnected && isOnline;
  const visible = showOffline || showOnline;

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
        visible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
            showOffline
              ? "bg-destructive/10 text-destructive"
              : "bg-green-500/10 text-green-600 dark:text-green-400"
          }`}
        >
          {showOffline ? (
            <>
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                You're offline — showing cached data
                {pendingCount > 0 &&
                  ` (${pendingCount} change${pendingCount > 1 ? "s" : ""} pending sync)`}
              </span>
              <button
                onClick={() => setDismissed(true)}
                className="ml-2 rounded-full p-0.5 hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Back online! Syncing changes...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
