import { Board, Difficulty } from "./sudoku";

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

// Encode initial puzzle board (81 characters: 0 = empty, 1-9 = filled)
export function encodeInitialPuzzle(board: Board): string {
  let encoded = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      encoded += value === null ? "0" : value.toString();
    }
  }
  return encoded;
}

// Decode initial puzzle from encoded string (81 characters)
export function decodeInitialPuzzle(encoded: string): Board | null {
  try {
    if (encoded.length !== 81) {
      console.error("Invalid puzzle length:", encoded.length);
      return null;
    }

    const board: Board = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));

    for (let i = 0; i < 81; i++) {
      const char = encoded[i];
      const num = parseInt(char);
      
      if (isNaN(num) || num < 0 || num > 9) {
        console.error("Invalid character at position", i, ":", char);
        return null;
      }

      const row = Math.floor(i / 9);
      const col = i % 9;
      board[row][col] = num === 0 ? null : num;
    }

    return board;
  } catch (error) {
    console.error("Failed to decode puzzle:", error);
    return null;
  }
}

// Encode current state (only user-filled cells, using position encoding)
export function encodeCurrentState(initialBoard: Board, currentBoard: Board): string {
  let encoded = "";
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const currentValue = currentBoard[row][col];
      const initialValue = initialBoard[row][col];

      // Only encode cells that user filled (not in initial puzzle)
      if (currentValue !== null && initialValue === null) {
        const position = row * 9 + col;
        // Use base62 for position (0-80) + number (1-9)
        encoded += base62Encode(position) + currentValue.toString();
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
      // Read base62 position
      let posStr = "";
      while (i < encoded.length && isBase62Char(encoded[i])) {
        posStr += encoded[i];
        i++;
      }

      if (!posStr) break;

      // If we've reached the end, the last character is the number, not part of position
      let num: number;
      if (i >= encoded.length) {
        // Take last character of posStr as the number
        num = parseInt(posStr[posStr.length - 1]);
        posStr = posStr.slice(0, -1);
        if (!posStr) break; // Invalid: no position
      } else {
        // Read the next character as the number
        num = parseInt(encoded[i]);
        i++;
      }

      const position = base62Decode(posStr);

      if (isNaN(num) || num < 1 || num > 9 || position < 0 || position > 80) {
        continue;
      }

      const row = Math.floor(position / 9);
      const col = position % 9;
      moves.push({ row, col, num });
    }
  } catch (error) {
    console.error("Failed to decode current state:", error);
  }

  return moves;
}

// Base62 encoding helpers (a-z, A-Z, 0-9)
const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62Encode(num: number): string {
  if (num === 0) return "0";
  let result = "";
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

function base62Decode(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_CHARS.indexOf(char);
    if (value === -1) return -1;
    result = result * 62 + value;
  }
  return result;
}

function isBase62Char(char: string): boolean {
  return BASE62_CHARS.includes(char);
}

// Convert difficulty to character
export function difficultyToChar(difficulty: Difficulty): string {
  return DIFFICULTY_MAP[difficulty];
}

// Convert character to difficulty
export function charToDifficulty(char: string): Difficulty | null {
  return CHAR_TO_DIFFICULTY[char] || null;
}
