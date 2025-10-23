import { Clock, AlertCircle } from "lucide-react";
import { formatTime } from "@/utils/gameStats";

interface GameStatsProps {
  elapsedTime: number;
  errorCount: number;
  isComplete: boolean;
  showTimer?: boolean;
  showErrors?: boolean;
  compact?: boolean;
}

export function GameStats({
  elapsedTime,
  errorCount,
  isComplete,
  showTimer = true,
  showErrors = true,
  compact = false
}: GameStatsProps) {
  // If both are hidden, don't render anything
  if (!showTimer && !showErrors) {
    return null;
  }

  // Compact mode: inline stats without background
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {showTimer && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-sm font-mono tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}
        {showErrors && (
          <div className="flex items-center gap-1">
            <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 ${
              errorCount > 0 ? 'text-destructive' : 'text-muted-foreground'
            }`} />
            <span className={`text-sm tabular-nums ${errorCount > 0 ? 'text-destructive' : ''}`}>
              {errorCount}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Regular mode: centered with background
  return (
    <div className="w-full sm:max-w-xl flex justify-center items-center gap-4 sm:gap-6 px-3 py-2 bg-muted/50 rounded-lg border border-border">
      {/* Timer */}
      {showTimer && (
        <div className="flex items-center gap-1.5 text-sm min-w-[70px]">
          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-mono font-medium tabular-nums">
            {formatTime(elapsedTime)}
          </span>
        </div>
      )}

      {/* Errors */}
      {showErrors && (
        <div className="flex items-center gap-1.5 text-sm min-w-[70px]">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
            errorCount > 0 ? 'text-destructive' : 'text-muted-foreground'
          }`} />
          <span className="font-medium">
            <span className="hidden sm:inline">Errors: </span><span className={`tabular-nums ${errorCount > 0 ? 'text-destructive' : ''}`}>
              {errorCount}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
