import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Search, 
  UserPlus, 
  Check, 
  Zap, 
  Trophy,
  UserSearch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SearchPlayer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock Global Search Results
  const players = [
    { id: "ARENA-102", name: "Blesson", aura: 2100, rank: "Diamond", status: "Online", isFriend: false },
    { id: "ARENA-405", name: "Sagar_S", aura: 950, rank: "Silver", status: "In Match", isFriend: true },
    { id: "ARENA-009", name: "Rahul_K", aura: 1540, rank: "Gold", status: "Offline", isFriend: false },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans italic pb-32">
      
      {/* --- MOBILE-OPTIMIZED HEADER --- */}
      <header className="p-6 bg-[#0b0f1a] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 bg-white/5 rounded-2xl active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 focus-within:border-emerald-500/50 transition-all shadow-inner">
            <Search size={18} className="text-slate-600" />
            <input 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="PLAYER NAME OR ID..."
              className="bg-transparent flex-1 outline-none text-[11px] font-black uppercase tracking-widest placeholder:text-slate-800"
            />
          </div>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        
        {/* --- EMPTY STATE --- */}
        {!searchQuery && (
          <div className="py-24 text-center space-y-6 opacity-40">
            <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10">
                <UserSearch size={32} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-2">Global Search</p>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-relaxed px-10">
                Type a name or unique ID to find athletes across the Cuttack sector.
              </p>
            </div>
          </div>
        )}

        {/* --- RESULTS LIST --- */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {searchQuery && players.map((player) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={player.id}
                className="bg-[#0b0f1a] border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between active:bg-white/[0.03] transition-all relative overflow-hidden group"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center font-black text-slate-600 italic border border-white/5 relative overflow-hidden shadow-2xl">
                    {player.name[0]}
                    <div className={`absolute bottom-0 w-full h-1 ${player.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black uppercase italic tracking-tight">{player.name}</h4>
                      <span className="text-[7px] font-black text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">{player.rank}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{player.id}</span>
                      <div className="w-1 h-1 bg-slate-800 rounded-full" />
                      <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">{player.aura} AURA</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  <button 
                    onClick={() => navigate(`/challenge-select`)}
                    className="p-4 bg-orange-500/10 rounded-2xl text-orange-500 border border-orange-500/10 active:scale-90 transition-all shadow-lg shadow-orange-500/5"
                  >
                    <Zap size={18} fill="currentColor" />
                  </button>
                  <button 
                    className={`p-4 rounded-2xl border transition-all active:scale-90 ${
                      player.isFriend 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-white/5 border-white/5 text-slate-400"
                    }`}
                  >
                    {player.isFriend ? <Check size={18} /> : <UserPlus size={18} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- LEADERBOARD REDIRECT --- */}
        {searchQuery && (
            <button className="w-full py-6 bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                <Trophy size={14} className="text-slate-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Open Sector Rankings</span>
            </button>
        )}
      </div>

    </div>
  );
}

export default SearchPlayer;