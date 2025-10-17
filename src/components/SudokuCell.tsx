import { cn } from "@/lib/utils";

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  onClick: () => void;
}

const SudokuCell = ({ value, isFixed, isSelected, isHighlighted, isError, onClick }: SudokuCellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isFixed}
      className={cn(
        "aspect-square w-full min-h-[48px] sm:min-h-[56px] md:min-h-[64px] flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-semibold transition-all touch-manipulation",
        "border border-gridLine focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
        isFixed && "bg-cellFixed text-muted-foreground cursor-not-allowed",
        !isFixed && "bg-card hover:bg-secondary cursor-pointer active:scale-95",
        isHighlighted && !isSelected && "bg-cellHighlighted",
        isSelected && "bg-cellSelected ring-2 ring-primary",
        isError && "bg-cellError text-destructive",
        !value && "text-transparent"
      )}
    >
      {value || "0"}
    </button>
  );
};

export default SudokuCell;
