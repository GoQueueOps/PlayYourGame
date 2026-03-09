import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Loader2, Swords, Gamepad2, MapPin, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

function Chat() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [members, setMembers] = useState([]); // other member profiles
  const [matchInfo, setMatchInfo] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data?.session?.user?.id || null);
    });
  }, []);

  // ── Load conversation info, members, match details ──
  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      try {
        // Fetch conversation + match info
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .select(`
            id, type, match_id,
            match:matches ( match_type, match_time, entry_points, arena_id,
              arena:arenas!matches_arena_fkey ( name )
            )
          `)
          .eq("id", conversationId)
          .single();

        if (convError) throw convError;
        setMatchInfo(convData?.match || null);

        // Fetch member profiles
        const { data: memberData, error: memberError } = await supabase
          .from("conversation_members")
          .select("user_id, profile:profiles!conversation_members_user_id_fkey ( name )")
          .eq("conversation_id", conversationId);

        if (!memberError && memberData) {
          setMembers(memberData);
        }

        // Fetch existing messages
        const { data: msgData, error: msgError } = await supabase
          .from("group_message")
          .select("id, sender_id, message, created_at")
          .eq("group_id", conversationId)
          .order("created_at", { ascending: true });

        if (msgError) throw msgError;
        setMessages(msgData || []);
      } catch (err) {
        console.error("Load conversation error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // ── Realtime subscription for new messages ──
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_message",
          filter: `group_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !currentUserId || sending) return;

    setSending(true);
    setNewMessage("");

    const { error } = await supabase
      .from("group_message")
      .insert({
        group_id: conversationId,
        sender_id: currentUserId,
        message: text,
      });

    if (error) {
      console.error("Send error:", error.message);
      setNewMessage(text); // restore on error
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Helpers ──
  const getNameForUser = (userId) => {
    const member = members.find((m) => m.user_id === userId);
    return member?.profile?.name || "Player";
  };

  const getOpponentName = () => {
    const opponent = members.find((m) => m.user_id !== currentUserId);
    return opponent?.profile?.name || "Opponent";
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit"
    });
  };

  const formatMatchTime = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const parseMatchType = (matchType = "") => {
    const parts = matchType.split("_");
    return parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "Match";
  };

  // ── Group messages by date ──
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">

      {/* ── AMBIENT GLOW ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Opponent avatar + name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Swords size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="font-black uppercase tracking-tight text-white truncate italic">
                {loading ? "Loading..." : getOpponentName()}
              </p>
              <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold">
                Challenge Active
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── MATCH INFO BANNER ── */}
      {matchInfo && (
        <div className="sticky top-[73px] z-10 bg-[#0b0f1a]/80 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Swords size={12} className="text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                {parseMatchType(matchInfo.match_type)}
              </span>
            </div>
            {matchInfo.arena?.name && (
              <div className="flex items-center gap-2 shrink-0">
                <MapPin size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">
                  {matchInfo.arena.name}
                </span>
              </div>
            )}
            {matchInfo.match_time && (
              <div className="flex items-center gap-2 shrink-0">
                <Clock size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {formatMatchTime(matchInfo.match_time)}
                </span>
              </div>
            )}
            {matchInfo.entry_points && (
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <Gamepad2 size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {matchInfo.entry_points * 2} G-PTS Pot
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MESSAGES ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-[10px] uppercase tracking-widest font-black">Loading Chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Swords size={28} className="text-emerald-400" />
              </div>
              <p className="text-white font-black uppercase italic tracking-tight text-xl">Challenge Accepted!</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                Say something to your opponent
              </p>
            </motion.div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest font-black">{date}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {msgs.map((msg) => {
                      const isOwn = msg.sender_id === currentUserId;
                      const senderName = getNameForUser(msg.sender_id);

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            {!isOwn && (
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black px-2">
                                {senderName}
                              </span>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm font-semibold leading-relaxed ${
                                isOwn
                                  ? "bg-emerald-500 text-black rounded-br-sm"
                                  : "bg-white/8 border border-white/8 text-white rounded-bl-sm"
                              }`}
                              style={!isOwn ? { background: "rgba(255,255,255,0.06)" } : {}}
                            >
                              {msg.message}
                            </div>
                            <span className="text-[8px] text-slate-600 px-2 font-bold">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── INPUT BAR ── */}
      <div className="sticky bottom-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-t border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-medium"
            disabled={sending || loading}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || loading}
            className="w-14 h-14 bg-emerald-500 text-black rounded-2xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-emerald-500/20"
          >
            {sending
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>

    </div>
  );
}

export default Chat;
