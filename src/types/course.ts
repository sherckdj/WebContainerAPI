import { AppInstance } from './app';
import { User } from './user';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  created_at: string;
  updated_at: string;
  instructor_email?: string;
  instructor?: {
    email: string;
  };
  co_instructors?: User[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  co_instructors?: string[]; // Array of instructor IDs
}

export interface CourseContent {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
  app_instance?: AppInstance;
}

export interface CreateContentData {
  title: string;
  content: string;
  order?: number;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface CourseLab {
  id: string;
  course_id: string;
  app_id: string;
  title: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  app?: {
    name: string;
    type: string;
    config_schema: Record<string, unknown>;
  };
}