import { Clock, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/gameStats";

interface GameStatsProps {
  elapsedTime: number;
  errorCount: number;
  isComplete: boolean;
  onRestartTimer?: () => void;
}

export function GameStats({ elapsedTime, errorCount, isComplete, onRestartTimer }: GameStatsProps) {
  return (
    <div className="w-full sm:max-w-xl flex justify-center items-center gap-4 sm:gap-6 px-3 py-2 bg-muted/50 rounded-lg border border-border">
      {/* Timer */}
      <div className="flex items-center gap-1.5 text-sm min-w-[70px]">
        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-mono font-medium tabular-nums">
          {formatTime(elapsedTime)}
        </span>
      </div>

      {/* Restart Button */}
      {onRestartTimer && !isComplete && (
        <Button
          onClick={onRestartTimer}
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs px-2"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Restart</span>
        </Button>
      )}

      {/* Errors */}
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
    </div>
  );
}
