import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Course } from '../types/course';

interface Props {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

export function CourseCard({ course, onEnroll, isEnrolled }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Users className="h-4 w-4 mr-2" />
          <span>Instructor: {course.instructor_email}</span>
        </div>

        {onEnroll && !isEnrolled && (
          <button
            onClick={() => onEnroll(course.id)}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Enroll Now
          </button>
        )}
        
        {isEnrolled && (
          <div className="w-full text-center py-2 px-4 bg-green-100 text-green-800 rounded-md">
            Enrolled
          </div>
        )}
      </div>
    </div>
  );
}