import { supabase } from '../../lib/supabase';
import { Grade, CreateGradeData } from '../../types/grade';

export async function fetchGrades(courseId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select(`
      *,
      student:users(email)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createGrade(
  courseId: string,
  studentId: string,
  gradeData: CreateGradeData
): Promise<Grade> {
  const { data, error } = await supabase
    .from('grades')
    .insert([{
      course_id: courseId,
      student_id: studentId,
      ...gradeData
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create grade');
  return data;
}

export async function updateGrade(
  gradeId: string,
  updates: Partial<CreateGradeData>
): Promise<Grade> {
  const { data, error } = await supabase
    .from('grades')
    .update(updates)
    .eq('id', gradeId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update grade');
  return data;
}

export async function deleteGrade(gradeId: string): Promise<void> {
  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', gradeId);

  if (error) throw error;
}