import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers, Plus, Edit3, ShieldCheck, MapPin,
  BarChart2, Users, XCircle, Upload, UserPlus,
  Trash, Loader2, Calendar, Clock, CheckCircle2,
  AlertCircle, LogOut, RefreshCw, Send
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

const STATUS_STYLES = {
  confirmed:        { label: 'Confirmed',  cls: 'bg-emerald-500/10 text-emerald-400' },
  pending:          { label: 'Pending',    cls: 'bg-yellow-500/10 text-yellow-400' },
  completed:        { label: 'Completed',  cls: 'bg-slate-500/10 text-slate-400' },
  cancelled:        { label: 'Cancelled',  cls: 'bg-red-500/10 text-red-400' },
  payment_verified: { label: 'Paid',       cls: 'bg-cyan-500/10 text-cyan-400' },
};

const REQ_STATUS = {
  pending:  { label: 'Pending Review', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  approved: { label: 'Approved',       cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Rejected',       cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArena, setEditingArena] = useState(null);
  const [creatingArena, setCreatingArena] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: arenasData } = await supabase
        .from('arenas')
        .select(`
          id, name, location, city, state, phone, is_active, description,
          courts (id, name, price_per_hour, is_active, sports(name, emoji)),
          play_area_amenities (amenities(name)),
          arena_sports (sports(name, emoji))
        `)
        .eq('venue_manager_id', user.id)
        .order('created_at', { ascending: false });

      if (arenasData) setArenas(arenasData);

      if (arenasData?.length > 0) {
        const arenaIds = arenasData.map(a => a.id);

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, booking_date, start_time, end_time, price, status, sport_type, arena_id, arenas(name), courts(name)')
          .in('arena_id', arenaIds)
          .order('booking_date', { ascending: false })
          .limit(50);

        if (bookingsData) {
          setBookings(bookingsData);
          const last7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return { name: d.toLocaleDateString('en-GB', { weekday: 'short' }), date: d.toLocaleDateString('en-CA'), revenue: 0 };
          });
          bookingsData.filter(b => ['confirmed', 'completed'].includes(b.status)).forEach(b => {
            const day = last7.find(d => d.date === b.booking_date);
            if (day) day.revenue += b.price || 0;
          });
          setRevenueData(last7);
        }
      }

      // Fetch owner's approval requests
      const { data: reqData } = await supabase
        .from('arena_approval_requests')
        .select('*')
        .eq('requested_by', user.id)
        .order('created_at', { ascending: false });
      if (reqData) setRequests(reqData);

    } catch (err) {
      console.error('Owner dashboard error:', err);
    }
    setLoading(false);
  };

  // Submit approval request instead of directly saving
  const submitApprovalRequest = async (formData, requestType, arenaId = null) => {
    const { error } = await supabase.from('arena_approval_requests').insert({
      arena_id: arenaId,
      requested_by: user.id,
      request_type: requestType,
      status: 'pending',
      payload: formData,
    });
    if (error) throw error;
  };

  const handleSaveArena = async (formData) => {
    try {
      if (editingArena) {
        await submitApprovalRequest(formData, 'edit_arena', editingArena.id);
        setEditingArena(null);
      } else {
        await submitApprovalRequest(formData, 'new_arena', null);
        setCreatingArena(false);
      }
      await fetchAll();
      alert('✅ Request submitted! Admins will review and approve your changes.');
    } catch (err) {
      alert('Error submitting request: ' + err.message);
    }
  };

  const totals = useMemo(() => {
    const revenue = bookings.filter(b => ['confirmed', 'completed'].includes(b.status)).reduce((sum, b) => sum + (b.price || 0), 0);
    const courts = arenas.reduce((sum, a) => sum + (a.courts?.length || 0), 0);
    const pending = requests.filter(r => r.status === 'pending').length;
    return { revenue, bookings: bookings.length, courts, pending };
  }, [arenas, bookings, requests]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });

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
            { id: 'requests', label: 'My Requests', icon: <Send size={16} />, badge: requests.filter(r => r.status === 'pending').length },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">Owner Portal</p>
            <h1 className="text-2xl font-black uppercase tracking-tight mt-0.5">
              {activeTab === 'dashboard' ? 'Analytics' : activeTab === 'arenas' ? 'Arena Control' : activeTab === 'bookings' ? 'Bookings' : activeTab === 'requests' ? 'My Requests' : 'Managers'}
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
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString()}`, color: 'text-emerald-400' },
                    { label: 'Total Bookings', value: totals.bookings, color: 'text-blue-400' },
                    { label: 'Total Courts', value: totals.courts, color: 'text-purple-400' },
                    { label: 'Pending Requests', value: totals.pending, color: 'text-orange-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-bold text-slate-500 uppercase">{s.label}</p>
                      <h3 className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6">Revenue — Last 7 Days</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d1424', border: 'none', borderRadius: '12px' }} formatter={v => [`₹${v}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4">Recent Bookings</h3>
                  {bookings.length === 0 ? (
                    <p className="text-slate-600 text-[10px] text-center py-8">No bookings yet</p>
                  ) : bookings.slice(0, 5).map(b => {
                    const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                    return (
                      <div key={b.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-[11px] font-black">{b.arenas?.name || b.sport_type}</p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                            <Calendar size={10} /><span>{formatDate(b.booking_date)}</span>
                            {b.start_time && <><Clock size={10} /><span>{b.start_time} → {b.end_time}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                          <span className="text-[11px] font-black text-emerald-400">₹{b.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ARENAS */}
            {activeTab === "arenas" && (
              <div className="space-y-6">
                {/* APPROVAL INFO BANNER */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-400/80 font-bold leading-relaxed">
                    Any changes to arenas or courts require admin approval. Your request will be reviewed and applied by an admin.
                    Check "My Requests" tab to track status.
                  </p>
                </div>

                <div className="flex justify-between items-center bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
                  <div>
                    <h2 className="font-black uppercase text-xl">Arena Inventory</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{arenas.length} arenas registered</p>
                  </div>
                  <button onClick={() => setCreatingArena(true)}
                    className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus size={16} /> Request New Arena
                  </button>
                </div>

                {arenas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Layers size={48} className="mb-4" />
                    <p className="font-black uppercase">No Arenas Yet</p>
                    <p className="text-[10px] mt-2">Submit a request to add your first arena</p>
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
                            {arena.phone && <p className="text-[9px] text-slate-600 mt-0.5">📞 {arena.phone}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-full ${arena.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {arena.is_active ? '● Active' : '⏳ Pending'}
                            </span>
                            <button onClick={() => setEditingArena(arena)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Request Edit">
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

            {/* BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="font-black uppercase text-xl">All Bookings</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{bookings.length} total</p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-black">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg">{bookings.filter(b => b.status === 'confirmed').length} Confirmed</span>
                    <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-lg">{bookings.filter(b => b.status === 'pending').length} Pending</span>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Calendar size={48} className="mb-4" />
                    <p className="font-black uppercase">No Bookings Yet</p>
                  </div>
                ) : bookings.map(b => {
                  const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                  return (
                    <div key={b.id} className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-sm">{b.arenas?.name || '—'}</h4>
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
                  );
                })}
              </div>
            )}

            {/* MY REQUESTS */}
            {activeTab === "requests" && (
              <div className="space-y-4">
                <div className="bg-[#0b0f1a] p-5 rounded-2xl border border-white/5">
                  <h2 className="font-black uppercase text-xl">My Approval Requests</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{requests.length} total requests</p>
                </div>

                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Send size={48} className="mb-4" />
                    <p className="font-black uppercase">No Requests Yet</p>
                    <p className="text-[10px] mt-2">Submit arena changes to see them here</p>
                  </div>
                ) : requests.map(req => {
                  const s = REQ_STATUS[req.status] || REQ_STATUS.pending;
                  return (
                    <div key={req.id} className={`bg-[#0b0f1a] border rounded-2xl p-5 ${s.cls.includes('yellow') ? 'border-yellow-500/20' : s.cls.includes('emerald') ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-sm capitalize">{req.request_type?.replace(/_/g, ' ')}</h4>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="text-[9px] text-slate-500">
                            Submitted {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          {req.admin_note && (
                            <div className="mt-3 bg-white/5 rounded-xl p-3">
                              <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Admin Note</p>
                              <p className="text-[10px] text-slate-300">{req.admin_note}</p>
                            </div>
                          )}
                        </div>
                        {req.status === 'pending' && (
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mt-1 shrink-0" />
                        )}
                        {req.status === 'approved' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                        {req.status === 'rejected' && <AlertCircle size={18} className="text-red-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MANAGERS */}
            {activeTab === "managers" && (
              <div className="bg-[#0b0f1a] p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <UserPlus className="text-slate-700 mb-4" size={48} />
                <h3 className="font-black uppercase text-lg">Manager Portal</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 mb-4">Assign venue managers to your arenas</p>
                <p className="text-[10px] text-slate-600 max-w-sm">Contact your admin to assign a venue manager role to a user.</p>
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
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    if (arena) {
      const sports = {};
      arena.courts?.forEach(court => {
        const sportName = court.sports?.name;
        if (!sportName) return;
        if (!sports[sportName]) sports[sportName] = [];
        sports[sportName].push({ dbId: court.id, name: court.name, pricing: [{ startTime: '06:00', endTime: '22:00', price: court.price_per_hour || 0 }] });
      });
      return { name: arena.name || '', address: arena.location || '', city: arena.city || '', state: arena.state || '', phone: arena.phone || '', description: arena.description || '', logo: null, amenities: [], sports };
    }
    return { name: '', address: '', city: '', state: '', phone: '', description: '', logo: null, amenities: [], sports: {} };
  });

  const toggleAmenity = (id) => setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(id) ? prev.amenities.filter(a => a !== id) : [...prev.amenities, id] }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const r = new FileReader(); r.onload = f => setFormData(prev => ({ ...prev, logo: f.target.result })); r.readAsDataURL(file); }
  };

  const addSport = (sport) => {
    if (!formData.sports[sport]) setFormData(prev => ({ ...prev, sports: { ...prev.sports, [sport]: [{ name: 'Court 1', pricing: [{ startTime: '06:00', endTime: '22:00', price: 500 }] }] } }));
  };

  const addCourt = (sport) => setFormData(prev => ({ ...prev, sports: { ...prev.sports, [sport]: [...prev.sports[sport], { name: `Court ${prev.sports[sport].length + 1}`, pricing: [{ startTime: '06:00', endTime: '22:00', price: 500 }] }] } }));

  const removeSport = (sport) => { const s = { ...formData.sports }; delete s[sport]; setFormData({ ...formData, sports: s }); };

  const updateCourtName = (sport, cIdx, val) => { const s = { ...formData.sports }; s[sport][cIdx].name = val; setFormData({ ...formData, sports: s }); };

  const removeCourt = (sport, cIdx) => { const s = { ...formData.sports }; s[sport] = s[sport].filter((_, i) => i !== cIdx); setFormData({ ...formData, sports: s }); };

  const updatePricing = (sport, cIdx, pIdx, field, val) => { const s = { ...formData.sports }; s[sport][cIdx].pricing[pIdx][field] = val; setFormData({ ...formData, sports: s }); };

  const addTimeSlot = (sport, cIdx) => { const s = { ...formData.sports }; s[sport][cIdx].pricing.push({ startTime: '06:00', endTime: '22:00', price: 500 }); setFormData({ ...formData, sports: s }); };

  const removeTimeSlot = (sport, cIdx, pIdx) => { const s = { ...formData.sports }; s[sport][cIdx].pricing = s[sport][cIdx].pricing.filter((_, i) => i !== pIdx); setFormData({ ...formData, sports: s }); };

  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSave(formData); setSaving(false); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex justify-center overflow-y-auto p-4 py-10"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#0d1424] border border-white/10 w-full max-w-3xl rounded-3xl h-fit overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0d1424] z-10">
          <div>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{arena ? 'Request Edit' : 'Request New Arena'}</p>
            <h3 className="text-xl font-black uppercase">{arena ? arena.name : 'New Arena Request'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Basic Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">Arena Name *</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">Phone *</label>
                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">City</label>
                <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">State</label>
                <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50 text-white" /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">Full Address *</label>
                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none h-20 text-white" required /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[9px] font-black uppercase text-slate-500">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none h-16 text-white" placeholder="Brief description..." /></div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Arena Logo</p>
            <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all cursor-pointer w-48" onClick={() => logoInputRef.current.click()}>
              {formData.logo ? <img src={formData.logo} alt="Logo" className="w-12 h-12 mx-auto rounded object-cover mb-2" /> : <Upload size={20} className="mx-auto mb-2 text-slate-500" />}
              <p className="text-[10px] font-bold text-slate-400">{formData.logo ? 'Change Logo' : 'Upload Logo'}</p>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(amenity => (
                <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)}
                  className={`px-4 py-2 rounded-xl border text-[10px] font-bold transition-all ${formData.amenities.includes(amenity.id) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-transparent text-slate-500'}`}>
                  {amenity.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sports & Court Pricing</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SPORTS_LIST.map(s => (
                <button key={s} type="button" onClick={() => addSport(s)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${formData.sports[s] ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-slate-500 border-white/10'}`}>
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
                      <button type="button" onClick={() => addCourt(sport)} className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg">+ Court</button>
                      <button type="button" onClick={() => removeSport(sport)} className="text-[9px] font-black bg-red-500/10 text-red-400 px-3 py-1 rounded-lg">Remove</button>
                    </div>
                  </div>
                  {courts.map((court, cIdx) => (
                    <div key={cIdx} className="bg-white/5 p-4 rounded-xl mb-3 border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <input value={court.name} onChange={e => updateCourtName(sport, cIdx, e.target.value)} className="bg-transparent font-black text-xs outline-none text-white w-1/2" />
                        <button type="button" onClick={() => removeCourt(sport, cIdx)} className="text-red-500 p-1 rounded"><Trash size={14} /></button>
                      </div>
                      <div className="space-y-2">
                        {court.pricing.map((p, pIdx) => (
                          <div key={pIdx} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg">
                            <input type="time" value={p.startTime} onChange={e => updatePricing(sport, cIdx, pIdx, 'startTime', e.target.value)} className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <span className="text-slate-600 text-[10px]">to</span>
                            <input type="time" value={p.endTime} onChange={e => updatePricing(sport, cIdx, pIdx, 'endTime', e.target.value)} className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <span className="text-slate-500 text-[10px]">₹</span>
                            <input type="number" value={p.price} onChange={e => updatePricing(sport, cIdx, pIdx, 'price', parseInt(e.target.value))} className="bg-black/40 p-1.5 rounded text-[10px] w-20 outline-none text-white" />
                            {court.pricing.length > 1 && <button type="button" onClick={() => removeTimeSlot(sport, cIdx, pIdx)} className="text-slate-600 hover:text-red-400 ml-auto"><Trash size={12} /></button>}
                          </div>
                        ))}
                        <button type="button" onClick={() => addTimeSlot(sport, cIdx)} className="w-full py-1.5 border border-dashed border-white/10 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-white/5">+ Add Time Slot</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
            <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-yellow-400/80 font-bold">
              This will be sent to admins for review. Changes go live only after approval.
            </p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-emerald-500 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit for Admin Approval</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default OwnerDashboard;
