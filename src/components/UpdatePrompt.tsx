import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast(
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-semibold text-sm">New version available!</p>
            <p className="text-xs text-muted-foreground">Update now to get the latest features</p>
          </div>
        </div>,
        {
          duration: Infinity,
          action: {
            label: "Update",
            onClick: () => {
              updateServiceWorker(true);
              setNeedRefresh(false);
            },
          },
          cancel: {
            label: "Later",
            onClick: () => setNeedRefresh(false),
          },
        }
      );
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};

export default UpdatePrompt;
