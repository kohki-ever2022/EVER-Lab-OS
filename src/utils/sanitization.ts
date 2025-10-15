// src/utils/sanitization.ts

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * @param unsafe The potentially unsafe string.
 * @returns A sanitized string safe for rendering as text content.
 */
export const escapeHtml = (unsafe: string): string => {
    if (typeof unsafe !== 'string' || !unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
};

/**
 * Recursively sanitizes all string properties of an object by escaping HTML characters.
 * This is a deep sanitization function.
 * @param obj The object to sanitize.
 * @returns A new object with all string properties sanitized.
 */
export const sanitizeObject = <T extends object>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        // @ts-ignore
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === 'string') {
                sanitized[key] = escapeHtml(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeObject(value as object);
            } else {
                sanitized[key] = value;
            }
        }
    }
    return sanitized as T;
};
