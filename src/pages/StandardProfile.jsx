import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, MoreVertical, Timer, 
  Users, MessageSquare, Ban, Zap,
  Heart, AlertTriangle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function StandardProfile() {
  const navigate = useNavigate();
  const [requestSent, setRequestSent] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const userData = {
    name: "Manas Mahapatra",
    bio: "Running on caffeine, ambition, & a little bit of chaos.",
    lastPlayed: "26th Jul 2025",
    stats: { matches: 24, friends: 47 }, // Removed Squad
    auraPercentage: 92,
    location: "Khandagiri, Bhubaneswar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ManasMahapatra"
  };

  const recentMatches = [
    { id: 1, sport: "Badminton", opponent: "Rajesh Kumar", result: "Won", score: "21-18" },
    { id: 2, sport: "Badminton", opponent: "Priya Singh", result: "Lost", score: "19-21" },
  ];

  const reportReasons = [
    "Inappropriate behavior",
    "Cheating/Unfair play",
    "Abusive language",
    "Ghosting/No-show"
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32 select-none font-sans italic font-black">
      
      {/* --- TOP NAV --- */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 flex justify-between items-center bg-[#0b0f1a] border-b border-white/5 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-3 items-center relative">
          <button className="p-2 text-slate-400 hover:text-white transition-all"><Share2 size={22} /></button>
          
          {/* OPTIONS DROPDOWN */}
          <button onClick={() => setShowOptions(!showOptions)} className={`p-2 transition-all ${showOptions ? 'text-white' : 'text-slate-400'}`}>
            <MoreVertical size={22} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => { setIsBlocked(!isBlocked); setShowOptions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5"
                  >
                    <Ban size={16} className={isBlocked ? "text-emerald-500" : "text-red-500"} />
                    <span className={`text-[10px] uppercase tracking-widest ${isBlocked ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isBlocked ? 'Unblock User' : 'Block User'}
                    </span>
                  </button>
                  <button 
                    onClick={() => { setShowReportModal(true); setShowOptions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-all text-left"
                  >
                    <AlertTriangle size={16} className="text-slate-400" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Report Behavior</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- IDENTITY CARD --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`m-4 bg-[#0b0f1a] rounded-[2.5rem] p-8 border transition-all ${isBlocked ? 'border-red-500/20 opacity-50 grayscale' : 'border-white/5'}`}>
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-800 overflow-hidden border-2 border-white/10 shadow-2xl">
              <img src={userData.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            {!isBlocked && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-full border-2 border-[#0b0f1a] flex items-center gap-0.5">
                <Zap size={10} fill="currentColor" /> {userData.auraPercentage}%
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              { label: 'Matches', val: userData.stats.matches },
              { label: 'Friends', val: userData.stats.friends }
            ].map((s, i) => (
              <div key={i} className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-2xl font-black">{s.val}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">{userData.name}</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2">📍 {userData.location}</p>
            </div>
            {!isBlocked && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setRequestSent(true)} className={`px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all ${requestSent ? 'bg-white/5 text-slate-500 border border-white/10' : 'bg-white text-black font-black'}`}>
                  {requestSent ? 'Pending' : 'Add Friend'}
                </button>
                <button onClick={() => setShowMessageModal(true)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  <MessageSquare size={18} />
                </button>
              </div>
            )}
          </div>
          {isBlocked && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
              <Ban size={12} className="text-red-500" />
              <span className="text-[9px] text-red-500 uppercase tracking-widest">This user is currently blocked</span>
            </div>
          )}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
             <p className="text-xs text-slate-300 leading-relaxed">"{userData.bio}"</p>
          </div>
        </div>
      </motion.div>

      {/* --- VIBE CHECK --- */}
      <div className="m-4 grid grid-cols-2 gap-3 font-black italic">
        {[
          { label: 'On-Time', count: 12, icon: <Timer size={14}/>, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Master', count: 8, icon: <Zap size={14}/>, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
          { label: 'Baccha', count: 15, icon: <Users size={14}/>, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Friendly', count: 20, icon: <Heart size={14}/>, color: 'text-red-400 bg-red-500/10 border-red-500/20' }
        ].map((badge, i) => (
          <div key={i} className={`flex items-center justify-between px-5 py-4 rounded-[1.5rem] border ${badge.color}`}>
            <div className="flex items-center gap-2">
              {badge.icon} <span className="text-[8px] uppercase tracking-widest">{badge.label}</span>
            </div>
            <span className="text-sm">{badge.count}</span>
          </div>
        ))}
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="mx-4 mt-8 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-4 italic">Recent Combat</h4>
        {recentMatches.map(match => (
          <div key={match.id} className="bg-[#0b0f1a] p-5 rounded-3xl border border-white/5 flex justify-between items-center opacity-60">
            <div>
              <p className="text-xs font-black uppercase text-white leading-none">vs {match.opponent}</p>
              <p className="text-[8px] text-slate-500 uppercase mt-1 tracking-widest">{match.sport}</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] uppercase font-black ${match.result === 'Won' ? 'text-emerald-500' : 'text-red-500'}`}>{match.result}</span>
              <p className="text-[9px] text-slate-600 mt-1">{match.score}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md italic font-black uppercase">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0b0f1a] border border-red-500/20 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowReportModal(false)} className="absolute top-8 right-8 text-slate-500"><X/></button>
              <h2 className="text-2xl tracking-tighter mb-8">Flag <span className="text-red-500">Player</span></h2>
              <div className="space-y-2 mb-8 text-left italic">
                {reportReasons.map(r => (
                  <button key={r} onClick={() => setReportReason(r)} className={`w-full p-4 rounded-2xl border text-[10px] tracking-widest text-left transition-all ${reportReason === r ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/5 text-slate-500'}`}>{r}</button>
                ))}
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] tracking-widest shadow-xl shadow-red-500/20">Submit Violation</button>
            </motion.div>
          </div>
        )}

        {showMessageModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md italic font-black uppercase">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0b0f1a] border border-emerald-500/20 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowMessageModal(false)} className="absolute top-8 right-8 text-slate-500"><X/></button>
              <h2 className="text-2xl tracking-tighter mb-8">Send <span className="text-emerald-500">Message</span></h2>
              <textarea className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-xs outline-none focus:border-emerald-500/50 mb-8 h-32 text-white italic font-black" placeholder="WRITE YOUR MESSAGE..."/>
              <button onClick={() => setShowMessageModal(false)} className="w-full py-5 bg-emerald-500 text-black rounded-2xl text-[10px] tracking-widest shadow-xl shadow-emerald-500/20">Dispatch</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default StandardProfile;