import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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
            {/* 👇 CLICKABLE USER NAME */}
            <button
              onClick={() => navigate("/profile")}
              className="text-white text-[10px] font-black uppercase tracking-widest hover:text-green-400 transition-all"
            >
              {user.user_metadata?.full_name || "Player"}
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