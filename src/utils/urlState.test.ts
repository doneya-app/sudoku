import { describe, it, expect } from 'vitest';
import { encodeGameStats, decodeGameStats } from './urlState';

describe('urlState - game stats', () => {
  describe('encodeGameStats', () => {
    it('should encode time and errors', () => {
      const result = encodeGameStats(120, 3);
      expect(result).toBe('t=120&e=3');
    });

    it('should encode only time if no errors', () => {
      const result = encodeGameStats(60, 0);
      expect(result).toBe('t=60');
    });

    it('should encode only errors if no time', () => {
      const result = encodeGameStats(0, 5);
      expect(result).toBe('e=5');
    });

    it('should return empty string if both are zero', () => {
      const result = encodeGameStats(0, 0);
      expect(result).toBe('');
    });

    it('should handle large numbers', () => {
      const result = encodeGameStats(3600, 100);
      expect(result).toBe('t=3600&e=100');
    });
  });

  describe('decodeGameStats', () => {
    it('should decode time and errors', () => {
      const params = new URLSearchParams('t=120&e=3');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(120);
      expect(result.errorCount).toBe(3);
    });

    it('should decode only time', () => {
      const params = new URLSearchParams('t=60');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(60);
      expect(result.errorCount).toBe(0);
    });

    it('should decode only errors', () => {
      const params = new URLSearchParams('e=5');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(0);
      expect(result.errorCount).toBe(5);
    });

    it('should return zeros if no params', () => {
      const params = new URLSearchParams('');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(0);
      expect(result.errorCount).toBe(0);
    });

    it('should handle invalid time values', () => {
      const params = new URLSearchParams('t=abc&e=3');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(0);
      expect(result.errorCount).toBe(3);
    });

    it('should handle invalid error values', () => {
      const params = new URLSearchParams('t=120&e=xyz');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(120);
      expect(result.errorCount).toBe(0);
    });

    it('should handle negative values', () => {
      const params = new URLSearchParams('t=-10&e=-5');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(0);
      expect(result.errorCount).toBe(0);
    });

    it('should handle decimal values by truncating', () => {
      const params = new URLSearchParams('t=120.5&e=3.7');
      const result = decodeGameStats(params);
      expect(result.elapsedTime).toBe(120);
      expect(result.errorCount).toBe(3);
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should preserve values through encode/decode', () => {
      const original = { elapsedTime: 300, errorCount: 7 };
      const encoded = encodeGameStats(original.elapsedTime, original.errorCount);
      const params = new URLSearchParams(encoded);
      const decoded = decodeGameStats(params);

      expect(decoded.elapsedTime).toBe(original.elapsedTime);
      expect(decoded.errorCount).toBe(original.errorCount);
    });

    it('should handle zero values through round-trip', () => {
      const original = { elapsedTime: 0, errorCount: 0 };
      const encoded = encodeGameStats(original.elapsedTime, original.errorCount);
      const params = new URLSearchParams(encoded);
      const decoded = decodeGameStats(params);

      expect(decoded.elapsedTime).toBe(0);
      expect(decoded.errorCount).toBe(0);
    });
  });
});
