import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

interface NavbarProps {
  children: React.ReactNode;
}

function Navbar({ children }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleBackClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                title="Go back to dashboard"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoScribe
                </h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                // Authenticated user navigation
                <>
                  <div className="flex items-center space-x-3 bg-white/50 rounded-lg px-3 py-2 border border-gray-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Unauthenticated user navigation
                <>
                  <Link
                    to="/login"
                    className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md group overflow-hidden"
                  >
                    <span className="relative z-10">Sign In</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Render children content */}
      {children}
    </>
  )
}

export default Navbar;