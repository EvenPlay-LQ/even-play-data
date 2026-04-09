import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const isIOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

export function InstallButton() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  // Hide only when already running as installed PWA
  if (isInstalled) return null;

  const handleClick = () => {
    if (canInstall) {
      promptInstall();
    } else if (isIOS) {
      alert(
        'To install Even Playground:\n\n1. Tap the Share button (box with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"'
      );
    } else {
      alert(
        "To install Even Playground:\n\nOpen this site in Chrome, Edge, or Safari and look for the install option in your browser's address bar or menu."
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
      onClick={handleClick}
    >
      <Download className="h-3.5 w-3.5" />
      Install App
    </Button>
  );
}
