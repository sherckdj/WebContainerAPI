import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Search } from 'lucide-react';
import { User } from '../types/user';

interface Props {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOrder: 'asc' | 'desc';
  sortField: 'email' | 'created_at' | 'last_name';
  onSort: (field: 'email' | 'created_at' | 'last_name') => void;
}

export function UserList({ 
  users, 
  searchTerm, 
  onSearchChange,
  sortOrder,
  sortField,
  onSort 
}: Props) {
  const getSortIcon = (field: 'email' | 'created_at' | 'last_name') => {
    if (sortField !== field) return null;
    return (
      <ArrowUpDown 
        className={`h-4 w-4 inline-block ml-1 ${
          sortField === field ? 'text-indigo-600' : 'text-gray-400'
        }`}
        aria-hidden="true"
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Search users"
        />
        <Search 
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
          aria-hidden="true"
        />
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => onSort('email')}
                      className="group inline-flex items-center"
                      aria-label={`Sort by email ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => onSort('last_name')}
                      className="group inline-flex items-center"
                      aria-label={`Sort by name ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      Name
                      {getSortIcon('last_name')}
                    </button>
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => onSort('created_at')}
                      className="group inline-flex items-center"
                      aria-label={`Sort by date created ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      Created At
                      {getSortIcon('created_at')}
                    </button>
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                      {user.role}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(user.created_at!).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <Link
                        to={`/users/${user.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}