import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Send, 
  UserPlus, 
  MoreVertical,
  Swords // Added for Challenge
} from "lucide-react";

function UniversalChat() {
  const { type, chatId } = useParams(); 
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);

  const [chatInfo, setChatInfo] = useState({
    title: "Loading...",
    onlineCount: 0,
    role: "Member",
    groupId: "G-TEST-99"
  });

  useEffect(() => {
    if (chatId) {
      setChatInfo({
        title: type === 'direct' ? "Rahul Sharma" : "Elite Cricket Club",
        onlineCount: 24,
        role: "Captain",
        groupId: chatId 
      });
    }
  }, [chatId, type]);

  const [messages, setMessages] = useState([
    { id: 1, sender: "System", text: "Welcome to Elite Cricket Club.", isSystem: true },
    { id: 2, sender: "Rahul S.", text: "Yo! Who's bringing the extra balls?", isMe: false },
    { id: 5, sender: "Tejas", text: "Everything is set from my end. See you guys!", isMe: true },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "Me", text: message, isMe: true }]);
    setMessage("");
  };

  const handleHeaderClick = () => {
    if (type === 'group' || type === 'match') {
      navigate(`/group/${chatInfo.groupId}`);
    } else {
      navigate(`/profile/${chatId}`); 
    }
  };

  // ✅ LOGIC: CREATE CHALLENGE
  const handleCreateChallenge = () => {
    // This can navigate to your existing Create Challenge page 
    // or open a specific challenge modal
    const confirmChallenge = window.confirm(
      `DO YOU WANT TO CHALLENGE ${type === 'direct' ? chatInfo.title : "THIS GROUP"} TO AN OFFICIAL MATCH?`
    );
    if (confirmChallenge) {
      // Navigate to your challenge creation route
      navigate("/create-challenge", { state: { targetId: chatId, type } });
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-black italic uppercase select-none">
      
      {/* --- HEADER --- */}
      <header className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0b0f1a] sticky top-0 z-50">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          
          <div onClick={handleHeaderClick} className="flex-1 cursor-pointer group active:opacity-70 transition-all">
            <div className="flex items-center gap-2">
              <h3 className="text-sm tracking-tighter truncate group-hover:text-emerald-400 transition-colors">
                {chatInfo.title}
              </h3>
              {type !== 'direct' && (
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] rounded-md uppercase">
                  {chatInfo.role}
                </span>
              )}
            </div>
            <p className="text-[8px] text-slate-500 tracking-widest mt-0.5 uppercase">
              {type === 'direct' ? "Online" : `${chatInfo.onlineCount} Squad Members • Tap for details`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* ✅ CHALLENGE BUTTON: Visible in both Direct and Group chats */}
          <button 
            onClick={handleCreateChallenge}
            className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-2xl shadow-lg active:scale-90 transition-all group"
            title="Create Challenge"
          >
            <Swords size={20} className="group-hover:rotate-12 transition-transform" />
          </button>

          {(type === 'group' || type === 'match') && (
            <button className="p-3 bg-emerald-500 text-black rounded-2xl shadow-lg active:scale-90 transition-all">
              <UserPlus size={20} strokeWidth={3} />
            </button>
          )}
          
          <button className="p-3 bg-white/5 text-slate-400 rounded-2xl border border-white/10 active:scale-90">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.isMe ? 'items-end' : 'items-start'}`}>
            {msg.isSystem ? (
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full">
                <p className="text-[9px] text-slate-500 tracking-[0.2em] uppercase font-bold">{msg.text}</p>
              </div>
            ) : (
              <div className={`max-w-[80%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                {!msg.isMe && (
                  <span className="text-[8px] text-slate-500 mb-1 ml-2 tracking-widest font-black uppercase">
                    {msg.sender}
                  </span>
                )}
                <div className={`p-4 rounded-[1.8rem] ${
                  msg.isMe 
                    ? "bg-emerald-500 text-black rounded-tr-none shadow-xl shadow-emerald-500/10" 
                    : "bg-[#1e293b] text-white rounded-tl-none border border-white/5"
                }`}>
                  <p className="text-[11px] lowercase not-italic font-bold leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <footer className="p-6 bg-[#0b0f1a] border-t border-white/10 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 focus-within:border-emerald-500/50 transition-all">
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="TYPE A MESSAGE..."
            className="flex-1 bg-transparent border-none outline-none px-6 text-xs italic font-black uppercase placeholder:text-slate-600"
          />
          <button type="submit" className="p-4 bg-emerald-500 text-black rounded-[1.5rem] active:scale-95 transition-all shadow-lg">
            <Send size={20} strokeWidth={3} />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default UniversalChat;