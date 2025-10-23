import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * Improved UpdatePrompt component with more aggressive update checking:
 *
 * 1. Checks for updates every 30 minutes (instead of 60)
 * 2. Checks for updates when the page becomes visible (user returns to tab)
 * 3. Checks for updates on network reconnection
 * 4. More explicit console logging for debugging
 *
 * These improvements ensure users see update notifications more reliably.
 */
const UpdatePrompt = () => {
  const toastIdRef = useRef<string | number | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log("[PWA] Service worker registered successfully");

      if (registration) {
        // Check for updates more frequently - every 30 minutes
        const checkInterval = 30 * 60 * 1000;
        console.log(`[PWA] Setting up update check every ${checkInterval / 1000 / 60} minutes`);

        const intervalId = setInterval(() => {
          console.log("[PWA] Checking for updates (scheduled check)...");
          registration.update();
        }, checkInterval);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
      }
    },
    onRegisterError(error) {
      console.error("[PWA] Service worker registration error:", error);
    },
  });

  // Check for updates when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && 'serviceWorker' in navigator) {
        console.log("[PWA] Page became visible, checking for updates...");
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Check for updates when network comes back online
  useEffect(() => {
    const handleOnline = () => {
      if ('serviceWorker' in navigator) {
        console.log("[PWA] Network connection restored, checking for updates...");
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Show toast when update is available
  useEffect(() => {
    if (needRefresh) {
      console.log("[PWA] Update available! Showing notification to user.");

      // Dismiss any existing toast to avoid duplicates
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      toastIdRef.current = toast(
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
              console.log("[PWA] User clicked Update, reloading with new version...");
              updateServiceWorker(true);
              setNeedRefresh(false);
            },
          },
          cancel: {
            label: "Later",
            onClick: () => {
              console.log("[PWA] User dismissed update notification");
              setNeedRefresh(false);
            },
          },
        }
      );
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};

export default UpdatePrompt;
