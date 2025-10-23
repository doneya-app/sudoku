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

# Build for production (includes build verification)
npm run build

# Build for production without verification
npm run build:prod

# Build for development mode (includes component tagging)
npm run build:dev

# Verify production build (check for test files)
npm run verify-build

# Lint code
npm run lint

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage report
npm test:coverage
```

## Architecture

### Application Structure

The app follows a single-page application pattern with the following key architecture:

**Provider Hierarchy** (from outer to inner in `main.tsx`):
1. `ThemeProvider` (next-themes) - Manages light/dark mode
2. `ColorSchemeProvider` - Manages custom color schemes for the Sudoku board
3. `GameOptionsProvider` - Manages game UI visibility options (new game button, timer, errors, share button)
4. `TooltipProvider` - shadcn-ui tooltip context
5. `QueryClientProvider` - TanStack Query for data management
6. `BrowserRouter` - React Router for URL-based routing

**Routing**:
- `/` - Main game page
- `/:gameState/*` - Game with encoded puzzle state in URL
- URL format: `/{difficulty}/{puzzle}?s={moves}&t={time}&e={errors}`
  - `difficulty`: Single character (e/m/h)
  - `puzzle`: 81-character string representing the initial puzzle (0 = empty, 1-9 = filled)
  - `?s=` query param: Base62-encoded user moves (optional, used for sharing progress)
  - `?t=` query param: Elapsed time in seconds (optional, included in shared URLs)
  - `?e=` query param: Error count (optional, included in shared URLs)

### Key Components

**SudokuGame** (`src/components/SudokuGame.tsx`):
- Main game controller component containing all game logic
- Manages state: difficulty, board, initialBoard, solution, selectedCell, errors, completion
- Tracks game statistics: timer (elapsed time) and error count
- Persists stats to localStorage for continuity across page refreshes
- Handles URL encoding/decoding for puzzle and stats sharing
- Coordinates child components: SudokuGrid, NumberPad, GameStats, ColorSchemeSelector, InstallPrompt

**SudokuGrid** (`src/components/SudokuGrid.tsx`):
- Renders the 9x9 Sudoku grid
- Displays cell highlighting for selected row/column/box
- Passes click events to parent

**SudokuCell** (`src/components/SudokuCell.tsx`):
- Individual cell component with visual states

**NumberPad** (`src/components/NumberPad.tsx`):
- Number input interface (1-9 + clear button)

**GameStats** (`src/components/GameStats.tsx`):
- Displays game timer and error count
- Supports conditional rendering via `showTimer` and `showErrors` props
- Supports `compact` mode for inline display without background
- Compact mode: smaller icons (3.5rem), no labels, no background/border
- Regular mode: full-size display with background and optional labels
- Returns null if both timer and errors are hidden
- Updates every second during gameplay
- Visual indicators: clock icon for time, alert icon for errors
- Errors highlighted in red when count > 0

**MobileMenu** (`src/components/MobileMenu.tsx`):
- Hamburger menu for all screen sizes (unified navigation)
- Positioned on the same row as difficulty tabs and game stats
- DropdownMenu with four options: New Game, Reset Timer & Errors, Share, Settings
- New Game always shown in menu for accessibility
- Reset Timer & Errors button moved from Settings to menu (disabled when game complete)
- Share conditionally shown based on `showShareButton` option
- Separator divides action buttons from settings
- Settings opens full-page Sheet that slides up from bottom

**SettingsContent** (`src/components/SettingsContent.tsx`):
- Reusable settings UI component
- Used in the Settings Sheet for all screen sizes
- Contains all game settings: color scheme, dark mode, gameplay options, game visibility toggles
- Accepts all necessary state and handlers as props

**UpdatePrompt** (`src/components/UpdatePrompt.tsx`):
- Handles PWA update notifications when new versions are available
- Checks for updates every 30 minutes
- Triggers update checks on page visibility change (tab return)
- Triggers update checks on network reconnection
- Shows toast notification with Update/Later options

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
- Game stats: `?t={time}&e={errors}` query params for sharing progress
- Difficulty: Single character mapping (e/m/h)

**gameStats.ts** (`src/utils/gameStats.ts`):
- Formats elapsed time (seconds) to MM:SS or HH:MM:SS display format
- Manages localStorage persistence for game statistics
- Saves/loads timer start time, elapsed time, and error count
- Generates unique puzzle IDs for stat tracking
- Gracefully handles localStorage errors

**colorSchemes.ts** (`src/utils/colorSchemes.ts`):
- Defines available color schemes (classic, forest, sunset, purple)
- Applies color scheme via `data-color-scheme` attribute on document element
- Persists selection to localStorage

### Context Providers

**ColorSchemeContext** (`src/contexts/ColorSchemeContext.tsx`):
- Manages custom color schemes for the Sudoku board
- Provides `useColorScheme()` hook for accessing/updating color scheme
- Persists selection to localStorage with key `sudoku-color-scheme`
- Applies scheme via `data-color-scheme` attribute on document element

**GameOptionsContext** (`src/contexts/GameOptionsContext.tsx`):
- Manages visibility of game UI elements (timer, errors, share button)
- Provides `useGameOptions()` hook with:
  - `options`: Current visibility settings for all game UI elements
  - `updateOption(key, value)`: Update individual option
  - `resetOptions()`: Reset all options to defaults
- Persists to localStorage with key `sudoku-game-options`
- Default values: all options set to `true` (all UI elements visible)
- Gracefully merges with defaults when loading partial options (backwards compatible)
- Options available:
  - `showTimer`: Control timer display in GameStats
  - `showErrors`: Control error counter display in GameStats
  - `showShareButton`: Control Share button visibility in hamburger menu

### State Management

The app uses React hooks for local state management:
- Game state is managed in `SudokuGame` component
- Timer and error tracking with localStorage persistence
- Theme state via `next-themes` ThemeProvider
- Color scheme state via custom ColorSchemeContext
- Game UI options via custom GameOptionsContext
- No global state management library (Redux, Zustand, etc.)

### PWA Configuration

Configured in `vite.config.ts`:
- Auto-updates enabled
- Service worker handles offline caching
- Manifest defines app metadata and icons
- Runtime caching for Google Fonts

### Game Flow

1. **Initialization**: On mount, component reads URL parameters to determine if loading existing puzzle or generating new one
2. **URL Parsing**: Decodes difficulty + puzzle from URL path, and optional progress + stats from query params
3. **Timer Start**: Timer starts automatically when game loads, persists to localStorage every 5 seconds
4. **Shared Progress**: If progress detected in URL, prompts user to load or dismiss it
5. **Input Handling**: Keyboard (1-9, Backspace/Delete) or NumberPad for cell input
6. **Validation**: Numbers validated before insertion; invalid moves increment error counter and show toast
7. **Completion**: Board automatically detected as complete when matching solution; timer stops and final stats shown
8. **Sharing**: Share button copies URL with current progress and stats (time, errors) to clipboard
9. **Persistence**: Stats survive page refresh via localStorage (keyed by puzzle ID)

### Styling

- Tailwind CSS for utility-first styling
- shadcn-ui components (Radix UI primitives)
- CSS custom properties for color schemes (defined via `data-color-scheme` attribute)
- Dark mode support via `next-themes` (class-based)
- Responsive design with mobile-first approach

### Testing

The project uses **Vitest** and **React Testing Library** for testing.

**Test Infrastructure**:
- `vitest.config.ts` - Vitest configuration with jsdom environment
- `src/tests/setup.ts` - Global test setup (mocks for matchMedia, IntersectionObserver, etc.)
- `src/tests/mocks/` - Module mocks (e.g., PWA virtual modules)

**Test File Structure**:
- Component tests: `src/components/ComponentName.test.tsx`
- Utility tests: `src/utils/utilityName.test.ts`
- Test files use the `.test.tsx` or `.test.ts` extension
- Tests are co-located with their source files

**Writing Tests**:
- Use `describe` blocks to group related tests
- Mock external dependencies (PWA modules, toast notifications, etc.)
- Test user behavior and outcomes, not implementation details
- Use `render` from `@testing-library/react` for component tests
- Use `waitFor` for asynchronous assertions
- Prefer semantic queries (`getByRole`, `getByLabelText`) over test IDs

**Build Safety**:
- Test files are never included in production builds (Vite tree-shaking)
- `npm run build` automatically runs `verify-build` script
- `verify-build` checks `dist/` for any test-related files
- Build fails if test files are found in production bundle

**Reference**: See `TESTING.md` for comprehensive testing documentation, best practices, and troubleshooting.

## Important Notes

- All game state can be reconstructed from the URL, making the app stateless
- The solution is generated client-side from the puzzle (puzzle is guaranteed solvable)
- Initial board is immutable once generated; only user-filled cells can be modified
- Color scheme changes apply custom properties to root element, working with both light/dark modes
- **Game statistics** (timer and error count) are tracked automatically and persist across page refreshes via localStorage
- Stats are included in shared URLs, allowing users to share progress with time and error count
- Timer updates every second; stats saved to localStorage every 5 seconds
- Error count increments only on invalid move attempts (violating Sudoku rules)
- **Game Options**: Users can customize UI visibility in Settings (accessible via Settings icon in hamburger menu):
  - Toggle visibility of Share button (in menu), Timer, and Errors (in stats display)
  - New Game is always available in hamburger menu (cannot be hidden)
  - All options default to visible for backwards compatibility
  - Preferences persist to localStorage and are device-specific (not shared in URLs)
  - Timer and error tracking continues internally even when hidden from UI
- **Ultra-Compact Navigation**:
  - **Single row layout**: Difficulty tabs, game stats, and hamburger menu all on one row
  - Saves two rows of vertical space on mobile compared to original layout
  - **Difficulty tabs**: "Medium" shortened to "Med" for space efficiency
  - **Game stats**: Compact inline display (icons + numbers only, no background)
  - **Hamburger menu (☰)**: Contains New Game, Reset Timer & Errors, Share (conditional), and Settings
  - **Reset Timer**: Moved from Settings popup to hamburger menu for easier access
  - Settings opens as full-page Sheet (slides up from bottom) on all devices
  - Sheet has max-width constraint on desktop for better UX (centered, 512px max)
  - New Game always available in menu for accessibility
  - Share option conditionally shown based on `showShareButton` setting
- PWA update detection has been enhanced with visibility-based checks and network reconnection handling
- See `UpdatePrompt.improved.tsx` for the enhanced version with more aggressive update checking and detailed logging
