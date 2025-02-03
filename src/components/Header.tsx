import React from 'react';
import { LogOut, Users, BookOpen, Home, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.includes('/welcome/admin');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleHomeClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role || 'student';
    navigate(`/welcome/${role}`);
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </button>
          
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => navigate('/admin/users')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </button>
              <button
                onClick={() => navigate('/admin/courses')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Manage Courses
              </button>
            </>
          )}
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}