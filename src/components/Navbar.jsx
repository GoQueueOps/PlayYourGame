import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNotifications } from "../hooks/useNotifications";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Hide Navbar on specific full-screen utility pages
  if (
    location.pathname === "/booking" ||
    location.pathname === "/notifications"
  )
    return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/5 italic">
      <Link to="/" className="active:scale-95 transition-transform">
        <img
          src={logo}
          alt="Play Your Game"
          className="h-8 w-auto brightness-200"
        />
      </Link>

      <div className="flex items-center gap-6">
        {!user ? (
          <Link
            to="/login"
            className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-white/5"
          >
            Login/Signup
          </Link>
        ) : (
          <div className="flex items-center gap-4">

            {/* 🔔 NOTIFICATIONS BELL */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative text-white hover:text-green-400 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* 👤 CLICKABLE USER NAME */}
            <button
              onClick={() => navigate("/profile")}
              className="text-white text-[10px] font-black uppercase tracking-widest hover:text-green-400 transition-all"
            >
              {user.user_metadata?.name || user.user_metadata?.full_name || "Player"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;