import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateAppealModal from "../components/CreateAppealModal"; 
import { 
  ChevronLeft, 
  Plus, 
  Star, 
  Clock, 
  Target,
  Zap,
  Sparkles,
  Check,
  X,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_APPEALS = [
  {
    id: 101,
    host: "Rahul S.",
    rating: 4.8,
    sport: "Cricket",
    arena: "Krater's Arena",
    time: "08:00 PM",
    date: new Date().toISOString().split('T')[0], 
    slotsNeeded: 12,
    joinedPlayers: 10,
    pricePerHead: "150",
    status: "Open",
    emoji: "🏏",
    isOwner: false
  },
  {
    id: 102,
    host: "Team Blazers",
    rating: 4.5,
    sport: "Football",
    arena: "Sports City",
    time: "06:00 AM",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slotsNeeded: 10,
    joinedPlayers: 9,
    pricePerHead: "200",
    status: "Open",
    emoji: "⚽",
    isOwner: false
  }
];

function FindPlayers() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [appeals, setAppeals] = useState(INITIAL_APPEALS);
  const [managedAppeal, setManagedAppeal] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formatMatchDate = (matchDateStr) => {
    if (!matchDateStr) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(matchDateStr);
    matchDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((matchDate.getTime() - today.getTime()) / 86400000);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(matchDate);
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(matchDate);

    if (diffDays === 0) return `Today, ${dayName}`;
    if (diffDays === 1) return `Tomorrow, ${dayName}`;
    
    return `${dayName}, ${matchDate.getDate()}${getOrdinal(matchDate.getDate())} ${monthName}`;
  };

  const handleCreateAppeal = (newAppealData) => {
    const completeAppeal = {
      ...newAppealData,
      host: "Tejas (You)", 
      rating: 5.0,
      emoji: newAppealData.sport === "Cricket" ? "🏏" : 
             newAppealData.sport === "Football" ? "⚽" : 
             newAppealData.sport === "Badminton" ? "🏸" : "🎾",
      pricePerHead: "100",
      status: "Open",
      isOwner: true,
      joinedPlayers: 0
    };
    setAppeals([completeAppeal, ...appeals]);
  };

  const cancelAppeal = (id) => {
    setAppeals(appeals.filter(app => app.id !== id));
  };

  const handleAcceptPlayer = (appealId, requesterName) => {
    setAppeals(prev => prev.map(app => 
      app.id === appealId ? { ...app, joinedPlayers: Math.min(app.slotsNeeded, app.joinedPlayers + 1) } : app
    ));
    alert(`Group chat with ${requesterName} is now live!`);
    setManagedAppeal(null);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#050818] text-white font-sans p-6 lg:p-12 relative overflow-hidden">
      
      <motion.div animate={{ background: [ "radial-gradient(ellipse 800px 800px at 0% 0%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)", "radial-gradient(ellipse 800px 800px at 100% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)", ] }} transition={{ duration: 20, repeat: Infinity }} className="absolute inset-0 pointer-events-none" />
      <motion.div animate={{ x: mousePosition.x * 50, y: mousePosition.y * 50 }} className="absolute w-[400px] h-[400px] bg-green-500/20 blur-[100px] rounded-full pointer-events-none" style={{ top: "10%", right: "5%", zIndex: 0 }} />

      <CreateAppealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateAppeal} />

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 relative z-10">
        <div className="flex items-center gap-6">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="p-3 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl hover:border-green-500/30 transition-all backdrop-blur-md shadow-lg">
            <ChevronLeft size={24} className="text-slate-400 group-hover:text-green-400" />
          </motion.button>
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">Matchmaking</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2"><Sparkles size={12} className="text-green-400" /> Lobby & Public Appeals</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl border border-green-400/30">
          <Plus size={18} strokeWidth={3} className="inline mr-2" /> Create Public Appeal
        </motion.button>
      </header>

      <main className="max-w-7xl mx-auto relative z-10 italic font-black uppercase">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence>
            {appeals.map((appeal, idx) => (
              <motion.div
                key={appeal.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => { if (appeal.isOwner) setManagedAppeal(appeal); }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[2.5rem] p-7 md:p-8 hover:border-green-500/40 transition-all group relative overflow-hidden backdrop-blur-md shadow-xl"
              >
                <div className="absolute -top-6 -right-6 text-8xl opacity-10 select-none group-hover:rotate-12 transition-transform">{appeal.emoji}</div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl font-black border border-white/20">
                      {appeal.host.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-black text-[15px] uppercase tracking-tight italic ${appeal.isOwner ? 'text-emerald-400' : 'text-white'}`}>{appeal.host}</h3>
                      <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-black mt-2"><Star size={12} fill="currentColor" />{appeal.rating}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/40 text-[10px] font-black tracking-tighter">
                    <div className="flex items-center gap-1"><Flame size={12} /> {appeal.joinedPlayers} Joined</div>
                    <div className="text-[8px] text-emerald-300/70 mt-0.5">{Number(appeal.slotsNeeded) - Number(appeal.joinedPlayers)} Left</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="p-2 bg-green-500/20 rounded-lg"><Target size={18} className="text-green-400" /></div>
                    <span className="text-[11px] uppercase tracking-tight">{appeal.arena || appeal.venue}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><Clock size={18} className="text-blue-400" /></div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-tight">{formatMatchDate(appeal.date)}</span>
                      <span className="text-[9px] opacity-70 tracking-widest">{appeal.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="p-2 bg-yellow-500/20 rounded-lg"><Zap size={18} className="text-yellow-400" /></div>
                    <span className="text-[11px] tracking-tight">₹{appeal.pricePerHead} per person</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/10 relative z-10">
                  {appeal.isOwner ? (
                    <button onClick={(e) => { e.stopPropagation(); cancelAppeal(appeal.id); }} className="w-full bg-red-500/20 border border-red-500/50 text-red-500 py-3 rounded-2xl text-[10px] tracking-widest">Cancel</button>
                  ) : (
                    <button className="w-full bg-gradient-to-r from-white to-slate-100 text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-green-400 hover:to-green-300 shadow-lg border border-white/30">Request</button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {managedAppeal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagedAppeal(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-white/10 rounded-t-[3rem] p-8 z-[101] max-h-[70vh] overflow-y-auto font-black italic uppercase">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl text-white tracking-tighter">Pending Requests</h3>
                <button onClick={() => setManagedAppeal(null)} className="p-2 bg-white/5 rounded-full text-slate-400"><X size={24}/></button>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-black">R</div>
                  <div><p className="text-sm">Rahul Sharma</p><p className="text-[10px] text-emerald-400">Aura Score: 98</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setManagedAppeal(null)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><X size={20}/></button>
                  <button onClick={() => handleAcceptPlayer(managedAppeal.id, "Rahul Sharma")} className="p-3 bg-emerald-500 text-black rounded-xl"><Check size={20} strokeWidth={4}/></button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FindPlayers;