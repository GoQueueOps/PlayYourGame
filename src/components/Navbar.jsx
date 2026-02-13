import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  const location = useLocation();

  // Hide Navbar on specific full-screen utility pages
  if (location.pathname === "/booking" || location.pathname === "/notifications") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/5 italic">
      <Link to="/" className="active:scale-95 transition-transform">
        <img src={logo} alt="Play Your Game" className="h-8 w-auto brightness-200" />
      </Link>

      <div className="flex items-center gap-6">
        {/* About and My Play removed to focus on the Lobby/Challenge flow */}
        <Link 
          to="/login" 
          className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-white/5"
        >
          Login/Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;