export interface Grade {
  id: string;
  course_id: string;
  student_id: string;
  activity_title: string;
  score: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGradeData {
  activity_title: string;
  score: number;
  feedback?: string;
}