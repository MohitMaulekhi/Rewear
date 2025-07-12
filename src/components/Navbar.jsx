import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { LogOut, User, Plus, Home, Grid, Settings } from "lucide-react";
import toast from "react-hot-toast";

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
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-green-600 text-white rounded-lg p-2">
              <Grid className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ReWear</span>
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
          <div className="flex items-center space-x-4">
            {userLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{currentUser?.points || 0}</span> points
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
