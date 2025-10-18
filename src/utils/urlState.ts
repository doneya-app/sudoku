import { Board, Difficulty } from "./sudoku";

// 81 URL-safe characters for position mapping (0-80)
const POSITION_CHARS = 
  "abcdefghijklmnopqrstuvwxyz" + // 0-25
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + // 26-51
  "0123456789" +                  // 52-61
  "-_.~!*'()$+,;@[]{}|";          // 62-80

// Difficulty mapping
const DIFFICULTY_MAP: Record<Difficulty, string> = {
  easy: "e",
  medium: "m",
  hard: "h",
};

const CHAR_TO_DIFFICULTY: Record<string, Difficulty> = {
  e: "easy",
  m: "medium",
  h: "hard",
};

// Convert position (0-80) to character
function positionToChar(pos: number): string {
  if (pos < 0 || pos > 80) throw new Error("Invalid position");
  return POSITION_CHARS[pos];
}

// Convert character to position (0-80)
function charToPosition(char: string): number {
  const pos = POSITION_CHARS.indexOf(char);
  if (pos === -1) throw new Error("Invalid position character");
  return pos;
}

// Convert row, col to position (0-80)
function rowColToPosition(row: number, col: number): number {
  return row * 9 + col;
}

// Convert position (0-80) to row, col
function positionToRowCol(pos: number): { row: number; col: number } {
  return {
    row: Math.floor(pos / 9),
    col: pos % 9,
  };
}

// Encode initial puzzle board (only filled cells)
export function encodeInitialPuzzle(board: Board): string {
  let encoded = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value !== null) {
        const pos = rowColToPosition(row, col);
        encoded += positionToChar(pos) + value.toString();
      }
    }
  }
  return encoded;
}

// Decode initial puzzle from encoded string
export function decodeInitialPuzzle(encoded: string): Board | null {
  try {
    const board: Board = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));

    // Parse pairs of (position_char, number)
    for (let i = 0; i < encoded.length; i += 2) {
      const posChar = encoded[i];
      const numChar = encoded[i + 1];

      if (!posChar || !numChar) {
        throw new Error("Invalid encoding format");
      }

      const pos = charToPosition(posChar);
      const num = parseInt(numChar);

      if (isNaN(num) || num < 1 || num > 9) {
        throw new Error("Invalid number");
      }

      const { row, col } = positionToRowCol(pos);
      board[row][col] = num;
    }

    return board;
  } catch (error) {
    console.error("Failed to decode puzzle:", error);
    return null;
  }
}

// Encode current state (only user-filled cells)
export function encodeCurrentState(initialBoard: Board, currentBoard: Board): string {
  let encoded = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const currentValue = currentBoard[row][col];
      const initialValue = initialBoard[row][col];

      // Only encode cells that user filled (not in initial puzzle)
      if (currentValue !== null && initialValue === null) {
        const pos = rowColToPosition(row, col);
        encoded += positionToChar(pos) + currentValue.toString();
      }
    }
  }
  return encoded;
}

// Decode current state from encoded string
export function decodeCurrentState(encoded: string): Array<{ row: number; col: number; num: number }> {
  const moves: Array<{ row: number; col: number; num: number }> = [];

  try {
    for (let i = 0; i < encoded.length; i += 2) {
      const posChar = encoded[i];
      const numChar = encoded[i + 1];

      if (!posChar || !numChar) continue;

      const pos = charToPosition(posChar);
      const num = parseInt(numChar);

      if (isNaN(num) || num < 1 || num > 9) continue;

      const { row, col } = positionToRowCol(pos);
      moves.push({ row, col, num });
    }
  } catch (error) {
    console.error("Failed to decode current state:", error);
  }

  return moves;
}

// Convert difficulty to character
export function difficultyToChar(difficulty: Difficulty): string {
  return DIFFICULTY_MAP[difficulty];
}

// Convert character to difficulty
export function charToDifficulty(char: string): Difficulty | null {
  return CHAR_TO_DIFFICULTY[char] || null;
}
