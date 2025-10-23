import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ColorSchemeSelector from "./ColorSchemeSelector";
import { Moon, Sun } from "lucide-react";
import { GameOptions } from "@/contexts/GameOptionsContext";

interface SettingsContentProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  highlightEnabled: boolean;
  setHighlightEnabled: (enabled: boolean) => void;
  options: GameOptions;
  updateOption: (key: keyof GameOptions, value: boolean) => void;
}

export function SettingsContent({
  theme,
  setTheme,
  highlightEnabled,
  setHighlightEnabled,
  options,
  updateOption,
}: SettingsContentProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Settings</h3>

      <ColorSchemeSelector />

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Appearance</h4>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="dark-mode-toggle"
            className="cursor-pointer flex items-center gap-2"
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            Dark Mode
          </Label>
          <Switch
            id="dark-mode-toggle"
            checked={theme === "dark"}
            onCheckedChange={(checked) =>
              setTheme(checked ? "dark" : "light")
            }
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Gameplay</h4>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="highlight-toggle"
            className="cursor-pointer"
          >
            Row/Column Highlight
          </Label>
          <Switch
            id="highlight-toggle"
            checked={highlightEnabled}
            onCheckedChange={setHighlightEnabled}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Double-click a selected cell to quickly toggle
          highlighting
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Game Options</h4>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="show-share-toggle"
            className="cursor-pointer"
          >
            Show Share Button
          </Label>
          <Switch
            id="show-share-toggle"
            checked={options.showShareButton}
            onCheckedChange={(checked) =>
              updateOption("showShareButton", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="show-timer-toggle"
            className="cursor-pointer"
          >
            Show Timer
          </Label>
          <Switch
            id="show-timer-toggle"
            checked={options.showTimer}
            onCheckedChange={(checked) =>
              updateOption("showTimer", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="show-errors-toggle"
            className="cursor-pointer"
          >
            Show Errors
          </Label>
          <Switch
            id="show-errors-toggle"
            checked={options.showErrors}
            onCheckedChange={(checked) =>
              updateOption("showErrors", checked)
            }
          />
        </div>

      </div>
    </div>
  );
}
