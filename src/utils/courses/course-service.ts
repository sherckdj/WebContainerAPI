import { supabase } from '../../lib/supabase';
import { Course, CreateCourseData, Enrollment, CourseContent, CreateContentData, CourseLab } from '../../types/course';

// Helper function to retry failed requests
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function fetchCourses(): Promise<Course[]> {
  return retryOperation(async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching courses:', error);
        throw error;
      }

      return data?.map(course => ({
        ...course,
        instructor_email: course.instructor?.email
      })) || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }
      throw new Error('Failed to fetch courses');
    }
  });
}

export async function createCourse(courseData: CreateCourseData): Promise<Course> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Start a transaction
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert([{ 
      title: courseData.title,
      description: courseData.description,
      instructor_id: user.id 
    }])
    .select(`
      *,
      instructor:instructor_id (
        email
      )
    `)
    .single();

  if (courseError) throw courseError;
  if (!course) throw new Error('Failed to create course');

  // Add co-instructors if specified
  if (courseData.co_instructors && courseData.co_instructors.length > 0) {
    const coInstructors = courseData.co_instructors.map(instructorId => ({
      course_id: course.id,
      instructor_id: instructorId
    }));

    const { error: instructorsError } = await supabase
      .from('course_instructors')
      .insert(coInstructors);

    if (instructorsError) {
      // If adding co-instructors fails, delete the course
      await supabase.from('courses').delete().eq('id', course.id);
      throw instructorsError;
    }
  }

  return {
    ...course,
    instructor_email: course.instructor?.email
  };
}

export async function updateCourse(
  courseId: string,
  updates: { title: string; description: string }
): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update({
      title: updates.title,
      description: updates.description,
      updated_at: new Date().toISOString()
    })
    .eq('id', courseId)
    .select(`
      *,
      instructor:instructor_id (
        email
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update course');

  return {
    ...data,
    instructor_email: data.instructor?.email
  };
}

export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
}

export async function fetchCourseContent(courseId: string): Promise<CourseContent[]> {
  const { data, error } = await supabase
    .from('course_content')
    .select(`
      *,
      app_instance:app_instance_id (
        *,
        app:app_id (*)
      )
    `)
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCourseContent(
  courseId: string, 
  contentData: CreateContentData
): Promise<CourseContent> {
  // Get the highest order number
  const { data: existing } = await supabase
    .from('course_content')
    .select('order')
    .eq('course_id', courseId)
    .order('order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing[0] ? existing[0].order + 1 : 0;

  const { data, error } = await supabase
    .from('course_content')
    .insert([{ 
      ...contentData,
      course_id: courseId,
      order: contentData.order ?? nextOrder
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create content');

  return data;
}

export async function updateCourseContent(
  contentId: string,
  updates: Partial<CreateContentData>
): Promise<CourseContent> {
  const { data, error } = await supabase
    .from('course_content')
    .update(updates)
    .eq('id', contentId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update content');

  return data;
}

export async function deleteCourseContent(contentId: string): Promise<void> {
  const { error } = await supabase
    .from('course_content')
    .delete()
    .eq('id', contentId);

  if (error) throw error;
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
    .eq('user_id', user.id)
    .eq('status', 'enrolled')
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function enrollInCourse(courseId: string, userId?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !userId) throw new Error('Not authenticated');

  const studentId = userId || user!.id;

  // Check if user is already enrolled
  const { data: enrollments, error: checkError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', studentId)
    .eq('status', 'enrolled');

  if (checkError) throw checkError;
  
  if (enrollments && enrollments.length > 0) {
    throw new Error('Already enrolled in this course');
  }

  const { error: enrollError } = await supabase
    .from('enrollments')
    .insert([{
      course_id: courseId,
      user_id: studentId,
      status: 'enrolled'
    }]);

  if (enrollError) {
    if (enrollError.code === '23505') {
      throw new Error('Already enrolled in this course');
    }
    throw enrollError;
  }
}

export async function unenrollFromCourse(courseId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchCourseLabs(courseId: string): Promise<CourseLab[]> {
  const { data, error } = await supabase
    .from('course_labs')
    .select(`
      *,
      app:apps(
        name,
        type,
        config_schema
      )
    `)
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCourseLab(courseId: string, labData: { 
  app_id: string;
  title: string;
  description?: string;
}): Promise<CourseLab> {
  const { data: existing } = await supabase
    .from('course_labs')
    .select('order')
    .eq('course_id', courseId)
    .order('order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing[0] ? existing[0].order + 1 : 0;

  const { data, error } = await supabase
    .from('course_labs')
    .insert([{
      course_id: courseId,
      app_id: labData.app_id,
      title: labData.title,
      description: labData.description,
      order: nextOrder
    }])
    .select(`
      *,
      app:apps(
        name,
        type,
        config_schema
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create lab');

  return data;
}

export async function deleteCourseLab(labId: string): Promise<void> {
  const { error } = await supabase
    .from('course_labs')
    .delete()
    .eq('id', labId);

  if (error) throw error;
}