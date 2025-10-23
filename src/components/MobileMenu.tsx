import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, RotateCcw, Share2, Settings, Timer } from "lucide-react";

interface MobileMenuProps {
  onNewGame: () => void;
  onShare: () => void;
  onOpenSettings: () => void;
  onRestartTimer: () => void;
  showShare: boolean;
  isComplete: boolean;
}

export function MobileMenu({
  onNewGame,
  onShare,
  onOpenSettings,
  onRestartTimer,
  showShare,
  isComplete,
}: MobileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Menu">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onNewGame} className="gap-2 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          <span>New Game</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onRestartTimer}
          disabled={isComplete}
          className="gap-2 cursor-pointer"
        >
          <Timer className="h-4 w-4" />
          <span>Reset Timer & Errors</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {showShare && (
          <DropdownMenuItem onClick={onShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onOpenSettings} className="gap-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
