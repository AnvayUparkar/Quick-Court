"use client"

import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
// import { requestOTP } from "../api" // Remove this line

export default function OTPVerification() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const { verifyOtp, resendOtp } = useAuth(); // Destructure login from useAuth
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!userId) {
      setError("User ID not found. Please sign up again.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email not found. Please go back and try again.");
      setLoading(false);
      return;
    }

    try {
      if (!email) {
        setError("Email not found. Please try again.");
        setLoading(false);
        return;
      }
      await verifyOtp(email, otp); // Changed userId to email
      alert("Account verified successfully! You can now log in.")
      navigate("/login")
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);

    if (!email) {
      setError("Email not found for resending OTP.");
      setLoading(false);
      return;
    }

    try {
      await resendOtp(email); // Changed userId to email
      alert("New OTP sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A One-Time Password (OTP) has been sent to your email address.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </div>
          <div className="text-sm text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
