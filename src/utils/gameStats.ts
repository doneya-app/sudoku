// Format seconds to MM:SS or HH:MM:SS
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// LocalStorage keys
const STORAGE_KEYS = {
  START_TIME: 'sudoku_game_start_time',
  ELAPSED_TIME: 'sudoku_elapsed_time',
  ERROR_COUNT: 'sudoku_error_count',
  PUZZLE_ID: 'sudoku_puzzle_id',
};

// Generate a unique ID for a puzzle based on its initial state
export function generatePuzzleId(initialPuzzle: string): string {
  return initialPuzzle; // The 81-character puzzle string itself is unique
}

// Save game stats to localStorage
export function saveGameStats(
  puzzleId: string,
  startTime: number,
  elapsedTime: number,
  errorCount: number
): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PUZZLE_ID, puzzleId);
    localStorage.setItem(STORAGE_KEYS.START_TIME, startTime.toString());
    localStorage.setItem(STORAGE_KEYS.ELAPSED_TIME, elapsedTime.toString());
    localStorage.setItem(STORAGE_KEYS.ERROR_COUNT, errorCount.toString());
  } catch (error) {
    console.error('Failed to save game stats:', error);
  }
}

// Load game stats from localStorage
export function loadGameStats(puzzleId: string): {
  startTime: number | null;
  elapsedTime: number;
  errorCount: number;
} | null {
  try {
    const storedPuzzleId = localStorage.getItem(STORAGE_KEYS.PUZZLE_ID);

    // Only load if it's the same puzzle
    if (storedPuzzleId !== puzzleId) {
      return null;
    }

    const startTime = localStorage.getItem(STORAGE_KEYS.START_TIME);
    const elapsedTime = localStorage.getItem(STORAGE_KEYS.ELAPSED_TIME);
    const errorCount = localStorage.getItem(STORAGE_KEYS.ERROR_COUNT);

    if (!startTime) return null;

    return {
      startTime: parseInt(startTime),
      elapsedTime: parseInt(elapsedTime) || 0,
      errorCount: parseInt(errorCount) || 0,
    };
  } catch (error) {
    console.error('Failed to load game stats:', error);
    return null;
  }
}

// Clear game stats from localStorage
export function clearGameStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PUZZLE_ID);
    localStorage.removeItem(STORAGE_KEYS.START_TIME);
    localStorage.removeItem(STORAGE_KEYS.ELAPSED_TIME);
    localStorage.removeItem(STORAGE_KEYS.ERROR_COUNT);
  } catch (error) {
    console.error('Failed to clear game stats:', error);
  }
}
