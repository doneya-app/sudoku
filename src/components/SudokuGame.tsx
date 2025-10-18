import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SudokuGrid from "./SudokuGrid";
import NumberPad from "./NumberPad";
import ColorSchemeSelector from "./ColorSchemeSelector";
import InstallPrompt from "./InstallPrompt";
import UpdatePrompt from "./UpdatePrompt";
import {
  Board,
  Difficulty,
  generatePuzzle,
  isValid,
  isBoardComplete,
  solvePuzzle,
} from "@/utils/sudoku";
import {
  encodeInitialPuzzle,
  decodeInitialPuzzle,
  encodeCurrentState,
  decodeCurrentState,
  difficultyToChar,
  charToDifficulty,
} from "@/utils/urlState";
import { Sparkles, RotateCcw, Share2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

const SudokuGame = () => {
  const { gameState, "*": restPath } = useParams<{ gameState?: string; "*"?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingMoves, setPendingMoves] = useState<Array<{ row: number; col: number; num: number }> | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const initializeGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(puzzle.map((row) => [...row]));
    setInitialBoard(puzzle.map((row) => [...row]));
    setSolution(sol);
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);

    // Update URL with new game state (format: /difficulty/puzzle)
    const encoded = encodeInitialPuzzle(puzzle);
    const diffChar = difficultyToChar(diff);
    navigate(`/${diffChar}/${encoded}`, { replace: true });
  }, [navigate]);

  // Load game from URL on mount
  useEffect(() => {
    if (isInitialized) return;

    // Construct full game state from params
    const fullGameState = restPath ? `${gameState}/${restPath}` : gameState;

    if (fullGameState && fullGameState.length > 0) {
      // Parse URL format: /difficulty/puzzle (81 characters)
      const parts = fullGameState.split("/");
      const diffChar = parts[0];
      const puzzleEncoded = parts[1] || "";
      const stateParam = searchParams.get("s");

      const diff = charToDifficulty(diffChar);
      if (!diff) {
        console.error("Invalid difficulty:", diffChar);
        initializeGame("medium");
        setIsInitialized(true);
        return;
      }

      if (!puzzleEncoded || puzzleEncoded.length !== 81) {
        console.error("Invalid puzzle length:", puzzleEncoded.length);
        initializeGame(diff);
        setIsInitialized(true);
        return;
      }

      const puzzle = decodeInitialPuzzle(puzzleEncoded);
      if (!puzzle) {
        console.error("Failed to decode puzzle");
        initializeGame(diff);
        setIsInitialized(true);
        return;
      }

      // Solve the puzzle from URL
      const sol = solvePuzzle(puzzle);
      
      setDifficulty(diff);
      setInitialBoard(puzzle.map((row) => [...row]));
      setSolution(sol);

      // Always start from the base puzzle; ask before applying shared progress
      setBoard(puzzle.map((row) => [...row]));

      // If a shared state is present, store it and prompt the user
      if (stateParam) {
        const moves = decodeCurrentState(stateParam);
        if (moves.length > 0) {
          setPendingMoves(moves);
          setShowLoadDialog(true);
        }
      }

      setSelectedCell(null);
      setErrors(new Set());
      setIsComplete(false);
    } else {
      initializeGame(difficulty);
    }

    setIsInitialized(true);
  }, []);

  // Update URL when difficulty changes (only if already initialized)
  useEffect(() => {
    if (!isInitialized) return;
    initializeGame(difficulty);
  }, [difficulty]);

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
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = null; // Temporarily clear the cell
    
    if (!isValid(newBoard, row, col, num)) {
      toast.error("Invalid move! Number already exists in row, column, or 3×3 box");
      return;
    }

    // Number is valid, insert it
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (isBoardComplete(newBoard, solution)) {
      setIsComplete(true);
      toast.success("🎉 Congratulations! You solved the puzzle!");
    }
  };

  const handleShare = () => {
    const currentState = encodeCurrentState(initialBoard, board);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = currentState ? `${baseUrl}?s=${currentState}` : baseUrl;

    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast.success("Game URL copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy URL");
      }
    );
  };

  const applyPendingMoves = useCallback(() => {
    if (!pendingMoves || initialBoard.length === 0) return;
    const currentBoard = initialBoard.map((row) => [...row]);
    pendingMoves.forEach(({ row, col, num }) => {
      if (initialBoard[row][col] === null) {
        currentBoard[row][col] = num;
      }
    });
    setBoard(currentBoard);
    setShowLoadDialog(false);
    setPendingMoves(null);
  }, [pendingMoves, initialBoard]);

  const dismissPendingMoves = useCallback(() => {
    setShowLoadDialog(false);
    setPendingMoves(null);
  }, []);

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
    <div className="min-h-screen bg-background">
      <AlertDialog open={showLoadDialog} onOpenChange={(open) => !open && setShowLoadDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load existing game?</AlertDialogTitle>
            <AlertDialogDescription>
              We found saved progress in this URL. Do you want to load it onto this puzzle?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismissPendingMoves}>No</AlertDialogCancel>
            <AlertDialogAction onClick={applyPendingMoves}>Yes, load progress</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Sudoku
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Fill the grid so each row, column, and 3×3 box contains 1-9</p>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
          
          {/* Left Column - Number Pad */}
          <div className="order-3 lg:order-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-center">Numbers</h3>
              <NumberPad onNumberClick={handleNumberInput} />
            </div>
          </div>

          {/* Center Column - Game Board */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="w-full">
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
              {isComplete && (
                <div className="text-center mt-6 animate-scale-in">
                  <p className="text-2xl font-bold text-primary">
                    Perfect! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings & Controls */}
          <div className="order-2 lg:order-3">
            <div className="bg-card rounded-lg border border-border p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="text-lg font-semibold mb-4">Game Setup</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
                    <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} className="w-full">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="easy">Easy</TabsTrigger>
                        <TabsTrigger value="medium">Medium</TabsTrigger>
                        <TabsTrigger value="hard">Hard</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Button
                    onClick={() => initializeGame(difficulty)}
                    variant="default"
                    size="lg"
                    className="w-full font-semibold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="w-full font-semibold"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Game
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                <div className="space-y-4">
                  <ColorSchemeSelector />
                  
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="dark-mode-toggle" className="cursor-pointer flex items-center gap-2">
                      {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Dark Mode
                    </Label>
                    <Switch
                      id="dark-mode-toggle"
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Gameplay</h3>
                <div className="space-y-3">
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
                  <p className="text-xs text-muted-foreground">
                    Double-click a selected cell to quickly toggle highlighting
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
};

export default SudokuGame;
