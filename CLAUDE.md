# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Progressive Web App (PWA) Sudoku puzzle game built with React, TypeScript, Vite, and shadcn-ui. The app features URL-based game state sharing, allowing users to share puzzles and progress via URLs.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development mode (includes component tagging)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Application Structure

The app follows a single-page application pattern with the following key architecture:

**Provider Hierarchy** (from outer to inner in `main.tsx`):
1. `ThemeProvider` (next-themes) - Manages light/dark mode
2. `ColorSchemeProvider` - Manages custom color schemes for the Sudoku board
3. `TooltipProvider` - shadcn-ui tooltip context
4. `QueryClientProvider` - TanStack Query for data management
5. `BrowserRouter` - React Router for URL-based routing

**Routing**:
- `/` - Main game page
- `/:gameState/*` - Game with encoded puzzle state in URL
- URL format: `/{difficulty}/{puzzle}?s={currentState}`
  - `difficulty`: Single character (e/m/h)
  - `puzzle`: 81-character string representing the initial puzzle (0 = empty, 1-9 = filled)
  - `?s=` query param: Base62-encoded user moves (optional, used for sharing progress)

### Key Components

**SudokuGame** (`src/components/SudokuGame.tsx`):
- Main game controller component containing all game logic
- Manages state: difficulty, board, initialBoard, solution, selectedCell, errors, completion
- Handles URL encoding/decoding for puzzle sharing
- Coordinates child components: SudokuGrid, NumberPad, ColorSchemeSelector, InstallPrompt

**SudokuGrid** (`src/components/SudokuGrid.tsx`):
- Renders the 9x9 Sudoku grid
- Displays cell highlighting for selected row/column/box
- Passes click events to parent

**SudokuCell** (`src/components/SudokuCell.tsx`):
- Individual cell component with visual states

**NumberPad** (`src/components/NumberPad.tsx`):
- Number input interface (1-9 + clear button)

### Core Utilities

**sudoku.ts** (`src/utils/sudoku.ts`):
- Puzzle generation using backtracking algorithm
- Board validation logic (`isValid`, `isBoardComplete`)
- Puzzle solver (`solvePuzzle`)
- Difficulty levels determine cells removed: easy (35), medium (45), hard (55)

**urlState.ts** (`src/utils/urlState.ts`):
- Encodes/decodes puzzle state to/from URL
- Initial puzzle: 81-character string (0-9)
- Current state: Base62-encoded position+number pairs for user moves
- Difficulty: Single character mapping (e/m/h)

**colorSchemes.ts** (`src/utils/colorSchemes.ts`):
- Defines available color schemes (classic, forest, sunset, purple)
- Applies color scheme via `data-color-scheme` attribute on document element
- Persists selection to localStorage

### State Management

The app uses React hooks for local state management:
- Game state is managed in `SudokuGame` component
- Theme state via `next-themes` ThemeProvider
- Color scheme state via custom ColorSchemeContext
- No global state management library (Redux, Zustand, etc.)

### PWA Configuration

Configured in `vite.config.ts`:
- Auto-updates enabled
- Service worker handles offline caching
- Manifest defines app metadata and icons
- Runtime caching for Google Fonts

### Game Flow

1. **Initialization**: On mount, component reads URL parameters to determine if loading existing puzzle or generating new one
2. **URL Parsing**: Decodes difficulty + puzzle from URL path, and optional progress from query param
3. **Shared Progress**: If progress detected in URL, prompts user to load or dismiss it
4. **Input Handling**: Keyboard (1-9, Backspace/Delete) or NumberPad for cell input
5. **Validation**: Numbers validated before insertion; invalid moves show toast error
6. **Completion**: Board automatically detected as complete when matching solution
7. **Sharing**: Share button copies URL with current progress to clipboard

### Styling

- Tailwind CSS for utility-first styling
- shadcn-ui components (Radix UI primitives)
- CSS custom properties for color schemes (defined via `data-color-scheme` attribute)
- Dark mode support via `next-themes` (class-based)
- Responsive design with mobile-first approach

## Important Notes

- All game state can be reconstructed from the URL, making the app stateless
- The solution is generated client-side from the puzzle (puzzle is guaranteed solvable)
- Initial board is immutable once generated; only user-filled cells can be modified
- Color scheme changes apply custom properties to root element, working with both light/dark modes
