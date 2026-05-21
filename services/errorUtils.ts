import { ApiError } from './apiClient';

/**
 * Extract validation error details from the response.
 * Handles the format: { error: { details: { fieldName: "error message" } } }
 */
export function getValidationErrors(err: unknown): Record<string, string> {
  if (err instanceof ApiError && err.data) {
    const data = err.data;
    
    // Handle nested error structure
    if (data.error && typeof data.error === 'object' && data.error.details) {
      return data.error.details;
    }
    
    // Handle flat error structure
    if (data.details && typeof data.details === 'object') {
      return data.details;
    }
  }
  return {};
}

/**
 * Extract a user-friendly message from an ApiError.
 * Prefer nested error.message, then data.message, then fallback to the ApiError's message.
 */
export function getErrorMessage(err: unknown): string {
  if (!err) {
    return 'An unknown error occurred';
  }

  // If it's an ApiError
  if (err instanceof ApiError) {
    // Try nested error structure first
    if (err.data && typeof err.data === 'object') {
      if (err.data.error && typeof err.data.error === 'object' && err.data.error.message) {
        return String(err.data.error.message);
      }
      if (err.data.message) {
        return String(err.data.message);
      }
    }
    // Fall back to the error's own message
    if (err.message) {
      return err.message;
    }
    // Last resort
    return `Request failed (${err.status})`;
  }

  // If it's a regular Error
  if (err instanceof Error) {
    return err.message || 'An error occurred';
  }

  // If it's a string
  if (typeof err === 'string') {
    return err;
  }

  // Fallback
  return 'An unexpected error occurred';
}

/**
 * Classify errors by HTTP status code for better UX.
 */
export function getErrorSeverity(
  err: unknown
): 'critical' | 'warning' | 'info' {
  if (err instanceof ApiError) {
    if (err.status >= 500) return 'critical';
    if (err.status === 401 || err.status === 403) return 'warning';
    if (err.status === 404 || err.status === 400) return 'info';
  }
  return 'warning';
}

/**
 * Determines if an error should be displayed to the user.
 * Some errors are too trivial (e.g. empty API data) and can be silently ignored.
 */
export function shouldDisplayError(
  err: unknown,
  context?: string
): boolean {
  if (!(err instanceof ApiError)) {
    return true;
  }

  // 404 errors usually just mean "not found" – often not exceptional
  if (err.status === 404) {
    return false;
  }

  // 400 errors are usually validation errors or malformed requests – show them
  if (err.status === 400) {
    return true;
  }

  // 401 is already handled by the interceptor (redirects to login)
  if (err.status === 401) {
    return false;
  }

  // 403 is forbidden – should be shown
  if (err.status === 403) {
    return true;
  }

  // 429 (too many requests) – show but with a friendly message
  if (err.status === 429) {
    return true;
  }

  // Network errors and 5xx – show
  if (!err.status || err.status >= 500) {
    return true;
  }

  return true;
}

/**
 * Transform an error to a display-friendly message in the UI.
 */
export function formatErrorForDisplay(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!shouldDisplayError(err)) {
    return '';
  }

  const message = getErrorMessage(err);
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return message || 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later.';
      default:
        return message || fallback;
    }
  }
  return message || fallback;
}
