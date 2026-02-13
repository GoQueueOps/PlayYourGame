import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  UserPlus, 
  ChevronLeft, 
  Zap, 
  MessageSquare,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

function Crew() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const crewMembers = [
    { id: 1, name: "Blesson", aura: 1240, status: "In Match", sport: "Football", rank: "Gold" },
    { id: 2, name: "Sagar", aura: 890, status: "Online", sport: "Cricket", rank: "Silver" },
    { id: 3, name: "Tejas", aura: 2100, status: "Available", sport: "Pickleball", rank: "Platinum" },
    { id: 4, name: "Geluuu", aura: 1500, status: "Offline", sport: "Badminton", rank: "Gold" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 font-sans italic selection:bg-emerald-500/30">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">THE <span className="text-emerald-500">CREW</span></h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Cuttack / Bhubaneswar Network</p>
          </div>
        </div>
        <button className="bg-emerald-500 text-black p-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
          <UserPlus size={20} />
        </button>
      </header>

      {/* --- SEARCH --- */}
      <div className="mb-10">
        <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-2 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all shadow-2xl">
          <div className="p-3 text-slate-700"><Search size={18} /></div>
          <input 
            type="text" 
            placeholder="Search Crew by Name or Aura..." 
            className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- CREW LIST --- */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">My Inner Circle</h2>
          <span className="text-[8px] font-black uppercase text-slate-600">{crewMembers.length} Active Members</span>
        </div>
        
        {crewMembers.map((member) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={member.id}
            className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group relative overflow-hidden active:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-5 relative z-10">
              {/* Avatar Logic */}
              <div className="relative">
                <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-white/5 flex items-center justify-center font-black text-xl italic text-slate-600">
                  {member.name[0]}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0b0f1a] flex items-center justify-center ${
                  member.status === "Online" || member.status === "Available" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                }`}>
                  <ShieldCheck size={12} className="text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter">{member.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                    <TrendingUp size={10} /> {member.rank}
                  </span>
                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {member.aura} AURA
                  </span>
                </div>
                <p className={`text-[9px] font-black uppercase mt-2 tracking-[0.15em] ${
                  member.status === "In Match" ? "text-orange-500" : "text-slate-600"
                }`}>
                   {member.status} {member.status === "In Match" && `— ${member.sport}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                <MessageSquare size={18} />
              </button>
              <button 
                onClick={() => navigate("/challenge-mode")}
                className="p-4 bg-orange-500/10 rounded-2xl text-orange-500 hover:bg-orange-500 hover:text-black transition-all active:scale-90 shadow-lg shadow-orange-500/5"
              >
                <Zap size={18} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- RECRUITMENT DRIVE --- */}
      <div className="mt-16 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
        <Users className="absolute -left-10 -bottom-10 w-40 h-40 text-emerald-500/5 rotate-12 group-hover:scale-110 transition-transform" />
        
        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 relative z-10">Scale The <span className="text-emerald-500">Hierarchy</span></h3>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 leading-loose relative z-10">
          Refer a new player to the zone<br/>and secure <span className="text-emerald-500">+20 G-Points</span>
        </p>
        
        <button className="relative z-10 w-full bg-white text-black py-5 rounded-3xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl active:scale-95 transition-all">
          Generate Recruit Link
        </button>
      </div>

    </div>
  );
}

export default Crew;