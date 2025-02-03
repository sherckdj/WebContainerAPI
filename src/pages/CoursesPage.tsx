import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CourseList } from '../components/courses';
import { fetchCourses, fetchMyCourses } from '../utils/courses/course-service';
import { Course, Enrollment } from '../types/course';
import { supabase } from '../lib/supabase';

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAdmin(user?.user_metadata?.role === 'admin');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesData, enrollmentsData] = await Promise.all([
        fetchCourses(),
        fetchMyCourses()
      ]);
      
      setCourses(coursesData);
      setMyEnrollments(enrollmentsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load courses';
      console.error('Load courses error:', error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageEnrollments = (courseId: string) => {
    navigate(`/courses/${courseId}/enrollments`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-red-800 text-lg font-medium mb-2">Error Loading Courses</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Only show enrolled courses to non-admin users
  if (!isAdmin) {
    const enrolledCourses = myEnrollments
      .filter(enrollment => enrollment.course)
      .map(enrollment => enrollment.course!);

    return (
      <CourseList
        title="My Courses"
        courses={enrolledCourses}
        emptyMessage="You are not enrolled in any courses."
      />
    );
  }

  // Show all courses to admin with management options
  return (
    <CourseList
      title="All Courses"
      courses={courses}
      onEnroll={handleManageEnrollments}
      emptyMessage="No courses available."
      enrollButtonText="Manage Enrollments"
    />
  );
}