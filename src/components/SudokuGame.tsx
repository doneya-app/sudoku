import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SudokuGrid from "./SudokuGrid";
import NumberPad from "./NumberPad";
import {
  Board,
  Difficulty,
  generatePuzzle,
  isValid,
  isBoardComplete,
} from "@/utils/sudoku";
import { Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const SudokuGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(
    null
  );
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(puzzle.map((row) => [...row]));
    setInitialBoard(puzzle.map((row) => [...row]));
    setSolution(sol);
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
  }, []);

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === null) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) {
      toast.error("Please select a cell first");
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;

    const newErrors = new Set(errors);
    const cellKey = `${row}-${col}`;

    if (num !== null && !isValid(newBoard, row, col, num)) {
      newErrors.add(cellKey);
      toast.error("Invalid move!");
    } else {
      newErrors.delete(cellKey);
    }

    setBoard(newBoard);
    setErrors(newErrors);

    if (isBoardComplete(newBoard, solution)) {
      setIsComplete(true);
      toast.success("🎉 Congratulations! You solved the puzzle!");
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleNumberInput(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedCell, board]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            Sudoku
          </h1>
          <p className="text-muted-foreground">
            Fill the grid so each row, column, and 3×3 box contains 1-9
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
            <TabsList>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => initializeGame(difficulty)}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </div>

        <div className="flex justify-center">
          <SudokuGrid
            board={board}
            initialBoard={initialBoard}
            solution={solution}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            errors={errors}
          />
        </div>

        <NumberPad onNumberClick={handleNumberInput} />

        {isComplete && (
          <div className="text-center animate-scale-in">
            <p className="text-2xl font-bold text-primary">
              Perfect! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuGame;
