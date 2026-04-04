import React, { useState, useEffect } from "react";
import {
  Layers, Activity, Plus, Trash2, LogOut,
  ShieldCheck, MapPin, XCircle,
  Bell, BarChart2, Users, ArrowUpRight, ArrowDownRight,
  AlertCircle, Ban, Unlock, Search, Eye,
  MessageCircle, Send, Star, Calendar, DollarSign, Loader2,
  ToggleLeft, ToggleRight, CheckCircle2, Clock, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const SPORTS_LIST = ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "Pickleball"];

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
    <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/[0.06] relative overflow-hidden group hover:border-emerald-500/20 transition-all">
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
  const [form, setForm] = useState({ arena_id: '', start_date: new Date().toISOString().slice(0, 16), end_date: '', city: '', state: '', priority: 1, payment_amount: 0 })

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
    const { error } = await supabase.from('featured_arenas').insert({ ...form, city: form.city || selectedArena?.city || '', state: form.state || selectedArena?.state || '', is_active: true, featured_by: user?.id })
    if (error) alert('Error: ' + error.message)
    else { setShowAddModal(false); setForm({ arena_id: '', start_date: new Date().toISOString().slice(0, 16), end_date: '', city: '', state: '', priority: 1, payment_amount: 0 }); await fetchAll() }
    setSaving(false)
  }

  const toggleActive = async (id, current) => {
    await supabase.from('featured_arenas').update({ is_active: !current }).eq('id', id)
    setFeaturedList(prev => prev.map(f => f.id === id ? { ...f, is_active: !current } : f))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove?')) return
    await supabase.from('featured_arenas').delete().eq('id', id)
    setFeaturedList(prev => prev.filter(f => f.id !== id))
  }

  const isExpired = (d) => new Date(d) < new Date()
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20"><Star size={20} /></div>
          <div><h3 className="font-black uppercase text-base">Featured Arena Manager</h3><p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Paid promotions · Location based · Auto-expires</p></div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest">
          <Plus size={13} /> Feature Arena
        </motion.button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
        : featuredList.length === 0 ? <div className="text-center py-20 opacity-40"><Star size={50} className="mx-auto mb-4 text-orange-400" /><p className="text-sm font-black uppercase">No Featured Arenas</p></div>
        : <div className="space-y-3">{featuredList.map(f => {
          const expired = isExpired(f.end_date)
          return (
            <motion.div key={f.id} layout className={`bg-[#0b0f1a] border rounded-2xl p-5 ${expired ? 'border-red-500/20 opacity-60' : f.is_active ? 'border-orange-500/20' : 'border-white/[0.06]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-base">{f.arenas?.name}</h4>
                    {expired && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">EXPIRED</span>}
                    {!expired && f.is_active && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">LIVE</span>}
                    {!expired && !f.is_active && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">PAUSED</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[9px] text-slate-500 font-bold uppercase mt-2">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {f.city || f.arenas?.city || 'All'}{f.state ? `, ${f.state}` : ''}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(f.start_date)} → {fmtDate(f.end_date)}</span>
                    <span className="flex items-center gap-1"><Star size={10} className="text-orange-400" /> Priority {f.priority}</span>
                    {f.payment_amount > 0 && <span className="flex items-center gap-1 text-emerald-400"><DollarSign size={10} /> ₹{f.payment_amount}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!expired && <button onClick={() => toggleActive(f.id, f.is_active)} className={`p-2 rounded-xl transition-all ${f.is_active ? 'text-orange-400 bg-orange-500/10' : 'text-slate-400 bg-white/5'}`}>{f.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>}
                  <button onClick={() => handleDelete(f.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            </motion.div>
          )
        })}</div>
      }

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-[#0d1424] border border-white/[0.1] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div><p className="text-[8px] font-bold uppercase tracking-[0.3em] text-orange-500">Feature an Arena</p><h3 className="text-lg font-black uppercase mt-1">Add Featured Listing</h3></div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><XCircle size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Select Arena *</label>
                  <select value={form.arena_id} onChange={e => setForm({ ...form, arena_id: e.target.value })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none text-white">
                    <option value="">Choose...</option>{allArenas.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Start *</label><input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none [color-scheme:dark]" /></div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">End *</label><input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none [color-scheme:dark]" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">City</label><input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" /></div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">State</label><input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Priority (1-10)</label><input type="number" min="1" max="10" value={form.priority} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" /></div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Payment (₹)</label><input type="number" min="0" value={form.payment_amount} onChange={e => setForm({ ...form, payment_amount: parseFloat(e.target.value) })} className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none" /></div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleAdd} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black py-3 rounded-lg font-black uppercase text-[10px] flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Star size={14} /> Feature</>}
                  </motion.button>
                  <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 hover:text-white rounded-lg font-black uppercase text-[10px]">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ARENA APPROVAL PANEL ────────────────────────────────────────────────────
function ArenaApprovalPanel() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionNote, setActionNote] = useState({})
  const [processing, setProcessing] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [editingArena, setEditingArena] = useState(null)

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('arena_approval_requests')
      .select(`*, arenas(id, name, city, courts(id, name, price_per_hour, is_active, sports(name)))`)
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
    setLoading(false)
  }

  const handleApprove = async (req) => {
    setProcessing(req.id)
    try {
      const payload = req.payload || {}

      if (req.request_type === 'new_arena') {
        // Create the arena from payload
        const { data: newArena, error } = await supabase.from('arenas').insert({
          name: payload.name,
          location: payload.address,
          city: payload.city || '',
          state: payload.state || '',
          phone: payload.phone,
          description: payload.description || '',
          venue_manager_id: req.requested_by,
          is_active: true,
        }).select().single()

        if (error) throw error

        // Insert courts per sport
        for (const [sportName, courts] of Object.entries(payload.sports || {})) {
          const { data: sportRow } = await supabase.from('sports').select('id').eq('name', sportName).single()
          if (!sportRow) continue
          // Link sport
          await supabase.from('arena_sports').insert({ arena_id: newArena.id, sport_id: sportRow.id })
          // Insert courts
          for (const court of courts) {
            await supabase.from('courts').insert({ arena_id: newArena.id, sport_id: sportRow.id, name: court.name, price_per_hour: court.pricing?.[0]?.price || 0, is_active: true })
          }
        }
      } else if (req.request_type === 'edit_arena' && req.arena_id) {
        await supabase.from('arenas').update({
          name: payload.name,
          location: payload.address,
          city: payload.city || '',
          state: payload.state || '',
          phone: payload.phone,
          description: payload.description || '',
        }).eq('id', req.arena_id)

        // Update/add courts
        for (const [sportName, courts] of Object.entries(payload.sports || {})) {
          const { data: sportRow } = await supabase.from('sports').select('id').eq('name', sportName).single()
          if (!sportRow) continue
          for (const court of courts) {
            if (court.dbId) {
              await supabase.from('courts').update({ name: court.name, price_per_hour: court.pricing?.[0]?.price || 0 }).eq('id', court.dbId)
            } else {
              await supabase.from('courts').insert({ arena_id: req.arena_id, sport_id: sportRow.id, name: court.name, price_per_hour: court.pricing?.[0]?.price || 0, is_active: true })
            }
          }
        }
      }

      // Mark request as approved
      await supabase.from('arena_approval_requests').update({
        status: 'approved',
        admin_note: actionNote[req.id] || 'Approved',
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      }).eq('id', req.id)

      // Notify owner
      await supabase.from('notifications').insert({
        user_id: req.requested_by,
        type: 'approval',
        message: `Your ${req.request_type?.replace(/_/g, ' ')} request has been approved! ✅`
      })

      await fetchRequests()
    } catch (err) {
      alert('Error approving: ' + err.message)
    }
    setProcessing(null)
  }

  const handleReject = async (req) => {
    setProcessing(req.id)
    await supabase.from('arena_approval_requests').update({
      status: 'rejected',
      admin_note: actionNote[req.id] || 'Rejected by admin',
      reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString(),
    }).eq('id', req.id)

    await supabase.from('notifications').insert({
      user_id: req.requested_by,
      type: 'approval',
      message: `Your ${req.request_type?.replace(/_/g, ' ')} request was rejected. ${actionNote[req.id] ? 'Note: ' + actionNote[req.id] : ''}`
    })

    await fetchRequests()
    setProcessing(null)
  }

  const handleSaveCourtEdit = async (courtId, name, price) => {
    await supabase.from('courts').update({ name, price_per_hour: price }).eq('id', courtId)
    setEditingArena(null)
    await fetchRequests()
  }

  const handleAddCourt = async (arenaId, sportName, courtName, price) => {
    const { data: sportRow } = await supabase.from('sports').select('id').eq('name', sportName).single()
    if (!sportRow) { alert('Sport not found'); return }
    await supabase.from('courts').insert({ arena_id: arenaId, sport_id: sportRow.id, name: courtName, price_per_hour: price, is_active: true })
    await fetchRequests()
  }

  const pending = requests.filter(r => r.status === 'pending')
  const reviewed = requests.filter(r => r.status !== 'pending')

  const REQ_TYPE_LABEL = { new_arena: 'New Arena', edit_arena: 'Arena Edit', add_court: 'Add Court', edit_court: 'Edit Court' }

  return (
    <div className="space-y-6">
      <div className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-black uppercase text-base">Arena Approval Requests</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{pending.length} pending · {reviewed.length} reviewed</p>
          </div>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
        : requests.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
            <p className="font-black uppercase">No Pending Requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 && <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Pending Review</p>}
            {[...pending, ...reviewed].map(req => (
              <motion.div key={req.id} layout className={`bg-[#0b0f1a] border rounded-2xl overflow-hidden ${req.status === 'pending' ? 'border-yellow-500/20' : req.status === 'approved' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <div className="p-5 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-sm">{REQ_TYPE_LABEL[req.request_type] || req.request_type}</h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                        req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>{req.status.toUpperCase()}</span>
                    </div>
                    <p className="text-[9px] text-slate-500">
                      Arena: {req.arenas?.name || req.payload?.name || '—'} · {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                    {req.admin_note && <p className="text-[9px] text-slate-400 mt-1">Note: {req.admin_note}</p>}
                  </div>
                  <span className="text-slate-500 text-[10px]">{expanded === req.id ? '▲' : '▼'}</span>
                </div>

                <AnimatePresence>
                  {expanded === req.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 p-5 space-y-4">
                      {/* PAYLOAD PREVIEW */}
                      {req.payload && (
                        <div className="bg-black/30 rounded-xl p-4 space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Request Details</p>
                          {req.payload.name && <p className="text-[10px]"><span className="text-slate-500">Name:</span> {req.payload.name}</p>}
                          {req.payload.address && <p className="text-[10px]"><span className="text-slate-500">Address:</span> {req.payload.address}</p>}
                          {req.payload.city && <p className="text-[10px]"><span className="text-slate-500">City:</span> {req.payload.city}</p>}
                          {req.payload.phone && <p className="text-[10px]"><span className="text-slate-500">Phone:</span> {req.payload.phone}</p>}
                          {req.payload.sports && Object.entries(req.payload.sports).map(([sport, courts]) => (
                            <div key={sport} className="mt-2">
                              <p className="text-[9px] text-emerald-400 font-black uppercase">{sport}</p>
                              {courts.map((c, i) => <p key={i} className="text-[9px] text-slate-400 pl-3">• {c.name} — ₹{c.pricing?.[0]?.price}/hr</p>)}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ADMIN NOTE */}
                      {req.status === 'pending' && (
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">Admin Note (optional)</label>
                          <input type="text" placeholder="Add a note for the owner..."
                            value={actionNote[req.id] || ''}
                            onChange={e => setActionNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-emerald-500/50 text-white" />
                        </div>
                      )}

                      {/* ACTIONS */}
                      {req.status === 'pending' && (
                        <div className="flex gap-3">
                          <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleApprove(req)} disabled={processing === req.id}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                            {processing === req.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve & Apply
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleReject(req)} disabled={processing === req.id}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                            Reject
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )
      }

      {/* DIRECT COURT EDIT BY ADMIN */}
      <div className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
        <h3 className="font-black uppercase text-sm mb-4">Direct Court Management</h3>
        <p className="text-[9px] text-slate-500 mb-4">Admins can directly edit or add courts without owner requests.</p>
        <AdminArenaEditor onAddCourt={handleAddCourt} />
      </div>

      {/* COURT EDIT MODAL */}
      <AnimatePresence>
        {editingArena && (
          <CourtEditModal court={editingArena.court} onClose={() => setEditingArena(null)} onSave={handleSaveCourtEdit} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AdminArenaEditor({ onAddCourt }) {
  const [arenas, setArenas] = useState([])
  const [selectedArena, setSelectedArena] = useState(null)
  const [courts, setCourts] = useState([])
  const [showAddCourt, setShowAddCourt] = useState(false)
  const [newCourt, setNewCourt] = useState({ sport: 'Cricket', name: '', price: 500 })
  const [editingCourt, setEditingCourt] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('arenas').select('id, name, city').eq('is_active', true).then(({ data }) => { if (data) setArenas(data) })
  }, [])

  const loadCourts = async (arenaId) => {
    const { data } = await supabase.from('courts').select('id, name, price_per_hour, is_active, sports(name, emoji)').eq('arena_id', arenaId)
    if (data) setCourts(data)
  }

  const handleSelectArena = async (arena) => {
    setSelectedArena(arena)
    await loadCourts(arena.id)
  }

  const handleSaveEdit = async (courtId, name, price) => {
    await supabase.from('courts').update({ name, price_per_hour: price }).eq('id', courtId)
    setEditingCourt(null)
    await loadCourts(selectedArena.id)
  }

  const handleAdd = async () => {
    if (!newCourt.name) { alert('Enter court name'); return }
    setSaving(true)
    await onAddCourt(selectedArena.id, newCourt.sport, newCourt.name, newCourt.price)
    await loadCourts(selectedArena.id)
    setNewCourt({ sport: 'Cricket', name: '', price: 500 })
    setShowAddCourt(false)
    setSaving(false)
  }

  const toggleCourtActive = async (courtId, current) => {
    await supabase.from('courts').update({ is_active: !current }).eq('id', courtId)
    await loadCourts(selectedArena.id)
  }

  return (
    <div className="space-y-4">
      <select onChange={e => handleSelectArena(arenas.find(a => a.id === e.target.value))}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-bold outline-none text-white">
        <option value="">Select an arena...</option>
        {arenas.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
      </select>

      {selectedArena && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase">{courts.length} Courts</p>
            <button onClick={() => setShowAddCourt(true)} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black">
              <Plus size={12} /> Add Court
            </button>
          </div>

          {courts.map(court => (
            <div key={court.id} className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-xl border border-white/5">
              {editingCourt?.id === court.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input value={editingCourt.name} onChange={e => setEditingCourt({ ...editingCourt, name: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white outline-none w-32" />
                  <span className="text-slate-500 text-[10px]">₹</span>
                  <input type="number" value={editingCourt.price} onChange={e => setEditingCourt({ ...editingCourt, price: parseInt(e.target.value) })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white outline-none w-20" />
                  <button onClick={() => handleSaveEdit(court.id, editingCourt.name, editingCourt.price)} className="bg-emerald-500 text-black px-3 py-1.5 rounded-lg text-[9px] font-black">Save</button>
                  <button onClick={() => setEditingCourt(null)} className="text-slate-500 text-[9px] font-black">Cancel</button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-black">{court.name}</p>
                    <p className="text-[9px] text-slate-500">{court.sports?.emoji} {court.sports?.name} · ₹{court.price_per_hour}/hr</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCourtActive(court.id, court.is_active)} className={`text-[8px] font-black px-2 py-1 rounded-full ${court.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {court.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => setEditingCourt({ id: court.id, name: court.name, price: court.price_per_hour })} className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-white">
                      <Edit3 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showAddCourt && (
            <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20 space-y-3">
              <p className="text-[9px] font-black text-emerald-400 uppercase">Add New Court</p>
              <div className="grid grid-cols-3 gap-2">
                <select value={newCourt.sport} onChange={e => setNewCourt({ ...newCourt, sport: e.target.value })}
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white outline-none">
                  {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" placeholder="Court name" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })}
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white outline-none" />
                <input type="number" placeholder="₹/hr" value={newCourt.price} onChange={e => setNewCourt({ ...newCourt, price: parseInt(e.target.value) })}
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving} className="flex-1 bg-emerald-500 text-black py-2 rounded-lg font-black text-[10px] uppercase disabled:opacity-50 flex items-center justify-center gap-1">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Court
                </button>
                <button onClick={() => setShowAddCourt(false)} className="px-4 py-2 text-slate-500 text-[10px] font-black">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CourtEditModal({ court, onClose, onSave }) {
  const [name, setName] = useState(court.name)
  const [price, setPrice] = useState(court.price_per_hour)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-[#0d1424] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h3 className="font-black uppercase">Edit Court</h3>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
        <input type="number" value={price} onChange={e => setPrice(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
        <div className="flex gap-3">
          <button onClick={() => onSave(court.id, name, price)} className="flex-1 bg-emerald-500 text-black py-3 rounded-xl font-black uppercase text-[10px]">Save</button>
          <button onClick={onClose} className="px-6 py-3 text-slate-500 font-black text-[10px]">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const AdminControlCenter = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [stats, setStats] = useState({ bookings: 0, arenas: 0, players: 0, groups: 0 });

  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      const [arenasRes, playersRes, groupsRes, notifRes, bookingsRes, reqRes] = await Promise.all([
        supabase.from('arenas').select('id, name, location, city, is_active').limit(50),
        supabase.from('profiles').select('id, name, email, created_at').limit(100),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('arena_approval_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      if (arenasRes.data) setArenas(arenasRes.data)
      if (playersRes.data) setAllPlayers(playersRes.data)
      if (notifRes.data) setNotifications(notifRes.data)
      setPendingRequests(reqRes.count || 0)
      setStats({ bookings: bookingsRes.count || 0, arenas: arenasRes.data?.length || 0, players: playersRes.data?.length || 0, groups: groupsRes.count || 0 })
    } catch (err) { console.error('Admin fetch error:', err) }
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const filteredPlayers = allPlayers.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const NAV = [
    { id: "dashboard", label: "Analytics", icon: <BarChart2 size={15} /> },
    { id: "featured", label: "Featured", icon: <Star size={15} /> },
    { id: "approvals", label: "Approvals", icon: <Clock size={15} />, badge: pendingRequests },
    { id: "arenas", label: "Arena Control", icon: <Layers size={15} />, badge: arenas.length },
    { id: "reports", label: "Player Reports", icon: <AlertCircle size={15} /> },
    { id: "banned", label: "Banned", icon: <Ban size={15} /> },
    { id: "players", label: "All Players", icon: <Users size={15} /> },
    { id: "chat", label: "Admin Chat", icon: <MessageCircle size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-black to-[#050818] text-white flex">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 -left-96 w-96 h-96 bg-blue-500/15 blur-[150px] rounded-full" />
        <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-96 -right-96 w-96 h-96 bg-green-500/15 blur-[150px] rounded-full" />
      </div>

      <aside className="w-72 bg-[#080d18] hidden lg:flex flex-col border-r border-white/[0.05] sticky top-0 h-screen shrink-0 z-40">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40"><ShieldCheck size={20} className="text-black" /></div>
            <div><h1 className="text-sm font-black uppercase tracking-tight leading-none">Admin <span className="text-emerald-400">Hub</span></h1><p className="text-[7px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Control Panel v2.0</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
              {tab.icon} {tab.label}
              {tab.badge > 0 && <span className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-black/30" : "bg-orange-500/20 text-orange-400"}`}>{tab.badge}</span>}
            </motion.button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.05]">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={14} /> Kill Session
          </motion.button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-600">Control Terminal</p>
            <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">Admin <span className="text-emerald-400">Dashboard</span></h2>
          </div>
          <div className="relative">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowNotifs(!showNotifs)} className="relative w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.07] rounded-xl hover:border-emerald-500/30 transition-all">
              <Bell size={16} className="text-slate-400" />
              {unread > 0 && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[7px] font-black flex items-center justify-center text-white">{unread}</motion.span>}
            </motion.button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-14 w-80 bg-[#0d1424] border border-white/[0.08] rounded-2xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-[9px] font-black uppercase text-white">Notifications</span>
                    <button onClick={markAllRead} className="text-[8px] font-bold text-emerald-500">Mark all</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? <p className="text-center text-[9px] text-slate-500 py-6">No notifications</p>
                      : notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] ${!n.is_read ? "bg-emerald-500/[0.05]" : "opacity-50"}`}>
                          <div className="flex-1"><p className="text-[10px] font-medium text-slate-200">{n.message}</p><p className="text-[8px] text-slate-600 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p></div>
                        </div>
                      ))}
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
                <StatCard label="Pending Approvals" value={pendingRequests} icon={<Clock size={16} />} color="text-orange-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Top Arenas</p>
                  {arenas.length === 0 ? <p className="text-slate-500 text-[10px]">No arenas yet</p>
                    : <div className="space-y-4">{arenas.slice(0, 5).map(a => (<div key={a.id} className="space-y-2"><div className="flex justify-between"><span className="text-[10px] font-black">{a.name}</span><span className="text-[9px] text-emerald-400">{a.city}</span></div><MiniBar value={30} max={50} /></div>))}</div>}
                </div>
                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">System Status</p>
                  <div className="space-y-3">
                    {[['Database', '● Online', 'text-green-400'], ['Payments', '● Razorpay', 'text-green-400'], ['Realtime', '● Active', 'text-green-400'], ['Pending Requests', pendingRequests, 'text-orange-400']].map(([l, v, c]) => (
                      <div key={l} className="flex justify-between items-center text-[10px]"><span className="text-slate-400">{l}</span><span className={`font-bold ${c}`}>{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "featured" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FeaturedArenaManager /></motion.div>}

          {activeTab === "approvals" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ArenaApprovalPanel /></motion.div>}

          {activeTab === "arenas" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Layers size={20} /></div>
                <div><h3 className="font-black uppercase text-base">Arena Inventory</h3><p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{arenas.length} arenas in DB</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arenas.map(arena => (
                  <div key={arena.id} className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div><h4 className="font-black text-lg">{arena.name}</h4>
                        <div className="flex items-center gap-1.5 mt-2 text-slate-500"><MapPin size={11} className="text-emerald-500" /><p className="text-[9px] font-medium">{arena.location} · {arena.city}</p></div>
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${arena.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{arena.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Player Reports</h3>
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40"><ShieldCheck size={50} className="mb-4" /><p className="text-sm font-black uppercase">No Active Reports</p></div>
            </motion.div>
          )}

          {activeTab === "banned" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Banned Players</h3>
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40"><Unlock size={50} className="mb-4" /><p className="text-sm font-black uppercase">No Banned Players</p></div>
            </motion.div>
          )}

          {activeTab === "players" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h3 className="text-xl font-black uppercase">Player Management</h3><p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{allPlayers.length} total players</p></div>
                <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} /><input type="text" placeholder="Search players..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-white/[0.07] rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold outline-none focus:border-emerald-500/50 transition-all" /></div>
              </div>
              <div className="space-y-2">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="bg-[#0b0f1a] border border-white/[0.06] p-4 rounded-xl hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div><h4 className="font-black text-sm">{player.name || 'Unknown'}</h4><p className="text-[9px] text-slate-500">{player.email}</p><p className="text-[8px] text-slate-600 mt-1">Joined: {new Date(player.created_at).toLocaleDateString()}</p></div>
                      <Eye size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h3 className="text-xl font-black uppercase">Admin Chat Room</h3>
              <div className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {chatMessages.length === 0 ? <p className="text-center text-slate-600 text-[10px] pt-10">No messages yet</p>
                    : chatMessages.map(msg => (<div key={msg.id} className="flex justify-end"><div className="max-w-xs px-4 py-2.5 rounded-lg text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-slate-200">{msg.message}</div></div>))}
                </div>
                <div className="border-t border-white/[0.06] p-4 flex gap-2 bg-black/40">
                  <input type="text" placeholder="Type message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && setChatMessages(prev => [...prev, { id: Date.now(), message: chatInput, created_at: new Date().toISOString() }]) && setChatInput("")}
                    className="flex-1 bg-black/40 border border-white/[0.07] rounded-lg px-4 py-2.5 text-[10px] font-bold outline-none focus:border-emerald-500/50 text-white placeholder-slate-600" />
                  <motion.button whileTap={{ scale: 0.92 }} onClick={() => { if (chatInput.trim()) { setChatMessages(prev => [...prev, { id: Date.now(), message: chatInput, created_at: new Date().toISOString() }]); setChatInput("") } }} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg font-black flex items-center gap-2"><Send size={14} /></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminControlCenter;
