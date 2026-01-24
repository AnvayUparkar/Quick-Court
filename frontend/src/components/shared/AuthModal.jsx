import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Loader from './Loader'

const AuthModal = () => {
    const {
        isAuthModalOpen,
        authModalMode,
        closeAuthModal,
        login,
        signup,
    } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState(authModalMode || 'login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState('user')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    React.useEffect(() => {
        if (authModalMode) setMode(authModalMode)
    }, [authModalMode])

    if (!isAuthModalOpen) return null

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(email, password)
            closeAuthModal()
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('role', role)
            const data = await signup(formData)
            // After signup navigate to verify-otp (same behavior as page signup)
            closeAuthModal()
            navigate(`/verify-otp?userId=${data.userId}&email=${email}`)
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={closeAuthModal}></div>
            <div className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex">
                    <div className="w-1/2 hidden md:block bg-indigo-600 text-white p-6">
                        <h3 className="text-2xl font-bold">Welcome to QuickCourt</h3>
                        <p className="mt-4">Quickly login or create an account to book courts and manage bookings.</p>
                    </div>
                    <div className="w-full md:w-1/2 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-2">
                                <button onClick={() => setMode('login')} className={`px-3 py-1 rounded ${mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Login</button>
                                <button onClick={() => setMode('signup')} className={`px-3 py-1 rounded ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Sign up</button>
                            </div>
                            <button onClick={closeAuthModal} className="text-gray-500 hover:text-gray-800">Close</button>
                        </div>

                        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3">{error}</div>}

                        {mode === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-3">
                                <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
                                <input value={password} onChange={e => setPassword(e.target.value)} required type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">
                                    {loading ? <Loader size="w-5 h-5" color="border-white" /> : 'Login'}
                                </button>
                                <div className="text-sm text-center mt-2">Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-indigo-600">Sign up</button></div>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-3">
                                <input value={name} onChange={e => setName(e.target.value)} required type="text" placeholder="Full name" className="w-full px-3 py-2 border rounded" />
                                <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
                                <input value={password} onChange={e => setPassword(e.target.value)} required type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
                                <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
                                    <option value="user">User</option>
                                    <option value="facility_owner">Facility Owner</option>
                                </select>
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded">
                                    {loading ? <Loader size="w-5 h-5" color="border-white" /> : 'Sign up'}
                                </button>
                                <div className="text-sm text-center mt-2">Already have an account? <button type="button" onClick={() => setMode('login')} className="text-indigo-600">Login</button></div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
