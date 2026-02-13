import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trophy } from "lucide-react"; 
import heroLogo from "../assets/hero-logo.png";
import CourtCard from "../components/CourtCard";

const courtsData = [
  {
    id: 1,
    name: "Test Court",
    city: "Cuttack",
    isFeatured: true,
    sports: ["Cricket", "Football"],
    distance: "2.3 km",
    images: ["https://images.unsplash.com/photo-1521412644187-c49fa049e84d"],
  },
  {
    id: 2,
    name: "Green Turf",
    city: "Cuttack",
    isFeatured: true,
    sports: ["Pickleball"],
    distance: "5.1 km",
    images: ["https://images.unsplash.com/photo-1546519638-68e109498ffc"],
  },
];

function Home() {
  const navigate = useNavigate();
  const [featuredCourts, setFeaturedCourts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const resultsRef = useRef(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    setFeaturedCourts(courtsData.filter(c => c.isFeatured).slice(0, 4));
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate("/booking", { state: { query: searchQuery } });
    } else {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-green-500/30 font-sans">

      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ================= HERO ================= */}
      <div className="relative pt-32 pb-24 px-4 flex flex-col items-center justify-center overflow-hidden">

        {/* WATERMARK */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-48 left-1/2 -translate-x-1/2 -z-10 select-none"
        >
          <h1 className="text-[120px] md:text-[250px] font-black text-white/[0.03] uppercase tracking-tighter transform skew-x-[-12deg]">
            ELITE
          </h1>
        </motion.div>

        <div className="relative z-10 flex flex-col items-center gap-10 text-center w-full max-w-7xl">

          {/* LOGO */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full animate-pulse" />
            <motion.img
              src={heroLogo}
              alt="Logo"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-[280px] md:w-[450px] relative z-10 drop-shadow-[0_0_80px_rgba(34,197,94,0.4)]"
            />
          </motion.div>

          {/* TITLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <h2 className="text-5xl md:text-8xl font-black uppercase leading-none text-center transform skew-x-[-12deg] break-words">
              READY TO{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                PLAY?
              </span>
            </h2>
          </motion.div>

          {/* SUBTEXT */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-[1px] w-12 bg-white/20" />
            <p className="text-gray-400 font-black tracking-[0.4em] text-[10px] uppercase">
              • Premium Arena Booking •
            </p>
            <div className="h-[1px] w-12 bg-white/20" />
          </div>

          {/* SEARCH */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 shadow-2xl"
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for arenas in your city..."
              className="flex-1 bg-transparent px-8 py-4 outline-none text-white font-bold placeholder:text-gray-700 text-sm"
            />
            <button
              onClick={handleSearch}
              className="bg-green-500 hover:bg-green-400 text-black px-12 py-4 rounded-[1.5rem] font-black uppercase tracking-tighter transition-all active:scale-95"
            >
              Find
            </button>
          </motion.div>

          {/* ACTION BUTTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-4 px-2 italic"
          >
            <button 
              onClick={() => navigate("/lobby-hub")}
              className="group bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <MessageSquare size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-tighter">Lobby</p>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Chat & Teams</p>
              </div>
            </button>

            <button 
              onClick={() => navigate("/challenge-select")}
              className="group bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                <Trophy size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-tighter">Challenge</p>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Call Out Rivals</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ================= FEATURED SECTION ================= */}
      <motion.div
        ref={resultsRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="p-8 max-w-7xl mx-auto mt-10"
      >
        {/* --- ADDED FEATURED ARENAS HEADING --- */}
        <div className="mb-10 italic">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-green-500/80">
              Top Tier Slots
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Arenas</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCourts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      </motion.div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">
        Play Your Game © 2026 • Engineered for Athletes
      </footer>
    </div>
  );
}

export default Home;