import { useEffect } from "react";
import { toast } from "sonner";

export default function PWAUpdatePrompt() {
  useEffect(() => {
    const handleUpdate = () => {
      toast("A new version is available", {
        description: "Save any unsaved work, then update.",
        duration: Infinity,
        action: {
          label: "Update Now",
          onClick: () => {
            const sw = navigator.serviceWorker;
            if (sw.controller) {
              // Tell the waiting SW to activate, then reload once it takes over
              sw.addEventListener("controllerchange", () => {
                window.location.reload();
              }, { once: true });
              sw.ready.then((reg) => reg.waiting?.postMessage({ type: "SKIP_WAITING" }));
            } else {
              window.location.reload();
            }
          },
        },
      });
    };

    window.addEventListener("sw-updated", handleUpdate);
    return () => window.removeEventListener("sw-updated", handleUpdate);
  }, []);

  return null;
}
