import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Zap, MapPin, Calendar, 
   ChevronRight, Swords 
} from "lucide-react";

function CreateChallenge({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sport: "Football",
    stakes: 20,
    venue: "",
    type: "Competitive"
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-6 italic font-sans">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />

        {/* Form Card */}
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-[#0b0f1a] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Draft <span className="text-emerald-500">Duel</span></h2>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Step {step} of 3 • Rules of Engagement</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* STEP 1: SPORT & TYPE */}
            {step === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {['Football', 'Cricket', 'Badminton', 'Pickleball'].map((s) => (
                    <button 
                      key={s} onClick={() => setFormData({...formData, sport: s})}
                      className={`py-6 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${formData.sport === s ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                  <button onClick={() => setFormData({...formData, type: "Friendly"})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${formData.type === 'Friendly' ? 'bg-blue-500 text-white' : 'text-slate-600'}`}>Friendly</button>
                  <button onClick={() => setFormData({...formData, type: "Competitive"})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${formData.type === 'Competitive' ? 'bg-orange-600 text-white' : 'text-slate-600'}`}>Competitive</button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STAKES (Z-POINTS) */}
            {step === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Stake Amount</p>
                <div className="flex justify-center gap-4">
                  {[20, 30, 50, 100].map((pts) => (
                    <button 
                      key={pts} onClick={() => setFormData({...formData, stakes: pts})}
                      className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all ${formData.stakes === pts ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      <Zap size={14} fill={formData.stakes === pts ? "black" : "none"} />
                      <span className="text-[10px] font-black mt-1">{pts}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Winner takes: {(formData.stakes * 2) * 0.9} Z-PTS (10% Arena Tax)</p>
              </motion.div>
            )}

            {/* STEP 3: VENUE & TIME */}
            {step === 3 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <MapPin className="text-emerald-500" size={20} />
                  <input className="bg-transparent outline-none flex-1 text-[11px] font-black uppercase tracking-widest" placeholder="VENUE NAME (e.g. KRATER'S)" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <Calendar className="text-emerald-500" size={20} />
                  <input type="datetime-local" className="bg-transparent outline-none flex-1 text-[11px] font-black uppercase tracking-widest text-slate-400" />
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="p-5 bg-white/5 text-white rounded-2xl border border-white/10 active:scale-90 transition-all">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              )}
              <button 
                onClick={() => step < 3 ? setStep(step + 1) : onClose()} 
                className="flex-1 bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {step === 3 ? "Launch Challenge" : "Next Phase"} 
                {step === 3 ? <Swords size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateChallenge;