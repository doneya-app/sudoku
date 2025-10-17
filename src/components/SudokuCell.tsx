import { cn } from "@/lib/utils";

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isError: boolean;
  onClick: () => void;
}

const SudokuCell = ({ value, isFixed, isSelected, isError, onClick }: SudokuCellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isFixed}
      className={cn(
        "aspect-square w-full flex items-center justify-center text-lg md:text-xl font-semibold transition-all",
        "border border-gridLine focus:outline-none focus:ring-2 focus:ring-primary focus:z-10",
        isFixed && "bg-cellFixed text-muted-foreground cursor-not-allowed",
        !isFixed && "bg-card hover:bg-secondary cursor-pointer",
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
