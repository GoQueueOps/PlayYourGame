import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, MessageSquare, UserPlus, 
  Trophy, BellOff
} from "lucide-react";
import { motion } from "framer-motion";

function NotificationCenter() {
  const navigate = useNavigate();

  // Mock data representing the different alerts a user might receive
  const notifications = [
    {
      id: 1,
      type: "lobby",
      title: "New Message",
      description: "Blesson: 'Who's bringing the ball today?'",
      time: "2 mins ago",
      link: "/lobby", // Leads to the Match Lobby [cite: 2026-02-13]
      icon: <MessageSquare size={18} className="text-emerald-500" />,
      unread: true
    },
    {
      id: 2,
      type: "challenge",
      title: "Match Challenge",
      description: "Sagar challenged you to a 1v1 Badminton match!",
      time: "1 hour ago",
      link: "/challenge/accept", // Leads to Challenge Response [cite: 2026-02-13]
      icon: <Trophy size={18} className="text-orange-500" />,
      unread: true
    },
    {
      id: 3,
      type: "friend",
      title: "New Playpal",
      description: "Manas Mahapatra accepted your recruit request.",
      time: "5 hours ago",
      link: "/profile/manas", // Leads to Player Profile [cite: 2026-02-12]
      icon: <UserPlus size={18} className="text-blue-500" />,
      unread: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans italic select-none">
      
      {/* --- HEADER --- */}
      <header className="p-6 bg-[#0b0f1a] border-b border-white/5 flex items-center gap-4 sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">Notifications</h1>
      </header>

      {/* --- NOTIFICATION LIST --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={notif.id}
              onClick={() => navigate(notif.link)}
              className={`p-5 rounded-[2rem] border transition-all active:scale-[0.98] flex items-start gap-4 ${
                notif.unread 
                ? 'bg-[#0b0f1a] border-white/10 shadow-lg' 
                : 'bg-transparent border-white/5 opacity-60'
              }`}
            >
              <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner`}>
                {notif.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[11px] font-black uppercase italic tracking-wide text-white">
                    {notif.title}
                  </h3>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
                  {notif.description}
                </p>
              </div>

              {notif.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center mt-40 text-slate-600">
            <BellOff size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">All Caught Up</p>
          </div>
        )}
      </div>

      {/* --- FOOTER ACTION --- */}
      <footer className="p-6 bg-gradient-to-t from-[#020617] to-transparent">
        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
          Mark all as read
        </button>
      </footer>

    </div>
  );
}

export default NotificationCenter;