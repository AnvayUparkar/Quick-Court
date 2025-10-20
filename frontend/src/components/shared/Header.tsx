import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : (user?.role === 'facility_owner' ? '/owner/dashboard' : '/')}
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent"
        >
          QuickCourt
        </Link>
        <nav className="flex items-center space-x-4">
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
      </div>
    </header>
  );
}