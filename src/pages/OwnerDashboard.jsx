import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Users, Clock, Edit3, Settings, 
  LogOut, Plus, MapPin, Trash2, Activity, 
  Zap, Shield, Layers
} from "lucide-react";

const defaultAvatars = ["👤", "🦁", "🐉", "⚔️", "🔥", "⚽"];

function OwnerDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [ownerProfile, setOwnerProfile] = useState({
    name: "KRATER'S ARENA",
    avatar: "👤",
    customAvatar: null,
    phone: "9876543210"
  });

  const [courts] = useState([
    { id: 1, sport: "Cricket", name: "Main Turf", units: ["Pitch A"], status: "Approved", price: 1200 }
  ]);

  const [staff, setStaff] = useState([
    { id: 1, name: "Admin Alpha", phone: "9000000001", role: "Manager" }
  ]);

  const [notifications] = useState([
    { id: 1, text: "System Audit Complete", time: "Just now" },
    { id: 2, text: "New Booking at 08:00 AM", time: "10m ago" }
  ]);

  const [timeSlots, setTimeSlots] = useState({});

  const generateSlots = () => {
    const hours = [];
    for (let i = 6; i <= 22; i++) {
      const period = i >= 12 ? "PM" : "AM";
      const displayHour = i > 12 ? i - 12 : i === 0 ? 12 : i;
      hours.push(`${displayHour}:00 ${period}`);
    }
    return hours;
  };

  useEffect(() => {
    const hours = generateSlots();
    if (!timeSlots[selectedDate]) {
        const initialDay = {};
        hours.forEach(h => {
            initialDay[h] = (h === "08:00 AM" || h === "10:00 AM") ? 'booked' : 'available';
        });
        setTimeSlots(prev => ({ ...prev, [selectedDate]: initialDay }));
    }
  }, [selectedDate, timeSlots]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setOwnerProfile({ ...ownerProfile, customAvatar: URL.createObjectURL(file) });
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans overflow-hidden select-none">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-80 bg-[#0b0f1a] border-r border-white/5 h-screen sticky top-0 p-8 flex flex-col">
        <div className="mb-12">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-emerald-500">Owner <span className="text-white">Portal</span></h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Verified Partner</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: "dashboard", label: "Analytics", icon: <Activity size={18}/> },
            { id: "bookings", label: "Slots Control", icon: <Clock size={18}/> },
            { id: "courts", label: "My Inventory", icon: <Layers size={18}/> },
            { id: "staff", label: "Ground Staff", icon: <Users size={18}/> },
            { id: "settings", label: "Preferences", icon: <Settings size={18}/> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:bg-white/5"}`}>
                {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate("/login")} className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={16} className="inline mr-2"/> Exit Session
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#020617] to-[#0b0f1a] p-8 lg:p-12">
        
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">
                {activeTab === "dashboard" && "Performance"}
                {activeTab === "bookings" && "Live Matrix"}
                {activeTab === "courts" && "Architecture"}
                {activeTab === "staff" && "Team Control"}
                {activeTab === "settings" && "Security"}
            </h2>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">{ownerProfile.name} • LIVE</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="w-12 h-12 bg-[#0b0f1a] border border-white/5 rounded-2xl flex items-center justify-center hover:border-emerald-500/30 transition-all">
                    <Zap size={20} className="text-emerald-500" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <AnimatePresence>
                    {isNotifOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-80 bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-[400] backdrop-blur-3xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest">Global Alerts</p>
                            <div className="space-y-6">
                                {notifications.map(n => (
                                    <div key={n.id} className="border-l-2 border-emerald-500 pl-4">
                                        <p className="text-xs font-black uppercase italic tracking-tight">{n.text}</p>
                                        <p className="text-[9px] text-slate-500 mt-1 font-bold">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shadow-xl">
                {ownerProfile.customAvatar ? <img src={ownerProfile.customAvatar} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">{ownerProfile.avatar}</div>}
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Net Revenue" val="₹18,250" trend="+12%" color="text-emerald-500" />
              <StatCard label="Bookings" val="42" trend="+5" color="text-blue-500" />
              <StatCard label="Active Units" val={courts.length} trend="STABLE" />
              <StatCard label="Z-Points" val="1,400" trend="USED" color="text-purple-500" />
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between gap-6 items-center bg-[#0b0f1a] p-8 rounded-[2.5rem] border border-white/5">
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-500">Slot Configuration</h1>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] font-black uppercase text-white outline-none cursor-pointer hover:border-emerald-500/50" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {timeSlots[selectedDate] && Object.entries(timeSlots[selectedDate]).map(([time, status]) => (
                <button key={time} className={`p-6 rounded-[2rem] border transition-all active:scale-95 text-center flex flex-col items-center justify-center gap-2 ${status === 'booked' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-white/5 hover:border-emerald-500/30'}`}>
                  <span className="text-xs font-black italic">{time}</span>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status === 'booked' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{status}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "courts" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-emerald-500">Venue Inventory</h1>
                <button className="bg-white text-black px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">+ Register New</button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {courts.map(c => (
                <div key={c.id} className="bg-[#0b0f1a] border border-white/5 p-10 rounded-[3.5rem] relative group overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full border border-emerald-500 text-emerald-500">{c.status}</span>
                        <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all">
                            <Edit3 size={20} />
                        </button>
                    </div>
                    <h3 className="text-3xl font-black uppercase mb-2 italic tracking-tighter leading-tight">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={12}/> {c.sport} Arena</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-purple-500">Ground Control</h1>
                <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">+ Add Manager</button>
            </div>
            <div className="bg-[#0b0f1a] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              {staff.map(s => (
                <div key={s.id} className="p-8 border-b border-white/5 flex justify-between items-center hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Shield size={24}/></div>
                        <div>
                            <p className="font-black text-lg italic uppercase tracking-tighter leading-tight">{s.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase mt-1 tracking-widest">{s.role} • {s.phone}</p>
                        </div>
                    </div>
                    <button onClick={() => setStaff([])} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={20}/>
                    </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto bg-[#0b0f1a] p-12 rounded-[4rem] border border-white/5 space-y-16 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-2 border-emerald-500 overflow-hidden flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  {ownerProfile.customAvatar ? <img src={ownerProfile.customAvatar} alt="Profile" className="w-full h-full object-cover" /> : ownerProfile.avatar}
                </div>
                <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-3 rounded-2xl shadow-2xl active:scale-90 transition-transform">
                    <Plus size={20} strokeWidth={3} />
                </button>
                <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                  {defaultAvatars.map(av => <button key={av} onClick={() => setOwnerProfile({...ownerProfile, avatar: av, customAvatar: null})} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${ownerProfile.avatar === av && !ownerProfile.customAvatar ? 'bg-emerald-500 text-black' : 'bg-white/5 border border-white/10 hover:border-emerald-500/30'}`}>{av}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <InputField label="Arena Brand Name" val={ownerProfile.name} icon={<MapPin size={16}/>} />
              <InputField label="Primary Contact" val={ownerProfile.phone} />
              <button className="md:col-span-2 bg-emerald-500 text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 active:scale-95 transition-all">Synchronize Systems</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components
function StatCard({ label, val, color, trend }) {
  return (
    <div className="bg-[#0b0f1a] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-all"><TrendingUp size={100}/></div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <h4 className={`text-4xl font-black italic tracking-tighter ${color}`}>{val}</h4>
      <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">{trend}</p>
    </div>
  );
}

function InputField({ label, val, placeholder, type = "text", icon }) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block px-1 tracking-widest">{label}</label>
      <div className="relative">
          {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
          <input type={type} defaultValue={val} placeholder={placeholder} className={`w-full bg-white/5 border border-white/5 rounded-[1.5rem] ${icon ? 'pl-14' : 'px-8'} py-5 outline-none focus:border-emerald-500/50 font-black text-sm transition-all text-white italic uppercase shadow-inner`} />
      </div>
    </div>
  );
}

export default OwnerDashboard;