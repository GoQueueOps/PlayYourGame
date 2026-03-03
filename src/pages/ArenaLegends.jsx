import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import { 
  MapPin, Star, Target, Shield, Plus, TrendingUp, Globe, Building 
} from "lucide-react";

// --- RANK LOGIC HELPER ---
const getRankTier = (mp) => {
  if (mp >= 5000) return { title: "Arena Legend", color: "text-yellow-400", bg: "border-yellow-400/30" };
  if (mp >= 2500) return { title: "Warlord", color: "text-orange-500", bg: "border-orange-500/30" };
  if (mp >= 1000) return { title: "Gladiator", color: "text-emerald-500", bg: "border-emerald-500/20" };
  return { title: "Recruit", color: "text-slate-500", bg: "border-slate-500/10" };
};

const generateLeaderboard = (type) => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: type === 'solo' ? `Player_${i + 1}` : `Lobby_${i + 1}`,
    matches: Math.floor(Math.random() * 100) + 20,
    wins: Math.floor(Math.random() * 20) + 10,
    mp: (100 - i) * 80 + Math.floor(Math.random() * 30),
    rank: i + 1,
    lastMatch: Math.random() > 0.3 ? 'win' : 'loss', 
  }));
};

const leaderboardData = {
  solo: generateLeaderboard('solo'),
  lobby: generateLeaderboard('lobby')
};

function ArenaLegends() {
  const navigate = useNavigate(); // ✅ Initialize Navigate
  const [activeTab, setActiveTab] = useState("solo");
  const [scope, setScope] = useState("city");
  const [location] = useState({ city: "Cuttack", state: "Odisha" });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans italic relative overflow-x-hidden select-none">
      
      {/* HEADER SECTION */}
      <header className="mb-10 space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="text-left">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              Arena <span className="text-emerald-500">Legends</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2 font-black italic">
              {scope === 'city' ? <MapPin size={10} className="text-emerald-500" /> : scope === 'state' ? <Building size={10} className="text-blue-500" /> : <Globe size={10} className="text-white" />} 
              {scope === 'city' ? location.city : scope === 'state' ? location.state : 'Worldwide'} Ranking
            </p>
          </div>
          
          <div className="flex bg-[#0b0f1a] p-1 rounded-xl border border-white/5 font-black italic">
            <button onClick={() => setActiveTab("solo")} className={`px-5 py-2 rounded-lg text-[9px] uppercase transition-all ${activeTab === "solo" ? "bg-white text-black shadow-lg" : "text-slate-500"}`}>Solo</button>
            <button onClick={() => setActiveTab("lobby")} className={`px-5 py-2 rounded-lg text-[9px] uppercase transition-all ${activeTab === "lobby" ? "bg-white text-black shadow-lg" : "text-slate-500"}`}>Lobby</button>
          </div>
        </div>

        {/* GEOGRAPHICAL SCOPE FILTER */}
        <div className="flex justify-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5 max-w-xs mx-auto italic">
            {['global', 'state', 'city'].map((s) => (
                <button 
                    key={s} 
                    onClick={() => setScope(s)}
                    className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${scope === s ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg' : 'text-slate-500'}`}
                >
                    {s}
                </button>
            ))}
        </div>
      </header>

      {/* LEADERBOARD LIST */}
      <div className="space-y-3 mb-32 max-w-3xl mx-auto">
        {leaderboardData[activeTab].map((legend, index) => {
          const tier = getRankTier(legend.mp);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              key={legend.id}
              className={`p-5 rounded-[2.5rem] border flex items-center justify-between relative overflow-hidden transition-all italic font-black ${
                index === 0 ? 'bg-emerald-500 text-black border-emerald-400 shadow-xl' : 
                index === 1 ? 'bg-slate-300 text-black border-white shadow-lg' :
                index === 2 ? 'bg-orange-800 text-white border-orange-700 shadow-md' :
                'bg-[#0b0f1a] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-5 text-left italic">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${index < 3 ? 'bg-black/20' : 'bg-white/5 text-slate-500'}`}>
                  {legend.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2 italic">
                    <h3 className="text-md font-black uppercase tracking-tighter italic flex items-center gap-2">
                        {legend.name} {index === 0 && <Star size={12} className="fill-current" />}
                    </h3>
                    <span className={`text-[7px] px-2 py-0.5 rounded-md border uppercase tracking-widest font-black ${tier.bg} ${tier.color}`}>
                        {tier.title}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 italic font-black text-slate-500">
                     <p className={`text-[7px] uppercase tracking-widest flex items-center gap-1 ${index < 2 && "text-black/60"}`}>
                       <Target size={8}/> {legend.matches} Games
                     </p>
                     <p className={`text-[7px] uppercase tracking-widest flex items-center gap-1 ${index < 2 && "text-black/60"}`}>
                       <Shield size={8}/> {legend.wins} Wins
                     </p>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-4 font-black italic">
                <div className="flex flex-col items-end">
                    <p className="text-xl font-black italic tracking-tighter leading-none">{legend.mp}</p>
                    <p className={`text-[7px] uppercase mt-1 tracking-widest ${index < 2 ? 'text-black/60' : 'text-emerald-500'}`}>Match Points</p>
                </div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${legend.lastMatch === 'win' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {legend.lastMatch === 'win' ? <TrendingUp size={16} strokeWidth={3} /> : <span className="text-[10px]">-5</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ✅ FIXED BUTTON: ENTER CHALLENGE MODE */}
      <button 
        onClick={() => navigate("/challenge")} // ✅ Navigates to the duel lobby
        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-3 active:scale-95 transition-all z-50 italic shadow-emerald-500/20"
      >
        <Plus size={20} strokeWidth={4} /> Enter Challenge Mode
      </button>

    </div>
  );
}

export default ArenaLegends;