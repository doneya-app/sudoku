import { Board, Difficulty } from "./sudoku";

// 62 truly URL-safe characters (unreserved per RFC 3986)
// For positions 62-80, we'll use two-character encoding
const POSITION_CHARS = 
  "abcdefghijklmnopqrstuvwxyz" + // 0-25
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + // 26-51
  "0123456789";                   // 52-61

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

// Convert position (0-80) to character(s)
function positionToChar(pos: number): string {
  if (pos < 0 || pos > 80) throw new Error("Invalid position");
  if (pos < 62) {
    return POSITION_CHARS[pos];
  }
  // For positions 62-80, use two characters: underscore + offset
  const offset = pos - 62;
  return "_" + POSITION_CHARS[offset];
}

// Convert character(s) to position (0-80)
function charToPosition(char: string, nextChar?: string): { pos: number; charsUsed: number } {
  if (char === "_" && nextChar) {
    // Two-character encoding for positions 62-80
    const offset = POSITION_CHARS.indexOf(nextChar);
    if (offset === -1) throw new Error("Invalid position character");
    return { pos: 62 + offset, charsUsed: 2 };
  }
  
  const pos = POSITION_CHARS.indexOf(char);
  if (pos === -1) throw new Error("Invalid position character");
  return { pos, charsUsed: 1 };
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

    // Parse position and number pairs
    let i = 0;
    while (i < encoded.length) {
      const posChar = encoded[i];
      const nextChar = encoded[i + 1];
      
      if (!posChar) break;

      const { pos, charsUsed } = charToPosition(posChar, nextChar);
      i += charsUsed;

      const numChar = encoded[i];
      if (!numChar) {
        throw new Error("Invalid encoding format");
      }

      const num = parseInt(numChar);
      if (isNaN(num) || num < 1 || num > 9) {
        throw new Error("Invalid number");
      }

      const { row, col } = positionToRowCol(pos);
      board[row][col] = num;
      i++;
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
    let i = 0;
    while (i < encoded.length) {
      const posChar = encoded[i];
      const nextChar = encoded[i + 1];
      
      if (!posChar) break;

      const { pos, charsUsed } = charToPosition(posChar, nextChar);
      i += charsUsed;

      const numChar = encoded[i];
      if (!numChar) break;

      const num = parseInt(numChar);
      if (isNaN(num) || num < 1 || num > 9) {
        i++;
        continue;
      }

      const { row, col } = positionToRowCol(pos);
      moves.push({ row, col, num });
      i++;
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
