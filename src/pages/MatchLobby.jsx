import React, { useState,  useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, MapPin, Clock, 
  
} from "lucide-react";
import { motion } from "framer-motion";

function MatchLobby() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("chat"); // Toggle between 'chat' and 'squad'

  const matchDetails = {
    venue: "Krater's Arena (Turf B)",
    time: "8:00 PM Today",
    players: 12,
    locationQuery: "Kraters+Arena+Bhubaneswar"
  };

  const [messages, setMessages] = useState([
    { id: 1, sender: "Blesson", text: "Yo, who's bringing the ball today?", time: "6:15 PM" },
    { id: 2, sender: "Sagar", text: "I have a Nike one, I'll bring it.", time: "6:18 PM" },
  ]);

  const squadList = [
    { name: "Tejas", team: "A", status: "Coming" },
    { name: "Blesson", team: "A", status: "At Venue" },
    { name: "Sagar", team: "B", status: "Coming" },
    { name: "Manas", team: "B", status: "Late" },
  ];

  const sendMessage = (txt = message) => {
    if (!txt.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: txt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden select-none font-sans italic">
      
      {/* --- HEADER --- */}
      <header className="p-6 bg-[#0b0f1a] border-b border-white/5 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-sm font-black uppercase italic tracking-widest">Squad Lobby</h1>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button onClick={() => setView("chat")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'chat' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Chat</button>
            <button onClick={() => setView("squad")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'squad' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Squad</button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${matchDetails.locationQuery}`} 
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
          >
            <MapPin size={12} className="text-emerald-500" /> {matchDetails.venue}
          </a>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-emerald-500" /> {matchDetails.time}
          </div>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {view === "chat" ? (
          <div ref={scrollRef} className="p-6 space-y-6">
            {messages.map((msg) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                {!msg.isMe && <span className="text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">{msg.sender}</span>}
                <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm font-medium border ${msg.isMe ? 'bg-emerald-500 text-black rounded-tr-none border-emerald-400' : 'bg-[#0b0f1a] border-white/5 text-slate-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-black text-slate-700 uppercase mt-2 tracking-[0.2em] px-2">{msg.time}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-[0.3em]">Team Split</h2>
            {squadList.map((player, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0b0f1a] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${player.team === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {player.team}
                  </div>
                  <span className="text-sm font-black uppercase">{player.name}</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${player.status === 'At Venue' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                  {player.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FOOTER / INPUT --- */}
      <footer className="p-6 bg-[#020617] border-t border-white/5 pb-10">
        {/* QUICK ACTION CHIPS [cite: 2026-02-08] */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {["On my way! 🏃", "I'm here 📍", "Late 5 mins ⏰", "Bringing ball ⚽"].map(chip => (
            <button key={chip} onClick={() => sendMessage(chip)} className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 active:bg-emerald-500 active:text-black transition-all">
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#0b0f1a] border border-white/10 rounded-[1.2rem] flex items-center px-4">
            <input 
              type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="SQUAD BANTAR..." 
              className="w-full bg-transparent py-5 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
            />
          </div>
          <button onClick={() => sendMessage()} className="p-5 bg-emerald-500 text-black rounded-[1.2rem] active:scale-90 shadow-lg">
            <Send size={20} strokeWidth={3} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default MatchLobby;