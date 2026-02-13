import React, { useState } from "react";
import { 
  ArrowLeft, Share2, MoreVertical,  MessageSquare, 
  ShieldAlert, Trophy, Zap, Ghost 
} from "lucide-react";

function PlayerProfile() {
  // State to manage the Recruit button
  const [requestSent, setRequestSent] = useState(false);
  
  // State to manage the Sport selection
  const [activeSport, setActiveSport] = useState("Badminton");

  const userData = {
    name: "Manas Mahapatra",
    bio: "Running on caffeine, ambition, & a little bit of chaos.",
    lastPlayed: "26th Jul 2025",
    stats: { matches: 24, squad: 10 },
    auraPoints: 92, // [cite: 2026-02-12]
    location: "Khandagiri, Bhubaneswar"
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-40 select-none font-sans italic">
      
      {/* --- TOP NAVIGATION --- */}
      <div className="p-6 flex justify-between items-center bg-[#0b0f1a] border-b border-white/5 sticky top-0 z-50">
        <ArrowLeft size={24} className="text-slate-400" />
        <div className="flex gap-4 items-center">
          <Share2 size={22} className="text-slate-400" />
          <MoreVertical size={22} className="text-slate-400" />
        </div>
      </div>

      {/* --- IDENTITY SECTION --- */}
      <div className="p-6 bg-[#0b0f1a]">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-800 overflow-hidden border-2 border-white/10 shadow-xl">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="User" />
          </div>

          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-black tracking-tighter italic">{userData.stats.matches}</p>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black tracking-tighter italic">{userData.stats.squad}</p>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Squad</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{userData.name}</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{userData.location}</p>
          </div>
          <button 
            onClick={() => setRequestSent(!requestSent)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${requestSent ? 'bg-white/5 text-slate-500 border border-white/10' : 'bg-white text-black shadow-lg'}`}
          >
            {requestSent ? 'Sent' : 'Recruit'}
          </button>
        </div>

        {/* --- DEDICATED AURA BAR [cite: 2026-02-12] --- */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {userData.name.split(' ')[0]}'s Aura
              </span>
            </div>
            <span className="text-xs font-black text-orange-500">{userData.auraPoints} Points</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            {/* Animated Aura Fill [cite: 2026-02-12] */}
            <div 
              className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 aura-bar-fill"
              style={{ 
                "--aura-width": `${userData.auraPoints}%`, 
                width: `${userData.auraPoints}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* --- VIBE CHECK (Reputation Summary) --- */}
      <div className="px-6 mt-8 mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-4">Vibe Check</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'On-Time Cheetah', count: 12, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
            { label: 'Vibe Master', count: 8, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
            { label: 'Friendly', count: 20, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
          ].map((badge, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-4 rounded-[1.5rem] border ${badge.color}`}>
              <span className="text-[9px] font-black uppercase tracking-widest">{badge.label}</span>
              <span className="text-xs font-black">{badge.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- SPORT RANKINGS CARD --- */}
      <div className="px-6 mb-8">
        <div className="bg-[#0b0f1a] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
          <Trophy className="absolute -right-8 -bottom-8 text-white/5 w-40 h-40 rotate-12" />
          
          <div className="flex gap-2 mb-6">
            {['Badminton', 'Cricket'].map((sport) => (
              <button 
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                  activeSport === sport 
                    ? 'bg-emerald-500 text-black shadow-lg' 
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">
            {activeSport} Peer Rank #455
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">Skill Level</p>
              <div className="text-xl font-black uppercase italic text-white">Intermediate</div>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-600 uppercase mb-1 tracking-widest">Aura Class</p>
              <p className="text-xl font-black uppercase italic text-emerald-400">Elite Alpha</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- USER INTERACTION DOCK (Fixed Bottom) [cite: 2026-02-08] --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none">
        <div className="bg-[#0b0f1a] border border-white/10 p-3 rounded-[2.5rem] shadow-2xl flex gap-3 pointer-events-auto">
          <button className="flex-1 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 py-4 active:scale-95 transition-all">
            <MessageSquare size={18} fill="currentColor" /> Message
          </button>
          
          <div className="flex gap-2">
            <button className="w-14 h-14 bg-white/5 text-slate-400 rounded-2xl border border-white/10 flex items-center justify-center active:bg-red-500/20 active:text-red-500 transition-all">
              <Ghost size={20} />
            </button>
            <button className="w-14 h-14 bg-white/5 text-red-500 rounded-2xl border border-red-500/10 flex items-center justify-center active:bg-red-500 active:text-white transition-all">
              <ShieldAlert size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PlayerProfile;