import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { User } from '../../types'; // Assuming you have a User type defined
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'user', 'facility_owner', 'admin'
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
      setError('Access Denied: You are not authorized to view this page.');
    }
  }, [user, fetchUsers]);

  const handleBanToggle = useCallback(async (userId: string, isBanned: boolean) => {
    try {
      await api.put(`/api/admin/users/${userId}`, { isBanned: !isBanned });
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error('Error updating user ban status:', err);
      setError(err.message || 'Failed to update user status');
    }
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="text-center py-8">Loading Users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (user?.role !== 'admin') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">User Management</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="facility_owner">Facility Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleBanToggle(u._id, u.isBanned || false)}
                      className={`mr-2 ${u.isBanned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/users/${u._id}/bookings`)} // Navigate to user-specific bookings page
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Bookings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
