import { useState, useEffect, useCallback } from "react";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType: string | null;
  /** Call after the reconnection has been acknowledged (e.g., banner auto-dismissed) */
  clearWasOffline: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [effectiveType, setEffectiveType] = useState<string | null>(
    (navigator as any).connection?.effectiveType ?? null
  );

  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    if (!online) setWasOffline(true);
  }, []);

  const clearWasOffline = useCallback(() => setWasOffline(false), []);

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      const handleChange = () => setEffectiveType(connection.effectiveType);
      connection.addEventListener("change", handleChange);
      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
        connection.removeEventListener("change", handleChange);
      };
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [updateOnlineStatus]);

  return { isOnline, wasOffline, effectiveType, clearWasOffline };
}
