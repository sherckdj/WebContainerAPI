import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { BookOpen, Users, Settings } from 'lucide-react';

const roleConfig = {
  student: {
    title: 'Welcome, Student!',
    message: 'You have successfully logged in as a student.',
    icon: BookOpen,
  },
  instructor: {
    title: 'Welcome, Instructor!',
    message: 'You have successfully logged in as an instructor.',
    icon: Users,
  },
  admin: {
    title: 'Welcome, Administrator!',
    message: 'You have successfully logged in as an administrator.',
    icon: Settings,
  },
};

export function WelcomePage() {
  const { role } = useParams<{ role: keyof typeof roleConfig }>();

  if (!role || !roleConfig[role]) {
    return <Navigate to="/login" replace />;
  }

  const { title, message, icon: Icon } = roleConfig[role];

  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div className="flex justify-center">
        <Icon className="h-12 w-12 text-indigo-600" />
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {message}
      </p>
    </div>
  );
}