import { CreateUserData, User } from '../types/user';
import { createUserRecord, fetchAllUsers } from './users';

export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.role) {
      throw new Error('Missing required fields');
    }

    // Validate student-specific fields
    if (userData.role === 'student') {
      if (!userData.first_name || !userData.last_name || !userData.student_number) {
        throw new Error('Student registration requires first name, last name, and student number');
      }
    }

    return await createUserRecord(userData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    console.error('User creation error:', error);
    throw new Error(message);
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    return await fetchAllUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}