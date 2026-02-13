import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Timer, Users, ShieldCheck, 
  Handshake, Smile, Info, 
  Settings, Share2, MapPin, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function UserProfile() {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState(null);

  // MOCK DATA: Tejas is our example user
  const user = {
    name: "Tejas",
    gender: "male",
    location: "Cuttack, Odisha",
    stats: { games: 24, rank: 9 },
    auraScore: 92 // This is the 'Street Cred' value
  };

  const getPronoun = (type) => {
    const map = {
      subject: user.gender === "male" ? "he" : "she",
      possessive: user.gender === "male" ? "his" : "her"
    };
    return map[type];
  };

  // VIBE CHECK: The peer-voting results
  const [vibeCheck] = useState([
    { 
      id: "on-time", 
      name: "On-Time Cheetah", 
      icon: <Timer />, 
      votes: 14, 
      desc: `The Cheetah of the Turf. ${getPronoun("subject")} arrives before the whistle blows every single time.`,
      color: "text-emerald-400"
    },
    { 
      id: "squad", 
      name: "Squad Soul", 
      icon: <Users />, 
      votes: 8,
      desc: `The Ultimate Teammate. ${getPronoun("subject")} doesn't just play; ${getPronoun("subject")} coordinates the whole unit.`,
      color: "text-blue-400"
    },
    { 
      id: "accha", 
      name: "Accha Baccha", 
      icon: <ShieldCheck />, 
      votes: 22,
      desc: "The Gold Standard. Honest, quick with payments, and follows all ground rules perfectly.",
      color: "text-yellow-400"
    },
    { 
      id: "trust", 
      name: "Trustable", 
      icon: <Handshake />, 
      votes: -2, // Negative vote example
      desc: `The Reliable One. When ${getPronoun("subject")} says ${getPronoun("subject")}'s coming, the team knows ${getPronoun("subject")}'ll be there.`,
      color: "text-purple-400"
    },
    { 
      id: "friendly", 
      name: "Vibe Master", 
      icon: <Smile />, 
      votes: 11,
      desc: `${getPronoun("subject")} makes the game fun for everyone, win or lose.`,
      color: "text-orange-400"
    }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400"><Share2 size={20} /></button>
          <button className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400"><Settings size={20} /></button>
        </div>
      </header>

      {/* --- PROFILE INFO --- */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl shadow-emerald-500/20">
          👤
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mt-2">{user.name}</h2>
        <div className="flex items-center gap-2 text-slate-500 mt-1">
          <MapPin size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">{user.location}</span>
        </div>
      </section>

      {/* --- PERSONALIZED AURA BAR --- */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-6 mb-8 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-500 animate-pulse" />
            {/* DYNAMIC NAME AURA */}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {user.name}'s Aura
            </span>
          </div>
          <span className="text-sm font-black italic text-orange-500">{user.auraScore} Points</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${user.auraScore}%` }}
            className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          />
        </div>
      </section>

      {/* --- THE VIBE CHECK --- */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">The Vibe Check</h4>
          <Info size={16} className="text-slate-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {vibeCheck.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedBadge(item)}
              className={`flex items-center justify-between p-4 rounded-3xl border transition-all active:scale-95 bg-[#0b0f1a] ${item.votes < 0 ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`${item.color} ${item.votes < 0 ? 'grayscale opacity-30' : ''}`}>
                  {React.cloneElement(item.icon, { size: 18 })}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tight truncate ${item.votes < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {item.name}
                </span>
              </div>
              <span className={`text-[10px] font-black italic ml-2 ${item.votes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.votes > 0 ? `+${item.votes}` : item.votes}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- INFO SHEET --- */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#020617] border-t border-white/10 rounded-t-[3rem] p-8 pb-12 z-[101]"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 bg-white/5 ${selectedBadge.color}`}>
                   {React.cloneElement(selectedBadge.icon, { size: 40 })}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{selectedBadge.name}</h3>
                <p className="text-sm font-bold italic text-slate-400 px-4 mb-10 leading-relaxed">"{selectedBadge.desc}"</p>
                <button onClick={() => setSelectedBadge(null)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all">Close Vibe</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default UserProfile;