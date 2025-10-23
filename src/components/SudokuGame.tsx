import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useGameOptions } from "@/contexts/GameOptionsContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import InstallPrompt from "./InstallPrompt";
import { MobileMenu } from "./MobileMenu";
import { SettingsContent } from "./SettingsContent";
import {
  Board,
  Difficulty,
  generatePuzzle,
  isValid,
  isBoardComplete,
  createEmptyBoard,
  solvePuzzle,
} from "@/utils/sudoku";
import {
  encodeInitialPuzzle,
  decodeInitialPuzzle,
  encodeCurrentState,
  decodeCurrentState,
  difficultyToChar,
  charToDifficulty,
  encodeGameStats,
  decodeGameStats,
} from "@/utils/urlState";
import {
  formatTime,
  saveGameStats,
  loadGameStats,
  clearGameStats,
  generatePuzzleId,
} from "@/utils/gameStats";
import { GameStats } from "./GameStats";
import { Sparkles, RotateCcw, Settings, Share2 } from "lucide-react";
import { toast } from "sonner";

const SudokuGame = () => {
  const { gameState, "*": restPath } = useParams<{
    gameState?: string;
    "*"?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { options, updateOption } = useGameOptions();

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingMoves, setPendingMoves] = useState<Array<{
    row: number;
    col: number;
    num: number;
  }> | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const isInitialLoadRef = useRef(true);

  // Timer and error tracking
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const initializeGame = useCallback(
    (diff: Difficulty) => {
      console.log("Initializing new game with difficulty:", diff);
      const { puzzle, solution: sol } = generatePuzzle(diff);
      // Update URL with new game state (format: /difficulty/puzzle)
      const encoded = encodeInitialPuzzle(puzzle);
      const diffChar = difficultyToChar(diff);
      navigate(`/${diffChar}/${encoded}`, { replace: true });
      setBoard(puzzle.map((row) => [...row]));
      setInitialBoard(puzzle.map((row) => [...row]));
      setSolution(sol);
      setSelectedCell(null);
      setErrors(new Set());
      setIsComplete(false);

      // Reset and start timer
      const startTime = Date.now();
      setGameStartTime(startTime);
      setElapsedTime(0);
      setErrorCount(0);
      setIsTimerRunning(true);

      // Save initial stats to localStorage
      const puzzleId = generatePuzzleId(encoded);
      clearGameStats(); // Clear old stats
      saveGameStats(puzzleId, startTime, 0, 0);
    },
    [navigate],
  );

  // Load game from URL on mount
  useEffect(() => {
    if (isInitialized) return;

    // Construct full game state from params
    const fullGameState = restPath ? `${gameState}/${restPath}` : gameState;

    console.log("Loading game from URL state:", fullGameState);
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

      // Load stats from URL and localStorage
      const puzzleId = generatePuzzleId(puzzleEncoded);
      const urlStats = decodeGameStats(searchParams);
      const storedStats = loadGameStats(puzzleId);

      // Prefer stored stats over URL stats if they're for the same puzzle
      let loadedElapsedTime = 0;
      let loadedErrorCount = 0;
      let startTime = Date.now();

      if (storedStats) {
        // Resume from localStorage
        loadedElapsedTime = storedStats.elapsedTime;
        loadedErrorCount = storedStats.errorCount;
        startTime = storedStats.startTime;
        console.log("Loaded stats from localStorage:", storedStats);
      } else if (urlStats.elapsedTime > 0 || urlStats.errorCount > 0) {
        // Load from URL (shared game)
        loadedElapsedTime = urlStats.elapsedTime;
        loadedErrorCount = urlStats.errorCount;
        startTime = Date.now() - (loadedElapsedTime * 1000);
        console.log("Loaded stats from URL:", urlStats);
      }

      setElapsedTime(loadedElapsedTime);
      setErrorCount(loadedErrorCount);
      setGameStartTime(startTime);
      setIsTimerRunning(true);

      // Save to localStorage
      saveGameStats(puzzleId, startTime, loadedElapsedTime, loadedErrorCount);

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
    // Don't set isInitialLoadRef.current = false here - it's set in a separate effect
  }, []);

  // Update URL when difficulty changes (only if already initialized)
  useEffect(() => {
    if (!isInitialized || isInitialLoadRef.current) return;
    initializeGame(difficulty);
  }, [difficulty]);

  // Clear the initial load flag after the first render cycle completes
  useEffect(() => {
    if (isInitialized && isInitialLoadRef.current) {
      // Use setTimeout to ensure this runs after all synchronous effects
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Timer effect - updates every second
  useEffect(() => {
    if (!isTimerRunning || !gameStartTime) return;

    const interval = setInterval(() => {
      const newElapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
      setElapsedTime(newElapsedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, gameStartTime]);

  // Save stats to localStorage periodically (every 5 seconds)
  useEffect(() => {
    if (!isTimerRunning || !gameStartTime || initialBoard.length === 0) return;

    const saveInterval = setInterval(() => {
      const puzzleId = generatePuzzleId(encodeInitialPuzzle(initialBoard));
      saveGameStats(puzzleId, gameStartTime, elapsedTime, errorCount);
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [isTimerRunning, gameStartTime, initialBoard, elapsedTime, errorCount]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === null) {
      setSelectedCell({ row, col });
    }
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setHighlightEnabled(!highlightEnabled);
      toast.info(
        highlightEnabled
          ? "Row/column highlight disabled"
          : "Row/column highlight enabled",
      );
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
      // Increment error counter
      setErrorCount((prev) => prev + 1);
      toast.error(
        "Invalid move! Number already exists in row, column, or 3×3 box",
      );
      return;
    }

    // Number is valid, insert it
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (isBoardComplete(newBoard, solution)) {
      setIsComplete(true);
      setIsTimerRunning(false); // Stop timer

      // Save final stats
      const puzzleId = generatePuzzleId(encodeInitialPuzzle(initialBoard));
      saveGameStats(puzzleId, gameStartTime!, elapsedTime, errorCount);

      toast.success(
        `🎉 Congratulations! Time: ${formatTime(elapsedTime)}, Errors: ${errorCount}`
      );
    }
  };

  const handleShare = () => {
    const movesState = encodeCurrentState(initialBoard, board);
    const statsParams = encodeGameStats(elapsedTime, errorCount);

    const baseUrl = window.location.origin + window.location.pathname;
    const moveParam = movesState ? `s=${movesState}` : '';
    const allParams = [moveParam, statsParams].filter(Boolean).join('&');
    const shareUrl = allParams ? `${baseUrl}?${allParams}` : baseUrl;

    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast.success("Game URL copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy URL");
      },
    );
  };

  const handleRestartTimer = () => {
    const startTime = Date.now();
    setGameStartTime(startTime);
    setElapsedTime(0);
    setErrorCount(0);

    // Save reset stats to localStorage
    if (initialBoard.length > 0) {
      const puzzleId = generatePuzzleId(encodeInitialPuzzle(initialBoard));
      saveGameStats(puzzleId, startTime, 0, 0);
    }

    toast.success("Timer and errors reset!");
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <InstallPrompt />
      <div className="w-full max-w-4xl space-y-3 sm:space-y-6 animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
            Sudoku
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Fill the grid so each row, column, and 3×3 box contains 1-9
          </p>
        </div>

        <div className="flex items-center justify-between w-full sm:max-w-xl mx-auto gap-3 px-4">
          <Tabs
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <TabsList>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Med</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
          </Tabs>

          <GameStats
            elapsedTime={elapsedTime}
            errorCount={errorCount}
            isComplete={isComplete}
            showTimer={options.showTimer}
            showErrors={options.showErrors}
            compact={true}
          />

          <MobileMenu
            onNewGame={() => initializeGame(difficulty)}
            onShare={handleShare}
            onOpenSettings={() => setShowMobileSettings(true)}
            onRestartTimer={handleRestartTimer}
            showShare={options.showShareButton}
            isComplete={isComplete}
          />
        </div>

        <div className="flex flex-col gap-3 items-center justify-center w-full">

          {/* Sudoku Grid - full width on mobile, constrained on desktop */}
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

          {/* NumberPad - grid layout on mobile, flex wrap on desktop */}
          <div className="w-full sm:w-auto">
            <div className="sm:hidden">
              <NumberPad onNumberClick={handleNumberInput} mobileGrid={true} />
            </div>
            <div className="hidden sm:block">
              <NumberPad onNumberClick={handleNumberInput} />
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="text-center animate-scale-in">
            <p className="text-2xl font-bold text-primary">Perfect! 🎉</p>
          </div>
        )}

        <AlertDialog
          open={showLoadDialog}
          onOpenChange={(open) => !open && setShowLoadDialog(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Load existing game?</AlertDialogTitle>
              <AlertDialogDescription>
                We found saved progress in this URL. Do you want to load it onto
                this puzzle?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={dismissPendingMoves}>
                No
              </AlertDialogCancel>
              <AlertDialogAction onClick={applyPendingMoves}>
                Yes, load progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Settings Sheet */}
        <Sheet open={showMobileSettings} onOpenChange={setShowMobileSettings}>
          <SheetContent
            side="bottom"
            className="h-auto max-h-[85vh] overflow-y-auto sm:max-w-lg sm:mx-auto sm:rounded-t-lg"
          >
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SettingsContent
                theme={theme}
                setTheme={setTheme}
                highlightEnabled={highlightEnabled}
                setHighlightEnabled={setHighlightEnabled}
                options={options}
                updateOption={updateOption}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SudokuGame;
