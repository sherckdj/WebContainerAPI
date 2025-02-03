export interface App {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  config_schema: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AppInstance {
  id: string;
  app_id: string;
  course_id: string;
  content_id: string | null;
  title: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  app?: App;
}

export interface AppSubmission {
  id: string;
  instance_id: string;
  user_id: string;
  submission_data: Record<string, unknown>;
  grade: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded' | 'resubmitted';
  created_at: string;
  updated_at: string;
}

export interface CreateAppData {
  name: string;
  slug: string;
  description?: string;
  type: string;
  config_schema: Record<string, unknown>;
}

export interface CreateAppInstanceData {
  app_id: string;
  course_id: string;
  content_id?: string;
  title: string;
  config: Record<string, unknown>;
}

export interface CreateAppSubmissionData {
  instance_id: string;
  submission_data: Record<string, unknown>;
}

export interface SubmissionGradeData {
  instance_id: string;
  user_id: string;
  points: number;
}