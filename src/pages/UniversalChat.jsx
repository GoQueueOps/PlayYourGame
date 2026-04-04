import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Send, UserPlus, MoreVertical,
  Swords, Loader2
} from "lucide-react";
import { supabase } from "../lib/supabase";

function UniversalChat() {
  const { type, id: chatId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chatInfo, setChatInfo] = useState({ title: "Loading...", memberCount: 0 });
  const [members, setMembers] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data?.session?.user?.id || null)
    })
  }, [])

  // ── Load chat data ──
  useEffect(() => {
    if (!chatId) return
    const load = async () => {
      setLoading(true)

      if (type === 'group' || type === 'match') {
        // Fetch group info
        const { data: group } = await supabase
          .from('groups')
          .select('id, name, match_id, type')
          .eq('id', chatId)
          .single()

        if (group) {
          setChatInfo({ title: group.name || 'Group Chat', type: group.type, matchId: group.match_id })
        }

        // Fetch members
        const { data: memberRows } = await supabase
          .from('group_members')
          .select('user_id, profiles(name)')
          .eq('group_id', chatId)

        if (memberRows) {
          const formatted = memberRows.map(m => ({
            user_id: m.user_id,
            name: m.profiles?.name || 'Player'
          }))
          setMembers(formatted)
          setChatInfo(prev => ({ ...prev, memberCount: formatted.length }))
        }

        // Fetch messages
        const { data: msgs } = await supabase
          .from('group_messages')
          .select('id, sender_id, message, created_at')
          .eq('group_id', chatId)
          .order('created_at', { ascending: true })
        setMessages(msgs || [])

      } else if (type === 'direct') {
        // Fetch other user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', chatId)
          .single()

        setChatInfo({ title: profile?.name || 'Player', type: 'direct' })

        // Fetch DM conversation
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: msgs } = await supabase
            .from('direct_messages')
            .select('id, sender_id, receiver_id, message, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
          setMessages(msgs || [])
        }
      }

      setLoading(false)
    }
    load()
  }, [chatId, type])

  // ── Realtime subscription ──
  useEffect(() => {
    if (!chatId) return

    let channel
    if (type === 'group' || type === 'match') {
      channel = supabase
        .channel(`universal_group:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'group_messages',
          filter: `group_id=eq.${chatId}`
        }, (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        })
        .subscribe()
    } else if (type === 'direct') {
      channel = supabase
        .channel(`universal_dm:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'direct_messages'
        }, (payload) => {
          const msg = payload.new
          if (
            (msg.sender_id === currentUserId && msg.receiver_id === chatId) ||
            (msg.sender_id === chatId && msg.receiver_id === currentUserId)
          ) {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
        })
        .subscribe()
    }

    return () => { if (channel) supabase.removeChannel(channel) }
  }, [chatId, type, currentUserId])

  // ── Auto scroll ──
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getNameForUser = (uid) => {
    return members.find(m => m.user_id === uid)?.name || 'Player'
  }

  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

  const handleSend = async () => {
    const text = message.trim()
    if (!text || !currentUserId || sending) return

    setSending(true)
    setMessage("")

    if (type === 'group' || type === 'match') {
      const { error } = await supabase.from('group_messages').insert({
        group_id: chatId,
        sender_id: currentUserId,
        message: text
      })
      if (error) { console.error('Send error:', error.message); setMessage(text) }
    } else if (type === 'direct') {
      const { error } = await supabase.from('direct_messages').insert({
        sender_id: currentUserId,
        receiver_id: chatId,
        message: text
      })
      if (error) { console.error('Send error:', error.message); setMessage(text) }
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleHeaderClick = () => {
    if (type === 'group' || type === 'match') {
      navigate(`/group/${chatId}`)
    } else {
      navigate(`/player/${chatId}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-black italic uppercase select-none">

      {/* HEADER */}
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
              {type !== 'direct' && chatInfo.type && (
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] rounded-md uppercase">
                  {chatInfo.type}
                </span>
              )}
            </div>
            <p className="text-[8px] text-slate-500 tracking-widest mt-0.5 uppercase">
              {type === 'direct'
                ? "Direct Message"
                : `${chatInfo.memberCount} Members · Tap for details`
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/challenge-select`, { state: { targetId: chatId, type } })}
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

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader2 size={32} className="text-emerald-500" />
            </motion.div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">No messages yet. Say something!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId
              const senderName = type === 'direct'
                ? (isOwn ? 'You' : chatInfo.title)
                : getNameForUser(msg.sender_id)

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!isOwn && (
                    <span className="text-[8px] text-slate-500 mb-1 ml-2 tracking-widest font-black uppercase">
                      {senderName}
                    </span>
                  )}
                  <div className={`max-w-[80%] p-4 rounded-[1.8rem] ${
                    isOwn
                      ? "bg-emerald-500 text-black rounded-tr-none shadow-xl shadow-emerald-500/10"
                      : "bg-[#1e293b] text-white rounded-tl-none border border-white/5"
                  }`}>
                    <p className="text-[11px] lowercase not-italic font-bold leading-relaxed">{msg.message}</p>
                  </div>
                  <span className="text-[8px] text-slate-600 px-2 mt-1">{formatTime(msg.created_at)}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <footer className="p-6 bg-[#0b0f1a] border-t border-white/10 sticky bottom-0">
        <div className="flex gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 focus-within:border-emerald-500/50 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="TYPE A MESSAGE..."
            className="flex-1 bg-transparent border-none outline-none px-6 text-xs italic font-black uppercase placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="p-4 bg-emerald-500 text-black rounded-[1.5rem] active:scale-95 transition-all shadow-lg disabled:opacity-40"
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} strokeWidth={3} />}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default UniversalChat;
