import React, { useState, useEffect } from "react";
import {
  Layers, Activity, Plus, Trash2, LogOut,
  ShieldCheck, MapPin, XCircle, Clock,
  Bell, BarChart2, Users, ArrowUpRight, ArrowDownRight,
  AlertCircle, Ban, Unlock, Search, Eye,
  MessageCircle, Send, UserPlus, UserCheck,
  Star, Calendar, DollarSign, Loader2,
  ToggleLeft, ToggleRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function MiniBar({ value, max }) {
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full" />
    </div>
  );
}

function StatCard({ label, value, icon, color, change }) {
  const up = change >= 0;
  return (
    <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/[0.06] relative overflow-hidden group hover:border-purple-500/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500">{label}</p>
        <span className={`${color} opacity-50 group-hover:opacity-100 transition-all`}>{icon}</span>
      </div>
      <h3 className={`text-3xl font-black tracking-tight leading-none ${color}`}>{value}</h3>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[9px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
          {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
}

// ─── FEATURED ARENA MANAGER ───────────────────────────────────────────────────
function FeaturedArenaManager() {
  const [featuredList, setFeaturedList] = useState([])
  const [allArenas, setAllArenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    arena_id: '', start_date: new Date().toISOString().slice(0, 16),
    end_date: '', city: '', state: '', priority: 1, payment_amount: 0,
  })

  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true)
    const [featuredRes, arenasRes] = await Promise.all([
      supabase.from('featured_arenas').select('*, arenas (id, name, city, location)').order('created_at', { ascending: false }),
      supabase.from('arenas').select('id, name, city, location, state').eq('is_active', true)
    ])
    if (featuredRes.data) setFeaturedList(featuredRes.data)
    if (arenasRes.data) setAllArenas(arenasRes.data)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.arena_id || !form.end_date) { alert('Select an arena and end date'); return }
    setSaving(true)
    const selectedArena = allArenas.find(a => a.id === form.arena_id)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('featured_arenas').insert({
      ...form,
      city: form.city || selectedArena?.city || '',
      state: form.state || selectedArena?.state || '',
      is_active: true,
      featured_by: user?.id
    })
    if (error) alert('Error: ' + error.message)
    else {
      setShowAddModal(false)
      setForm({ arena_id: '', start_date: new Date().toISOString().slice(0, 16), end_date: '', city: '', state: '', priority: 1, payment_amount: 0 })
      await fetchAll()
    }
    setSaving(false)
  }

  const toggleActive = async (id, current) => {
    await supabase.from('featured_arenas').update({ is_active: !current }).eq('id', id)
    setFeaturedList(prev => prev.map(f => f.id === id ? { ...f, is_active: !current } : f))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this featured arena?')) return
    await supabase.from('featured_arenas').delete().eq('id', id)
    setFeaturedList(prev => prev.filter(f => f.id !== id))
  }

  const isExpired = (endDate) => new Date(endDate) < new Date()
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Star size={20} />
          </div>
          <div>
            <h3 className="font-black uppercase text-base">Featured Arena Manager</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Paid promotions · Location based · Auto-expires</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest shadow-lg shadow-orange-500/20">
          <Plus size={13} /> Feature Arena
        </motion.button>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-yellow-400/80 font-bold leading-relaxed">
          Featured arenas appear at the top of the home page. Set city/state to target specific regions.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : featuredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Star size={50} className="mb-4 text-orange-400" />
          <p className="text-sm font-black uppercase">No Featured Arenas Yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {featuredList.map(f => {
            const expired = isExpired(f.end_date)
            return (
              <motion.div key={f.id} layout
                className={`bg-[#0b0f1a] border rounded-2xl p-5 ${expired ? 'border-red-500/20 opacity-60' : f.is_active ? 'border-orange-500/20' : 'border-white/[0.06]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-base">{f.arenas?.name || 'Unknown'}</h4>
                      {expired && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">EXPIRED</span>}
                      {!expired && f.is_active && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">LIVE</span>}
                      {!expired && !f.is_active && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">PAUSED</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-[9px] text-slate-500 font-bold uppercase mt-2">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {f.city || f.arenas?.city || 'All cities'}{f.state ? `, ${f.state}` : ''}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(f.start_date)} → {formatDate(f.end_date)}</span>
                      <span className="flex items-center gap-1"><Star size={10} className="text-orange-400" /> Priority {f.priority}</span>
                      {f.payment_amount > 0 && <span className="flex items-center gap-1 text-emerald-400"><DollarSign size={10} /> ₹{f.payment_amount}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!expired && (
                      <button onClick={() => toggleActive(f.id, f.is_active)}
                        className={`p-2 rounded-xl transition-all ${f.is_active ? 'text-orange-400 bg-orange-500/10' : 'text-slate-400 bg-white/5'}`}>
                        {f.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    )}
                    <button onClick={() => handleDelete(f.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d1424] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-orange-500">Feature an Arena</p>
                  <h3 className="text-lg font-black uppercase mt-1">Add Featured Listing</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><XCircle size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Select Arena *</label>
                  <select value={form.arena_id} onChange={e => setForm({ ...form, arena_id: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-orange-500/50 text-white">
                    <option value="">Choose an arena...</option>
                    {allArenas.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Start Date *</label>
                    <input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">End Date *</label>
                    <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none [color-scheme:dark]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Target City</label>
                    <input type="text" placeholder="e.g. Cuttack" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Target State</label>
                    <input type="text" placeholder="e.g. Odisha" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Priority (1-10)</label>
                    <input type="number" min="1" max="10" value={form.priority} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Payment Received (₹)</label>
                    <input type="number" min="0" value={form.payment_amount} onChange={e => setForm({ ...form, payment_amount: parseFloat(e.target.value) })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleAdd} disabled={saving}
                    className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black py-3 rounded-lg font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Star size={14} /> Feature Arena</>}
                  </motion.button>
                  <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 hover:text-white rounded-lg font-black uppercase text-[10px] tracking-wider">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [newAdmin, setNewAdmin] = useState({ email: "", role: "admin" });
  const [stats, setStats] = useState({ bookings: 0, arenas: 0, players: 0, groups: 0 });
  const [addingAdmin, setAddingAdmin] = useState(false);

  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      const [arenasRes, playersRes, groupsRes, notifRes, bookingsRes, adminsRes] = await Promise.all([
        supabase.from('arenas').select('id, name, location, city, is_active').limit(50),
        supabase.from('profiles').select('id, name, email, created_at').limit(100),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('user_id, roles(name), profiles(name, email)')
      ])
      if (arenasRes.data) setArenas(arenasRes.data)
      if (playersRes.data) setAllPlayers(playersRes.data)
      if (notifRes.data) setNotifications(notifRes.data)
      if (adminsRes.data) setAdmins(adminsRes.data.filter(a => ['admin', 'superadmin'].includes(a.roles?.name)))
      setStats({
        bookings: bookingsRes.count || 0,
        arenas: arenasRes.data?.length || 0,
        players: playersRes.data?.length || 0,
        groups: groupsRes.count || 0,
      })
    } catch (err) {
      console.error('SuperAdmin fetch error:', err)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.email) { alert('Enter an email'); return }
    setAddingAdmin(true)
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', newAdmin.email.toLowerCase().trim()).single()
      if (!profile) throw new Error('User not found. They must have an account first.')
      const { data: roleRow } = await supabase.from('roles').select('id').eq('name', newAdmin.role).single()
      if (!roleRow) throw new Error('Role not found')
      await supabase.from('user_roles').update({ role_id: roleRow.id }).eq('user_id', profile.id)
      setNewAdmin({ email: "", role: "admin" })
      await fetchAll()
      alert(`✅ ${newAdmin.email} is now ${newAdmin.role}`)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setAddingAdmin(false)
  }

  const removeAdmin = async (userId) => {
    if (!window.confirm('Downgrade this admin to regular user?')) return
    const { data: userRole } = await supabase.from('roles').select('id').eq('name', 'user').single()
    await supabase.from('user_roles').update({ role_id: userRole?.id }).eq('user_id', userId)
    await fetchAll()
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { id: Date.now(), message: chatInput, created_at: new Date().toISOString() }])
    setChatInput("")
  }

  const filteredPlayers = allPlayers.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const NAV = [
    { id: "dashboard", label: "Analytics", icon: <BarChart2 size={15} /> },
    { id: "featured", label: "Featured", icon: <Star size={15} /> },
    { id: "arenas", label: "Arena Control", icon: <Layers size={15} />, badge: arenas.length },
    { id: "admin_mgmt", label: "Admin Mgmt", icon: <UserPlus size={15} />, badge: admins.length },
    { id: "reports", label: "Player Reports", icon: <AlertCircle size={15} /> },
    { id: "banned", label: "Banned Players", icon: <Ban size={15} /> },
    { id: "players", label: "All Players", icon: <Users size={15} /> },
    { id: "chat", label: "Admin Chat", icon: <MessageCircle size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-black to-[#050818] text-white flex">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 -left-96 w-96 h-96 bg-purple-500/15 blur-[150px] rounded-full" />
        <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-96 -right-96 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full" />
      </div>

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#080d18] hidden lg:flex flex-col border-r border-white/[0.05] sticky top-0 h-screen shrink-0 z-40">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40">
              <ShieldCheck size={20} className="text-black" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight leading-none">Super <span className="text-purple-400">Admin</span></h1>
              <p className="text-[7px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">👑 Root Access</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}>
              {tab.icon} {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-black/30" : "bg-orange-500/20 text-orange-400"}`}>
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.05]">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={14} /> Kill Session
          </motion.button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-600">Root Terminal</p>
            <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">Super <span className="text-purple-400">Admin 👑</span></h2>
          </div>
          <div className="relative">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.07] rounded-xl hover:border-purple-500/30 transition-all">
              <Bell size={16} className="text-slate-400" />
              {unread > 0 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[7px] font-black flex items-center justify-center text-white">
                  {unread}
                </motion.span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-14 w-80 bg-[#0d1424] border border-white/[0.08] rounded-2xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-[9px] font-black uppercase text-white">Notifications</span>
                    <button onClick={markAllRead} className="text-[8px] font-bold text-purple-400">Mark all</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="text-center text-[9px] text-slate-500 py-6">No notifications</p>
                      : notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] ${!n.is_read ? "bg-purple-500/[0.05]" : "opacity-50"}`}>
                          <div className="flex-1">
                            <p className="text-[10px] font-medium text-slate-200">{n.message}</p>
                            <p className="text-[8px] text-slate-600 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">

          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total Bookings" value={stats.bookings} icon={<Activity size={16} />} color="text-cyan-400" change={+11.2} />
                <StatCard label="Active Arenas" value={stats.arenas} icon={<Layers size={16} />} color="text-purple-400" />
                <StatCard label="Total Players" value={stats.players} icon={<Users size={16} />} color="text-indigo-400" />
                <StatCard label="Total Groups" value={stats.groups} icon={<Users size={16} />} color="text-pink-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Arenas Overview</p>
                  <div className="space-y-4">
                    {arenas.slice(0, 5).map(a => (
                      <div key={a.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-black">{a.name}</span>
                          <span className="text-[9px] text-slate-500">{a.city}</span>
                        </div>
                        <MiniBar value={30} max={50} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">System Status</p>
                  <div className="space-y-3">
                    {[['Database', '● Online', 'text-green-400'], ['Payments', '● Razorpay', 'text-green-400'], ['Realtime', '● Active', 'text-green-400'], ['Admins', admins.length, 'text-purple-400']].map(([label, val, cls]) => (
                      <div key={label} className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">{label}</span>
                        <span className={`font-bold ${cls}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "featured" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FeaturedArenaManager />
            </motion.div>
          )}

          {activeTab === "admin_mgmt" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                <h3 className="text-xl font-black uppercase">Manage Admin Access</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 mb-6">Promote existing users to admin roles</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">User Email</label>
                    <input type="email" placeholder="user@email.com" value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-purple-500/40" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">Assign Role</label>
                    <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-purple-500/40 text-white">
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                      <option value="owner">Owner</option>
                      <option value="venue_manager">Venue Manager</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddAdmin} disabled={addingAdmin}
                      className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                      {addingAdmin ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><UserPlus size={14} /> Promote User</>}
                    </motion.button>
                  </div>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-[9px] text-yellow-400/80 font-bold">
                  ⚠️ User must already have an account. Their role will be updated immediately.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admins.map((admin, idx) => (
                  <motion.div layout key={idx}
                    className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-xl ${admin.roles?.name === 'superadmin' ? 'bg-purple-500/20 border-purple-500/30' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {admin.roles?.name === 'superadmin' ? '👑' : <UserCheck size={20} />}
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">{admin.profiles?.name || 'Unknown'}</h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">{admin.profiles?.email}</p>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${admin.roles?.name === 'superadmin' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {admin.roles?.name}
                        </span>
                      </div>
                    </div>
                    {admin.roles?.name !== 'superadmin' && (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeAdmin(admin.user_id)}
                        className="w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "arenas" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase text-base">Arena Inventory</h3>
                  <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{arenas.length} arenas in DB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arenas.map(arena => (
                  <div key={arena.id} className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl p-5 hover:border-purple-500/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg">{arena.name}</h4>
                        <div className="flex items-center gap-1.5 mt-2 text-slate-500">
                          <MapPin size={11} className="text-purple-400" />
                          <p className="text-[9px] font-medium">{arena.location} · {arena.city}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${arena.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {arena.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Player Reports</h3>
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                <ShieldCheck size={50} className="mb-4" />
                <p className="text-sm font-black uppercase">No Active Reports</p>
              </div>
            </motion.div>
          )}

          {activeTab === "banned" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Banned Players</h3>
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                <Unlock size={50} className="mb-4" />
                <p className="text-sm font-black uppercase">No Banned Players</p>
              </div>
            </motion.div>
          )}

          {activeTab === "players" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase">Player Management</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{allPlayers.length} total players</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                  <input type="text" placeholder="Search players..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/40 border border-white/[0.07] rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold outline-none focus:border-purple-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="bg-[#0b0f1a] border border-white/[0.06] p-4 rounded-xl hover:border-purple-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm">{player.name || 'Unknown'}</h4>
                        <p className="text-[9px] text-slate-500">{player.email}</p>
                        <p className="text-[8px] text-slate-600 mt-1">Joined: {new Date(player.created_at).toLocaleDateString()}</p>
                      </div>
                      <Eye size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Admin Chat Room 👑</h3>
              <div className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {chatMessages.length === 0
                    ? <p className="text-center text-slate-600 text-[10px] pt-10">No messages yet</p>
                    : chatMessages.map(msg => (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-xs px-4 py-2.5 rounded-lg text-[10px] bg-purple-500/15 border border-purple-500/20 text-slate-200">
                          {msg.message}
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="border-t border-white/[0.06] p-4 flex gap-2 bg-black/40">
                  <input type="text" placeholder="Type message..." value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-black/40 border border-white/[0.07] rounded-lg px-4 py-2.5 text-[10px] font-bold outline-none focus:border-purple-500/50 text-white placeholder-slate-600" />
                  <motion.button whileTap={{ scale: 0.92 }} onClick={handleSendMessage}
                    className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-2.5 rounded-lg font-black flex items-center gap-2">
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
