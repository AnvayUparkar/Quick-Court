"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { requestOTP } from "../api"

export default function SignupScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user") // Default role
  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth() // Destructure signup from useAuth
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    if (avatar) {
        formData.append("avatar", avatar);
    }

    try {
      const data = await signup(formData)
      await requestOTP(email);
      navigate(`/verify-otp?userId=${data.userId}&email=${email}`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Array of image URLs for the left side
  const images = [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3BvcnRzfGVufDB8fDB8fHww",
    "https://imgs.search.brave.com/XGjrvN2VaGKw8Gl4f3itgiLfw1zTY_ZkYqrk4zHfCw4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vb19BRUkv/TUFFeEZ5b19BRUkv/MS90bC9jYW52YS1m/cmllbmRzLXBsYXlp/bmctYmFza2V0YmFs/bC1hdC1vdXRkb29y/LWNvdXJ0LU1BRXhG/eW9fQUVJLmpwZw",
    "https://unsplash.com/s/photos/swimming-competition",
  ]
  // Pick a random image only once per browser refresh
  const randomImage = React.useMemo(() => images[Math.floor(Math.random() * images.length)], [])

  return (
    <div className="flex w-screen h-screen bg-[#f8f9fa]">
      {/* Left side full image */}
      <div
        className="w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${randomImage}')` }}
      ></div>
      {/* Right side signup card container */}
      <div className="w-1/2 h-full flex items-center justify-center">
        <div
          className="w-full max-w-md rounded-xl shadow-md p-8 bg-white"
          style={{
            border: "2px solid",
            borderImage: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%) 1",
            borderRadius: "1rem",
          }}
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">QUICKCOURT</h2>
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">SIGN UP</h3>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center border border-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="user">User</option>
                <option value="facility_owner">Facility Owner</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Profile Avatar (Optional):</label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded font-semibold transition"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
              }}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
