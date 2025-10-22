import { Board } from "@/utils/sudoku";
import SudokuCell from "./SudokuCell";
import { cn } from "@/lib/utils";

interface SudokuGridProps {
  board: Board;
  initialBoard: Board;
  solution: Board;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  onCellDoubleClick: (row: number, col: number) => void;
  errors: Set<string>;
  highlightEnabled: boolean;
}

const SudokuGrid = ({
  board,
  initialBoard,
  solution,
  selectedCell,
  onCellClick,
  onCellDoubleClick,
  errors,
  highlightEnabled,
}: SudokuGridProps) => {
  return (
    <div className="inline-block bg-card rounded-lg shadow-xl p-2 sm:p-3 md:p-4 animate-scale-in w-full sm:max-w-xl">
      <div className="grid grid-cols-9 gap-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isFixed = initialBoard[rowIndex][colIndex] !== null;
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isHighlighted =
              highlightEnabled &&
              selectedCell !== null &&
              (selectedCell.row === rowIndex || selectedCell.col === colIndex) &&
              !isSelected;
            const cellKey = `${rowIndex}-${colIndex}`;
            const isError = errors.has(cellKey);
            const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
            const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

            return (
              <div
                key={cellKey}
                className={cn(
                  isRightBorder && "border-r-2 border-gridLineThick",
                  isBottomBorder && "border-b-2 border-gridLineThick"
                )}
              >
                <SudokuCell
                  value={cell}
                  isFixed={isFixed}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isError={isError}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onDoubleClick={() => onCellDoubleClick(rowIndex, colIndex)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;
