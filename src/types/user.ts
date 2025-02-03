export interface User {
  id: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  first_name?: string | null;
  last_name?: string | null;
  student_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: User['role'];
  first_name?: string;
  last_name?: string;
  student_number?: string;
}