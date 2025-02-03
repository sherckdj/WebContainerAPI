import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { CSVImport } from '../components/CSVImport';
import { getAllUsers } from '../utils/user-management';
import { User } from '../types/user';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'email' | 'created_at' | 'last_name'>('created_at');

  const loadData = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: 'email' | 'created_at' | 'last_name') => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.first_name?.toLowerCase() || '').includes(searchLower) ||
        (user.last_name?.toLowerCase() || '').includes(searchLower) ||
        (user.student_number || '').includes(searchTerm)
      );
    })
    .sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortField) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'last_name':
          aValue = `${a.last_name || ''} ${a.first_name || ''}`.trim();
          bValue = `${b.last_name || ''} ${b.first_name || ''}`.trim();
          break;
        case 'created_at':
          aValue = a.created_at || '';
          bValue = b.created_at || '';
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  return (
    <div className="bg-white shadow rounded-lg p-8">
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
            <UserList 
              users={filteredAndSortedUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOrder={sortOrder}
              sortField={sortField}
              onSort={handleSort}
            />
          )}
        </div>
      </div>
    </div>
  );
}