import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GameOptions {
  showTimer: boolean;
  showErrors: boolean;
  showShareButton: boolean;
  highlightSameNumbers: boolean;
  showCellNumberSelector: boolean;
}

interface GameOptionsContextType {
  options: GameOptions;
  updateOption: (key: keyof GameOptions, value: boolean) => void;
  resetOptions: () => void;
}

const defaultOptions: GameOptions = {
  showTimer: true,
  showErrors: true,
  showShareButton: true,
  highlightSameNumbers: true,
  showCellNumberSelector: true,
};

const STORAGE_KEY = 'sudoku-game-options';

const GameOptionsContext = createContext<GameOptionsContextType | undefined>(undefined);

export function GameOptionsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<GameOptions>(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new options added in updates
        return { ...defaultOptions, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load game options from localStorage:', error);
    }
    return defaultOptions;
  });

  // Save to localStorage whenever options change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.error('Failed to save game options to localStorage:', error);
    }
  }, [options]);

  const updateOption = (key: keyof GameOptions, value: boolean) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
  };

  return (
    <GameOptionsContext.Provider value={{ options, updateOption, resetOptions }}>
      {children}
    </GameOptionsContext.Provider>
  );
}

export function useGameOptions() {
  const context = useContext(GameOptionsContext);
  if (context === undefined) {
    throw new Error('useGameOptions must be used within a GameOptionsProvider');
  }
  return context;
}
