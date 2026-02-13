import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Search, User, SlidersHorizontal, Trophy,
  Users, Zap, Target, PlusCircle, Bell, Gamepad2,Swords
 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import playAreasData from "../data/playAreas";

function Explore() {
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All India");
  const filterRef = useRef(null);

  // MOCK USER DATA (Based on your point logic: 10G = 1Z)
  const userStats = {
    gPoints: 450,
    zPoints: 12,
    bookingsLast30Days: 2 
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredArenas = (playAreasData ?? []).filter((arena) => {
    const availableSports = arena?.sportsManaged ? Object.keys(arena.sportsManaged) : [];
    const matchesSport = activeSport === "All" || availableSports.includes(activeSport);
    const matchesCity = selectedCity === "All India" || arena?.city?.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = (arena?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesCity && matchesSearch;
  });

  const handleMapRedirect = (name, address) => {
    const query = encodeURIComponent(`${name}, ${address}`);
    window.open(`http://googleusercontent.com/maps.google.com/search?q=${query}`, "_blank");
  };

  const features = [
    { icon: <Target size={20} className="text-emerald-500" />, text: "Find Venues" },
    { icon: <Users size={20} className="text-emerald-500" />, text: "Join Teams" },
    { icon: <Zap size={20} className="text-yellow-400 fill-yellow-400 animate-pulse" />, text: "Earn Z-Points" },
    { icon: <Swords size={20} className="text-emerald-500" />, text: "Challenges" },
    { icon: <Trophy size={20} className="text-emerald-500" />, text: "Tournaments" }
  ];



  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden relative">
      
      {/* --- 1. BACKGROUND PATTERN --- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="playbook-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="12" stroke="white" strokeWidth="1" fill="none" />
            <path d="M 120 20 L 140 40 M 140 20 L 120 40" stroke="white" strokeWidth="2" />
            <path d="M 20 120 Q 80 80 140 120" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="10,5" />
            <path d="M 135 115 L 145 120 L 135 125 Z" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#playbook-pattern)" />
        </svg>
      </div>

      {/* --- 2. SIDEBAR (Full width on Mobile, Fixed on Desktop) --- */}
      <section className="w-full lg:w-[500px] lg:border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-3xl z-10 shadow-2xl relative">
        <header className="p-5 md:p-6 space-y-6 border-b border-white/5">
          <div className="flex items-center justify-between gap-4">
            
            {/* CITY SELECTOR */}
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
              <MapPin size={16} className="text-emerald-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white cursor-pointer"
              >
                <option className="bg-slate-900" value="All India">Pan India</option>
                <option className="bg-slate-900" value="Cuttack">Cuttack</option>
                <option className="bg-slate-900" value="Bhubaneswar">Bhubaneswar</option>
              </select>
            </div>

            {/* ACTION HUD */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate("/wallet")}
                className="flex items-center gap-3 bg-[#0b0f1a]/80 border border-white/10 px-4 py-2.5 rounded-2xl cursor-pointer hover:border-yellow-500/30 transition-all active:scale-95 shadow-xl group overflow-hidden relative"
              >
                <div className="flex items-center gap-1.5 relative z-10">
                  <div className="relative">
                    <Zap size={15} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    <Zap size={15} className="text-yellow-400 blur-[4px] absolute inset-0 opacity-40" />
                  </div>
                  <span className="text-xs font-black italic tracking-tighter text-yellow-400">{userStats.zPoints}</span>
                </div>
                <div className="w-px h-3 bg-white/10 relative z-10" />
                <div className="flex items-center gap-1.5 relative z-10">
                  <Gamepad2 size={15} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                  <span className="text-xs font-black italic tracking-tighter text-emerald-100">{userStats.gPoints}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate("/notifications")}
                className="relative w-11 h-11 bg-[#0b0f1a] border border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
              >
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617]" />
              </button>

              <div 
                onClick={() => navigate("/profile")}
                className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 transition-all"
              >
                <User size={22} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Find venues across India..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4 pl-16 pr-6 text-sm outline-none focus:bg-white/10 focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-4 rounded-2xl transition-all h-full shadow-lg ${isFilterOpen ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-400"}`}
              >
                <SlidersHorizontal size={20} />
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-56 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl z-[100] p-2 py-4 backdrop-blur-3xl"
                  >
                    {["All", "Cricket", "Football", "Pickleball", "Badminton"].map((sport) => (
                      <button
                        key={sport}
                        onClick={() => { setActiveSport(sport); setIsFilterOpen(false); }}
                        className={`w-full text-left px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeSport === sport ? "bg-emerald-500 text-black" : "hover:bg-white/5 text-slate-400"}`}
                      >
                        {sport}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MATCHMAKING BUTTON */}
          <button 
            onClick={() => navigate("/find-players")}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-[20px] flex items-center justify-between shadow-xl shadow-emerald-500/10 group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-2 rounded-xl text-white group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                <Users size={20} />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-black/80 uppercase tracking-tighter leading-none">Matchmaking</p>
                <p className="text-white font-black uppercase italic text-sm tracking-tight leading-none">Find Players & Teams</p>
              </div>
            </div>
            <PlusCircle size={22} className="text-white/70" />
          </button>
        </header>

        {/* VENUE LIST (Mobile Friendly Scrolling) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-6 space-y-6 pb-28">
          {filteredArenas.map((arena) => (
            <div key={arena.id} className="bg-white/5 border border-white/5 rounded-[36px] p-6 hover:bg-white/10 transition-all group relative overflow-hidden">
              
              {/* REWARD BADGES */}
              <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5 opacity-60 group-hover:opacity-100">
                <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg">
                  <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[9px] font-black text-yellow-400">+3Z</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <Gamepad2 size={10} className="text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400">+4G</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex-shrink-0 flex items-center justify-center p-4">
                  <img src={arena?.images?.[0]} alt={arena?.name} className="max-w-full max-h-full object-cover rounded-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-black text-white leading-tight uppercase italic tracking-tighter mb-1 pr-16">{arena?.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight mb-4">{arena?.location}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {arena?.sportsManaged && Object.keys(arena.sportsManaged).map((s) => (
                      <div key={s} className="bg-white/5 border border-white/10 p-2 rounded-lg text-[16px]">
                        {s === "Cricket" ? "🏏" : s === "Football" ? "⚽" : s === "Pickleball" ? "🎾" : "🏸"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <button onClick={() => handleMapRedirect(arena.name, arena?.location)} className="text-2xl hover:scale-125 transition-transform">🗺️</button>
                  <div>
                    <p className="text-[12px] font-black text-emerald-400 uppercase italic leading-none">{arena?.distance}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Away</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/play-area/${arena.id}`)} className="bg-emerald-500 text-black px-12 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white shadow-xl active:scale-95 transition-all">
                  Book Arena »
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 3. CENTER SHOWCASE (Hidden on Mobile) --- */}
      <section className="hidden lg:flex flex-1 flex-col items-center justify-center p-20 z-10 relative overflow-hidden bg-gradient-to-br from-[#020617] to-[#0b0f1a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.03] blur-[150px] rounded-full" />
        
        <div className="text-center relative z-10 w-full max-w-2xl">
          <div className="space-y-4 mb-16">
            <h1 className="text-9xl font-black italic uppercase tracking-tighter leading-none text-white">Play Your <br /> <span className="inline-block px-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600">Game</span></h1>
            <p className="text-white text-sm font-bold uppercase tracking-[0.4em] opacity-90">Your Game, Your Time</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left px-12 mb-16">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl hover:bg-emerald-500/10 transition-all cursor-default">
                <div className="bg-black/40 p-3 rounded-2xl">{feature.icon}</div>
                <span className="text-sm font-black uppercase italic tracking-wider">{feature.text}</span>
              </div>
            ))}
          </div>

         
        </div>
      </section>

    </div>
  );
}

export default Explore;