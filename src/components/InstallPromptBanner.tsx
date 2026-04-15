import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const DISMISS_KEY = "ep_install_dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export default function InstallPromptBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(isDismissed);

  if (!canInstall || dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setDismissed(true);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) handleDismiss();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-slide-up">
      <div className="rounded-xl border border-primary/20 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Install Even Playground
              </p>
              <p className="text-muted-foreground">
                Get faster access and offline support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
