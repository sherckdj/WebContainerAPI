import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

export function validateInput(value: string, maxLength = 1000): boolean {
  return value.length > 0 && value.length <= maxLength && !/[<>]/.test(value);
}