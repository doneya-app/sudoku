import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  formatTime,
  saveGameStats,
  loadGameStats,
  clearGameStats,
  generatePuzzleId,
} from './gameStats';

describe('gameStats utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(599)).toBe('9:59');
      expect(formatTime(3599)).toBe('59:59');
    });

    it('should format hours to HH:MM:SS', () => {
      expect(formatTime(3600)).toBe('1:00:00');
      expect(formatTime(3661)).toBe('1:01:01');
      expect(formatTime(7325)).toBe('2:02:05');
      expect(formatTime(36000)).toBe('10:00:00');
    });
  });

  describe('generatePuzzleId', () => {
    it('should return the puzzle string as ID', () => {
      const puzzle = '0'.repeat(81);
      expect(generatePuzzleId(puzzle)).toBe(puzzle);
    });

    it('should generate unique IDs for different puzzles', () => {
      const puzzle1 = '0'.repeat(81);
      const puzzle2 = '1' + '0'.repeat(80);
      expect(generatePuzzleId(puzzle1)).not.toBe(generatePuzzleId(puzzle2));
    });
  });

  describe('saveGameStats and loadGameStats', () => {
    it('should save and load game stats', () => {
      const puzzleId = 'test-puzzle-123';
      const startTime = Date.now();
      const elapsedTime = 120;
      const errorCount = 3;

      saveGameStats(puzzleId, startTime, elapsedTime, errorCount);

      const loaded = loadGameStats(puzzleId);
      expect(loaded).not.toBeNull();
      expect(loaded!.startTime).toBe(startTime);
      expect(loaded!.elapsedTime).toBe(elapsedTime);
      expect(loaded!.errorCount).toBe(errorCount);
    });

    it('should return null for non-existent puzzle', () => {
      const loaded = loadGameStats('non-existent-puzzle');
      expect(loaded).toBeNull();
    });

    it('should return null for different puzzle ID', () => {
      const puzzleId1 = 'puzzle-1';
      const puzzleId2 = 'puzzle-2';

      saveGameStats(puzzleId1, Date.now(), 100, 5);

      const loaded = loadGameStats(puzzleId2);
      expect(loaded).toBeNull();
    });

    it('should overwrite previous stats for same puzzle', () => {
      const puzzleId = 'test-puzzle';

      saveGameStats(puzzleId, 1000, 100, 5);
      saveGameStats(puzzleId, 2000, 200, 10);

      const loaded = loadGameStats(puzzleId);
      expect(loaded!.startTime).toBe(2000);
      expect(loaded!.elapsedTime).toBe(200);
      expect(loaded!.errorCount).toBe(10);
    });
  });

  describe('clearGameStats', () => {
    it('should clear all saved stats', () => {
      const puzzleId = 'test-puzzle';
      saveGameStats(puzzleId, Date.now(), 100, 5);

      clearGameStats();

      const loaded = loadGameStats(puzzleId);
      expect(loaded).toBeNull();
    });

    it('should not throw if no stats exist', () => {
      expect(() => clearGameStats()).not.toThrow();
    });
  });

  describe('localStorage error handling', () => {
    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      expect(() => {
        saveGameStats('test', Date.now(), 100, 5);
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle load errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = () => {
        throw new Error('SecurityError');
      };

      expect(() => {
        loadGameStats('test');
      }).not.toThrow();

      const result = loadGameStats('test');
      expect(result).toBeNull();

      Storage.prototype.getItem = originalGetItem;
    });
  });
});
