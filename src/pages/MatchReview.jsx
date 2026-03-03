import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, Check, Timer, Users, ShieldCheck, 
  Smile, ChevronRight, HelpCircle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MatchReview() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false); // ✅ Used in Modal
  const [isFinished, setIsFinished] = useState(false);
  const [currentVotes, setCurrentVotes] = useState({});

  const [teammates] = useState([
    { id: 101, name: "Blesson", avatar: "👤" },
    { id: 102, name: "Sagar", avatar: "👤" },
    { id: 103, name: "Ipsit", avatar: "👤" },
    { id: 104, name: "Rajat", avatar: "👤" },
    { id: 105, name: "Amit", avatar: "👤" }
  ]);

  const traits = [
    { id: 'on-time', label: 'On-Time Cheetah', icon: <Timer size={18} />, color: 'text-emerald-400', desc: 'Arrives before the whistle blows every single time.' },
    { id: 'squad', label: 'Squad Soul', icon: <Users size={18} />, color: 'text-blue-400', desc: "Coordinates the whole unit." },
    { id: 'accha', label: 'Accha Baccha', icon: <ShieldCheck size={18} />, color: 'text-yellow-400', desc: 'Honest, quick with payments, and follows rules.' },
    { id: 'friendly', label: 'Vibe Master', icon: <Smile size={18} />, color: 'text-orange-400', desc: 'Makes the game fun for everyone.' }
  ];

  const toggleVote = (traitID, value) => {
    setCurrentVotes(prev => ({
      ...prev,
      [traitID]: prev[traitID] === value ? 0 : value 
    }));
  };

  const goToNextPlayer = () => {
    // Logic: In a real app, you'd post 'currentVotes' to your DB here
    setCurrentVotes({});

    if (currentIndex < teammates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center italic font-black">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8 p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <CheckCircle2 size={80} className="text-emerald-500" />
        </motion.div>
        <h2 className="text-4xl uppercase tracking-tighter mb-4">Vibe Check Submitted</h2>
        <p className="text-slate-500 text-sm uppercase tracking-widest max-w-xs mb-12">You've earned <span className="text-white">+5 G-Points</span> for reviewing your squad.</p>
        <button onClick={() => navigate("/challenge-mode")} className="w-full max-w-xs py-6 bg-emerald-500 text-black rounded-[2rem] uppercase text-xs tracking-[0.3em] font-black shadow-2xl active:scale-95 transition-all">Back to Bookings »</button>
      </div>
    );
  }

  const currentPlayer = teammates[currentIndex];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 flex flex-col justify-center select-none overflow-hidden font-black italic">
      
      {/* HEADER / PROGRESS */}
      <div className="fixed top-12 left-6 right-6 flex items-center justify-between z-50">
        <div className="flex gap-1.5">
          {teammates.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
        <button onClick={() => setShowHelp(true)} className="w-10 h-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 active:scale-90">
          <HelpCircle size={20} />
        </button>
      </div>

      {/* VOTING CARD */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPlayer.id}
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
          className="bg-[#0b0f1a] border border-white/5 rounded-[3.5rem] p-8 shadow-2xl relative"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-white/5 to-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 border border-white/10">
              {currentPlayer.avatar}
            </div>
            <h2 className="text-3xl uppercase tracking-tighter leading-none">{currentPlayer.name}</h2>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] mt-3">The Vibe Check</p>
          </div>

          <div className="space-y-3">
            {traits.map((trait) => {
              const voteValue = currentVotes[trait.id] || 0;
              return (
                <div key={trait.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className={voteValue !== 0 ? trait.color : 'text-slate-600'}>{trait.icon}</div>
                    <span className={`text-[10px] uppercase tracking-widest ${voteValue === 0 ? 'text-slate-500' : 'text-white'}`}>{trait.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleVote(trait.id, -1)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${voteValue === -1 ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500'}`}>
                      <X size={16} strokeWidth={3} />
                    </button>
                    <button onClick={() => toggleVote(trait.id, 1)} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${voteValue === 1 ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={goToNextPlayer} className="w-full mt-10 py-6 bg-emerald-500 text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] active:scale-95 flex items-center justify-center gap-2">
            {currentIndex === teammates.length - 1 ? "Complete Review" : "Next Teammate"}
            <ChevronRight size={18} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* HELP MODAL (USES showHelp) */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHelp(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed top-1/2 left-8 right-8 -translate-y-1/2 bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 z-[101]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 flex items-center gap-2">Cheat Sheet</h3>
              <div className="space-y-6">
                {traits.map(t => (
                  <div key={t.id} className="flex gap-4 italic font-black">
                    <div className={`${t.color} p-3 bg-white/5 rounded-2xl h-fit`}>{t.icon}</div>
                    <div>
                      <h4 className="text-[10px] uppercase text-white mb-1">{t.label}</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">"{t.desc}"</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHelp(false)} className="w-full mt-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MatchReview;