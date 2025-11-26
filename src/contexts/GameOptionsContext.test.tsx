import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameOptionsProvider, useGameOptions, GameOptions } from "./GameOptionsContext";

const STORAGE_KEY = "sudoku-game-options";

describe("GameOptionsContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Provider initialization", () => {
    it("should provide default options when localStorage is empty", () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      expect(result.current.options).toEqual({
        showTimer: true,
        showErrors: true,
        showShareButton: true,
        highlightSameNumbers: true,
        showCellNumberSelector: true,
      });
    });

    it("should load options from localStorage on initialization", () => {
      const savedOptions: GameOptions = {
        showTimer: false,
        showErrors: true,
        showShareButton: false,
        highlightSameNumbers: false,
        showCellNumberSelector: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOptions));

      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      expect(result.current.options).toEqual(savedOptions);
    });

    it("should merge with defaults when loading partial options from localStorage", () => {
      // Simulate old version with fewer options
      const partialOptions = {
        showTimer: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partialOptions));

      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      // Should have all default options plus the stored ones
      expect(result.current.options).toEqual({
        showTimer: false,
        showErrors: true, // default
        showShareButton: true, // default
        highlightSameNumbers: true, // default
        showCellNumberSelector: true, // default
      });
    });

    it("should handle corrupted localStorage data gracefully", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json{");

      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      // Should fall back to defaults
      expect(result.current.options).toEqual({
        showTimer: true,
        showErrors: true,
        showShareButton: true,
        highlightSameNumbers: true,
        showCellNumberSelector: true,
      });
    });
  });

  describe("updateOption", () => {
    it("should update a single option", () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      act(() => {
        result.current.updateOption("showTimer", false);
      });

      expect(result.current.options.showTimer).toBe(false);
      expect(result.current.options.showErrors).toBe(true); // unchanged
    });

    it("should persist changes to localStorage", async () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      act(() => {
        result.current.updateOption("showTimer", false);
      });

      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.showTimer).toBe(false);
      });
    });

    it("should update multiple options independently", () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      act(() => {
        result.current.updateOption("showTimer", false);
        result.current.updateOption("showErrors", false);
        result.current.updateOption("showShareButton", false);
      });

      expect(result.current.options).toEqual({
        showTimer: false,
        showErrors: false,
        showShareButton: false,
        highlightSameNumbers: true, // unchanged
        showCellNumberSelector: true, // unchanged
      });
    });
  });

  describe("resetOptions", () => {
    it("should reset all options to defaults", () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      // Change some options
      act(() => {
        result.current.updateOption("showTimer", false);
        result.current.updateOption("showErrors", false);
      });

      // Reset
      act(() => {
        result.current.resetOptions();
      });

      expect(result.current.options).toEqual({
        showTimer: true,
        showErrors: true,
        showShareButton: true,
        highlightSameNumbers: true,
        showCellNumberSelector: true,
      });
    });

    it("should persist reset to localStorage", async () => {
      const { result } = renderHook(() => useGameOptions(), {
        wrapper: GameOptionsProvider,
      });

      // Change and then reset
      act(() => {
        result.current.updateOption("showTimer", false);
      });

      act(() => {
        result.current.resetOptions();
      });

      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(stored!);
        expect(parsed).toEqual({
          showTimer: true,
          showErrors: true,
          showShareButton: true,
          highlightSameNumbers: true,
          showCellNumberSelector: true,
        });
      });
    });
  });

  describe("useGameOptions hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useGameOptions());
      }).toThrow("useGameOptions must be used within a GameOptionsProvider");

      console.error = consoleError;
    });
  });

  describe("React component integration", () => {
    function TestComponent() {
      const { options, updateOption } = useGameOptions();

      return (
        <div>
          <div data-testid="show-timer">{String(options.showTimer)}</div>
          <div data-testid="show-errors">{String(options.showErrors)}</div>
          <button onClick={() => updateOption("showTimer", false)}>
            Hide Timer
          </button>
          <button onClick={() => updateOption("showErrors", false)}>
            Hide Errors
          </button>
        </div>
      );
    }

    it("should update component when options change", async () => {
      const user = userEvent.setup();

      render(
        <GameOptionsProvider>
          <TestComponent />
        </GameOptionsProvider>
      );

      expect(screen.getByTestId("show-timer")).toHaveTextContent("true");
      expect(screen.getByTestId("show-errors")).toHaveTextContent("true");

      await user.click(screen.getByText("Hide Timer"));

      expect(screen.getByTestId("show-timer")).toHaveTextContent("false");
      expect(screen.getByTestId("show-errors")).toHaveTextContent("true");
    });
  });
});
