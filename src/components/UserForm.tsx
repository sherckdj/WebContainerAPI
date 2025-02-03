import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createUser } from '../utils/user-management';
import { validatePassword } from '../utils/validation';
import { ROLES } from '../types/auth';

export function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    role: 'student' as const,
    first_name: '',
    last_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { valid, message } = validatePassword(formData.password);
    if (!valid) {
      toast.error(message);
      return;
    }

    // Validate required fields
    if (!formData.id || !formData.email || !formData.password || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate User ID format (8 digits)
    if (!/^\d{8}$/.test(formData.id)) {
      toast.error('User ID must be exactly 8 digits');
      return;
    }

    setLoading(true);

    try {
      await createUser(formData);
      toast.success('User created successfully');
      setFormData({
        id: '',
        email: '',
        password: '',
        role: 'student',
        first_name: '',
        last_name: ''
      });
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="id" className="block text-sm font-medium text-gray-700">
          User ID
        </label>
        <input
          type="text"
          id="id"
          value={formData.id}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
            setFormData(prev => ({ ...prev, id: value }));
          }}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          required
          pattern="\d{8}"
          maxLength={8}
          placeholder="12345678"
        />
        <p className="mt-1 text-sm text-gray-500">
          Must be exactly 8 digits (numbers only)
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          required
          minLength={6}
        />
        <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters long</p>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as typeof ROLES[number] }))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          {ROLES.map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          value={formData.first_name}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name}
          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}