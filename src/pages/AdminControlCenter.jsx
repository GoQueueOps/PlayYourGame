import { useRef } from "react";
import React, { useState } from "react";
import {
  Layers, Activity, Plus, Trash2, LogOut, TrendingUp, Trash,
  Edit3, ShieldCheck, MapPin,  XCircle, Download, Clock, 
  Bell, BarChart2, Users, ArrowUpRight, ArrowDownRight, Check, X,
  AlertCircle, Ban, Phone, MapPinIcon, Wifi, UtensilsCrossed,
  ParkingCircle, Wind, Heart, Unlock, Search, Eye, Upload, MessageCircle, Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const INITIAL_ARENAS = [
  {
    id: 1,
    name: "Pitch Alpha",
    address: "Sector 9, Cuttack",
    phone: "+91 98765 43210",
    logo: null,
    images: [],
    direction: { lat: 20.4625, lng: 85.8830 },
    amenities: ["parking", "wifi", "snacks"],
    sports: {
      Cricket: [
        { id: 1, name: "Pitch 1", pricing: [{ startTime: "06:00", endTime: "10:00", price: 500 }] },
        { id: 2, name: "Pitch 2", pricing: [{ startTime: "06:00", endTime: "10:00", price: 500 }] },
      ],
      Football: [
        { id: 3, name: "Field 1", pricing: [{ startTime: "06:00", endTime: "22:00", price: 1000 }] },
      ],
    },
    status: "Approved",
    revenue: 48200,
    bookings: 34,
  },
];

const PENDING_OWNERS = [
  { id: 1, name: "Rajan Patel", arena: "Slam Dunk Courts", sport: "Basketball", location: "Sector 4", submitted: "2 hrs ago", docs: "Verified" },
];

const NOTIFICATIONS = [
  { id: 1, type: "approval", text: "New owner request: Rajan Patel", time: "2m ago", read: false },
  { id: 2, type: "revenue", text: "Peak traffic detected", time: "1h ago", read: false },
];

const AMENITIES_OPTIONS = [
  { id: "parking", label: "Free Parking", icon: ParkingCircle },
  { id: "wifi", label: "Free Wi-Fi", icon: Wifi },
  { id: "snacks", label: "Snacks & Drinks", icon: UtensilsCrossed },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "firstaid", label: "First Aid", icon: Heart },
];

const SPORTS_LIST = ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "Pickleball"];

const INITIAL_BANNED_PLAYERS = [
  { id: 101, name: "Player Z", reason: "Spamming", banDuration: "7 days", bannedUntil: "2025-03-07", bannedAt: "1 day ago" },
];

const BAN_DURATIONS = [
  "2 hours", "5 hours", "12 hours", "20 hours", "24 hours",
  "2 days", "3 days", "5 days", "7 days", "10 days",
  "15 days", "30 days", "2 months", "3 months", "Permanent"
];

const REPORTED_PLAYERS = [
  { id: 1, name: "Player X", reportedBy: "Admin", reason: "Abusive language", count: 3, status: "Active", date: "2 hrs ago" },
  { id: 2, name: "Player Y", reportedBy: "User", reason: "Cheating", count: 5, status: "Active", date: "5 hrs ago" },
];

const ALL_PLAYERS = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@example.com", joinedDate: "2025-02-10", status: "Active", groups: 3 },
  { id: 2, name: "Priya Singh", email: "priya@example.com", joinedDate: "2025-02-05", status: "Active", groups: 2 },
  { id: 3, name: "Arjun Patel", email: "arjun@example.com", joinedDate: "2025-01-20", status: "Active", groups: 5 },
];

const ALL_GROUPS = [
  { id: 1, name: "Weekend Warriors", creator: "Rajesh Kumar", members: 12, sport: "Cricket" },
  { id: 2, name: "Football Enthusiasts", creator: "Priya Singh", members: 8, sport: "Football" },
];

const ADMIN_CHAT_MESSAGES = [
  { id: 1, admin: "Super Admin", message: "Morning team, let's review the pending approvals", time: "9:30 AM", role: "super" },
  { id: 2, admin: "Admin 1", message: "Sure! I've checked Rajan's documents - all verified", time: "9:35 AM", role: "admin" },
  { id: 3, admin: "Admin 2", message: "Also reviewed the player reports - 2 more bans needed", time: "9:38 AM", role: "admin" },
  { id: 4, admin: "Super Admin", message: "Great! Approved Rajan's request. Let's discuss the reported players", time: "9:40 AM", role: "super" },
  { id: 5, admin: "Admin 1", message: "Player X has 3 abuse reports - recommend 7-day ban", time: "9:42 AM", role: "admin" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function MiniBar({ value, max }) {
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-emerald-500 rounded-full"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color, change }) {
  const up = change >= 0;
  return (
    <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/[0.06] relative overflow-hidden group hover:border-emerald-500/20 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color.replace("text-", "bg-")}/5 blur-[70px] rounded-full`} />
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const AdminControlCenter = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState(INITIAL_ARENAS);
  const [owners, setOwners] = useState(PENDING_OWNERS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [reportedPlayers, setReportedPlayers] = useState(REPORTED_PLAYERS);
  const [bannedPlayers, setBannedPlayers] = useState(INITIAL_BANNED_PLAYERS);
  const [allPlayers, setAllPlayers] = useState(ALL_PLAYERS);
  const [allGroups, setAllGroups] = useState(ALL_GROUPS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [selectedBanDuration, setSelectedBanDuration] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingArena, setEditingArena] = useState(null);
  const [creatingArena, setCreatingArena] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [chatMessages, setChatMessages] = useState(ADMIN_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState("");

  const unread = notifications.filter(n => !n.read).length;

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        admin: "You",
        message: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: "admin"
      }]);
      setChatInput("");
    }
  };

  // ─── ARENA MANAGEMENT ───

  const createNewArena = (arenaData) => {
    const newArena = {
      id: Date.now(),
      ...arenaData,
      status: "Approved",
      revenue: 0,
      bookings: 0,
    };
    setArenas([...arenas, newArena]);
    setCreatingArena(false);
  };

  const updateArena = (id, updatedData) => {
    setArenas(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
    setEditingArena(null);
  };

  const deleteArena = (id) => {
    setArenas(prev => prev.filter(a => a.id !== id));
  };

  // ─── PLAYER MANAGEMENT ───

  const handleBanPlayer = (playerId, duration) => {
    const player = reportedPlayers.find(p => p.id === playerId);
    const bannedUntil = new Date();
    
    if (duration === "Permanent") {
      bannedUntil.setFullYear(bannedUntil.getFullYear() + 100);
    } else if (duration.includes("hour")) {
      const hours = parseInt(duration);
      bannedUntil.setHours(bannedUntil.getHours() + hours);
    } else if (duration.includes("day") || duration.includes("days")) {
      const days = parseInt(duration);
      bannedUntil.setDate(bannedUntil.getDate() + days);
    } else if (duration.includes("month") || duration.includes("months")) {
      const months = parseInt(duration);
      bannedUntil.setMonth(bannedUntil.getMonth() + months);
    }

    setBannedPlayers([...bannedPlayers, {
      id: playerId,
      name: player.name,
      reason: player.reason,
      banDuration: duration,
      bannedUntil: bannedUntil.toISOString().split('T')[0],
      bannedAt: "just now",
    }]);

    setReportedPlayers(prev => prev.filter(p => p.id !== playerId));
    setSelectedBanDuration(prev => ({ ...prev, [playerId]: null }));
  };

  const unbanPlayer = (playerId) => {
    setBannedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const removePlayer = (playerId) => {
    setAllPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const removePlayerFromGroup = (playerId, groupId) => {
    setAllGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, members: g.members - 1 }
        : g
    ));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredPlayers = allPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NAV = [
    { id: "dashboard", label: "Analytics", icon: <BarChart2 size={15} /> },
    { id: "arenas", label: "Arena Control", icon: <Layers size={15} />, badge: arenas.length },
    { id: "approvals", label: "Owner Queue", icon: <Users size={15} />, badge: owners.length },
    { id: "reports", label: "Player Reports", icon: <AlertCircle size={15} />, badge: reportedPlayers.length },
    { id: "banned", label: "Banned Players", icon: <Ban size={15} />, badge: bannedPlayers.length },
    { id: "players", label: "All Players", icon: <Users size={15} /> },
    { id: "chat", label: "Admin Chat", icon: <MessageCircle size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-black to-[#050818] text-white flex">
      {/* GRAIN */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* ANIMATED BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 -left-96 w-96 h-96 bg-blue-500/15 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-96 -right-96 w-96 h-96 bg-green-500/15 blur-[150px] rounded-full"
        />
      </div>

      {/* ── SIDEBAR ── */}
      <aside className="w-72 bg-[#080d18] hidden lg:flex flex-col border-r border-white/[0.05] sticky top-0 h-screen shrink-0 z-40">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <ShieldCheck size={20} className="text-black" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight leading-none">
                Admin <span className="text-emerald-400">Hub</span>
              </h1>
              <p className="text-[7px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Control Panel v2.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge > 0 && (
                <span className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-black/30" : "bg-orange-500/20 text-orange-400"
                }`}>
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.05]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} /> Kill Session
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* TOP BAR */}
        <div className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-600">Control Terminal</p>
            <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">
              Admin <span className="text-emerald-400">Dashboard</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.07] rounded-xl hover:border-emerald-500/30 transition-all"
              >
                <Bell size={16} className="text-slate-400" />
                {unread > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[7px] font-black flex items-center justify-center text-white"
                  >
                    {unread}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-14 w-80 bg-[#0d1424] border border-white/[0.08] rounded-2xl shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <span className="text-[9px] font-black uppercase text-white">Notifications</span>
                      <button onClick={markAllRead} className="text-[8px] font-bold text-emerald-500 hover:text-emerald-400">
                        Mark all
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] ${!n.read ? "bg-emerald-500/[0.05]" : "opacity-50"}`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === "approval" ? "bg-orange-500/15 text-orange-400"
                            : n.type === "revenue" ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                          }`}>
                            {n.type === "approval" ? <Users size={11} /> : <TrendingUp size={11} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-medium text-slate-200">{n.text}</p>
                            <p className="text-[8px] text-slate-600 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-4 py-2.5 rounded-lg hover:border-emerald-500/30 transition-all"
            >
              <Download size={13} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase">Export</span>
            </motion.button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">

          {/* ══ DASHBOARD ══ */}
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <StatCard label="Site Traffic" value="12.4K" icon={<Activity size={16} />} color="text-blue-400" change={+24.3} />
                <StatCard label="Total Bookings" value="1,248" icon={<Activity size={16} />} color="text-cyan-400" change={+11.2} />
                <StatCard label="Active Arenas" value={arenas.length} icon={<Layers size={16} />} color="text-purple-400" />
                <StatCard label="Total Players" value="847" icon={<Users size={16} />} color="text-indigo-400" />
                <StatCard label="Total Groups" value="34" icon={<Users size={16} />} color="text-pink-400" />
                <StatCard label="Pending Approvals" value={owners.length} icon={<Clock size={16} />} color="text-orange-400" />
              </div>

              {/* ANALYTICS CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Top Performing Arenas</p>
                  <div className="space-y-4">
                    {arenas.map(a => (
                      <div key={a.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black">{a.name}</span>
                          <span className="text-[9px] font-bold text-emerald-400">{a.bookings} bookings</span>
                        </div>
                        <MiniBar value={a.bookings} max={50} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0b0f1a] border border-white/[0.06] p-6 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">System Status</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Server Load</span>
                      <span className="font-bold text-green-400">42%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-green-500 to-emerald-400" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-3">
                      <span className="text-slate-400">API Response</span>
                      <span className="font-bold text-green-400">156ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ ARENA CONTROL ══ */}
          {activeTab === "arenas" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-base">Arena Inventory</h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{arenas.length} active arenas</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCreatingArena(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest shadow-lg shadow-emerald-500/20"
                >
                  <Plus size={13} /> Add Arena
                </motion.button>
              </div>

              {/* CREATE/EDIT ARENA FORM */}
              <AnimatePresence>
                {creatingArena && (
                  <ArenaFormModal onClose={() => setCreatingArena(false)} onSave={createNewArena} />
                )}
              </AnimatePresence>

              {/* ARENAS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arenas.map(arena => (
                  <ArenaCard
                    key={arena.id}
                    arena={arena}
                    onEdit={() => setEditingArena(arena)}
                    onDelete={() => deleteArena(arena.id)}
                  />
                ))}
              </div>

              {/* EDIT ARENA MODAL */}
              <AnimatePresence>
                {editingArena && (
                  <ArenaFormModal
                    arena={editingArena}
                    onClose={() => setEditingArena(null)}
                    onSave={(data) => updateArena(editingArena.id, data)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══ OWNER APPROVALS ══ */}
          {activeTab === "approvals" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h3 className="text-xl font-black uppercase">Owner Approval Queue</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{owners.length} pending requests</p>
              </div>

              {owners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <ShieldCheck size={50} className="mb-4" />
                  <p className="text-sm font-black uppercase">No Pending Approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {owners.map(owner => (
                    <motion.div key={owner.id} layout className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-black text-base">{owner.name}</h4>
                          <p className="text-[10px] font-bold text-emerald-400 mt-1">{owner.arena}</p>
                          <div className="flex gap-3 mt-2 text-[9px] text-slate-500 flex-wrap">
                            <span>{owner.sport}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><MapPin size={10} /> {owner.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setOwners(prev => prev.filter(o => o.id !== owner.id))}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-[9px] font-black"
                          >
                            <Check size={12} /> Approve
                          </motion.button>
                          <button className="text-red-400 hover:text-red-300 text-[9px] font-black">
                            <X size={12} /> Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ PLAYER REPORTS ══ */}
          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h3 className="text-xl font-black uppercase">Player Reports</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{reportedPlayers.length} active reports</p>
              </div>

              {reportedPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <ShieldCheck size={50} className="mb-4" />
                  <p className="text-sm font-black uppercase">No Reports</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedPlayers.map(player => (
                    <motion.div key={player.id} layout className="bg-[#0b0f1a] border border-white/[0.06] p-5 rounded-2xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base">{player.name}</h4>
                            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                              {player.count} reports
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-red-400 mt-1">{player.reason}</p>
                          <p className="text-[9px] text-slate-500 mt-1">Reported by: {player.reportedBy} · {player.date}</p>
                        </div>
                        <div className="flex gap-2 flex-col">
                          <select
                            value={selectedBanDuration[player.id] || ""}
                            onChange={(e) => setSelectedBanDuration(prev => ({ ...prev, [player.id]: e.target.value }))}
                            className="bg-black/40 border border-white/[0.07] rounded-lg p-2 text-[9px] font-bold outline-none"
                          >
                            <option value="">Select Duration</option>
                            {BAN_DURATIONS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              if (selectedBanDuration[player.id]) {
                                handleBanPlayer(player.id, selectedBanDuration[player.id]);
                              }
                            }}
                            disabled={!selectedBanDuration[player.id]}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[9px] font-black"
                          >
                            <Ban size={12} /> Ban Player
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ BANNED PLAYERS ══ */}
          {activeTab === "banned" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h3 className="text-xl font-black uppercase">Banned Players</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{bannedPlayers.length} banned</p>
              </div>

              {bannedPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <Unlock size={50} className="mb-4" />
                  <p className="text-sm font-black uppercase">No Banned Players</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bannedPlayers.map(player => (
                    <motion.div key={player.id} layout className="bg-[#0b0f1a] border border-red-500/20 p-5 rounded-2xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-black text-base text-red-400">{player.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{player.reason}</p>
                          <div className="flex gap-3 mt-2 text-[9px] text-slate-500">
                            <span>Ban: {player.banDuration}</span>
                            <span>·</span>
                            <span>Until: {player.bannedUntil}</span>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => unbanPlayer(player.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-[9px] font-black"
                        >
                          <Unlock size={12} /> Unban
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ ALL PLAYERS ══ */}
          {activeTab === "players" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase">Player Management</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{allPlayers.length} total players</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/40 border border-white/[0.07] rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                  <Users size={50} className="mb-4" />
                  <p className="text-sm font-black uppercase">No Players Found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlayers.map(player => (
                    <motion.div
                      key={player.id}
                      layout
                      className="bg-[#0b0f1a] border border-white/[0.06] p-4 rounded-xl hover:border-emerald-500/20 transition-all cursor-pointer group"
                      onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm">{player.name}</h4>
                            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                              {player.groups} groups
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 mt-0.5">{player.email}</p>
                          <p className="text-[8px] text-slate-600 mt-1">Joined: {player.joinedDate}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-slate-400 group-hover:text-blue-400 transition-all"
                        >
                          <Eye size={16} />
                        </motion.button>
                      </div>

                      {/* EXPANDED PLAYER DETAILS */}
                      <AnimatePresence>
                        {selectedPlayer?.id === player.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/[0.06] space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => removePlayer(player.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1"
                              >
                                <Trash2 size={11} /> Remove
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 px-3 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1"
                              >
                                <Ban size={11} /> Ban
                              </motion.button>
                            </div>

                            {/* GROUPS THIS PLAYER IS IN */}
                            {player.groups > 0 && (
                              <div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase mb-2">Groups ({player.groups})</p>
                                <div className="space-y-1">
                                  {allGroups.map(g => (
                                    <div key={g.id} className="flex items-center justify-between text-[9px] bg-black/30 p-2 rounded">
                                      <span>{g.name}</span>
                                      <button
                                        onClick={() => removePlayerFromGroup(player.id, g.id)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ ADMIN CHAT ══ */}
          {activeTab === "chat" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <h3 className="text-xl font-black uppercase">Admin Chat Room</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Super Admin & Admins Only</p>
              </div>

              <div className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
                {/* CHAT MESSAGES */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {chatMessages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "super" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs ${msg.role === "super" ? "order-2" : "order-1"}`}>
                        <div className={`text-[9px] font-black mb-1.5 flex items-center gap-1 ${msg.role === "super" ? "text-right text-orange-400" : "text-left text-emerald-400"}`}>
                          {msg.admin}
                          {msg.role === "super" && <span className="text-lg">👑</span>}
                        </div>
                        <div className={`px-4 py-2.5 rounded-lg text-[10px] break-words ${
                          msg.role === "super"
                            ? "bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 text-slate-100 shadow-lg"
                            : "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 text-slate-200"
                        }`}>
                          {msg.message}
                        </div>
                        <div className={`text-[7px] text-slate-600 mt-1.5 ${msg.role === "super" ? "text-right" : "text-left"}`}>
                          {msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* DIVIDER */}
                <div className="border-t border-white/[0.06]" />

                {/* CHAT INPUT */}
                <div className="p-4 flex gap-2 bg-black/40">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-black/40 border border-white/[0.07] rounded-lg px-4 py-2.5 text-[10px] font-bold outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all"
                  />
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black px-6 py-2.5 rounded-lg font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send size={14} />
                    <span className="text-[9px] uppercase">Send</span>
                  </motion.button>
                </div>
              </div>

              {/* ONLINE ADMINS INFO */}
              <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-5 space-y-3">
                <p className="text-[9px] font-black text-slate-500 uppercase">Online Team</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold">Super Admin <span className="text-orange-400">👑</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold">Admin 1 <span className="text-emerald-400">✓</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold">Admin 2 <span className="text-emerald-400">✓</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-slate-600 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-500">Admin 3 (Away)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

// ─── ARENA FORM MODAL ─────────────────────────────────────────────────────────

function ArenaFormModal({ arena, onClose, onSave }) {
  const [formData, setFormData] = useState(arena || {
    name: "",
    address: "",
    phone: "",
    logo: null,
    images: [],
    direction: { lat: 0, lng: 0 },
    amenities: [],
    sports: {},
  });

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const toggleAmenity = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const addSport = (sport) => {
    if (!formData.sports[sport]) {
      setFormData(prev => ({
        ...prev,
        sports: {
          ...prev.sports,
          [sport]: [{ id: 1, name: "Court 1", pricing: [{ startTime: "06:00", endTime: "22:00", price: 500 }] }],
        },
      }));
    }
  };

  const logoInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, logo: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), event.target?.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: null });
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapInput, setMapInput] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0d1424] border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-[#0d1424] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-500">{arena ? "Edit" : "Create"} Arena</p>
            <h3 className="text-lg font-black uppercase mt-1">{arena ? arena.name : "New Arena"}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* BASIC INFO */}
          <div className="space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Basic Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Arena Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-emerald-500/50"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-emerald-500/50"
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="md:col-span-2 bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-emerald-500/50"
                rows="2"
              />
            </div>
          </div>

          {/* LOGO & IMAGES MEDIA SECTION */}
          <div className="space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Media - Logo & Images</p>
            
            {/* LOGO UPLOAD */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400">Arena Logo (Single Image)</label>
              {formData.logo ? (
                <div className="relative w-full">
                  <div className="w-full h-40 bg-black/40 rounded-lg border border-white/[0.06] overflow-hidden flex items-center justify-center">
                    <img src={formData.logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={removeLogo}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg"
                  >
                    <X size={14} />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full mt-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1"
                  >
                    <Upload size={12} /> Change Logo
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/[0.1] rounded-lg p-6 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all cursor-pointer group bg-black/20"
                >
                  <Upload size={24} className="text-slate-600 group-hover:text-emerald-500 mb-2 transition-colors" />
                  <p className="text-[9px] font-bold text-slate-500 group-hover:text-slate-400">Click to Upload Logo</p>
                  <p className="text-[8px] text-slate-600 mt-1">PNG, JPG, GIF (Max 5MB)</p>
                </motion.button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* IMAGES UPLOAD */}
            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              <label className="text-[9px] font-bold text-slate-400">Arena Images (Multiple)</label>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => imagesInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/[0.1] rounded-lg p-6 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all cursor-pointer group bg-black/20"
              >
                <Upload size={24} className="text-slate-600 group-hover:text-emerald-500 mb-2 transition-colors" />
                <p className="text-[9px] font-bold text-slate-500 group-hover:text-slate-400">Click to Add Images</p>
                <p className="text-[8px] text-slate-600 mt-1">{formData.images?.length || 0} images added</p>
              </motion.button>
              <input
                ref={imagesInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesUpload}
                className="hidden"
              />

              {/* IMAGES GRID */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                  {formData.images.map((image, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-lg overflow-hidden border border-white/[0.06]"
                    >
                      <div className="w-full aspect-square bg-black/40 flex items-center justify-center">
                        <img src={image} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={18} className="text-red-400" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LOCATION & DIRECTION */}
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Location</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Latitude"
                value={formData.direction?.lat}
                onChange={(e) => setFormData({
                  ...formData,
                  direction: { ...formData.direction, lat: parseFloat(e.target.value) }
                })}
                className="bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-emerald-500/50"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={formData.direction?.lng}
                onChange={(e) => setFormData({
                  ...formData,
                  direction: { ...formData.direction, lng: parseFloat(e.target.value) }
                })}
                className="bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-emerald-500/50"
              />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMapModal(true)}
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-lg text-[9px] font-black flex items-center justify-center gap-2 transition-all"
            >
              <MapPinIcon size={12} /> Set Location on Map
            </motion.button>
          </div>

          {/* AMENITIES */}
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Amenities</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AMENITIES_OPTIONS.map(amenity => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities?.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-3 rounded-lg border transition-all flex items-center gap-2 text-[9px] font-bold ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-black/30 border-white/[0.07] text-slate-500 hover:border-white/20"
                    }`}
                  >
                    <Icon size={13} />
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SPORTS & COURTS */}
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-3">Add Sports</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {SPORTS_LIST.map(sport => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => addSport(sport)}
                  disabled={formData.sports?.[sport]}
                  className={`p-2 rounded-lg border text-[9px] font-black transition-all ${
                    formData.sports?.[sport]
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-black/30 border-white/[0.07] text-slate-500 hover:border-white/20 disabled:opacity-50"
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>

            {/* DISPLAY ADDED SPORTS */}
            {Object.keys(formData.sports || {}).length > 0 && (
              <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/[0.06]">
                {Object.entries(formData.sports).map(([sport, courts]) => (
                  <motion.div
                    key={sport}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-black/40 border border-white/[0.06] rounded-lg p-4 space-y-3"
                  >
                    {/* SPORT NAME */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">{sport}</p>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const updated = { ...formData.sports };
                          delete updated[sport];
                          setFormData({ ...formData, sports: updated });
                        }}
                        className="text-[9px] text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-500/10 rounded border border-red-500/20"
                      >
                        Remove Sport
                      </motion.button>
                    </div>

                    {/* COURTS FOR THIS SPORT */}
                    <div className="space-y-3">
                      {courts.map((court, courtIdx) => (
                        <motion.div
                          key={courtIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-black/60 border border-white/[0.06] p-3 rounded-lg space-y-2"
                        >
                          {/* COURT HEADER */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                            <input
                              type="text"
                              placeholder={`Court ${courtIdx + 1} Name`}
                              value={court.name}
                              onChange={(e) => {
                                const updated = { ...formData.sports };
                                updated[sport][courtIdx].name = e.target.value;
                                setFormData({ ...formData, sports: updated });
                              }}
                              className="flex-1 bg-transparent text-[10px] font-bold outline-none text-white"
                            />
                            {courts.length > 1 && (
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  const updated = { ...formData.sports };
                                  updated[sport] = updated[sport].filter((_, i) => i !== courtIdx);
                                  setFormData({ ...formData, sports: updated });
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash size={13} />
                              </motion.button>
                            )}
                          </div>

                          {/* TIME SLOTS */}
                          <div className="space-y-2">
                            <p className="text-[8px] font-bold text-slate-500 uppercase">Time Slots & Pricing</p>
                            {court.pricing && court.pricing.map((slot, slotIdx) => (
                              <div key={slotIdx} className="flex gap-2 items-center bg-black/70 p-2 rounded border border-white/[0.04]">
                                <input
                                  type="time"
                                  value={slot.startTime || "06:00"}
                                  onChange={(e) => {
                                    const updated = { ...formData.sports };
                                    updated[sport][courtIdx].pricing[slotIdx].startTime = e.target.value;
                                    setFormData({ ...formData, sports: updated });
                                  }}
                                  className="bg-black/60 border border-white/[0.06] rounded p-1.5 text-[9px] font-bold outline-none focus:border-emerald-500/50 w-20"
                                />
                                <span className="text-[9px] text-slate-500">to</span>
                                <input
                                  type="time"
                                  value={slot.endTime || "22:00"}
                                  onChange={(e) => {
                                    const updated = { ...formData.sports };
                                    updated[sport][courtIdx].pricing[slotIdx].endTime = e.target.value;
                                    setFormData({ ...formData, sports: updated });
                                  }}
                                  className="bg-black/60 border border-white/[0.06] rounded p-1.5 text-[9px] font-bold outline-none focus:border-emerald-500/50 w-20"
                                />
                                <span className="text-[9px] text-slate-500">₹</span>
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={slot.price || 500}
                                  onChange={(e) => {
                                    const updated = { ...formData.sports };
                                    updated[sport][courtIdx].pricing[slotIdx].price = parseInt(e.target.value);
                                    setFormData({ ...formData, sports: updated });
                                  }}
                                  className="flex-1 bg-black/60 border border-white/[0.06] rounded p-1.5 text-[9px] font-bold outline-none focus:border-emerald-500/50"
                                />
                                {court.pricing.length > 1 && (
                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      const updated = { ...formData.sports };
                                      updated[sport][courtIdx].pricing = updated[sport][courtIdx].pricing.filter((_, i) => i !== slotIdx);
                                      setFormData({ ...formData, sports: updated });
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash size={12} />
                                  </motion.button>
                                )}
                              </div>
                            ))}

                            {/* ADD TIME SLOT */}
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const updated = { ...formData.sports };
                                updated[sport][courtIdx].pricing.push({ startTime: "06:00", endTime: "22:00", price: 500 });
                                setFormData({ ...formData, sports: updated });
                              }}
                              className="w-full text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 py-1.5 rounded hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1"
                            >
                              <Plus size={10} /> Add Time Slot
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* ADD COURT */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const updated = { ...formData.sports };
                        updated[sport].push({
                          id: courts.length + 1,
                          name: `Court ${courts.length + 1}`,
                          pricing: [{ startTime: "06:00", endTime: "22:00", price: 500 }]
                        });
                        setFormData({ ...formData, sports: updated });
                      }}
                      className="w-full text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> Add Court
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-6 border-t border-white/[0.06]">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-black uppercase text-[10px] tracking-wider shadow-lg shadow-emerald-500/20"
            >
              {arena ? "Update Arena" : "Create Arena"}
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-500 hover:text-white rounded-lg font-black uppercase text-[10px] tracking-wider"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* MAP MODAL */}
        <AnimatePresence>
          {showMapModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setShowMapModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#0d1424] border border-white/[0.1] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
              >
                <div className="sticky top-0 bg-[#0d1424] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase">Set Location on Map</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMapModal(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    <XCircle size={20} />
                  </motion.button>
                </div>

                <div className="p-6 space-y-4">
                  {/* SEARCH INPUT */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Search Location or Enter Coordinates</label>
                    <input
                      type="text"
                      placeholder="Search address or location name..."
                      value={mapInput}
                      onChange={(e) => setMapInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-3 text-sm font-bold outline-none focus:border-blue-500/50 text-white"
                    />
                  </div>

                  {/* MAP PLACEHOLDER */}
                  <div className="w-full h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-white/[0.06] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="text-center space-y-3">
                        <MapPinIcon size={48} className="text-emerald-500/40 mx-auto" />
                        <div>
                          <p className="text-slate-400 text-sm font-black">🗺️ Google Maps Integration</p>
                          <p className="text-[9px] text-slate-600 mt-2">Enter coordinates or search location</p>
                        </div>
                        <div className="space-y-1 text-[9px] text-slate-600 pt-4 border-t border-white/10">
                          <p>Current Location: <span className="text-emerald-400 font-bold">{formData.direction?.lat.toFixed(4)}, {formData.direction?.lng.toFixed(4)}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COORDINATES INPUT */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.direction?.lat}
                        onChange={(e) => setFormData({
                          ...formData,
                          direction: { ...formData.direction, lat: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-2 text-[9px] font-bold outline-none focus:border-emerald-500/50"
                        placeholder="e.g., 20.4625"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.direction?.lng}
                        onChange={(e) => setFormData({
                          ...formData,
                          direction: { ...formData.direction, lng: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-black/40 border border-white/[0.07] rounded-lg p-2 text-[9px] font-bold outline-none focus:border-emerald-500/50"
                        placeholder="e.g., 85.8830"
                      />
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowMapModal(false)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-black uppercase text-[10px] tracking-wider shadow-lg shadow-emerald-500/20"
                    >
                      Confirm Location
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowMapModal(false)}
                      className="px-6 py-3 text-slate-500 hover:text-white rounded-lg font-black uppercase text-[10px] tracking-wider border border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── ARENA CARD ───────────────────────────────────────────────────────────────

function ArenaCard({ arena, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      className="bg-[#0b0f1a] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-black text-lg leading-tight">{arena.name}</h4>
          <div className="flex items-center gap-1.5 mt-2 text-slate-500">
            <MapPin size={11} className="text-emerald-500" />
            <p className="text-[9px] font-medium">{arena.address}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500">
            <Phone size={11} className="text-blue-400" />
            <p className="text-[9px] font-medium">{arena.phone}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onEdit}
            className="w-9 h-9 bg-white/[0.04] rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
          >
            <Edit3 size={14} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            className="w-9 h-9 bg-white/[0.04] rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* AMENITIES */}
      {arena.amenities && arena.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-white/[0.06]">
          {arena.amenities.map(amenity => {
            const amenityOption = AMENITIES_OPTIONS.find(a => a.id === amenity);
            const Icon = amenityOption?.icon;
            return Icon ? (
              <div key={amenity} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Icon size={10} className="text-emerald-400" />
                <span className="text-[8px] font-bold text-emerald-400">{amenityOption.label}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* SPORTS COUNT */}
      <div className="text-[10px] font-bold">
        <span className="text-slate-500">Sports: </span>
        <span className="text-emerald-400">{Object.keys(arena.sports || {}).join(", ")}</span>
      </div>
    </motion.div>
  );
}

export default AdminControlCenter;
