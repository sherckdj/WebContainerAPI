import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createCourse } from '../../utils/courses/course-service';
import { CreateCourseData } from '../../types/course';
import { User } from '../../types/user';
import { supabase } from '../../lib/supabase';

interface Props {
  onSuccess: () => void;
}

export function CourseForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [formData, setFormData] = useState<CreateCourseData>({
    title: '',
    description: '',
    co_instructors: []
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'instructor');

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Failed to load instructors:', error);
      toast.error('Failed to load instructors');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCourse(formData);
      toast.success('Course created successfully');
      setFormData({ title: '', description: '', co_instructors: [] });
      onSuccess();
    } catch (error) {
      console.error('Course creation error:', error);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorChange = (instructorId: string) => {
    setFormData(prev => {
      const currentInstructors = prev.co_instructors || [];
      const newInstructors = currentInstructors.includes(instructorId)
        ? currentInstructors.filter(id => id !== instructorId)
        : [...currentInstructors, instructorId];
      return { ...prev, co_instructors: newInstructors };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Course Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructor
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
          {instructors.map(instructor => (
            <label key={instructor.id} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={formData.co_instructors?.includes(instructor.id)}
                onChange={() => handleInstructorChange(instructor.id)}
                className="rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{instructor.email}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}