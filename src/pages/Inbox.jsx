import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CHATS = [
  {
    id: "g1",
    type: "group", // General Community Groups
    name: "Cricket Lovers Odisha",
    lastMsg: "Rahul: I'll bring the extra ball.",
    time: "2:40 PM",
    unread: 3,
    image: "🏏"
  },
  {
    id: "m1",
    type: "match", // Automated Match Groups from Find Players/Challenges
    name: "Football @ Sports City",
    lastMsg: "System: Match confirmed for Friday.",
    time: "1:15 PM",
    unread: 0,
    image: "⚽"
  },
  {
    id: "d1",
    type: "direct", // One-on-One DMs
    name: "Sanjay Kumar",
    lastMsg: "GG WP! Let's play again tomorrow.",
    time: "Yesterday",
    unread: 0,
    image: "👤"
  }
];

function Inbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Logic to filter chats based on the 4 tabs
  const filteredChats = MOCK_CHATS.filter((chat) => {
    if (activeTab === "all") return true;
    return chat.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 italic font-black uppercase select-none">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-3xl tracking-tighter italic">Inbox</h1>
        </div>
        <button className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400 active:scale-95 transition-all">
          <Search size={20} />
        </button>
      </header>

      {/* Tabs - Added "groups" */}
      <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
        {["all", "matches", "group", "direct"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] tracking-widest transition-all ${
              activeTab === tab ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileTap={{ scale: 0.98 }}
              // Navigates to /chat/group/g1 or /chat/match/m1 or /chat/direct/d1
              onClick={() => navigate(`/chat/${chat.type}/${chat.id}`)}
              className="flex items-center gap-4 p-5 bg-[#0b0f1a] border border-white/5 rounded-[2rem] hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              {/* Avatar with Icon Overlay for Groups/Matches */}
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 relative shadow-inner">
                {chat.image}
                {(chat.type === "group" || chat.type === "match") && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-md border-2 border-[#0b0f1a]">
                    <Users size={10} className="text-black" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm tracking-tighter truncate group-hover:text-emerald-400 transition-colors">{chat.name}</h3>
                  <span className="text-[8px] text-slate-600 font-bold">{chat.time}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate lowercase font-bold tracking-tight">
                  {chat.lastMsg}
                </p>
              </div>

              {/* Unread Badge */}
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-black shadow-lg shadow-emerald-500/30">
                  {chat.unread}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredChats.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[10px] text-slate-600 tracking-[0.3em]">No {activeTab} conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;