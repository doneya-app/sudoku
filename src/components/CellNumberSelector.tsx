import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface CellNumberSelectorProps {
  children: React.ReactNode;
  onNumberSelect: (num: number | null) => void;
  isFixed: boolean;
  disabled?: boolean;
}

const CellNumberSelector = ({
  children,
  onNumberSelect,
  isFixed,
  disabled = false
}: CellNumberSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleNumberClick = (num: number | null) => {
    onNumberSelect(num);
    setOpen(false);
  };

  // Don't show popover for fixed cells or when disabled
  if (isFixed || disabled) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-2 sm:p-3",
          // Mobile: larger padding and spacing
          "max-sm:p-3"
        )}
        side="top"
        align="center"
        sideOffset={8}
      >
        {/* 3x3 Grid for numbers 1-9 */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              variant="outline"
              size="sm"
              className={cn(
                "font-semibold transition-all active:scale-95",
                "hover:bg-primary hover:text-primary-foreground",
                // Mobile: larger touch targets
                "min-w-[52px] min-h-[52px] text-xl",
                // Desktop: more compact
                "sm:min-w-[44px] sm:min-h-[44px] sm:text-lg"
              )}
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Clear button - full width below the grid */}
        <Button
          onClick={() => handleNumberClick(null)}
          variant="outline"
          size="sm"
          className={cn(
            "w-full mt-2 transition-all active:scale-95",
            "hover:bg-destructive hover:text-destructive-foreground",
            "min-h-[44px] sm:min-h-[36px]"
          )}
        >
          <Eraser className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default CellNumberSelector;
