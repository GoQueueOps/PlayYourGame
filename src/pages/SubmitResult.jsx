import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Frown, 
  AlertTriangle, 
  ChevronLeft, 
  ShieldCheck,
  Zap
} from "lucide-react";

function SubmitResult() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState(null); // 'win' or 'loss'
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data for the current match context
  const matchData = {
    opponent: "Cantonment Kings",
    venue: "Krater's Arena",
    slab: 50,
    pool: 90 // 100 total - 10% platform cut
  };

  const handleSubmit = () => {
    // Logic: If Captain A says 'win' and Captain B says 'loss' -> Success.
    // If both say 'win' -> Dispute triggered.
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50">
          <ShieldCheck className="text-emerald-500" size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Result Logged</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs">
          Waiting for {matchData.opponent} to confirm. Z-Points will be distributed shortly.
        </p>
        <button 
          onClick={() => navigate("/challenge")}
          className="mt-10 text-emerald-500 font-black uppercase text-[10px] tracking-[0.4em] border-b border-emerald-500/30 pb-1"
        >
          Back to League »
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 relative overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <header className="flex items-center gap-6 mb-12">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Declare Result</h1>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Match vs {matchData.opponent}</p>
        </div>
      </header>

      {/* MATCH SUMMARY CARD */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-emerald-500/50 blur-sm rounded-full" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total Stakes</p>
        <div className="flex items-center justify-center gap-3 text-4xl font-black italic">
          <Zap size={32} className="text-yellow-500" fill="currentColor" />
          {matchData.pool} Z-PTS
        </div>
        <p className="text-[9px] font-black text-emerald-500/50 uppercase mt-2 tracking-widest italic">Winner Takes All (Net Pool)</p>
      </div>

      {/* SELECTION AREA */}
      <div className="flex-1 space-y-4">
        <button 
          onClick={() => setSelection("win")}
          className={`w-full p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
            selection === "win" ? "bg-emerald-500 border-emerald-400 text-black" : "bg-white/5 border-white/5 text-white hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-6">
            <Trophy size={32} className={selection === "win" ? "text-black" : "text-emerald-500"} />
            <div className="text-left">
              <p className="text-xl font-black uppercase italic tracking-tight leading-none">We Won</p>
              <p className={`text-[10px] font-bold uppercase mt-1 ${selection === "win" ? "text-black/60" : "text-slate-500"}`}>Claim the Z-Point Pool</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setSelection("loss")}
          className={`w-full p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
            selection === "loss" ? "bg-red-500 border-red-400 text-black" : "bg-white/5 border-white/5 text-white hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-6">
            <Frown size={32} className={selection === "loss" ? "text-black" : "text-red-500"} />
            <div className="text-left">
              <p className="text-xl font-black uppercase italic tracking-tight leading-none">We Lost</p>
              <p className={`text-[10px] font-bold uppercase mt-1 ${selection === "loss" ? "text-black/60" : "text-slate-500"}`}>Accept Defeat Gracefully</p>
            </div>
          </div>
        </button>
      </div>

      {/* DISPUTE WARNING (Rule 12) */}
      <div className="mt-10 p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl flex gap-4">
        <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
        <p className="text-[9px] font-bold text-yellow-500/80 uppercase leading-relaxed tracking-wider">
          Warning: False result declaration leads to a <strong>Z-Point burn</strong> and a permanent rank penalty for your team.
        </p>
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        disabled={!selection}
        onClick={handleSubmit}
        className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] mt-8 transition-all shadow-2xl ${
          selection 
          ? "bg-white text-black shadow-white/10 hover:scale-[1.02] active:scale-95" 
          : "bg-white/5 text-slate-700 cursor-not-allowed"
        }`}
      >
        Confirm Declaration »
      </button>

    </div>
  );
}

export default SubmitResult;