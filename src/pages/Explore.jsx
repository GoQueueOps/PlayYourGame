import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Search, User, SlidersHorizontal, Trophy,
  Users, Zap, Target, PlusCircle, Bell, Gamepad2, Swords,
  Sparkles, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import playAreasData from "../data/playAreas";

function Explore() {
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Initialize with a placeholder or empty string
  const [selectedCity, setSelectedCity] = useState("Detecting...");
  
  const [hoveredArena, setHoveredArena] = useState(null);
  const filterRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

   // --- 1. AUTOMATIC LOCATION DETECTION (Reverse Geocoding) ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || "Cuttack";
            setSelectedCity(city);
          } catch (error) {
            setSelectedCity("Cuttack");
          }
        },
        () => setSelectedCity("All India")
      );
    }
  }, []);


  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    
    // Improved matching for manual city updates
    const matchesCity = 
      selectedCity === "All India" || 
      selectedCity === "Detecting..." ||
      (arena?.city ?? "").toLowerCase().includes(selectedCity.toLowerCase());
      
    const matchesSearch = (arena?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesCity && matchesSearch;
  });

  const handleMapRedirect = (name, address) => {
    const query = encodeURIComponent(`${name}, ${address}`);
    window.open(`http://googleusercontent.com/maps.google.com/search?q=${query}`, "_blank");
  };

  const features = [
    { icon: <Target size={20} className="text-emerald-500" />, text: "Find Venues", glow: "emerald" },
    { icon: <Users size={20} className="text-blue-400" />, text: "Join Teams", glow: "blue" },
    { icon: <Zap size={20} className="text-yellow-400 fill-yellow-400" />, text: "Earn Z-Points", glow: "yellow" },
    { icon: <Swords size={20} className="text-purple-400" />, text: "Challenges", glow: "purple" },
    { icon: <Trophy size={20} className="text-orange-400" />, text: "Tournaments", glow: "orange" }
  ];

  const sports = ["All", "Cricket", "Football", "Pickleball", "Badminton"];

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden relative" ref={containerRef}>
      
      {/* ANIMATED BACKGROUND GRADIENT */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(ellipse 400px 400px at 0% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)",
            "radial-gradient(ellipse 400px 400px at 100% 100%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)",
            "radial-gradient(ellipse 400px 400px at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)",
          ]
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* ANIMATED BACKGROUND PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0 select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <pattern id="playbook-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="12" stroke="white" strokeWidth="1.5" fill="none" filter="url(#glow)" />
            <path d="M 120 20 L 140 40 M 140 20 L 120 40" stroke="white" strokeWidth="2.5" filter="url(#glow)" />
            <path d="M 20 120 Q 80 80 140 120" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10,5" filter="url(#glow)" />
            <path d="M 135 115 L 145 120 L 135 125 Z" fill="white" filter="url(#glow)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#playbook-pattern)" />
        </svg>
      </div>

      {/* PARALLAX CURSOR EFFECT */}
      <motion.div
        animate={{
          x: mousePosition.x * 100 - 50,
          y: mousePosition.y * 100 - 50,
        }}
        className="absolute w-[400px] h-[400px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"
        style={{ left: "0%", top: "0%" }}
      />

      {/* --- SIDEBAR --- */}
      <motion.section
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[500px] lg:border-r border-white/10 flex flex-col bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-3xl z-10 shadow-2xl relative"
      >
        <header className="p-5 md:p-6 space-y-6 border-b border-white/10">
          {/* TOP ACTION BAR */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-4"
          >
            {/* LOCATION INPUT - NOW MANUALLY EDITABLE */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 px-4 py-2.5 rounded-2xl border border-white/20 flex-1 max-w-[200px] backdrop-blur-md hover:border-emerald-500/30 transition-all"
            >
              <MapPin size={16} className="text-emerald-500" />
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-white w-full placeholder:text-emerald-500/50"
              />
            </motion.div>

            {/* ACTION HUD */}
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/wallet")}
                className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 px-4 py-2.5 rounded-2xl cursor-pointer hover:border-yellow-500/50 transition-all shadow-lg backdrop-blur-md group overflow-hidden relative"
              >
                <div className="flex items-center gap-1.5 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="relative"
                  >
                    <Zap size={15} className="text-yellow-400 fill-yellow-400" />
                    <Zap size={15} className="text-yellow-400 blur-[4px] absolute inset-0 opacity-40" />
                  </motion.div>
                  <span className="text-xs font-black italic tracking-tighter text-yellow-400">{userStats.zPoints}</span>
                </div>
                <div className="w-px h-3 bg-white/20 relative z-10" />
                <div className="flex items-center gap-1.5 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Gamepad2 size={15} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                  </motion.div>
                  <span className="text-xs font-black italic tracking-tighter text-emerald-100">{userStats.gPoints}</span>
                </div>
              </motion.div>

              <motion.button 
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/notifications")}
                className="relative w-11 h-11 bg-gradient-to-br from-white/20 to-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 backdrop-blur-md"
              >
                <Bell size={20} />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617] shadow-lg shadow-red-500/50"
                />
              </motion.button>

              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/profile")}
                className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95 transition-all hover:shadow-[0_0_35px_rgba(16,185,129,0.7)]"
              >
                <User size={22} strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* SEARCH & FILTER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <motion.div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <motion.input
                whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)" }}
                type="text"
                placeholder="Find venues across India..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-[24px] py-4 pl-16 pr-6 text-sm outline-none focus:bg-white/15 focus:border-emerald-500/50 transition-all font-medium backdrop-blur-md"
              />
            </motion.div>

            <div className="relative" ref={filterRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-4 rounded-2xl transition-all h-full shadow-lg backdrop-blur-md border ${
                  isFilterOpen 
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/50" 
                    : "bg-white/10 text-slate-400 border-white/20 hover:border-emerald-500/30"
                }`}
              >
                <SlidersHorizontal size={20} />
              </motion.button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute right-0 mt-4 w-56 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/20 rounded-[2rem] shadow-2xl z-[100] p-2 py-4 backdrop-blur-3xl"
                  >
                    {sports.map((sport, idx) => (
                      <motion.button
                        key={sport}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 10 }}
                        onClick={() => { setActiveSport(sport); setIsFilterOpen(false); }}
                        className={`w-full text-left px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                          activeSport === sport 
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-lg shadow-emerald-500/30" 
                            : "hover:bg-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {sport}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* MATCHMAKING BUTTON */}
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/find-players")}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 p-4 rounded-[20px] flex items-center justify-between shadow-xl shadow-emerald-500/30 group active:scale-[0.98] transition-all border border-emerald-400/30 backdrop-blur-sm hover:border-emerald-300/50"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-black/30 p-2.5 rounded-xl text-white group-hover:bg-white group-hover:text-emerald-600 transition-colors"
              >
                <Users size={20} />
              </motion.div>
              <div className="text-left">
                <p className="text-[11px] font-black text-black/80 uppercase tracking-tighter leading-none">Matchmaking</p>
                <p className="text-white font-black uppercase italic text-sm tracking-tight leading-none">Find Players & Teams</p>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <PlusCircle size={22} className="text-white/70" />
            </motion.div>
          </motion.button>
        </header>

        {/* VENUE LIST */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-6 space-y-5 pb-28"
        >
          {filteredArenas.map((arena, idx) => (
            <motion.div
              key={arena.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredArena(arena.id)}
              onHoverEnd={() => setHoveredArena(null)}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[32px] p-6 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-white/5 transition-all group relative overflow-hidden backdrop-blur-md shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/30"
            >
              {/* GLOW EFFECT */}
              <motion.div
                animate={{ opacity: hoveredArena === arena.id ? 1 : 0 }}
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent pointer-events-none rounded-[32px]"
              />

              {/* STATS BADGES */}
              <motion.div
                animate={{ y: hoveredArena === arena.id ? -5 : 0 }}
                className="absolute top-6 right-6 flex flex-col items-end gap-2 opacity-70 group-hover:opacity-100 transition-all z-10"
              >
                <motion.div
                  animate={{ scale: hoveredArena === arena.id ? 1.1 : 1 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 px-3 py-1.5 rounded-lg backdrop-blur-md"
                >
                  <Zap size={10} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]" />
                  <span className="text-[9px] font-black text-yellow-300">+3Z</span>
                </motion.div>
                <motion.div
                  animate={{ scale: hoveredArena === arena.id ? 1.1 : 1 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md"
                >
                  <Gamepad2 size={10} className="text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]" />
                  <span className="text-[9px] font-black text-emerald-300">+4G</span>
                </motion.div>
              </motion.div>

              <div className="flex gap-6 relative z-10">
                {/* ARENA IMAGE */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="w-24 h-24 bg-gradient-to-br from-white to-slate-100 rounded-[20px] flex-shrink-0 flex items-center justify-center p-4 shadow-lg overflow-hidden relative"
                >
                  <img src={arena?.images?.[0]} alt={arena?.name} className="max-w-full max-h-full object-cover rounded-[16px]" />
                  {hoveredArena === arena.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-emerald-500/20 rounded-[16px]"
                    />
                  )}
                </motion.div>

                {/* ARENA INFO */}
                <div className="flex-1 min-w-0">
                  <motion.h3
                    animate={{ color: hoveredArena === arena.id ? "#4ade80" : "#ffffff" }}
                    className="text-[18px] font-black text-white leading-tight uppercase italic tracking-tighter mb-1 pr-16 transition-colors"
                  >
                    {arena?.name}
                  </motion.h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight mb-4">{arena?.location}</p>
                  
                  {/* SPORTS ICONS */}
                  <motion.div className="flex flex-wrap gap-2 mt-3">
                    {arena?.sportsManaged && Object.keys(arena.sportsManaged).map((s, i) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        className="bg-gradient-to-br from-white/20 to-white/5 border border-white/30 p-2 rounded-lg text-[18px] hover:border-emerald-400/50 transition-all cursor-pointer backdrop-blur-sm shadow-md"
                      >
                        {s === "Cricket" ? "🏏" : s === "Football" ? "⚽" : s === "Pickleball" ? "🎾" : s === "Badminton" ? "🏸" : "🎮"}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* FOOTER WITH DISTANCE & BUTTON */}
              <motion.div
                animate={{ opacity: hoveredArena === arena.id ? 1 : 0.8 }}
                className="mt-6 flex items-center justify-between pt-6 border-t border-white/10 relative z-10 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => handleMapRedirect(arena.name, arena?.location)}
                >
                  <motion.div
                    transition={{ duration: 0.6 }}
                    className="text-2xl"
                  >
                    🗺️
                  </motion.div>
                  <div>
                    <p className="text-[12px] font-black text-emerald-400 uppercase italic leading-none">{arena?.distance}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Away</p>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/play-area/${arena.id}`)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-black px-10 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white shadow-lg active:scale-95 transition-all flex items-center gap-2 border border-emerald-400/30"
                >
                  Book
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight size={14} />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* --- CENTER SHOWCASE --- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-20 z-10 relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0b0f1a] to-[#050810]"
      >
        {/* ANIMATED BACKGROUND ELEMENTS */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"
        />
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center relative z-10 w-full max-w-2xl"
        >
          {/* MAIN TITLE */}
          <motion.div className="space-y-6 mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={28} className="text-emerald-400" />
              </motion.div>
              <span className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em]">Book & Play</span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={28} className="text-emerald-400" />
              </motion.div>
            </motion.div>

            <h1 className="text-8xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
              Play Your <br /> 
              <motion.span
                animate={{
                  backgroundPosition: ["0%", "100%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="inline-block px-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-200% animate-gradient"
              >
                Game
              </motion.span>
            </h1>

            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-white text-sm font-bold uppercase tracking-[0.4em] opacity-90"
            >
              Your Game, Your Time
            </motion.p>
          </motion.div>
          
          {/* FEATURE GRID */}
          <motion.div className="grid grid-cols-2 gap-4 px-12 mb-16">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-5 rounded-3xl hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-white/5 hover:border-emerald-500/30 transition-all cursor-default shadow-lg group"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  className="bg-black/40 p-3 rounded-2xl group-hover:bg-emerald-500/20 transition-all"
                >
                  {feature.icon}
                </motion.div>
                <span className="text-sm font-black uppercase italic tracking-wider group-hover:text-emerald-400 transition-colors">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </motion.section>

      
    </div>
  );
}

export default Explore;