import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Import the modal component from your components folder
import CreateAppealModal from "../components/CreateAppealModal"; 
import { 
  Users, 
  ChevronLeft, 
  Plus, 
  Star, 
  Clock, 
  ShieldCheck,
  Target,
  Zap
} from "lucide-react";

// Mock data for the Lobby Appeals
const mockAppeals = [
  {
    id: 101,
    host: "Rahul S.",
    rating: 4.8,
    sport: "Cricket",
    arena: "Krater's Arena",
    time: "Today, 08:00 PM",
    slotsNeeded: 2,
    totalSlots: 12,
    pricePerHead: "150",
    status: "Open"
  },
  {
    id: 102,
    host: "Team Blazers",
    rating: 4.5,
    sport: "Football",
    arena: "Sports City",
    time: "Tomorrow, 06:00 AM",
    slotsNeeded: 1,
    totalSlots: 10,
    pricePerHead: "200",
    status: "Open"
  }
];

function FindPlayers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("teams"); 
  
  // State to manage the visibility of the Create Appeal popup
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 lg:p-12 relative overflow-hidden">
      
      {/* 1. THE MODAL COMPONENT */}
      <CreateAppealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Matchmaking</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Lobby & Public Appeals</p>
          </div>
        </div>

        {/* Create Public Appeal Button - Opens Modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-500/20 hover:bg-white transition-all flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          Create Public Appeal
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto relative z-10">
        
        {/* TABS */}
        <div className="flex gap-4 mb-10 bg-white/5 p-1.5 rounded-[2rem] w-fit border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab("teams")}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "teams" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-slate-400 hover:text-white"}`}
          >
            Find Teams
          </button>
          <button 
            onClick={() => setActiveTab("individuals")}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "individuals" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-slate-400 hover:text-white"}`}
          >
            Find Players
          </button>
        </div>

        {/* FEED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAppeals.map((appeal) => (
            <div key={appeal.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-green-500/30 transition-all group relative overflow-hidden backdrop-blur-sm">
              
              <div className="absolute -top-4 -right-4 text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all select-none">
                {appeal.sport === "Cricket" ? "🏏" : "⚽"}
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black border border-white/10 shadow-inner">
                    {appeal.host.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-[15px] uppercase tracking-tight text-white italic">{appeal.host}</h3>
                    <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-black mt-1">
                      <Star size={12} fill="currentColor" />
                      {appeal.rating} <span className="text-slate-500 uppercase tracking-tighter">Z-Score</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter">
                  +{appeal.slotsNeeded} Slots
                </div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex items-center gap-4 text-slate-300">
                  <Target size={18} className="text-green-500" />
                  <span className="text-[11px] font-black uppercase tracking-tight truncate leading-none">{appeal.arena}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <Clock size={18} className="text-green-500" />
                  <span className="text-[11px] font-black uppercase tracking-tight leading-none">{appeal.time}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <Zap size={18} className="text-yellow-400" />
                  <span className="text-[11px] font-black uppercase tracking-tight leading-none">Split: {appeal.pricePerHead} / person</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-emerald-500">
                  <ShieldCheck size={16} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
                </div>
                <button className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-500 transition-all shadow-xl active:scale-95">
                  Request
                </button>
              </div>
            </div>
          ))}

          {/* EMPTY STATE - Also triggers Modal */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center opacity-40 hover:opacity-100 transition-all cursor-pointer group"
          >
            <div className="p-4 bg-white/5 rounded-3xl mb-4 group-hover:bg-green-500/10 transition-colors">
              <Users size={32} className="text-slate-500 group-hover:text-green-500" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Matchmaking</p>
            <h4 className="text-xs font-black uppercase italic mt-1 text-white">Host Your Own Lobby</h4>
          </div>

        </div>
      </main>
    </div>
  );
}

export default FindPlayers;