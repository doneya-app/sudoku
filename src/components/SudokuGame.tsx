import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SudokuGrid from "./SudokuGrid";
import NumberPad from "./NumberPad";
import {
  Board,
  Difficulty,
  generatePuzzle,
  isValid,
  isBoardComplete,
} from "@/utils/sudoku";
import { Sparkles, RotateCcw, Settings } from "lucide-react";
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
  const [highlightEnabled, setHighlightEnabled] = useState(true);

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

  const handleCellDoubleClick = (row: number, col: number) => {
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setHighlightEnabled(!highlightEnabled);
      toast.info(highlightEnabled ? "Row/column highlight disabled" : "Row/column highlight enabled");
    }
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) {
      toast.error("Please select a cell first");
      return;
    }

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    // If clearing the cell (num is null), allow it
    if (num === null) {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
      return;
    }

    // Check if the number would be valid before inserting
    const testBoard = board.map((r) => [...r]);
    testBoard[row][col] = num;
    
    if (!isValid(testBoard, row, col, num)) {
      toast.error("Invalid move! Number already exists in row, column, or 3×3 box");
      return;
    }

    // Number is valid, insert it
    setBoard(testBoard);

    if (isBoardComplete(testBoard, solution)) {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6 animate-fade-in">
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

          <div className="flex gap-2">
            <Button
              onClick={() => initializeGame(difficulty)}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Settings</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-toggle" className="cursor-pointer">
                      Row/Column Highlight
                    </Label>
                    <Switch
                      id="highlight-toggle"
                      checked={highlightEnabled}
                      onCheckedChange={setHighlightEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Double-click a selected cell to quickly toggle highlighting
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-center">
          <SudokuGrid
            board={board}
            initialBoard={initialBoard}
            solution={solution}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
            errors={errors}
            highlightEnabled={highlightEnabled}
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
