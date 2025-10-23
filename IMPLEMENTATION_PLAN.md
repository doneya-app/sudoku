# Timer & Error Counter Implementation Plan

## Overview

Add game statistics tracking to the Sudoku app:
1. **Timer**: Track elapsed time from puzzle start to completion
2. **Error Counter**: Count invalid move attempts
3. **URL State**: Persist stats in shareable URLs
4. **UI Display**: Show stats prominently during gameplay

## Current State Analysis

### Existing Code
- **SudokuGame.tsx:65**: `errors` state exists but is a `Set<string>` for highlighting invalid cells (NOT a counter)
- **SudokuGame.tsx:218-223**: Invalid moves are detected and rejected with toast notification
- **urlState.ts**: Current URL format: `/{difficulty}/{puzzle}?s={moves}`
- **No timer implementation** currently exists

### Current URL Structure
```
Example: /m/000200000300...?s=A3B5C7
         ↑  ↑              ↑
         │  │              └─ User moves (base62 encoded)
         │  └─ Initial puzzle (81 chars)
         └─ Difficulty (e/m/h)
```

## Implementation Design

### 1. State Management (SudokuGame.tsx)

#### New State Variables
```typescript
// Add these to SudokuGame component:
const [gameStartTime, setGameStartTime] = useState<number | null>(null);
const [elapsedTime, setElapsedTime] = useState<number>(0); // seconds
const [errorCount, setErrorCount] = useState<number>(0);
const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
```

#### Timer Logic
```typescript
// Timer effect - updates every second
useEffect(() => {
  if (!isTimerRunning || !gameStartTime) return;

  const interval = setInterval(() => {
    setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
  }, 1000);

  return () => clearInterval(interval);
}, [isTimerRunning, gameStartTime]);

// Start timer when game initializes
// Stop timer when puzzle is complete
```

#### Behavior Rules
1. **Timer starts**: When puzzle is generated or loaded
2. **Timer stops**: When puzzle is completed (isBoardComplete returns true)
3. **Timer persists**: In URL state for sharing
4. **Error increments**: Every time isValid() returns false during handleNumberInput

### 2. Error Tracking

#### Modify handleNumberInput (line ~197-233)
```typescript
// BEFORE (current):
if (!isValid(newBoard, row, col, num)) {
  toast.error("Invalid move! ...");
  return; // Just reject
}

// AFTER (with error counting):
if (!isValid(newBoard, row, col, num)) {
  setErrorCount(prev => prev + 1); // INCREMENT ERROR COUNTER
  toast.error("Invalid move! ...");
  return;
}
```

#### What Counts as an Error?
- ✅ Attempting to place a number that violates Sudoku rules
- ❌ Clearing a cell (null) - this is NOT an error
- ❌ Clicking on a filled initial cell - this is NOT an error
- ❌ Selecting a cell - this is NOT an error

### 3. URL State Extension

#### New URL Format
```
/{difficulty}/{puzzle}?s={moves}&t={time}&e={errors}
                         ↑        ↑       ↑
                         │        │       └─ Error count (decimal)
                         │        └─ Elapsed seconds (decimal)
                         └─ User moves (base62)
```

#### Example URLs
```bash
# New game (no stats yet)
/m/000200000300.../

# Game in progress (2 minutes, 3 errors)
/m/000200000300...?s=A3B5C7&t=120&e=3

# Completed game (15 minutes, 5 errors)
/m/000200000300...?s=A3B5C7D9E2F4&t=900&e=5
```

#### urlState.ts Changes

**Add encoding function:**
```typescript
export function encodeGameStats(
  elapsedTime: number,
  errorCount: number
): string {
  const params = new URLSearchParams();
  if (elapsedTime > 0) params.set('t', elapsedTime.toString());
  if (errorCount > 0) params.set('e', errorCount.toString());
  return params.toString();
}
```

**Add decoding function:**
```typescript
export function decodeGameStats(
  searchParams: URLSearchParams
): { elapsedTime: number; errorCount: number } {
  const time = parseInt(searchParams.get('t') || '0');
  const errors = parseInt(searchParams.get('e') || '0');

  return {
    elapsedTime: isNaN(time) ? 0 : time,
    errorCount: isNaN(errors) ? 0 : errors,
  };
}
```

**Update share function (SudokuGame.tsx line ~235):**
```typescript
const handleShare = () => {
  const movesState = encodeCurrentState(initialBoard, board);
  const statsParams = encodeGameStats(elapsedTime, errorCount);

  const baseUrl = window.location.origin + window.location.pathname;
  const moveParam = movesState ? `s=${movesState}` : '';
  const allParams = [moveParam, statsParams].filter(Boolean).join('&');
  const shareUrl = allParams ? `${baseUrl}?${allParams}` : baseUrl;

  navigator.clipboard.writeText(shareUrl).then(/* ... */);
};
```

### 4. UI Implementation

#### Option A: Stats Bar (Recommended)
Add a stats bar above the grid, below the title:

```
┌─────────────────────────────────────┐
│         ✨ Sudoku                   │
│  Fill the grid so each row...       │
├─────────────────────────────────────┤
│  [Easy|Medium|Hard] [New] [Share]   │
├─────────────────────────────────────┤
│  ⏱️ 05:23        ❌ Errors: 3       │  ← NEW STATS BAR
├─────────────────────────────────────┤
│         [Sudoku Grid]               │
│                                     │
└─────────────────────────────────────┘
```

**Component Structure:**
```tsx
<div className="flex justify-between items-center p-4
                bg-muted/50 rounded-lg">
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4" />
    <span className="font-mono">{formatTime(elapsedTime)}</span>
  </div>
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4" />
    <span>Errors: {errorCount}</span>
  </div>
</div>
```

#### Option B: Inline with Difficulty Tabs
Add stats to the same row as difficulty tabs:

```
┌─────────────────────────────────────┐
│  [Easy|Medium|Hard] ⏱️ 05:23  ❌ 3  │
│  [New Game] [Share] [Settings]      │
└─────────────────────────────────────┘
```

#### Option C: Completion Dialog Enhancement
Show final stats when puzzle is completed:

```
🎉 Congratulations!
You solved the puzzle in:
⏱️ 15 minutes 23 seconds
❌ 5 errors
```

**All three options should be implemented** for best UX.

#### Helper Functions
```typescript
// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 5. Game Lifecycle Integration

#### Initialize New Game
```typescript
const initializeGame = (diff: Difficulty) => {
  // ... existing code ...

  // Reset stats
  setGameStartTime(Date.now());
  setElapsedTime(0);
  setErrorCount(0);
  setIsTimerRunning(true);
};
```

#### Load Game from URL
```typescript
// In the useEffect that loads from URL:
const statsQuery = searchParams.get('s');
const { elapsedTime, errorCount } = decodeGameStats(searchParams);

// If loading progress with stats:
setElapsedTime(elapsedTime);
setErrorCount(errorCount);
setGameStartTime(Date.now() - (elapsedTime * 1000));
setIsTimerRunning(true);
```

#### Complete Game
```typescript
// In handleNumberInput, when puzzle completes:
if (isBoardComplete(newBoard, solution)) {
  setIsComplete(true);
  setIsTimerRunning(false); // STOP TIMER

  toast.success(
    `🎉 Congratulations! Time: ${formatTime(elapsedTime)}, Errors: ${errorCount}`
  );
}
```

### 6. Component Creation (Optional)

Create a dedicated stats component for cleaner code:

**src/components/GameStats.tsx**
```tsx
interface GameStatsProps {
  elapsedTime: number;
  errorCount: number;
  isComplete: boolean;
}

export function GameStats({ elapsedTime, errorCount, isComplete }: GameStatsProps) {
  return (
    <div className="flex justify-between items-center p-4
                    bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-primary" />
        <span className="font-mono font-medium">
          {formatTime(elapsedTime)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <AlertCircle className={`w-4 h-4 ${
          errorCount > 0 ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className="font-medium">
          Errors: <span className={errorCount > 0 ? 'text-destructive' : ''}>
            {errorCount}
          </span>
        </span>
      </div>
    </div>
  );
}
```

## Testing Considerations

### New Test Cases Needed

**GameStats.test.tsx**
1. Should display time in MM:SS format
2. Should display time in HH:MM:SS format for long games
3. Should highlight errors in red when > 0
4. Should update when props change

**SudokuGame.test.tsx (additions)**
1. Timer should start when game initializes
2. Timer should stop when puzzle completes
3. Error count should increment on invalid move
4. Error count should NOT increment on valid move
5. Error count should NOT increment when clearing cell
6. Stats should persist in URL when sharing
7. Stats should load correctly from URL

**urlState.test.ts (additions)**
1. Should encode game stats correctly
2. Should decode game stats correctly
3. Should handle missing stats gracefully (default to 0)
4. Should handle invalid stats (NaN, negative)

### Manual Testing Checklist
- [ ] Timer starts immediately on new game
- [ ] Timer updates every second
- [ ] Timer stops when puzzle completes
- [ ] Timer persists when sharing URL
- [ ] Timer resumes from correct time when loading shared URL
- [ ] Error count increments on invalid moves
- [ ] Error count does NOT increment on valid moves
- [ ] Error count persists when sharing URL
- [ ] Stats display correctly on mobile
- [ ] Stats display correctly in dark mode
- [ ] Completion message shows final stats

## Mobile Responsiveness

### Layout Adjustments
```tsx
// Desktop: Side-by-side stats
<div className="hidden sm:flex justify-between items-center">
  <div>⏱️ 05:23</div>
  <div>❌ Errors: 3</div>
</div>

// Mobile: Stacked or compact
<div className="flex sm:hidden gap-4 justify-center text-sm">
  <span>⏱️ 05:23</span>
  <span>❌ 3</span>
</div>
```

## Backward Compatibility

### Handling Old URLs
URLs without stats params should still work:
```typescript
// Old URL: /m/000200000...?s=A3B5C7
// Should load with: elapsedTime=0, errorCount=0, timer starts fresh
```

### Migration Strategy
1. No database/storage changes needed (URL-based state)
2. Old shared URLs continue to work
3. New URLs include stats but are optional
4. Graceful fallback to 0 for missing params

## Performance Considerations

1. **Timer updates**: Only update every second (not more frequently)
2. **Re-renders**: Wrap timer display in `memo()` to avoid unnecessary re-renders
3. **URL updates**: Only update URL on share, not on every timer tick
4. **Error increment**: Minimal performance impact (simple counter)

## Future Enhancements

### Phase 2 (Optional)
1. **Pause/Resume**: Add pause button to stop timer
2. **Best Times**: Track personal records (localStorage)
3. **Streak Tracking**: Count consecutive error-free solves
4. **Leaderboard**: Compare times with friends (requires backend)
5. **Stats Page**: View all-time stats and history
6. **Hints**: Deduct time penalty for using hints

## Implementation Order

### Recommended Sequence
1. ✅ Add state variables to SudokuGame
2. ✅ Implement timer logic (start/stop/update)
3. ✅ Implement error counter (increment on invalid move)
4. ✅ Create GameStats UI component
5. ✅ Add formatTime helper function
6. ✅ Extend URL encoding/decoding functions
7. ✅ Update share handler to include stats
8. ✅ Update load handler to restore stats
9. ✅ Update completion toast to show stats
10. ✅ Add tests for new functionality
11. ✅ Test on mobile devices
12. ✅ Update CLAUDE.md documentation

## Questions to Resolve

Before implementation, decide:

1. **Timer behavior on page refresh?**
   - Option A: Reset timer (user loses progress)
   - Option B: Store in localStorage, resume on refresh
   - **Recommendation**: Option A (simpler, URL-based state is sufficient)

2. **Show stats on completed puzzles?**
   - Option A: Always show final stats
   - Option B: Hide stats after completion
   - **Recommendation**: Option A (show final stats with completion message)

3. **Error highlighting?**
   - Option A: Just count errors
   - Option B: Also highlight which cells had errors (requires tracking cell positions)
   - **Recommendation**: Option A (simpler, cleaner UX)

4. **Timer format for very long games (> 1 hour)?**
   - Option A: Switch to HH:MM:SS automatically
   - Option B: Always use MM:SS even for 90+ minutes
   - **Recommendation**: Option A (better UX)

5. **Stats bar placement?**
   - Option A: Above grid (between controls and grid)
   - Option B: Below controls (integrated with tabs)
   - Option C: Floating overlay (bottom of screen)
   - **Recommendation**: Option A (most visible, clean separation)

## Summary

This implementation adds essential game statistics without major architectural changes:

**Pros:**
- ✅ URL-based state (no backend needed)
- ✅ Shareable progress with stats
- ✅ Clean separation of concerns
- ✅ Testable components
- ✅ Mobile-friendly

**Cons:**
- ❌ Stats reset on page refresh (mitigated by URL sharing)
- ❌ No historical tracking (would require localStorage/backend)
- ❌ Timer precision limited to 1 second

**Estimated Effort:**
- Implementation: 4-6 hours
- Testing: 2-3 hours
- Documentation: 1 hour
- **Total: ~8 hours**
