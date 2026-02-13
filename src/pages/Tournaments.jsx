import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, ChevronLeft, Timer, 
  Flame, Star, BellRing 
} from "lucide-react";

function Tournaments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none flex flex-col items-center justify-center text-center">
      
      {/* --- HEADER --- */}
      <div className="fixed top-0 left-0 right-0 p-6 flex items-center z-50 bg-[#020617]/80 backdrop-blur-xl">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="ml-4 text-xl font-black uppercase italic tracking-tighter">Championships</h1>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative w-full max-w-lg">
        {/* Glowing Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 space-y-8 mt-12">
          {/* Animated Trophy Icon */}
          <div className="inline-flex p-8 bg-white/5 border border-white/10 rounded-[3rem] relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <Trophy size={80} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
               <Flame size={16} className="text-orange-500 fill-orange-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Phase Two Initializing</span>
            </div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-tight">
              Coming <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">Soon</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-loose">
              The ultimate arena for pro squads. Compete for major <span className="text-yellow-400">G-Point</span> pools and regional glory.
            </p>
          </div>

          {/* COMING SOON FEATURES */}
          <div className="grid grid-cols-2 gap-3 pt-8">
            <div className="bg-[#0b0f1a] border border-white/5 p-5 rounded-3xl text-left">
               <Timer size={18} className="text-emerald-500 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest mb-1">Live Bracket</p>
               <p className="text-[9px] text-slate-600 font-bold uppercase leading-tight">Real-time match tracking.</p>
            </div>
            <div className="bg-[#0b0f1a] border border-white/5 p-5 rounded-3xl text-left">
               <Star size={18} className="text-yellow-400 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest mb-1">MVP Rewards</p>
               <p className="text-[9px] text-slate-600 font-bold uppercase leading-tight">Bonus G-Points for top scorers.</p>
            </div>
          </div>

          {/* CTA: NOTIFY ME */}
          <button className="w-full py-5 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-2xl shadow-white/5 active:scale-95 transition-all">
            <BellRing size={18} />
            Notify Me When Live
          </button>
        </div>
      </div>

    </div>
  );
}

export default Tournaments;