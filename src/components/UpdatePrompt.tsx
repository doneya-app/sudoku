import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("SW registered:", swUrl);
      // Check for updates every hour
      registration && setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
      toast.info("New version available!", {
        description: "Click to update the app",
        duration: Infinity,
        action: {
          label: "Update",
          onClick: () => {
            updateServiceWorker(true);
          },
        },
      });
    }
  }, [needRefresh, updateServiceWorker]);

  const handleUpdate = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
    updateServiceWorker(true);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-card border border-primary/50 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
        <div>
          <p className="font-semibold text-sm">Update Available</p>
          <p className="text-xs text-muted-foreground">A new version is ready</p>
        </div>
        <Button onClick={handleUpdate} size="sm" variant="default">
          Update Now
        </Button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
