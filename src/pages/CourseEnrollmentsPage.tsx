import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Upload, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Course } from '../types/course';
import { User } from '../types/user';
import { enrollInCourse, unenrollFromCourse } from '../utils/courses/course-service';

interface EnrolledUser extends User {
  isInstructor?: boolean;
}

export function CourseEnrollmentsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!courseId) {
      navigate('/courses');
      return;
    }
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*, instructor:users(id, email)')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch enrolled users
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('enrollment_details')
        .select('user_id, user_email, user_role')
        .eq('course_id', courseId)
        .eq('status', 'enrolled');

      if (enrolledError) throw enrolledError;
      
      const enrolledUsersList = enrolledData.map(e => ({
        id: e.user_id,
        email: e.user_email,
        role: e.user_role,
        isInstructor: courseData.instructor.id === e.user_id
      }));

      // Sort users with instructor first, then by email
      const sortedUsers = sortUserList(enrolledUsersList);
      setEnrolledUsers(sortedUsers);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const enrolledIds = enrolledUsers.map(u => u.id);
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('id', 'in', `(${enrolledIds.join(',')})`)
        .ilike('email', `%${searchTerm}%`);

      if (error) throw error;
      setAvailableUsers(users || []);
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error('Failed to load available users');
    }
  };

  const handleEnroll = async (userId: string) => {
    if (!courseId) return;
    
    try {
      await enrollInCourse(courseId, userId);
      toast.success('User enrolled successfully');
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll user';
      console.error('Error enrolling user:', error);
      toast.error(message);
    }
  };

  const handleUnenroll = async (userId: string) => {
    if (!courseId) return;

    try {
      await unenrollFromCourse(courseId, userId);
      toast.success('User removed from course');
      await loadData();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  const sortUserList = (users: EnrolledUser[]) => {
    return [...users].sort((a, b) => {
      if (a.isInstructor) return -1;
      if (b.isInstructor) return 1;
      return sortDirection === 'asc' 
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    });
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setEnrolledUsers(prev => sortUserList(prev));
  };

  if (loading) {
    return <div className="text-center py-8">Loading enrollment data...</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Manage Enrollments
        </h1>
        <p className="text-gray-600">
          {course.title}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Enrolled Users</h2>
            <button
              onClick={toggleSort}
              className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowAddModal(true);
                setSearchTerm('');
                loadAvailableUsers();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Users
            </button>
          </div>
        </div>

        {enrolledUsers.length === 0 ? (
          <p className="text-gray-500">No users enrolled</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {enrolledUsers.map(user => (
              <li 
                key={user.id} 
                className={`py-4 flex items-center justify-between ${
                  user.isInstructor ? 'bg-indigo-50' : ''
                }`}
              >
                <div>
                  <Link 
                    to={`/users/${user.id}`} 
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {user.email}
                  </Link>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                    {user.isInstructor && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Instructor
                      </span>
                    )}
                  </div>
                </div>
                {!user.isInstructor && (
                  <button
                    onClick={() => handleUnenroll(user.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-4">Add Users</h3>
            
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    loadAvailableUsers();
                  }}
                  placeholder="Search users by email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200">
              {availableUsers.map(user => (
                <li key={user.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => handleEnroll(user.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}