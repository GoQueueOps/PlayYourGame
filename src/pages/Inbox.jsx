import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Users, Loader2, Swords, MessageCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

function Inbox() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [matchChats, setMatchChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data?.session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchMatchChats = async () => {
      try {
        const { data: memberRows } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", currentUserId);

        if (!memberRows?.length) { setLoading(false); return; }

        const convIds = memberRows.map((m) => m.conversation_id);

        const { data: convs } = await supabase
          .from("conversations")
          .select("id, match_id, type, created_at")
          .in("id", convIds)
          .eq("type", "challenge")
          .order("created_at", { ascending: false });

        if (!convs?.length) { setLoading(false); return; }

        const matchIds = convs.map((c) => c.match_id).filter(Boolean);
        const { data: matches } = await supabase
          .from("matches")
          .select("id, match_type, match_time, status, entry_points")
          .in("id", matchIds);

        const { data: allMembers } = await supabase
          .from("conversation_members")
          .select("conversation_id, user_id")
          .in("conversation_id", convIds);

        const opponentIds = (allMembers || [])
          .filter((m) => m.user_id !== currentUserId)
          .map((m) => m.user_id);

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", [...new Set(opponentIds)]);

        const { data: latestMsgs } = await supabase
          .from("group_messages")
          .select("group_id, message, created_at")
          .in("group_id", convIds)
          .order("created_at", { ascending: false });

        const enriched = convs.map((conv) => {
          const match = matches?.find((m) => m.id === conv.match_id);
          const opponent = (allMembers || []).find(
            (m) => m.conversation_id === conv.id && m.user_id !== currentUserId
          );
          const opponentProfile = profiles?.find((p) => p.id === opponent?.user_id);
          const lastMsg = latestMsgs?.find((m) => m.group_id === conv.id);
          const sport = match?.match_type?.split("_")[1] || "sport";

          return {
            id: conv.id,
            type: "match",
            name: opponentProfile?.name || "Opponent",
            sport: sport.charAt(0).toUpperCase() + sport.slice(1),
            matchStatus: match?.status || "open",
            entryPoints: match?.entry_points,
            lastMsg: lastMsg?.message || "Challenge accepted! Say hello.",
            lastMsgTime: lastMsg?.created_at || conv.created_at,
            image: { football: "⚽", cricket: "🏏", badminton: "🏸", pickleball: "🏓" }[sport] || "🎯",
          };
        });

        setMatchChats(enriched);
      } catch (err) {
        console.error("Inbox error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchChats();
  }, [currentUserId]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = Date.now() - date;
    if (diff < 86400000) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return date.toLocaleDateString("en-IN", { weekday: "short" });
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const MOCK_GROUP_CHATS = [
    { id: "g1", type: "group", name: "Cricket Lovers Odisha", lastMsg: "Rahul: I'll bring the extra ball.", lastMsgTime: new Date(), image: "🏏" },
  ];
  const MOCK_DIRECT_CHATS = [
    { id: "d1", type: "direct", name: "Sanjay Kumar", lastMsg: "GG WP! Let's play again.", lastMsgTime: new Date(Date.now() - 86400000), image: "👤" },
  ];

  const allChats = [...matchChats, ...MOCK_GROUP_CHATS, ...MOCK_DIRECT_CHATS]
    .sort((a, b) => new Date(b.lastMsgTime) - new Date(a.lastMsgTime));

  const filteredChats = allChats.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "matches") return c.type === "match";
    if (activeTab === "group") return c.type === "group";
    if (activeTab === "direct") return c.type === "direct";
    return true;
  });

  const handleChatClick = (chat) => {
    if (chat.type === "match") navigate(`/chat/${chat.id}`);
    else navigate(`/chat/${chat.type}/${chat.id}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 italic font-black uppercase select-none">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl tracking-tighter italic">Inbox</h1>
            <p className="text-[9px] text-slate-500 tracking-[0.3em] mt-0.5">
              {matchChats.length} Active Challenge{matchChats.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400 active:scale-95 transition-all">
          <Search size={20} />
        </button>
      </header>

      <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar relative z-10">
        {[
          { key: "all", icon: <MessageCircle size={12} /> },
          { key: "matches", icon: <Swords size={12} /> },
          { key: "group", icon: <Users size={12} /> },
          { key: "direct", icon: <User size={12} /> },
        ].map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              activeTab === key ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500"
            }`}
          >
            {icon}{key}
          </button>
        ))}
      </div>

      <div className="space-y-3 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
            <Loader2 className="animate-spin text-emerald-500" size={28} />
            <p className="text-[10px] tracking-widest">Loading chats...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChatClick(chat)}
                className="flex items-center gap-4 p-5 bg-[#0b0f1a] border border-white/5 rounded-[2rem] hover:border-emerald-500/30 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 relative shadow-inner shrink-0">
                  {chat.image}
                  {chat.type === "match" && (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 p-1 rounded-md border-2 border-[#0b0f1a]">
                      <Swords size={9} className="text-white" />
                    </div>
                  )}
                  {chat.type === "group" && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-md border-2 border-[#0b0f1a]">
                      <Users size={9} className="text-black" />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0">
                      <h3 className="text-sm tracking-tighter truncate group-hover:text-emerald-400 transition-colors">
                        {chat.name}
                      </h3>
                      {chat.type === "match" && (
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[8px] text-orange-400 tracking-widest">{chat.sport}</span>
                          {chat.entryPoints && <span className="text-[8px] text-emerald-500">• {chat.entryPoints} G-PTS</span>}
                          <span className={`text-[8px] tracking-widest ${
                            chat.matchStatus === "confirmed" ? "text-emerald-400" :
                            chat.matchStatus === "accepted" ? "text-yellow-400" : "text-slate-500"
                          }`}>• {chat.matchStatus}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-600 font-bold shrink-0 ml-2">{formatTime(chat.lastMsgTime)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate lowercase font-bold tracking-tight">{chat.lastMsg}</p>
                </div>
              </motion.div>
            ))}

            {filteredChats.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <p className="text-[10px] text-slate-600 tracking-[0.3em]">No {activeTab === "all" ? "" : activeTab} conversations yet</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default Inbox;