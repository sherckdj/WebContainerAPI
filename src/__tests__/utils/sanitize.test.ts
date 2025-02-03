import { describe, it, expect } from 'vitest';
import { sanitizeHtml, validateInput } from '../../utils/sanitize';

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('should remove unsafe HTML tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe('<p>Hello</p>');
  });
});

describe('validateInput', () => {
  it('should validate correct input', () => {
    expect(validateInput('Hello World')).toBe(true);
  });

  it('should reject empty input', () => {
    expect(validateInput('')).toBe(false);
  });

  it('should reject input exceeding max length', () => {
    const longString = 'a'.repeat(1001);
    expect(validateInput(longString)).toBe(false);
  });

  it('should reject input with HTML tags', () => {
    expect(validateInput('<script>alert("xss")</script>')).toBe(false);
  });
});