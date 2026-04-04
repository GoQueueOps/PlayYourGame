import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers, Plus, Edit3, ShieldCheck, MapPin,
  BarChart2, Users, XCircle, Upload, UserPlus,
  Trash, Loader2, Calendar, Clock, CheckCircle2,
  AlertCircle, LogOut, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const AMENITIES_OPTIONS = [
  { id: "parking", label: "Free Parking" },
  { id: "wifi", label: "Free Wi-Fi" },
  { id: "snacks", label: "Snacks & Drinks" },
  { id: "ac", label: "Air Conditioning" },
  { id: "firstaid", label: "First Aid" },
];

const SPORTS_LIST = ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "Pickleball"];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArena, setEditingArena] = useState(null);
  const [creatingArena, setCreatingArena] = useState(false);

  useEffect(() => {
    if (user) fetchAll()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Fetch owner's arenas
      const { data: arenasData } = await supabase
        .from('arenas')
        .select(`
          id, name, location, city, state, phone, is_active, description,
          courts (id, name, price_per_hour, is_active, sports(name)),
          play_area_amenities (amenities(name)),
          arena_sports (sports(name, emoji))
        `)
        .eq('venue_manager_id', user.id)
        .order('created_at', { ascending: false })

      if (arenasData) setArenas(arenasData)

      // Fetch bookings for owner's arenas
      if (arenasData?.length > 0) {
        const arenaIds = arenasData.map(a => a.id)
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            id, booking_date, start_time, end_time, price, status,
            sport_type, arena_id, court_id,
            arenas (name),
            courts (name)
          `)
          .in('arena_id', arenaIds)
          .order('booking_date', { ascending: false })
          .limit(50)

        if (bookingsData) setBookings(bookingsData)

        // Build revenue chart data (last 7 days)
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return {
            name: d.toLocaleDateString('en-GB', { weekday: 'short' }),
            date: d.toLocaleDateString('en-CA'),
            revenue: 0
          }
        })

        bookingsData?.filter(b => b.status === 'confirmed' || b.status === 'completed').forEach(b => {
          const day = last7.find(d => d.date === b.booking_date)
          if (day) day.revenue += b.price || 0
        })

        setRevenueData(last7)
      }
    } catch (err) {
      console.error('Owner dashboard fetch error:', err)
    }
    setLoading(false)
  }

  const handleSaveArena = async (formData) => {
    try {
      if (editingArena) {
        // Update arena basic info
        await supabase.from('arenas').update({
          name: formData.name,
          location: formData.address,
          phone: formData.phone,
          description: formData.description || '',
        }).eq('id', editingArena.id)

        // Update courts
        for (const [sportName, courts] of Object.entries(formData.sports || {})) {
          // Find sport id
          const { data: sportRow } = await supabase.from('sports').select('id').eq('name', sportName).single()
          if (!sportRow) continue

          for (const court of courts) {
            if (court.dbId) {
              await supabase.from('courts').update({
                name: court.name,
                price_per_hour: court.pricing?.[0]?.price || 0,
              }).eq('id', court.dbId)
            } else {
              await supabase.from('courts').insert({
                arena_id: editingArena.id,
                sport_id: sportRow.id,
                name: court.name,
                price_per_hour: court.pricing?.[0]?.price || 0,
                is_active: true,
              })
            }
          }
        }
        setEditingArena(null)
      } else {
        // Create new arena
        const { data: newArena, error } = await supabase.from('arenas').insert({
          name: formData.name,
          location: formData.address,
          city: formData.city || '',
          state: formData.state || '',
          phone: formData.phone,
          description: formData.description || '',
          venue_manager_id: user.id,
          is_active: false, // pending approval
        }).select().single()

        if (error) throw error

        // Insert courts per sport
        for (const [sportName, courts] of Object.entries(formData.sports || {})) {
          const { data: sportRow } = await supabase.from('sports').select('id').eq('name', sportName).single()
          if (!sportRow) continue

          // Link sport to arena
          await supabase.from('arena_sports').insert({ arena_id: newArena.id, sport_id: sportRow.id }).onConflict('arena_id, sport_id')

          for (const court of courts) {
            await supabase.from('courts').insert({
              arena_id: newArena.id,
              sport_id: sportRow.id,
              name: court.name,
              price_per_hour: court.pricing?.[0]?.price || 0,
              is_active: true,
            })
          }
        }

        // Insert amenities
        for (const amenityId of formData.amenities || []) {
          const { data: amenityRow } = await supabase.from('amenities').select('id').eq('name', amenityId).single()
          if (amenityRow) {
            await supabase.from('play_area_amenities').insert({ arena_id: newArena.id, amenity_id: amenityRow.id })
          }
        }

        setCreatingArena(false)
      }
      await fetchAll()
    } catch (err) {
      alert('Error saving arena: ' + err.message)
    }
  }

  const totals = useMemo(() => {
    const revenue = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).reduce((sum, b) => sum + (b.price || 0), 0)
    const courts = arenas.reduce((sum, a) => sum + (a.courts?.length || 0), 0)
    const pending = arenas.filter(a => !a.is_active).length
    return { revenue, bookings: bookings.length, courts, pending }
  }, [arenas, bookings])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })

  const STATUS_STYLES = {
    confirmed: { label: 'Confirmed', cls: 'bg-emerald-500/10 text-emerald-400' },
    pending: { label: 'Pending', cls: 'bg-yellow-500/10 text-yellow-400' },
    completed: { label: 'Completed', cls: 'bg-slate-500/10 text-slate-400' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400' },
    payment_verified: { label: 'Paid', cls: 'bg-cyan-500/10 text-cyan-400' },
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#080d18] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" size={20} />
          <span className="font-black uppercase tracking-tighter text-sm">Owner<span className="text-emerald-400">Hub</span></span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Analytics', icon: <BarChart2 size={16} /> },
            { id: 'arenas', label: 'Arena Control', icon: <Layers size={16} />, badge: arenas.length },
            { id: 'bookings', label: 'Bookings', icon: <Calendar size={16} />, badge: bookings.filter(b => b.status === 'pending').length },
            { id: 'managers', label: 'Managers', icon: <Users size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}>
              {tab.icon} {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-black/30' : 'bg-orange-500/20 text-orange-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">Owner Portal</p>
            <h1 className="text-2xl font-black uppercase tracking-tight mt-0.5">
              {activeTab === 'dashboard' ? 'Analytics' : activeTab === 'arenas' ? 'Arena Control' : activeTab === 'bookings' ? 'Bookings' : 'Managers'}
            </h1>
          </div>
          <button onClick={fetchAll} className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-emerald-500" size={36} />
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Total Revenue</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totals.revenue.toLocaleString()}</h3>
                  </div>
                  <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Total Bookings</p>
                    <h3 className="text-2xl font-black text-blue-400 mt-1">{totals.bookings}</h3>
                  </div>
                  <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Total Courts</p>
                    <h3 className="text-2xl font-black text-purple-400 mt-1">{totals.courts}</h3>
                  </div>
                  <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Pending Approval</p>
                    <h3 className="text-2xl font-black text-orange-400 mt-1">{totals.pending}</h3>
                  </div>
                </div>

                {/* REVENUE CHART */}
                <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6">Revenue — Last 7 Days</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d1424', border: 'none', borderRadius: '12px' }}
                          formatter={(v) => [`₹${v}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RECENT BOOKINGS */}
                <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">Recent Bookings</h3>
                  {bookings.length === 0 ? (
                    <p className="text-slate-600 text-[10px] text-center py-8">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map(b => {
                        const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                        return (
                          <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <div>
                              <p className="text-[11px] font-black">{b.arenas?.name || b.sport_type}</p>
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                                <Calendar size={10} />
                                <span>{formatDate(b.booking_date)}</span>
                                {b.start_time && <><Clock size={10} /><span>{b.start_time} → {b.end_time}</span></>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[8px] font-black px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                              <span className="text-[11px] font-black text-emerald-400">₹{b.price}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ARENAS ── */}
            {activeTab === "arenas" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <div>
                    <h2 className="font-black uppercase text-xl">Arena Inventory</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{arenas.length} arenas registered</p>
                  </div>
                  <button onClick={() => setCreatingArena(true)}
                    className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus size={16} /> Add New Arena
                  </button>
                </div>

                {arenas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Layers size={48} className="mb-4" />
                    <p className="font-black uppercase">No Arenas Yet</p>
                    <p className="text-[10px] mt-2">Click "Add New Arena" to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {arenas.map(arena => (
                      <div key={arena.id} className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-black">{arena.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin size={12} /> {arena.location}{arena.city ? `, ${arena.city}` : ''}
                            </p>
                            {arena.phone && (
                              <p className="text-[9px] text-slate-600 mt-0.5">📞 {arena.phone}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-full ${arena.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {arena.is_active ? '● Active' : '⏳ Pending'}
                            </span>
                            <button onClick={() => setEditingArena(arena)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white">
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex gap-3">
                            <div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase">Courts</p>
                              <p className="text-xs font-black">{arena.courts?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-slate-500 uppercase">Bookings</p>
                              <p className="text-xs font-black">{bookings.filter(b => b.arena_id === arena.id).length}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {arena.arena_sports?.map((as, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase">
                                {as.sports?.emoji} {as.sports?.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* COURTS LIST */}
                        {arena.courts?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <p className="text-[8px] font-bold text-slate-500 uppercase">Courts</p>
                            {arena.courts.map(court => (
                              <div key={court.id} className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-xl">
                                <span className="text-[10px] font-bold">{court.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-emerald-400 font-bold">₹{court.price_per_hour}/hr</span>
                                  <span className={`w-1.5 h-1.5 rounded-full ${court.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="font-black uppercase text-xl">All Bookings</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{bookings.length} total</p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-black">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg">
                      {bookings.filter(b => b.status === 'confirmed').length} Confirmed
                    </span>
                    <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-lg">
                      {bookings.filter(b => b.status === 'pending').length} Pending
                    </span>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Calendar size={48} className="mb-4" />
                    <p className="font-black uppercase">No Bookings Yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => {
                      const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
                      return (
                        <div key={b.id} className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-sm">{b.arenas?.name || '—'}</h4>
                                <span className="text-[8px] text-slate-500">·</span>
                                <span className="text-[9px] text-slate-400">{b.courts?.name || b.sport_type}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-[9px] text-slate-500 font-bold uppercase">
                                <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(b.booking_date)}</span>
                                {b.start_time && <span className="flex items-center gap-1"><Clock size={10} /> {b.start_time} → {b.end_time}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[8px] font-black px-3 py-1.5 rounded-full ${s.cls}`}>{s.label}</span>
                              <span className="text-lg font-black text-emerald-400">₹{b.price}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MANAGERS ── */}
            {activeTab === "managers" && (
              <div className="bg-[#0b0f1a] p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <UserPlus className="text-slate-700 mb-4" size={48} />
                <h3 className="font-black uppercase text-lg">Manager Portal</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 mb-6">
                  Assign venue managers to your arenas
                </p>
                <p className="text-[10px] text-slate-600 max-w-sm">
                  Contact your super admin to assign a venue manager role to a user,
                  then they'll be able to manage your specific arena.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ARENA FORM MODAL */}
      <AnimatePresence>
        {(creatingArena || editingArena) && (
          <ArenaFormModal
            arena={editingArena}
            onClose={() => { setCreatingArena(false); setEditingArena(null); }}
            onSave={handleSaveArena}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ARENA FORM MODAL ─────────────────────────────────────────────────────────
function ArenaFormModal({ arena, onClose, onSave }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(() => {
    if (arena) {
      // Map DB arena to form format
      const sports = {}
      arena.courts?.forEach(court => {
        const sportName = court.sports?.name
        if (!sportName) return
        if (!sports[sportName]) sports[sportName] = []
        sports[sportName].push({
          dbId: court.id,
          name: court.name,
          pricing: [{ startTime: '06:00', endTime: '22:00', price: court.price_per_hour || 0 }]
        })
      })
      return {
        name: arena.name || '',
        address: arena.location || '',
        city: arena.city || '',
        state: arena.state || '',
        phone: arena.phone || '',
        description: arena.description || '',
        logo: null,
        images: [],
        amenities: arena.play_area_amenities?.map(pa => pa.amenities?.name).filter(Boolean) || [],
        sports,
      }
    }
    return { name: '', address: '', city: '', state: '', phone: '', description: '', logo: null, images: [], amenities: [], sports: {} }
  })

  const logoInputRef = useRef(null)

  const toggleAmenity = (id) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) ? prev.amenities.filter(a => a !== id) : [...prev.amenities, id]
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (f) => setFormData(prev => ({ ...prev, logo: f.target.result }))
      reader.readAsDataURL(file)
    }
  }

  const addSport = (sport) => {
    if (!formData.sports[sport]) {
      setFormData(prev => ({
        ...prev,
        sports: { ...prev.sports, [sport]: [{ name: 'Court 1', pricing: [{ startTime: '06:00', endTime: '22:00', price: 500 }] }] }
      }))
    }
  }

  const addCourt = (sport) => {
    setFormData(prev => ({
      ...prev,
      sports: { ...prev.sports, [sport]: [...prev.sports[sport], { name: `Court ${prev.sports[sport].length + 1}`, pricing: [{ startTime: '06:00', endTime: '22:00', price: 500 }] }] }
    }))
  }

  const removeSport = (sport) => {
    const updated = { ...formData.sports }
    delete updated[sport]
    setFormData({ ...formData, sports: updated })
  }

  const updateCourtName = (sport, cIdx, value) => {
    const s = { ...formData.sports }
    s[sport][cIdx].name = value
    setFormData({ ...formData, sports: s })
  }

  const removeCourt = (sport, cIdx) => {
    const s = { ...formData.sports }
    s[sport] = s[sport].filter((_, i) => i !== cIdx)
    setFormData({ ...formData, sports: s })
  }

  const updatePricing = (sport, cIdx, pIdx, field, value) => {
    const s = { ...formData.sports }
    s[sport][cIdx].pricing[pIdx][field] = value
    setFormData({ ...formData, sports: s })
  }

  const addTimeSlot = (sport, cIdx) => {
    const s = { ...formData.sports }
    s[sport][cIdx].pricing.push({ startTime: '06:00', endTime: '22:00', price: 500 })
    setFormData({ ...formData, sports: s })
  }

  const removeTimeSlot = (sport, cIdx, pIdx) => {
    const s = { ...formData.sports }
    s[sport][cIdx].pricing = s[sport][cIdx].pricing.filter((_, i) => i !== pIdx)
    setFormData({ ...formData, sports: s })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex justify-center overflow-y-auto p-4 py-10"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#0d1424] border border-white/10 w-full max-w-3xl rounded-3xl h-fit overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0d1424] z-10">
          <div>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{arena ? 'Edit Arena' : 'New Arena'}</p>
            <h3 className="text-xl font-black uppercase">{arena ? arena.name : 'Add New Arena'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* BASIC INFO */}
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Basic Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Arena Name *</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Phone *</label>
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">City</label>
                <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">State</label>
                <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Full Address *</label>
                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none h-20 text-white" required />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none h-16 text-white" placeholder="Brief description of your arena..." />
              </div>
            </div>
          </section>

          {/* LOGO */}
          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Arena Logo</p>
            <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all cursor-pointer w-48"
              onClick={() => logoInputRef.current.click()}>
              {formData.logo
                ? <img src={formData.logo} alt="Logo" className="w-12 h-12 mx-auto rounded object-cover mb-2" />
                : <Upload size={20} className="mx-auto mb-2 text-slate-500" />
              }
              <p className="text-[10px] font-bold text-slate-400">{formData.logo ? 'Change Logo' : 'Upload Logo'}</p>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </section>

          {/* AMENITIES */}
          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(amenity => (
                <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)}
                  className={`px-4 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                    formData.amenities.includes(amenity.id)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-transparent text-slate-500 hover:border-white/20'
                  }`}>
                  {amenity.label}
                </button>
              ))}
            </div>
          </section>

          {/* SPORTS & COURTS */}
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sports & Court Pricing</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SPORTS_LIST.map(s => (
                <button key={s} type="button" onClick={() => addSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${
                    formData.sports[s] ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/30'
                  }`}>
                  + {s}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {Object.entries(formData.sports).map(([sport, courts]) => (
                <div key={sport} className="bg-black/30 rounded-2xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-emerald-400">{sport}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addCourt(sport)}
                        className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-500/20">
                        + Add Court
                      </button>
                      <button type="button" onClick={() => removeSport(sport)}
                        className="text-[9px] font-black bg-red-500/10 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/20">
                        Remove
                      </button>
                    </div>
                  </div>

                  {courts.map((court, cIdx) => (
                    <div key={cIdx} className="bg-white/5 p-4 rounded-xl mb-3 border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <input value={court.name} onChange={e => updateCourtName(sport, cIdx, e.target.value)}
                          className="bg-transparent font-black text-xs outline-none text-white w-1/2" />
                        <button type="button" onClick={() => removeCourt(sport, cIdx)}
                          className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors">
                          <Trash size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {court.pricing.map((p, pIdx) => (
                          <div key={pIdx} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg">
                            <input type="time" value={p.startTime} onChange={e => updatePricing(sport, cIdx, pIdx, 'startTime', e.target.value)}
                              className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <span className="text-slate-600 text-[10px]">to</span>
                            <input type="time" value={p.endTime} onChange={e => updatePricing(sport, cIdx, pIdx, 'endTime', e.target.value)}
                              className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <span className="text-slate-500 text-[10px]">₹</span>
                            <input type="number" value={p.price} onChange={e => updatePricing(sport, cIdx, pIdx, 'price', parseInt(e.target.value))}
                              className="bg-black/40 p-1.5 rounded text-[10px] w-20 outline-none text-white" />
                            {court.pricing.length > 1 && (
                              <button type="button" onClick={() => removeTimeSlot(sport, cIdx, pIdx)}
                                className="text-slate-600 hover:text-red-400 ml-auto transition-colors">
                                <Trash size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addTimeSlot(sport, cIdx)}
                          className="w-full py-1.5 border border-dashed border-white/10 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-white/5">
                          + Add Time Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* NOTICE */}
          {!arena && (
            <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
              <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-400/80 font-bold">
                Your arena will be submitted for admin approval. It will go live once approved.
              </p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-emerald-500 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><CheckCircle2 size={16} /> {arena ? 'Update Arena' : 'Submit for Approval'}</>
            }
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default OwnerDashboard;
