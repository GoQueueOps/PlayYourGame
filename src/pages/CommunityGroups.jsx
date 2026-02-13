import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Plus, ChevronLeft, Search, 
  Share2, ShieldCheck, UserPlus, Gamepad2 
} from "lucide-react";

function CommunityGroups() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-squads");

  // Mock data for the "10 member" logic
  const myGroups = [
    { 
      id: 1, 
      name: "Cuttack Strikers", 
      members: 8, 
      isLeader: true, 
      unlockedReward: false 
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Community</h1>
        </div>
        <button className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 active:scale-90 transition-all">
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {/* --- TABS --- */}
      <div className="flex gap-2 bg-white/5 p-1.5 rounded-[2rem] mb-8">
        {["my-squads", "explore-teams"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative mb-8 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Find a squad to join..." 
          className="w-full bg-[#0b0f1a] border border-white/5 rounded-[2rem] py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
        />
      </div>

      {/* --- SQUAD REWARD STATUS (Sticky logic) --- */}
      <section className="mb-10">
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
          <Gamepad2 size={120} className="absolute -right-10 -bottom-10 text-emerald-500/5 rotate-12" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Squad Goal</h3>
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4">The Power of 10</h2>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-6">
              Create a group with <span className="text-white">10+ active members</span> to instantly unlock a <span className="text-emerald-400">+10 G-Point</span> bonus.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">
              Create Squad
            </button>
          </div>
        </div>
      </section>

      {/* --- SQUAD LIST --- */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Active Squads</h4>
        
        {myGroups.map((squad) => (
          <div key={squad.id} className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-6 relative group overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-2xl border border-white/5">
                  🛡️
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tighter text-lg">{squad.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Squad Leader</span>
                  </div>
                </div>
              </div>
              <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                <Share2 size={18} />
              </button>
            </div>

            {/* PROGRESS TOWARD 10 MEMBERS */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-500" />
                  <span className="text-[11px] font-black italic text-slate-300">{squad.members} Members</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  {squad.members >= 10 ? "Reward Ready!" : `${10 - squad.members} to go`}
                </span>
              </div>
              
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${squad.members >= 10 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}
                  style={{ width: `${(squad.members / 10) * 100}%` }}
                />
              </div>

              <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all group-active:scale-95">
                <UserPlus size={16} />
                Invite Friends
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default CommunityGroups;