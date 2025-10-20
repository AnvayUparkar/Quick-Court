"use client"

import React, { useState, useEffect } from "react";
// import Header from "./shared/Header"; // Removed local Header import
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';

const ProfileScreen = () => {
  const { user, token , updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarPreview(user?.avatar ?? null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (password) {
      formData.append("password", password);
    }
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`http://localhost:8000/api/users/profile`, formData, config);
      setSuccess(response.data.message || "Profile updated successfully!");
      updateUser(response.data.user); // Update user in AuthContext
      // Optionally update user in AuthContext if needed, though a full page reload might be simpler
      // For now, let's assume AuthContext's user state might need a refresh logic or explicit update.
      // Since this is a direct update, a simple refresh can be triggered by refetching user details.
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> Removed local Header component */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                  <img
                    src={avatarPreview || "https://via.placeholder.com/150"}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-sm font-medium">Change Avatar</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600 capitalize">Role: {user.role.replace('_', ' ')}</p>
              </div>

              {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{success}</span></div>}
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

                <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                        <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                          <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Updating..." : "Update Profile"}
                          </button>
                        </div>
            </form>
          ) : (
            <p className="text-center text-gray-600">Please log in to view your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
