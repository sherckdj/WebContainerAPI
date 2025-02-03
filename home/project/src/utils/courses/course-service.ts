import { supabase } from '../../lib/supabase';
import { Course, CreateCourseData, Enrollment } from '../../types/course';

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('course_details')  // Use the view instead of direct table access
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCourse(courseData: CreateCourseData): Promise<Course> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('courses')
    .insert([{ ...courseData, instructor_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create course');

  return data;
}

export async function fetchMyCourses(): Promise<Enrollment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(
        *,
        instructor:users(email)
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'enrolled')
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function enrollInCourse(courseId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('enrollments')
    .insert([{
      course_id: courseId,
      student_id: user.id,
      status: 'enrolled'
    }]);

  if (error) throw error;
}