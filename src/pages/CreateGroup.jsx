import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Camera, 
  Globe, 
  Lock, 
  Zap,
  CheckCircle2,
  Plus
} from "lucide-react";

function CreateGroup() {
  const navigate = useNavigate();
  const [groupType, setGroupType] = useState("Public");
  const [selectedSports, setSelectedSports] = useState([]);

  const sportsList = ["Football", "Cricket", "Badminton", "Pickleball", "Tennis", "Basketball"];

  const toggleSport = (sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans italic pb-32">
      
      {/* --- HEADER --- */}
      <header className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#0b0f1a]">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
            Start a <span className="text-emerald-500">Lobby</span>
          </h1>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 italic italic">Establish your local Crew</p>
        </div>
      </header>

      <div className="p-8 max-w-2xl mx-auto space-y-10">
        
        {/* --- IMAGE UPLOAD --- */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-[#0b0f1a] rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative group cursor-pointer hover:border-emerald-500/50 transition-all">
            <Camera className="text-slate-700 group-hover:text-emerald-500 transition-colors" size={32} />
            <span className="text-[7px] font-black uppercase text-slate-700 mt-2 italic">Upload Avatar</span>
          </div>
        </div>

        {/* --- CORE INFO --- */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Lobby Name</label>
            <input 
              type="text" 
              placeholder="E.G. CDA SECTOR-9 GIANTS"
              className="w-full bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase tracking-widest placeholder:text-slate-800 outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          {/* --- SPORTS SELECTION (The Missing Button/Section) --- */}
          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Target Sports (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
              {sportsList.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`px-5 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    selectedSports.includes(sport)
                    ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-white/5 border-white/10 text-slate-500"
                  }`}
                >
                  {selectedSports.includes(sport) && <Plus size={12} className="rotate-45" />}
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Description</label>
            <textarea 
              rows="3"
              placeholder="TELL THE SECTOR WHAT THIS CREW IS ABOUT..."
              className="w-full bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 text-sm font-black uppercase tracking-widest placeholder:text-slate-800 outline-none focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* --- PRIVACY SELECTION --- */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => setGroupType("Public")}
            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${groupType === "Public" ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            <Globe size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Public</span>
          </button>
          <button 
            type="button"
            onClick={() => setGroupType("Private")}
            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${groupType === "Private" ? 'bg-orange-500 border-orange-500 text-black shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            <Lock size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Private</span>
          </button>
        </div>

        {/* --- REWARD HINT --- */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-6 flex items-start gap-4 mx-1">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <div>
            <p className="text-[10px] font-black text-white uppercase italic leading-none mb-1">Founder's Bonus</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-relaxed italic">
              Establishing your first community awards you <span className="text-emerald-500">+10 G-Points</span> instantly.
            </p>
          </div>
        </div>

        {/* --- SUBMIT --- */}
        <button className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
          DEPLOY LOBBY <Zap size={16} fill="currentColor" />
        </button>

      </div>
    </div>
  );
}

export default CreateGroup;