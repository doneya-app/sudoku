import { cn } from "@/lib/utils";
import CellNumberSelector from "./CellNumberSelector";

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumberHighlighted: boolean;
  isError: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onNumberSelect?: (num: number | null) => void;
}

const SudokuCell = ({
  value,
  isFixed,
  isSelected,
  isHighlighted,
  isSameNumberHighlighted,
  isError,
  onClick,
  onDoubleClick,
  onNumberSelect
}: SudokuCellProps) => {
  const cellButton = (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "aspect-square w-full min-h-[44px] sm:min-h-[48px] md:min-h-[52px] flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-semibold transition-all touch-manipulation cursor-pointer",
        "border border-gridLine focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
        isFixed && "bg-cellFixed text-muted-foreground",
        !isFixed && "bg-card hover:bg-secondary active:scale-95",
        isHighlighted && !isSelected && "bg-cellHighlighted",
        isSameNumberHighlighted && "ring-2 ring-primary/60 bg-primary/10",
        isSelected && "bg-cellSelected ring-2 ring-primary",
        isError && "bg-cellError text-destructive",
        !value && "text-transparent"
      )}
    >
      {value || "0"}
    </button>
  );

  // Only wrap with number selector if onNumberSelect is provided
  if (onNumberSelect) {
    return (
      <CellNumberSelector
        onNumberSelect={onNumberSelect}
        isFixed={isFixed}
      >
        {cellButton}
      </CellNumberSelector>
    );
  }

  return cellButton;
};

export default SudokuCell;
