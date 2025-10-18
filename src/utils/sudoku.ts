export type Cell = number | null;
export type Board = Cell[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

const BOARD_SIZE = 9;
const BOX_SIZE = 3;

// Check if a number is valid in a given position
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

// Solve the board using backtracking
function solveSudoku(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Solve a given puzzle and return the solution
export function solvePuzzle(puzzle: Board): Board {
  const solution = puzzle.map(row => [...row]);
  solveSudoku(solution);
  return solution;
}

// Generate a solved board
function generateSolvedBoard(): Board {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Fill diagonal 3x3 boxes first
  for (let box = 0; box < BOARD_SIZE; box += BOX_SIZE) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        const randomIndex = Math.floor(Math.random() * nums.length);
        board[box + i][box + j] = nums[randomIndex];
        nums.splice(randomIndex, 1);
      }
    }
  }

  solveSudoku(board);
  return board;
}

// Remove numbers based on difficulty
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]);

  const cellsToRemove = {
    easy: 35,
    medium: 45,
    hard: 55,
  }[difficulty];

  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }

  return { puzzle, solution };
}

// Check if the board is complete and correct
export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

// Create an empty board
export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}
