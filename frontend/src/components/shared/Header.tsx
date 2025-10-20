import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import React, { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : (user?.role === 'facility_owner' ? '/owner/dashboard' : '/')}
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent"
        >
          QuickCourt
        </Link>
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">Hello, {user.name} ({user.role})</span>
              {user.role !== 'admin' && ( // Conditionally render Profile link for non-admin users
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600">
                  Profile
                </Link>
              )}
              {user.role === 'facility_owner' && (
                <>
                  {/* <Link to="/owner/dashboard" className="text-gray-600 hover:text-indigo-600">
                    Owner Dashboard
                  </Link> */}
                  {/* <Link to="/owner/facilities" className="text-gray-600 hover:text-indigo-600">
                    Facility Management
                  </Link>
                   */}
                  {/* <Link to="/owner/bookings" className="text-gray-600 hover:text-indigo-600">
                    Booking Overview
                  </Link> */}
                </>
              )}
              {user.role === 'admin' && (
                <>
                  {/* <Link to="/admin/facility-approval" className="text-gray-600 hover:text-indigo-600">
                    Facility Approval
                  </Link>
                  <Link to="/admin/user-management" className="text-gray-600 hover:text-indigo-600">
                    User Management
                  </Link>
                  <Link to="/admin/profile" className="text-gray-600 hover:text-indigo-600">
                    Admin Profile
                  </Link> */}
                </>
              )}
              <button
                onClick={logout}
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-full bg-white z-50 p-4 shadow-lg">
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                aria-label="Close mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              {user ? (
                <>
                  <span className="text-gray-700">Hello, {user.name} ({user.role})</span>
                  {user.role !== 'admin' && (
                    <Link to="/profile" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                      Profile
                    </Link>
                  )}
                  {user.role === 'facility_owner' && (
                    <>
                      {/* <Link to="/owner/dashboard" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        Owner Dashboard
                      </Link> */}
                      {/* <Link to="/owner/facilities" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        Facility Management
                      </Link>
                       */}
                      {/* <Link to="/owner/bookings" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        Booking Overview
                      </Link> */}
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      {/* <Link to="/admin/facility-approval" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        Facility Approval
                      </Link>
                      <Link to="/admin/user-management" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        User Management
                      </Link>
                      <Link to="/admin/profile" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                        Admin Profile
                      </Link> */}
                    </>
                  )}
                  <button
                    onClick={() => { logout(); toggleMobileMenu(); }}
                    className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={toggleMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}