"use client"

import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Loader from "./shared/Loader"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  // Array of image URLs for the left side
  const images = [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3BvcnRzfGVufDB8fDB8fHww",
    "https://imgs.search.brave.com/XGjrvN2VaGKw8Gl4f3itgiLfw1zTY_ZkYqrk4zHfCw4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tYXJr/ZXRwbGFjZS5jYW52/YS5jb20vb19BRUkv/TUFFeEZ5b19BRUkv/MS90bC9jYW52YS1m/cmllbmRzLXBsYXlp/bmctYmFza2V0YmFs/bC1hdC1vdXRkb29y/LWNvdXJ0LU1BRXhG/eW9fQUVJLmpwZw"
  ]
  // Pick a random image only once per page load
  const randomImage = useMemo(
    () => images[Math.floor(Math.random() * images.length)],
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      // Redirect to home or dashboard after successful login (handled by AuthContext)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-screen h-screen bg-[#f8f9fa]">
      {/* Left side full image with sliding animation */}
      <div
        className="w-1/2 h-full bg-cover bg-center slide-in-image hidden lg:block"
        style={{ backgroundImage: `url('${randomImage}')` }}
      ></div>
      {/* Right side login card container */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center">
        <div
          className="w-full max-w-md rounded-xl shadow-md p-8 bg-white"
          style={{
            border: "2px solid",
            borderImage: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%) 1",
            borderRadius: "1rem",
          }}
        >
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">QUICKCOURT</h2>
          <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">LOGIN</h3>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center border border-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? <Loader size="w-5 h-5" color="border-white" /> : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/forgot-password" className="text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
