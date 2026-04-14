export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    if (import.meta.env.DEV) {
      console.log(
        `[PWA] Storage persistence ${granted ? "granted" : "denied (browser heuristic)"}`
      );
    }
    return granted;
  }
  return false;
}

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage: usage || 0, quota: quota || 0 };
  }
  return null;
}
