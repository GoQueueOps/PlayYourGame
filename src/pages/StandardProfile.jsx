import React, { useState } from "react";
import { 
  ArrowLeft, Share2, MoreVertical, Info, Timer, 
  Users, MessageSquare, 
  ShieldAlert, Ban, Trophy, Zap, Percent
} from "lucide-react";

function StandardProfile({ userRole = "superadmin" }) { // 'superadmin' gives you full power
  const [requestSent, setRequestSent] = useState(false);
  const [activeSport, setActiveSport] = useState("Badminton");

  const userData = {
    name: "Manas Mahapatra",
    bio: "Running on caffeine, ambition, & a little bit of chaos.",
    lastPlayed: "26th Jul 2025",
    stats: { matches: 24, squad: 10 },
    auraPercentage: 92, // The new % based Aura
    location: "Khandagiri, Bhubaneswar"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-32 select-none font-sans">
      
      {/* --- TOP NAV --- */}
      <div className="p-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <ArrowLeft size={24} />
        <div className="flex gap-4 items-center">
          {/* Super Admin Kill Switch */}
          {userRole === "superadmin" && <Ban size={20} className="text-red-500" />}
          <Share2 size={22} className="text-slate-600" />
          <MoreVertical size={22} className="text-slate-600" />
        </div>
      </div>

      {/* --- IDENTITY CARD --- */}
      <div className="m-4 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border-2 border-emerald-500/20 shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="User" />
             </div>
             {/* AURA % INDICATOR */}
             <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-0.5">
               <Zap size={8} fill="currentColor" /> {userData.auraPercentage}%
             </div>
          </div>

          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-black tracking-tighter">{userData.stats.matches}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Matches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black tracking-tighter">{userData.stats.squad}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Squad</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{userData.name}</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Last Active: {userData.lastPlayed}</p>
            </div>
            {/* RECRUIT BUTTON MOVED TO TOP */}
            <button 
              onClick={() => setRequestSent(!requestSent)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${requestSent ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-black'}`}
            >
              {requestSent ? 'Requested' : 'Recruit'}
            </button>
          </div>
          
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {userData.bio}
            </p>
          </div>
        </div>
      </div>

      {/* --- VIBE CHECK (The Peer Reputation System) --- */}
      <div className="m-4 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Vibe Check</h2>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase">Top Tier</span>
          </div>
          <Info size={14} className="text-slate-300" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'On-Time Cheetah', count: 12, icon: <Timer size={14}/>, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Vibe Master', count: 8, icon: <Zap size={14}/>, color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { label: 'Accha Baccha', count: 15, icon: <Users size={14}/>, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Friendly', count: 20, icon: <Percent size={14}/>, color: 'bg-purple-50 text-purple-600 border-purple-100' }
          ].map((badge, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${badge.color}`}>
              <div className="flex items-center gap-2">
                {badge.icon}
                <span className="text-[8px] font-black uppercase tracking-widest">{badge.label}</span>
              </div>
              <span className="text-xs font-black">{badge.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- SPORTS & RANKINGS --- */}
      <div className="m-4 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {['Badminton', 'Cricket', 'Football'].map(sport => (
            <button 
              key={sport} onClick={() => setActiveSport(sport)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSport === sport ? 'bg-[#0F172A] text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
            >
              {sport}
            </button>
          ))}
        </div>
        
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
          <Trophy className="absolute -right-6 -bottom-6 text-white/5 w-32 h-32" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">{activeSport} Peer Rank #455</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-widest">Skill Level</p>
              <div className="text-xs font-black uppercase tracking-tighter italic">Intermediate</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-widest">Consistency</p>
              <p className="text-xs font-black uppercase italic tracking-tighter">High Alpha</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FIXED INTERACTION (Message & Report) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 flex gap-3 z-50">
        <button className="flex-1 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 py-4">
          <MessageSquare size={16} /> Direct Message
        </button>
        <button className="px-5 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-95 transition-all flex items-center justify-center">
          <ShieldAlert size={20} />
        </button>
      </div>
    </div>
  );
}

export default StandardProfile;