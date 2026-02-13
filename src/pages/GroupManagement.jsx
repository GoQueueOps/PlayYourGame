import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  UserCheck, 
  UserX, 
  Shield, 
  Settings,
  MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";

function GroupManagement() {
  const navigate = useNavigate();

  // Mock Pending Requests
  const [requests, setRequests] = useState([
    { id: 101, name: "Arun_99", aura: 1200, bio: "Striker from Sector 6" },
    { id: 102, name: "Rahul_Pro", aura: 850, bio: "Looking for regular cricket squad" }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans italic pb-32">
      
      {/* --- HEADER --- */}
      <header className="p-6 bg-[#0b0f1a] border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Mod <span className="text-emerald-500">Panel</span></h1>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">CDA Sector-9 Strikers</p>
          </div>
        </div>
        <button className="p-3 text-slate-500 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-10">
        
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
            <Shield size={20} className="text-emerald-500 mb-2" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Leadership</span>
            <span className="text-xs font-black uppercase">Active Creator</span>
          </div>
          <div className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
            <UserCheck size={20} className="text-blue-500 mb-2" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Roster Size</span>
            <span className="text-xs font-black uppercase">42 / 100</span>
          </div>
        </div>

        {/* --- PENDING REQUESTS --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Join Requests ({requests.length})</h2>
          </div>

          {requests.length > 0 ? (
            requests.map((req) => (
              <motion.div 
                layout
                key={req.id}
                className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-black text-slate-700 italic border border-white/5">
                      {req.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase italic tracking-tight">{req.name}</h3>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">{req.aura} AURA</p>
                    </div>
                  </div>
                  <button className="text-slate-700"><MoreVertical size={16} /></button>
                </div>
                
                <p className="text-[9px] font-black text-slate-500 uppercase italic mb-6 px-1 leading-relaxed">
                  "{req.bio}"
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setRequests(requests.filter(r => r.id !== req.id))}
                    className="py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Accept <UserCheck size={14} />
                  </button>
                  <button 
                    onClick={() => setRequests(requests.filter(r => r.id !== req.id))}
                    className="py-4 bg-white/5 text-red-500 border border-red-500/10 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Reject <UserX size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">No Pending Recruits</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default GroupManagement;