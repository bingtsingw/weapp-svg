import { describe, expect, it } from 'vite-plus/test';
import { hexToRgb } from './hex-to-rgb';

describe('hexToRgb', () => {
  it('converts six-digit hexadecimal colors', () => {
    expect(hexToRgb('#12abef')).toBe('rgb(18,171,239)');
  });

  it('expands shorthand hexadecimal colors before converting them', () => {
    expect(hexToRgb('#abc')).toBe('rgb(170,187,204)');
  });
});
