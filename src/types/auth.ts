export type Role = 'student' | 'instructor' | 'admin';

export const ROLES: Role[] = ['student', 'instructor', 'admin'];

export interface AuthError {
  message: string;
  code?: string;
}