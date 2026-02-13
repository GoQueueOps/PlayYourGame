import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, Check, Timer, Users, ShieldCheck, 
  Smile, ChevronRight, HelpCircle, Trophy 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MatchReview() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  
  // Stores votes for all players: { 101: { 'on-time': 1, 'friendly': -1 }, 102: {...} }
  const [ setAllVotes] = useState({}); 
  const [currentVotes, setCurrentVotes] = useState({});

  // Mock list of 10+ players
  const [teammates] = useState([
    { id: 101, name: "Blesson", avatar: "👤" },
    { id: 102, name: "Sagar", avatar: "👤" },
    { id: 103, name: "Ipsit", avatar: "👤" },
    { id: 104, name: "Rajat", avatar: "👤" },
    { id: 105, name: "Amit", avatar: "👤" }
  ]);

  const traits = [
    { id: 'on-time', label: 'On-Time Cheetah', icon: <Timer size={18} />, color: 'text-emerald-400', desc: 'He/She arrives before the whistle blows every single time.' },
    { id: 'squad', label: 'Squad Soul', icon: <Users size={18} />, color: 'text-blue-400', desc: "He/She doesn't just play; he/she coordinates the whole unit." },
    { id: 'accha', label: 'Accha Baccha', icon: <ShieldCheck size={18} />, color: 'text-yellow-400', desc: 'The Gold Standard. Honest, quick with payments, and follows rules.' },
    { id: 'friendly', label: 'Vibe Master', icon: <Smile size={18} />, color: 'text-orange-400', desc: 'He/She makes the game fun for everyone, win or lose.' }
  ];

  const toggleVote = (traitID, value) => {
    setCurrentVotes(prev => ({
      ...prev,
      [traitID]: prev[traitID] === value ? 0 : value 
    }));
  };

  const goToNextPlayer = () => {
    // Save current votes to the main state
    setAllVotes(prev => ({ ...prev, [teammates[currentIndex].id]: currentVotes }));
    
    // Clear for next person
    setCurrentVotes({});

    if (currentIndex < teammates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Send to the Aura Summary page we discussed
      navigate("/aura-summary"); 
    }
  };

  const currentPlayer = teammates[currentIndex];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 flex flex-col justify-center select-none overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="fixed top-12 left-6 right-6 flex items-center justify-between z-50">
        <div className="flex gap-1.5">
          {teammates.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={() => setShowHelp(true)} 
          className="w-10 h-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-xl"
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* --- VOTING CARD --- */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPlayer.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="bg-[#0b0f1a] border border-white/5 rounded-[3.5rem] p-8 shadow-2xl relative"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 border border-white/10">
              {currentPlayer.avatar}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">{currentPlayer.name}</h2>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-3">The Vibe Check</p>
          </div>

          <div className="space-y-3">
            {traits.map((trait) => {
              const voteValue = currentVotes[trait.id] || 0;
              return (
                <div key={trait.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className={voteValue !== 0 ? trait.color : 'text-slate-600'}>
                      {trait.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${voteValue === 0 ? 'text-slate-500' : 'text-white'}`}>
                      {trait.label}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* DISLIKE BUTTON */}
                    <button 
                      onClick={() => toggleVote(trait.id, -1)} 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${voteValue === -1 ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-red-500/10 text-red-500'}`}
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                    {/* LIKE BUTTON */}
                    <button 
                      onClick={() => toggleVote(trait.id, 1)} 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${voteValue === 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-emerald-500/10 text-emerald-500'}`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTON */}
          <button 
            onClick={goToNextPlayer} 
            className="w-full mt-10 py-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {currentIndex === teammates.length - 1 ? "Complete Review" : "Next Teammate"}
            <ChevronRight size={18} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* --- REWARD HINT --- */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-5 py-3 rounded-full">
          <Trophy size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Earn +1 G-Point for every vote</span>
        </div>
      </div>

      {/* --- HELP MODAL --- */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setShowHelp(false)} 
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
              className="fixed top-1/2 left-8 right-8 -translate-y-1/2 bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 z-[101] shadow-2xl"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 flex items-center gap-2">
                <HelpCircle size={14} /> Trait Cheat Sheet
              </h3>
              <div className="space-y-6">
                {traits.map(t => (
                  <div key={t.id} className="flex gap-4">
                    <div className={`${t.color} p-3 bg-white/5 rounded-2xl h-fit`}>{t.icon}</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white mb-1">{t.label}</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">"{t.desc}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowHelp(false)} 
                className="w-full mt-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
              >
                Back to Voting
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default MatchReview;