import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Course } from '../types/course';
import { AppSubmission } from '../types/app';
import { fetchMyCourses } from '../utils/courses/course-service';
import { supabase } from '../lib/supabase';

interface GradeData {
  courseId: string;
  title: string;
  instructor: string;
  submissions: AppSubmission[];
}

export function CourseGradebookPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    loadData();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== 'student') {
      navigate('/');
      return;
    }
  };

  const loadData = async () => {
    try {
      const enrollments = await fetchMyCourses();
      const coursesData = enrollments.map(e => e.course!);
      setCourses(coursesData);

      // Fetch submissions for each course
      const gradesData = await Promise.all(
        coursesData.map(async (course) => {
          const { data: submissions } = await supabase
            .from('app_submissions')
            .select(`
              *,
              app_instance:instance_id(
                title,
                course_id
              )
            `)
            .eq('app_instance.course_id', course.id);

          return {
            courseId: course.id,
            title: course.title,
            instructor: course.instructor?.email || 'Unknown',
            submissions: submissions || []
          };
        })
      );

      setGrades(gradesData);
    } catch (error) {
      console.error('Failed to load gradebook:', error);
      toast.error('Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading gradebook...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Gradebook</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lab Activities
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grades.map((grade) => {
              const totalPoints = grade.submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
              const averageGrade = grade.submissions.length > 0 
                ? totalPoints / grade.submissions.length 
                : null;

              return (
                <tr key={grade.courseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{grade.title}</div>
                    <div className="text-sm text-gray-500">Instructor: {grade.instructor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {grade.submissions.map((submission, index) => (
                        <div key={index} className="text-sm text-gray-900">
                          {submission.app_instance?.title}: {submission.grade || 'Not graded'}%
                        </div>
                      ))}
                      {grade.submissions.length === 0 && (
                        <span className="text-sm text-gray-500">No labs completed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {averageGrade !== null ? (
                      <span className="text-sm font-medium text-gray-900">
                        {averageGrade.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Not graded</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {grades.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  You are not enrolled in any courses
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}