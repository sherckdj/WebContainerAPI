import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Users, BookOpen, LogOut, GraduationCap, User, AppWindow } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{ id: string, title: string }>>([]);

  useEffect(() => {
    checkUserRole();
    loadEnrolledCourses();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAdmin(user?.user_metadata?.role === 'admin');
    setUserRole(user?.user_metadata?.role);
  };

  const loadEnrolledCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const role = user.user_metadata.role;

    if (role === 'instructor') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (courses) {
        setEnrolledCourses(courses);
      }
    } else if (role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course:courses(id, title)')
        .eq('user_id', user.id)
        .eq('status', 'enrolled');

      if (enrollments) {
        setEnrolledCourses(enrollments.map(e => e.course));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div 
        className="w-64 bg-white shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <GraduationCap className="h-8 w-8 text-indigo-600" aria-hidden="true" />
            <span className="ml-2 text-xl font-semibold text-gray-900">LMS</span>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate('/admin/users')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/users')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive('/admin/users') ? 'page' : undefined}
                >
                  <Users className="h-5 w-5 mr-3" aria-hidden="true" />
                  <span>Manage Users</span>
                </button>

                <button
                  onClick={() => navigate('/admin/courses')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/courses')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive('/admin/courses') ? 'page' : undefined}
                >
                  <BookOpen className="h-5 w-5 mr-3" aria-hidden="true" />
                  <span>Manage Courses</span>
                </button>

                <button
                  onClick={() => navigate('/admin/apps')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/admin/apps')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive('/admin/apps') ? 'page' : undefined}
                >
                  <AppWindow className="h-5 w-5 mr-3" aria-hidden="true" />
                  <span>Manage Apps</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/courses')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                    isActive('/courses')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive('/courses') ? 'page' : undefined}
                >
                  <BookOpen className="h-5 w-5 mr-3" aria-hidden="true" />
                  <span>{userRole === 'instructor' ? 'My Teaching' : 'My Courses'}</span>
                </button>

                {userRole === 'student' && (
                  <button
                    onClick={() => navigate('/gradebook')}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                      isActive('/gradebook')
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={isActive('/gradebook') ? 'page' : undefined}
                  >
                    <GraduationCap className="h-5 w-5 mr-3" aria-hidden="true" />
                    <span>Gradebook</span>
                  </button>
                )}
              </>
            )}
          </nav>

          <div className="border-t p-4 space-y-2">
            <button
              onClick={() => navigate('/profile')}
              className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                isActive('/profile')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={isActive('/profile') ? 'page' : undefined}
            >
              <User className="h-5 w-5 mr-3" aria-hidden="true" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <main className="p-8" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}