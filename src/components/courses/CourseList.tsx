import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { Course } from '../../types/course';

interface Props {
  title: string;
  courses: Course[];
  onEnroll?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onEdit?: (courseId: string) => void;
  isEnrolled?: (courseId: string) => boolean;
  emptyMessage?: string;
  enrollButtonText?: string;
}

export function CourseList({ 
  title, 
  courses, 
  onEnroll, 
  onDelete,
  onEdit,
  isEnrolled, 
  emptyMessage = 'No courses available.',
  enrollButtonText = 'Enroll Now'
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <p className="text-gray-600">
          {searchTerm ? 'No courses match your search.' : emptyMessage}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              onDelete={onDelete}
              onEdit={onEdit}
              isEnrolled={isEnrolled ? isEnrolled(course.id) : false}
              enrollButtonText={enrollButtonText}
            />
          ))}
        </div>
      )}
    </div>
  );
}