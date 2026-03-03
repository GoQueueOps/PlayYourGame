import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Swords, Zap, 
  ChevronLeft, Medal, Star, Target, Users, User, Plus, 
  ChevronRight 
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import CreateChallenge from "./CreateChallenge"; 

// --- 1. ARENA LEGENDS PREVIEW SECTION ---
function ArenaLegendsSection() {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState("Lobby");

  const leaderboardData = {
    Solo: [
      { rank: 1, name: "Nitro", score: 2840, matches: 58, wins: 45 },
      { rank: 2, name: "Z-Storm", score: 2610, matches: 40, wins: 32 },
      { rank: 3, name: "Shadow", score: 2450, matches: 35, wins: 20 },
    ],
    Lobby: [
      { rank: 1, name: "CDA Strikers", score: 8900, matches: 120, wins: 95 },
      { rank: 2, name: "City FC", score: 7200, matches: 98, wins: 85 },
      { rank: 3, name: "BBS Smashers", score: 6800, matches: 80, wins: 60 },
    ]
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 relative z-10 pb-20 font-sans italic">
      <div className="flex flex-col md:flex-row items-end justify-between mb-8 px-4 gap-6">
        <div className="w-full md:w-auto">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Arena <span className="text-emerald-500">Legends</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">
            Top Sector Performers • Cuttack
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate("/arena-legends")} 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 transition-all active:scale-95"
          >
            <span className="border-b border-emerald-500/20 pb-1 group-hover:border-emerald-500 transition-all">
              View Full Rankings
            </span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex bg-[#0b0f1a] p-1 rounded-2xl border border-white/10 font-black italic shadow-2xl">
            <button 
              onClick={() => setBoardType("Solo")}
              className={`px-6 py-2.5 rounded-xl text-[10px] uppercase flex items-center gap-2 transition-all ${boardType === 'Solo' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <User size={14} /> Solo
            </button>
            <button 
              onClick={() => setBoardType("Lobby")}
              className={`px-6 py-2.5 rounded-xl text-[10px] uppercase flex items-center gap-2 transition-all ${boardType === 'Lobby' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Users size={14} /> Lobby
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md italic font-black">
        {leaderboardData[boardType].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all group">
            <div className="flex items-center gap-8">
              <div className="w-12 text-center">
                {item.rank === 1 ? (
                  <Trophy className="text-yellow-500 mx-auto" size={32} />
                ) : (
                  <Medal className={item.rank === 2 ? "text-slate-300 mx-auto" : "text-orange-700 mx-auto"} size={28} />
                )}
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                  {item.name} {item.rank === 1 && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> {item.score} Z-PTS
                  </span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Target size={10} /> {item.matches} Matches
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Win Count</p>
                <p className="text-xl font-black text-white italic">{item.wins} WINS</p>
              </div>
              <button onClick={() => navigate("/arena-legends")} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 2. MAIN CHALLENGE MODE PAGE ---
const mockChallenges = [
  { id: "CH-001", sport: "Football", teamA: { name: "CDA Strikers", rank: "Gold II" }, venue: "Krater's Arena", time: "Today, 7:00 PM", slab: 50, type: "Competitive" },
  { id: "CH-002", sport: "Cricket", teamA: { name: "City FC", rank: "Silver I" }, venue: "Sports City", time: "Tomorrow, 6:00 AM", slab: 30, type: "Friendly" },
  { id: "CH-003", sport: "Pickleball", teamA: { name: "Shadow Solo", rank: "Gold I" }, venue: "Turf King", time: "Today, 9:00 PM", slab: 20, type: "Competitive" },
];

function ChallengeMode() {
  const navigate = useNavigate();
  const [selectedSlab, setSelectedSlab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredChallenges = selectedSlab === "All" 
    ? mockChallenges 
    : mockChallenges.filter(c => c.slab === selectedSlab);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 lg:p-12 relative overflow-x-hidden italic selection:bg-emerald-500/30 font-black">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      <CreateChallenge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <header className="max-w-6xl mx-auto mb-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords size={16} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/80">Lobby & Duels</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Challenge Mode</h1>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-black px-10 py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3">
          <Plus size={18} strokeWidth={3} /> Create New Challenge
        </button>
      </header>

      {/* FILTER TABS */}
      <div className="max-w-6xl mx-auto mb-10 flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {["All", 20, 30, 40, 50].map((slab) => (
          <button
            key={slab}
            onClick={() => setSelectedSlab(slab)}
            className={`px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
              selectedSlab === slab ? "bg-white text-black border-white shadow-xl" : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            {slab === "All" ? "All Stakes" : `${slab} Z-Points`}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 font-black italic">
        <AnimatePresence mode="popLayout">
          {filteredChallenges.map((match) => (
            <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={match.id} className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all italic font-black">
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="space-y-1">
                  <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${match.type === 'Competitive' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {match.type}
                  </span>
                  <h3 className="text-3xl font-black uppercase italic tracking-tight mt-2">{match.teamA.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{match.sport} • {match.teamA.rank}</p>
                </div>
                <div className="text-right">
                  {match.type === "Competitive" ? (
                    <>
                      <div className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-black italic text-sm shadow-xl">
                        <Zap size={14} fill="currentColor" /> {match.slab} Z-PTS
                      </div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 tracking-tight italic">Pot: {match.slab * 2} Z-PTS</p>
                    </>
                  ) : (
                    <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/20 text-[10px] uppercase font-black tracking-widest">Friendly Match</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-widest italic">Location</p>
                  <p className="text-[11px] font-bold uppercase truncate">{match.venue}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-widest italic">Time Slot</p>
                  <p className="text-[11px] font-bold uppercase truncate">{match.time}</p>
                </div>
              </div>
              <button className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-white transition-all active:scale-95 italic font-black">Accept Challenge Back »</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      <ArenaLegendsSection />
    </div>
  );
}

export default ChallengeMode;