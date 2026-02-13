import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Users, 
  Crown, 
  MessageSquare, 
  UserPlus,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

function GroupDetails() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const members = [
    { id: 1, name: "Tejas", role: "Creator", aura: 2450, status: "Available", isFriend: true },
    { id: 2, name: "Blesson", role: "Member", aura: 1820, status: "In Match", isFriend: false },
    { id: 3, name: "Sagar", role: "Member", aura: 950, status: "Online", isFriend: false },
    { id: 4, name: "Geluuu", role: "Member", aura: 1200, status: "Offline", isFriend: true },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans italic pb-32">
      
      {/* --- STICKY HEADER --- */}
      <div className="bg-[#0b0f1a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Crew <span className="text-emerald-500">Intel</span></h1>
          <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest mt-1">ID: {groupId || 'LOBBY-01'}</span>
        </div>
      </div>

      {/* --- GROUP HERO --- */}
      <div className="p-8 text-center bg-gradient-to-b from-[#0b0f1a] to-transparent">
        <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] mx-auto mb-6 border-2 border-emerald-500/20 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200" 
            className="w-full h-full object-cover grayscale" 
            alt="Group" 
          />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-2">CDA Sector-9 Strikers</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 italic px-10 leading-relaxed">
          "The most aggressive football squad in Sector 9. Daily drills and weekend challenges."
        </p>
      </div>

      {/* --- MEMBER LIST --- */}
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 px-2">
          <Users size={16} className="text-slate-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Personnel Roster</h3>
        </div>

        {members.map((member) => (
          <motion.div 
            key={member.id}
            className="bg-[#0b0f1a] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between active:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center font-black text-slate-600 italic border border-white/10 relative">
                {member.name[0]}
                {member.role === "Creator" && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 p-1.5 rounded-full ring-2 ring-[#0b0f1a]">
                    <Crown size={8} className="text-black" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-tight">{member.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${member.status === 'In Match' ? 'text-orange-500' : 'text-slate-600'}`}>
                    • {member.status}
                  </span>
                  <div className="w-1 h-1 bg-white/5 rounded-full" />
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">{member.aura} AURA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-90">
                <MessageSquare size={16} />
              </button>
              
              {/* UPDATED BUTTON: Send Friend Request instead of Thunder */}
              <button 
                className={`p-4 rounded-2xl border transition-all active:scale-90 ${
                  member.isFriend 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-white/5 border-white/5 text-slate-400"
                }`}
              >
                {member.isFriend ? <Check size={16} /> : <UserPlus size={16} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

export default GroupDetails;