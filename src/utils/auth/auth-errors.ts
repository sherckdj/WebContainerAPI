import { AuthError } from '../../types/auth';

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Invalid login credentials':
        return { message: 'Invalid email or password' };
      case 'User not found in database':
        return { message: 'Your account is not properly set up. Please contact an administrator.' };
      default:
        return { message: error.message };
    }
  }
  return { message: 'An unexpected error occurred' };
}