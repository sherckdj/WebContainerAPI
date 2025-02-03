import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { CSVImport } from '../components/CSVImport';
import { CourseForm } from '../components/courses/CourseForm';
import { CourseList } from '../components/courses';
import { getAllUsers } from '../utils/user-management';
import { fetchCourses } from '../utils/courses/course-service';
import { User } from '../types/user';
import { Course } from '../types/course';
import { Header } from '../components/Header';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [usersData, coursesData] = await Promise.all([
        getAllUsers(),
        fetchCourses()
      ]);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <UserForm onSuccess={loadData} />
              </div>
              
              <CSVImport onSuccess={loadData} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Existing Users</h3>
              {loading ? (
                <p>Loading users...</p>
              ) : (
                <UserList users={users} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Course Management</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
              <CourseForm onSuccess={loadData} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Courses</h3>
              {loading ? (
                <p>Loading courses...</p>
              ) : (
                <CourseList
                  title=""
                  courses={courses}
                  emptyMessage="You haven't created any courses yet."
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}