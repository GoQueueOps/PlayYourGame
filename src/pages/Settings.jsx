import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PREVIOUS_BOOKINGS = [
  { id: "PG-X921", arena: "Krater's Arena", date: "05 Feb 2026", sport: "Cricket", status: "Completed" },
  { id: "PG-B102", arena: "Sector 9 Turf", date: "02 Feb 2026", sport: "Football", status: "Completed" }
];

function Settings() {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Aryan Sharma",
    email: "aryan@example.com",
    zPoints: 450,
    avatar: "🦁"
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24 font-sans overflow-x-hidden">
      
      {/* 1. PROFILE HEADER */}
      <div className="bg-[#0f172a] p-8 pt-16 rounded-b-[3rem] border-b border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-4xl border-4 border-white/10 shadow-2xl mb-4">
            {user.avatar}
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">{user.name}</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-8 space-y-6">
        
        {/* 2. Z-WALLET CARD */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/5 border border-yellow-500/20 p-6 rounded-[2.5rem] flex justify-between items-center shadow-lg">
          <div>
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Total Z-Points</p>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">{user.zPoints} <span className="text-xl text-yellow-500">⚡</span></h2>
          </div>
          <button className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest">Store</button>
        </div>

        {/* 3. QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left hover:bg-white/10 transition-all">
            <span className="text-xl block mb-2">🛡️</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Privacy</p>
          </button>
          <button className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left hover:bg-white/10 transition-all">
            <span className="text-xl block mb-2">💳</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Payments</p>
          </button>
        </div>

        {/* 4. BOOKING HISTORY */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Recent Sessions</p>
          {PREVIOUS_BOOKINGS.map((bk) => (
            <motion.div 
              key={bk.id}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0f172a] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">
                  {bk.sport === "Cricket" ? "🏏" : "⚽"}
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase italic tracking-tighter">{bk.arena}</h4>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">{bk.date} • {bk.id}</p>
                </div>
              </div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
                {bk.status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* 5. LOGOUT */}
        <button 
          onClick={() => navigate("/login")}
          className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] mt-10"
        >
          Logout Account
        </button>

      </div>
    </div>
  );
}

export default Settings;