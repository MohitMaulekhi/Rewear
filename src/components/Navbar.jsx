import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { LogOut, User, Plus, Home, Grid, Settings } from "lucide-react";
import toast from "react-hot-toast";
import logo from "/logo.png";
const Navbar = () => {
  const { currentUser, userLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-600 hover:text-green-700 transition">
            <img src={logo} alt="logo" className="h-7 w-7" />
            <span>ReWear</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <Link to="/browse" className="text-gray-700 hover:text-green-600 transition-colors">
              Browse Items
            </Link>
            
            {userLoggedIn ? (
              <>
                <Link to="/add-item" className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
                  Dashboard
                </Link>
                {currentUser?.isAdmin && (
                  <Link to="/admin" className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}
              </>
            ) : null}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {userLoggedIn ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="text-xs md:text-sm text-gray-700">
                  <span className="font-medium">{currentUser?.points || 0}</span> pts
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-20 md:max-w-none">
                    {currentUser?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 transition-colors p-1"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link
                  to="/login"
                  className="text-sm md:text-base text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {userLoggedIn && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/browse"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Grid className="h-4 w-4 mr-2" />
                  Browse Items
                </div>
              </Link>
              <Link
                to="/add-item"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </div>
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </div>
              </Link>
              {currentUser?.isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;