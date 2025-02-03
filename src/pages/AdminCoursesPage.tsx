import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CourseForm } from '../components/courses/CourseForm';
import { CourseList } from '../components/courses';
import { fetchCourses, deleteCourse } from '../utils/courses/course-service';
import { Course } from '../types/course';

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const coursesData = await fetchCourses();
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Load courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManageEnrollments = (courseId: string) => {
    navigate(`/courses/${courseId}/enrollments`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <div className="text-center">Loading courses...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Course Management</h2>
        <CourseForm onSuccess={loadData} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Course List</h2>
        <CourseList
          title=""
          courses={courses}
          onEnroll={handleManageEnrollments}
          onDelete={handleDeleteCourse}
          onEdit={handleEditCourse}
          emptyMessage="No courses have been created yet."
          enrollButtonText="Manage Enrollments"
        />
      </div>
    </div>
  );
}