import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import Loader from '../../components/shared/Loader'; // Added import for Loader

const AdminProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // New state for password
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // New state for avatar file
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // New state for avatar preview
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(user.avatar || null); // Set initial avatar preview from user data
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Create a URL for preview
    } else {
      setAvatarFile(null);
      setAvatarPreview(user?.avatar || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!user?._id) {
      setError('Admin user ID not found.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (password) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        formData.append('password', password);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (user?.avatar && avatarPreview === null) {
        // If there was an avatar but it's removed (preview is null and no new file)
        formData.append('removeAvatar', 'true');
      }

      const response = await api.put(`/api/admin/users/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateUser(response.data.data); // Update user context with new data
      setMessage('Profile updated successfully!');
      setPassword(''); // Clear password fields on success
      setConfirmPassword('');
      setAvatarFile(null); // Clear selected file
    } catch (err: any) {
      console.error('Error updating admin profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg w-full text-center mt-10">
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-gray-500 text-sm overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="avatar" className="cursor-pointer mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
          {avatarPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
        </label>
        {avatarPreview && (
          <button
            type="button"
            onClick={() => {
              setAvatarFile(null);
              setAvatarPreview(null);
            }}
            className="ml-4 mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Remove Picture
          </button>
        )}
        <p className="text-sm text-gray-500 mb-2">Profile Available</p>
        <h2 className="text-xl font-semibold text-gray-800">{user?.name || 'Admin User'}</h2>
        <p className="text-gray-600 mb-1">{user?.email || 'N/A'}</p>
        <p className="text-gray-500 text-sm mb-6">Role: {user?.role || 'N/A'}</p>

        {message && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? <Loader size="w-5 h-5" color="border-white" /> : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
