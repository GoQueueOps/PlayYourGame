import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Swords, 
  ShieldAlert, 
  Zap, 
  ChevronLeft, 
  Medal, 
  Flame, 
  TrendingUp 
} from "lucide-react";
import { motion } from "framer-motion";
import CreateChallenge from "./CreateChallenge"; // Ensure this matches your filename

// 1. LEADERBOARD COMPONENT
function TeamLeaderboard() {
  const topTeams = [
    { rank: 1, name: "CDA Strikers", aura: 2840, streak: 5, status: "up" },
    { rank: 2, name: "City FC", aura: 2610, streak: 3, status: "stable" },
    { rank: 3, name: "Cantonment Kings", aura: 2450, streak: 0, status: "down" },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-20 relative z-10 pb-20 font-sans italic">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Arena Legends</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Cuttack / Bhubaneswar Division</p>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 border-b border-emerald-500/20 pb-1">
          View Full Rankings »
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden backdrop-blur-md">
        {topTeams.map((team, index) => (
          <div 
            key={team.name} 
            className={`flex items-center justify-between p-8 ${
              index !== topTeams.length - 1 ? "border-b border-white/5" : ""
            } hover:bg-white/[0.02] transition-colors`}
          >
            <div className="flex items-center gap-8">
              <div className="w-12 text-center">
                {team.rank === 1 ? (
                  <Medal className="text-yellow-500 mx-auto" size={28} />
                ) : (
                  <span className="text-2xl font-black italic text-slate-700">#{team.rank}</span>
                )}
              </div>
              <div>
                <h4 className="text-xl font-black uppercase italic tracking-tight">{team.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> {team.aura} Aura Points
                  </span>
                  {team.streak > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                      <Flame size={10} fill="currentColor" /> {team.streak} Match Streak
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Performance</p>
                <div className="flex items-center gap-1 justify-end text-emerald-500 font-black italic">
                   <TrendingUp size={14} />
                   <span>+12%</span>
                </div>
              </div>
              <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. MAIN PAGE COMPONENT
const mockChallenges = [
  {
    id: "CH-001",
    sport: "Football",
    teamA: { name: "CDA Strikers", rank: "Gold II", winRate: "78%" },
    venue: "Krater's Arena",
    time: "Today, 7:00 PM",
    slab: 50,
    type: "Competitive"
  },
  {
    id: "CH-002",
    sport: "Cricket",
    teamA: { name: "Cantonment Kings", rank: "Silver I", winRate: "62%" },
    venue: "Sports City Cuttack",
    time: "Tomorrow, 6:00 AM",
    slab: 30,
    type: "Friendly"
  }
];

function ChallengeMode() {
  const navigate = useNavigate();
  const [selectedSlab, setSelectedSlab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 lg:p-12 relative overflow-x-hidden italic selection:bg-emerald-500/30">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* CREATE CHALLENGE MODAL COMPONENT */}
      <CreateChallenge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <header className="max-w-6xl mx-auto mb-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/80">Ranked League</span>
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Challenge Mode</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // Opens the Modal
          className="bg-emerald-500 text-black px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
        >
          Create New Challenge
        </button>
      </header>

      {/* FILTER TABS */}
      <div className="max-w-6xl mx-auto mb-10 flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {["All", 20, 30, 40, 50].map((slab) => (
          <button
            key={slab}
            onClick={() => setSelectedSlab(slab)}
            className={`px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
              selectedSlab === slab ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            {slab === "All" ? "All Stakes" : `${slab} Z-Points`}
          </button>
        ))}
      </div>

      {/* CHALLENGE LIST */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {mockChallenges.map((match) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={match.id} 
            className="bg-white/5 border border-white/10 rounded-[3rem] p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity">
               <Swords />
            </div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="space-y-1">
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                  {match.type}
                </span>
                <h3 className="text-2xl font-black uppercase italic tracking-tight mt-2">{match.teamA.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Rank: {match.teamA.rank}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-black italic text-sm shadow-xl shadow-yellow-500/10">
                  <Zap size={14} fill="currentColor" /> {match.slab} Z-PTS
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-tight">Pool: {(match.slab * 2) * 0.9} Z-PTS</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Venue</p>
                <p className="text-[11px] font-bold uppercase truncate tracking-tight">{match.venue}</p>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Time Slot</p>
                <p className="text-[11px] font-bold uppercase truncate tracking-tight">{match.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <button className="flex-[2] bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-500 active:scale-95 transition-all">
                Challenge Back »
              </button>
            </div>
          </motion.div>
        ))}
      </main>

      {/* 3. INTEGRATED LEADERBOARD */}
      <TeamLeaderboard />

      {/* DISPUTE ALERT BUBBLE - Mobile Friendly */}
      <div className="fixed bottom-8 right-8 z-[100] animate-bounce cursor-pointer group">
         <div className="bg-red-500 text-white px-6 py-4 rounded-[1.8rem] shadow-[0_15px_40px_rgba(239,68,68,0.4)] flex items-center gap-3">
           <ShieldAlert size={20} />
           <span className="text-[10px] font-black uppercase tracking-widest">Active Dispute In Sector</span>
         </div>
      </div>
    </div>
  );
}

export default ChallengeMode;