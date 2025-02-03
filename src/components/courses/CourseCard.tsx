import React from 'react';
import { Calendar, Users, Trash2, Edit2 } from 'lucide-react';
import { Course } from '../../types/course';
import { Link } from 'react-router-dom';

interface Props {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onEdit?: (courseId: string) => void;
  isEnrolled?: boolean;
  enrollButtonText?: string;
}

export function CourseCard({ 
  course, 
  onEnroll, 
  onDelete,
  onEdit,
  isEnrolled,
  enrollButtonText = 'Enroll Now'
}: Props) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      onDelete?.(course.id);
    }
  };

  const truncateDescription = (text: string | null, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link to={`/courses/${course.id}`} className="block">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                {course.title}
              </h3>
            </Link>
            <p className="text-gray-600 mb-4" title={course.description || ''}>
              {truncateDescription(course.description, 45)}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>Instructor: {course.instructor_email}</span>
              </div>
            </div>
          </div>

          <div className="ml-6 flex flex-col items-end space-y-4">
            {onDelete && (
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(course.id)}
                    className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50"
                    title="Edit course"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  title="Delete course"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}

            {onEnroll && !isEnrolled && (
              <button
                onClick={() => onEnroll(course.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
              >
                {enrollButtonText}
              </button>
            )}
            
            {isEnrolled && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md whitespace-nowrap">
                Enrolled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}