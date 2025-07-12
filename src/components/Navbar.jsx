import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";
import { LogOut, User, Settings } from "lucide-react";
import toast from "react-hot-toast";
import logo from "/image.png";

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
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-600 hover:text-green-700 transition">
            <img src={logo} alt="logo" className="h-7 w-7" />
            <span>ReWear</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/browse" className="hover:text-green-700 px-4 py-2 rounded-full font-medium transition">
              Browse Items
            </Link>
            {userLoggedIn ? (
              <>
                <Link to="/dashboard" className="flex items-center bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-full font-medium transition gap-1">
                  Dashboard
                </Link>
                {currentUser?.isAdmin && (
                  <Link to="/admin" className="flex items-center text-gray-700 hover:text-green-600 px-4 py-2 rounded-full font-medium transition gap-1">
                    <Settings className="h-4 w-4" /> Admin
                  </Link>
                )}
              </>
            ) : (
              <Link to="/signup" className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-green-600 hover:to-emerald-500 transition">
                Start Swapping
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {userLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{currentUser?.points || 0}</span> pts
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                    />
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-sm uppercase">
                      {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-full font-medium transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-full font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-green-600 hover:to-emerald-500 transition"
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
