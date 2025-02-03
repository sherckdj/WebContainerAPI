import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit2, Save, X } from 'lucide-react';
import { Course, CourseContent as CourseContentType } from '../types/course';
import { fetchCourses, fetchCourseContent, updateCourse } from '../utils/courses/course-service';
import { CourseContent } from '../components/courses/CourseContent';
import { supabase } from '../lib/supabase';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [content, setContent] = useState<CourseContentType[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (!id) {
      setError('Course ID is missing');
      return;
    }
    loadData();
    checkPermissions();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [courseData, contentData] = await Promise.all([
        fetchCourses(),
        fetchCourseContent(id!)
      ]);
      
      const foundCourse = courseData.find(c => c.id === id);
      if (!foundCourse) {
        setError('Course not found');
        return;
      }
      
      setCourse(foundCourse);
      setContent(contentData);
      setEditForm({
        title: foundCourse.title,
        description: foundCourse.description || ''
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load course';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isAdmin = user.user_metadata.role === 'admin';
      const isInstructor = course?.instructor_id === user.id;
      setCanEdit(isAdmin || isInstructor);
    } catch (err) {
      console.error('Permission check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      await updateCourse(course.id, editForm);
      toast.success('Course updated successfully');
      setIsEditing(false);
      loadData();
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error('Failed to update course');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-red-800 text-lg font-medium mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 text-red-600 hover:text-red-800 font-medium"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h2 className="text-yellow-800 text-lg font-medium mb-2">Course Not Found</h2>
        <p className="text-yellow-600">The requested course could not be found.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 text-yellow-600 hover:text-yellow-800 font-medium"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-2">{course.description}</p>
                <div className="text-sm text-gray-500 mt-4">
                  Instructor: {course.instructor?.email}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Course
                </button>
              )}
            </div>
            {canEdit && (
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => navigate(`/courses/${course.id}/enrollments`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Manage Enrollments
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CourseContent
          courseId={course.id}
          canEdit={canEdit}
          onContentChange={loadData}
        />
      </div>
    </div>
  );
}