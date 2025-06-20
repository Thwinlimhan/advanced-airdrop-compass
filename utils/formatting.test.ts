import { describe, it, expect } from 'vitest';
import { formatCurrency, parseMonetaryValue } from './formatting';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('should handle zero values', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
