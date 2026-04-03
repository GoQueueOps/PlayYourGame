import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, MessageSquare, UserPlus, Trophy,
  BellOff, Wallet, ShieldCheck, Loader, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const NOTIF_ICONS = {
  challenge:  <Trophy size={18} className="text-orange-500" />,
  match:      <Trophy size={18} className="text-emerald-500" />,
  wallet:     <Wallet size={18} className="text-yellow-500" />,
  account:    <ShieldCheck size={18} className="text-purple-500" />,
  appeal:     <ShieldCheck size={18} className="text-blue-500" />,
  friend:     <UserPlus size={18} className="text-blue-400" />,
  message:    <MessageSquare size={18} className="text-emerald-500" />,
  booking:    <Bell size={18} className="text-cyan-500" />,
  default:    <Bell size={18} className="text-slate-400" />,
}

function NotificationCenter() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel('notif_center')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setNotifications(data)
    setLoading(false)
  }

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans italic select-none">

      {/* HEADER */}
      <header className="p-6 bg-[#0b0f1a] border-b border-white/5 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black uppercase italic tracking-tighter flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </header>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader size={32} className="text-blue-500" />
            </motion.div>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-40 text-slate-600">
            <BellOff size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">All Caught Up</p>
            <p className="text-[9px] text-slate-700 mt-2">No notifications yet</p>
          </div>
        )}

        <AnimatePresence>
          {!loading && notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => {
                if (!notif.is_read) markAsRead(notif.id)
              }}
              className={`p-5 rounded-[2rem] border transition-all active:scale-[0.98] flex items-start gap-4 cursor-pointer ${
                !notif.is_read
                  ? 'bg-[#0b0f1a] border-white/10 shadow-lg'
                  : 'bg-transparent border-white/5 opacity-60'
              }`}
            >
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner shrink-0">
                {NOTIF_ICONS[notif.type] || NOTIF_ICONS.default}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[11px] font-black uppercase italic tracking-wide text-white capitalize">
                    {notif.type?.replace(/_/g, ' ') || 'Notification'}
                  </h3>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest shrink-0 ml-2">
                    {formatTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight break-words">
                  {notif.message}
                </p>
              </div>

              {!notif.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="p-6 bg-gradient-to-t from-[#020617] to-transparent">
        <button
          onClick={markAllAsRead}
          disabled={markingAll || unreadCount === 0}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {markingAll ? <><Loader size={12} className="animate-spin" /> Marking...</> : 'Mark All as Read'}
        </button>
      </footer>
    </div>
  )
}

export default NotificationCenter;
