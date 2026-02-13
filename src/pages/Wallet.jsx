import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Gamepad2, ArrowLeftRight, History, 
  ChevronLeft, CheckCircle2, Lock, TrendingUp 
} from "lucide-react";

function Wallet() {
  const navigate = useNavigate();
  
  // 1. DYNAMIC STATE: Initializing with your logic [cite: 2026-02-13]
  const [stats, setStats] = useState({
    gPoints: 450,
    zPoints: 12,
    bookingsLast30Days: 3, // Set to 3 for demo to show eligibility
    convertedThisMonth: 10 // Monthly cap tracker (Max 70 Z)
  });

  const [convertAmount, setConvertAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const history = [
    { id: 1, type: "G", amount: "+20", event: "New Sign-up Reward", date: "Feb 10" },
    { id: 2, type: "Z", amount: "+3", event: "Venue Booking: Krater Turf", date: "Feb 09" },
    { id: 3, type: "G", amount: "-7", event: "Booking Cancellation Penalty", date: "Feb 08" },
  ];

  // 2. LOGIC GATEKEEPERS
  const isEligible = stats.bookingsLast30Days >= 3;
  const Z_CAP = 70;
  const remainingZCapacity = Z_CAP - stats.convertedThisMonth;
  const maxGAllowed = Math.min(stats.gPoints, remainingZCapacity * 10);

  const handleConvert = () => {
    if (convertAmount < 10) return;
    
    const zGained = Math.floor(convertAmount / 10);
    
    // Update local state based on your rules
    setStats(prev => ({
      ...prev,
      gPoints: prev.gPoints - (zGained * 10),
      zPoints: prev.zPoints + zGained,
      convertedThisMonth: prev.convertedThisMonth + zGained
    }));

    setConvertAmount(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none font-sans italic relative overflow-hidden">
      
      {/* SUCCESS NOTIFICATION */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6"
          >
            <div className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={18} /> Conversion Successful! Z-Points Added.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">My Wallet</h1>
      </header>

      {/* --- BALANCE CARDS --- */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Z-POINTS CARD */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
          <Zap size={120} className="absolute -right-8 -top-8 text-yellow-500/5 rotate-12" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Zone Points
            </div>
            <Zap size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter relative z-10">
            {stats.zPoints} <span className="text-sm opacity-40 italic">Z</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase mt-4 tracking-widest relative z-10">Value: ₹{stats.zPoints}</p>
        </div>

        {/* G-POINTS CARD */}
        <div className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
          <Gamepad2 size={120} className="absolute -right-8 -top-8 text-white/5 rotate-12" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Game Points
            </div>
            <Gamepad2 size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter relative z-10">
            {stats.gPoints} <span className="text-sm opacity-40 italic">G</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase mt-4 tracking-widest italic relative z-10">Conversion: 10 G = 1 Z</p>
        </div>
      </div>

      {/* --- CONVERSION HUB (MANUAL SELECTION) --- */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <ArrowLeftRight size={20} />
          </div>
          <h3 className="text-sm font-black uppercase italic tracking-tight">G ➔ Z Conversion</h3>
        </div>

        <div className="space-y-8">
          {/* PROGRESS BARS */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[8px] font-black text-slate-600 uppercase">Streak</p>
                <span className="text-[8px] font-black text-white">{stats.bookingsLast30Days}/3</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${(stats.bookingsLast30Days / 3) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[8px] font-black text-slate-600 uppercase">Monthly Cap</p>
                <span className="text-[8px] font-black text-white">{stats.convertedThisMonth}/70 Z</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(stats.convertedThisMonth / 70) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* SLIDER FOR MANUAL AMOUNT */}
          {isEligible && maxGAllowed >= 10 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase">Select Amount</p>
                <p className="text-xl font-black text-emerald-500 italic">+{Math.floor(convertAmount / 10)} Z</p>
              </div>
              <input 
                type="range" min="0" max={maxGAllowed} step="10" value={convertAmount}
                onChange={(e) => setConvertAmount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-700">
                <span>0 G</span>
                <span className="text-white bg-white/5 px-2 py-1 rounded-md">{convertAmount} G-POINTS</span>
                <span>{maxGAllowed} G</span>
              </div>
            </motion.div>
          )}

          {/* ELIGIBILITY INFO */}
          <div className="bg-black/40 rounded-3xl p-5 flex items-start gap-4 border border-white/5">
            {isEligible ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} /> : <Lock className="text-slate-600 shrink-0" size={18} />}
            <p className="text-[11px] text-slate-400 font-bold uppercase italic leading-relaxed">
              {isEligible 
                ? "Eligibility unlocked. Convert G-Points manually to gain Zone value." 
                : `Complete ${3 - stats.bookingsLast30Days} more matches this month to unlock conversion.`}
            </p>
          </div>

          <button 
            onClick={handleConvert}
            disabled={!isEligible || convertAmount < 10}
            className={`w-full py-5 rounded-[22px] font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
              isEligible && convertAmount >= 10 ? 'bg-white text-black shadow-xl active:scale-95' : 'bg-white/5 text-slate-700 cursor-not-allowed'
            }`}
          >
            Confirm Transfer <TrendingUp size={14} />
          </button>
        </div>
      </section>

      {/* --- HISTORY --- */}
      <section className="px-2">
        <div className="flex items-center gap-3 mb-6">
          <History size={18} className="text-slate-500" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Financial Log</h3>
        </div>

        <div className="space-y-3 text-sans">
          {history.map(item => (
            <div key={item.id} className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'Z' ? 'bg-yellow-400/5 text-yellow-400' : 'bg-emerald-400/5 text-emerald-400'}`}>
                  {item.type === 'Z' ? <Zap size={20} /> : <Gamepad2 size={20} />}
                </div>
                <div>
                  <p className="text-sm font-black uppercase italic tracking-tighter">{item.event}</p>
                  <p className="text-[10px] text-slate-600 font-black uppercase mt-1 tracking-widest">{item.date}</p>
                </div>
              </div>
              <span className={`text-sm font-black italic tracking-tighter ${item.amount.includes('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.amount} {item.type}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Wallet;