# Testing Documentation

## Overview

This document describes the testing setup for the Sudoku PWA application and provides guidance for writing and running tests.

## Testing Stack

- **Vitest**: Fast unit test framework built on top of Vite
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM implementation for Node.js

## Getting Started

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Generate coverage report
npm test:coverage
```

### Project Structure

```
src/
├── components/
│   ├── UpdatePrompt.tsx
│   └── UpdatePrompt.test.tsx
└── tests/
    ├── setup.ts              # Global test setup
    └── mocks/
        └── pwa-register.ts   # Mock for PWA virtual module
```

## Writing Tests

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Mocking Modules

For virtual modules like `virtual:pwa-register/react`, create a mock in `src/tests/mocks/` and configure the alias in `vitest.config.ts`.

### Testing Components with Context

When testing components that use context providers (Theme, ColorScheme, etc.), wrap them appropriately:

```typescript
import { ThemeProvider } from 'next-themes';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};
```

## PWA Update Mechanism Analysis

### Issues Identified in Original UpdatePrompt

#### 1. Infrequent Update Checks
**Problem**: The service worker only checked for updates every 60 minutes.

**Impact**: Users with the app open during a deployment might not see the update for up to an hour.

**Location**: `UpdatePrompt.tsx:15-17`

```typescript
setInterval(() => {
  registration.update();
}, 60 * 60 * 1000); // Only checks once per hour
```

#### 2. No Visibility-Based Checks
**Problem**: When users switched tabs or minimized the browser, no update check occurred when they returned.

**Impact**: Users might keep using an old version even after returning to the app.

#### 3. No Network Reconnection Checks
**Problem**: If a user lost network connection during a deployment, they wouldn't get notified when reconnecting.

**Impact**: Users on spotty connections might miss updates.

#### 4. Limited Debugging Information
**Problem**: No console logging made it difficult to diagnose update detection issues.

**Impact**: Hard to verify if the update mechanism was working correctly.

### Recommended Improvements

See `UpdatePrompt.improved.tsx` for an enhanced version that includes:

1. **More Frequent Checks**: 30-minute intervals instead of 60
2. **Visibility Change Detection**: Checks for updates when users return to the tab
3. **Network Reconnection Detection**: Checks for updates when network comes back online
4. **Enhanced Logging**: Console logs for debugging update detection
5. **Toast Deduplication**: Prevents multiple toasts for the same update

### Testing the Improved Version

To test the update mechanism in production:

1. **Deploy a new version** of your app
2. **Open the browser console** (F12)
3. **Look for PWA logs** starting with `[PWA]`
4. **Trigger an update check** by:
   - Waiting 30 minutes (automatic)
   - Switching tabs and returning (visibility change)
   - Disconnecting and reconnecting network
5. **Verify toast appears** with "New version available!"

### Replacing the Current Version

To use the improved version:

```bash
# Backup the original
mv src/components/UpdatePrompt.tsx src/components/UpdatePrompt.original.tsx

# Use the improved version
mv src/components/UpdatePrompt.improved.tsx src/components/UpdatePrompt.tsx

# Run tests to verify
npm test
```

## Best Practices

### 1. Test Behavior, Not Implementation
Focus on what the component does from the user's perspective, not how it does it.

❌ **Bad**: Testing internal state
```typescript
expect(component.state.count).toBe(5);
```

✅ **Good**: Testing visible output
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Semantic Queries
Prefer queries that reflect how users interact with your app.

**Query Priority**:
1. `getByRole` - Accessible to assistive technologies
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

### 3. Avoid Testing Implementation Details
Don't test internal functions, state, or props directly. Test the component's public API (what the user sees and does).

### 4. Keep Tests Isolated
Each test should be independent and not rely on the state from other tests.

### 5. Use `waitFor` for Asynchronous Behavior
When testing async operations, always use `waitFor`:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loading complete')).toBeInTheDocument();
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --run
      - run: npm run test:coverage
```

## Coverage Goals

Aim for the following coverage targets:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Critical paths (payment, authentication, game logic) should have > 95% coverage.

## Troubleshooting

### Tests Failing Due to Module Resolution

If you see errors like "Failed to resolve import", check:

1. Is the module in `vitest.config.ts` aliases?
2. Is there a mock in `src/tests/mocks/`?
3. Is the module listed in `test.server.deps.inline`?

### Tests Timing Out

Increase the timeout for slow tests:

```typescript
it('should handle slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mocks are defined before imports:

```typescript
// ✅ Correct order
vi.mock('module-name');
import { something } from 'module-name';

// ❌ Wrong order
import { something } from 'module-name';
vi.mock('module-name');
```

## Next Steps

1. **Add more component tests** for:
   - `SudokuGame.tsx` (game logic)
   - `SudokuGrid.tsx` (cell rendering)
   - `NumberPad.tsx` (input handling)

2. **Add utility tests** for:
   - `src/utils/sudoku.ts` (puzzle generation, validation)
   - `src/utils/urlState.ts` (URL encoding/decoding)
   - `src/utils/colorSchemes.ts` (theme application)

3. **Add integration tests** for:
   - Complete game flow (start → play → complete)
   - Sharing puzzles via URL
   - Color scheme switching

4. **Add E2E tests** using Playwright or Cypress for:
   - PWA installation
   - Offline functionality
   - Cross-browser compatibility

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [PWA Testing Guide](https://web.dev/articles/testing-pwa)
