import React, { useState, useMemo, useRef } from "react";
import {
  Layers, Plus,  Edit3, ShieldCheck, MapPin, 
  BarChart2, Users, XCircle, Upload, UserPlus, Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const AMENITIES_OPTIONS = [
  { id: "parking", label: "Free Parking" },
  { id: "wifi", label: "Free Wi-Fi" },
  { id: "snacks", label: "Snacks & Drinks" },
  { id: "ac", label: "Air Conditioning" },
  { id: "firstaid", label: "First Aid" },
];

const SPORTS_LIST = ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "Pickleball"];

const CHART_DATA = [
  { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 }, { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 }, { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 7490 },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [arenas, setArenas] = useState([
    {
      id: 1,
      name: "Pitch Alpha",
      address: "Sector 9, Cuttack",
      phone: "+91 98765 43210",
      status: "Approved",
      revenue: 48200,
      bookings: 124,
      amenities: ["parking", "wifi"],
      sports: {
        Cricket: [{ id: 1, name: "Pitch 1", pricing: [{ startTime: "06:00", endTime: "10:00", price: 500 }] }],
      },
    }
  ]);
  const [editingArena, setEditingArena] = useState(null);
  const [creatingArena, setCreatingArena] = useState(false);

  const totals = useMemo(() => {
    return arenas.reduce((acc, arena) => {
      acc.revenue += arena.revenue || 0;
      acc.bookings += arena.bookings || 0;
      if (arena.status === "Pending") acc.pending++;
      Object.values(arena.sports || {}).forEach(s => acc.courts += s.length);
      return acc;
    }, { revenue: 0, bookings: 0, courts: 0, pending: 0 });
  }, [arenas]);

  const handleSaveArena = (arenaData) => {
    if (editingArena) {
      setArenas(prev => prev.map(a => a.id === editingArena.id ? { ...a, ...arenaData, status: "Pending" } : a));
      setEditingArena(null);
    } else {
      setArenas([...arenas, { ...arenaData, id: Date.now(), status: "Pending", revenue: 0, bookings: 0 }]);
      setCreatingArena(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      <aside className="w-64 bg-[#080d18] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" />
          <span className="font-black uppercase tracking-tighter text-sm">Owner<span className="text-emerald-400">Hub</span></span>
        </div>
        <nav className="p-4 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}><BarChart2 size={16}/> Analytics</button>
          <button onClick={() => setActiveTab("arenas")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'arenas' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}><Layers size={16}/> Arena Control</button>
          <button onClick={() => setActiveTab("managers")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'managers' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}><Users size={16}/> Managers</button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
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
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Pending Approvals</p>
                  <h3 className="text-2xl font-black text-orange-400 mt-1">{totals.pending}</h3>
               </div>
            </div>

            <div className="bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
               <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6">Revenue Trend</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1424', border: 'none', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {activeTab === "arenas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0b0f1a] p-6 rounded-2xl border border-white/5">
              <div>
                <h2 className="font-black uppercase text-xl">Arena Inventory</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Manage your properties and court pricing</p>
              </div>
              <button onClick={() => setCreatingArena(true)} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                <Plus size={16}/> Add New Arena
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {arenas.map(arena => (
                <div key={arena.id} className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-6 group hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black">{arena.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {arena.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingArena(arena)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit3 size={16}/></button>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex gap-4">
                       <div><p className="text-[8px] font-bold text-slate-500 uppercase">Status</p>
                       <span className={`text-[9px] font-black uppercase ${arena.status === 'Approved' ? 'text-emerald-400' : 'text-orange-400'}`}>{arena.status}</span></div>
                       <div><p className="text-[8px] font-bold text-slate-500 uppercase">Bookings</p><p className="text-xs font-black">{arena.bookings}</p></div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Object.keys(arena.sports || {}).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "managers" && (
           <div className="bg-[#0b0f1a] p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <UserPlus className="text-slate-700 mb-4" size={40}/>
              <h3 className="font-black uppercase text-sm">Manager Portal</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Connect managers to specific arenas</p>
           </div>
        )}
      </main>

      <AnimatePresence>
        {(creatingArena || editingArena) && (
          <ArenaFormModal 
            arena={editingArena} 
            onClose={() => {setCreatingArena(false); setEditingArena(null);}} 
            onSave={handleSaveArena} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MODAL COMPONENT (FULL FEATURES & ZERO WARNINGS) ─────────────────────────

function ArenaFormModal({ arena, onClose, onSave }) {
  const [formData, setFormData] = useState(arena || {
    name: "", address: "", phone: "", logo: null, images: [],
    amenities: [], sports: {},
  });

  const logoInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const toggleAmenity = (id) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) ? prev.amenities.filter(a => a !== id) : [...prev.amenities, id]
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setFormData(prev => ({...prev, logo: f.target.result}));
      reader.readAsDataURL(file);
    }
  };

  const addSport = (sport) => {
    if (!formData.sports[sport]) {
      setFormData(prev => ({
        ...prev,
        sports: { 
            ...prev.sports, 
            [sport]: [{ id: Date.now(), name: "Court 1", pricing: [{ startTime: "06:00", endTime: "22:00", price: 500 }] }] 
        }
      }));
    }
  };

  const addCourt = (sport) => {
    const newCourt = { id: Date.now(), name: `Court ${formData.sports[sport].length + 1}`, pricing: [{ startTime: "06:00", endTime: "22:00", price: 500 }] };
    setFormData(prev => ({
      ...prev,
      sports: { ...prev.sports, [sport]: [...prev.sports[sport], newCourt] }
    }));
  };

  const addTimeSlot = (sport, courtIdx) => {
    const updatedSports = { ...formData.sports };
    updatedSports[sport][courtIdx].pricing.push({ startTime: "06:00", endTime: "22:00", price: 500 });
    setFormData({ ...formData, sports: updatedSports });
  };

  const removeTimeSlot = (sport, courtIdx, slotIdx) => {
    const updatedSports = { ...formData.sports };
    updatedSports[sport][courtIdx].pricing = updatedSports[sport][courtIdx].pricing.filter((_, i) => i !== slotIdx);
    setFormData({ ...formData, sports: updatedSports });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex justify-center overflow-y-auto p-4 py-10" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0d1424] border border-white/10 w-full max-w-3xl rounded-3xl h-fit overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0d1424] z-10">
          <h3 className="text-xl font-black uppercase">{arena ? "Edit Arena" : "Add New Arena"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><XCircle/></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-8">
          
          {/* BASIC INFO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500">Arena Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500">Phone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500/50" required />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500">Full Address</label>
              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-black/40 border border-white/5 p-3 rounded-xl outline-none h-20" required />
            </div>
          </section>

          {/* MEDIA ASSETS */}
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Media Assets</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all cursor-pointer relative" onClick={() => logoInputRef.current.click()}>
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-12 h-12 mx-auto rounded object-cover mb-2" />
                  ) : (
                    <Upload size={20} className="mx-auto mb-2 text-slate-500"/>
                  )}
                  <p className="text-[10px] font-bold">{formData.logo ? "Change Logo" : "Upload Logo"}</p>
                  <input ref={logoInputRef} type="file" className="hidden" onChange={handleLogoUpload} />
               </div>
               <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => imagesInputRef.current.click()}>
                  <Upload size={20} className="mx-auto mb-2 text-slate-500"/>
                  <p className="text-[10px] font-bold">Add Arena Photos ({formData.images.length})</p>
                  <input ref={imagesInputRef} type="file" multiple className="hidden" />
               </div>
            </div>
          </section>

          {/* AMENITIES */}
          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-500">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(amenity => (
                <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)} className={`px-4 py-2 rounded-xl border text-[10px] font-bold transition-all ${formData.amenities.includes(amenity.id) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-transparent text-slate-500'}`}>
                  {amenity.label}
                </button>
              ))}
            </div>
          </section>

          {/* SPORTS & COURTS SECTION */}
          <section className="space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-500">Sports & Court Pricing</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SPORTS_LIST.map(s => (
                <button key={s} type="button" onClick={() => addSport(s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all ${formData.sports[s] ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>+ {s}</button>
              ))}
            </div>

            <div className="space-y-6">
              {Object.entries(formData.sports).map(([sport, courts]) => (
                <div key={sport} className="bg-black/30 rounded-2xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-emerald-400">{sport}</span>
                    <button type="button" onClick={() => addCourt(sport)} className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-500/20">+ Add Court</button>
                  </div>
                  
                  {courts.map((court, cIdx) => (
                    <div key={cIdx} className="bg-white/5 p-4 rounded-xl mb-4 space-y-3 border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <input value={court.name} onChange={(e) => {
                          const s = {...formData.sports}; s[sport][cIdx].name = e.target.value; setFormData({...formData, sports: s});
                        }} className="bg-transparent font-black text-xs outline-none w-1/2" />
                        <button type="button" onClick={() => {
                            const s = {...formData.sports}; s[sport] = s[sport].filter((_, i) => i !== cIdx); setFormData({...formData, sports: s});
                        }} className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"><Trash size={14}/></button>
                      </div>

                      <div className="space-y-2">
                        {court.pricing.map((p, pIdx) => (
                          <div key={pIdx} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg">
                            <input type="time" value={p.startTime} onChange={(e) => {
                                const s = {...formData.sports}; s[sport][cIdx].pricing[pIdx].startTime = e.target.value; setFormData({...formData, sports: s});
                            }} className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <span className="text-slate-600 text-[10px]">to</span>
                            <input type="time" value={p.endTime} onChange={(e) => {
                                const s = {...formData.sports}; s[sport][cIdx].pricing[pIdx].endTime = e.target.value; setFormData({...formData, sports: s});
                            }} className="bg-black/40 p-1.5 rounded text-[10px] text-white outline-none" />
                            <input type="number" value={p.price} placeholder="₹" onChange={(e) => {
                                const s = {...formData.sports}; s[sport][cIdx].pricing[pIdx].price = e.target.value; setFormData({...formData, sports: s});
                            }} className="bg-black/40 p-1.5 rounded text-[10px] w-20 outline-none border border-transparent focus:border-emerald-500/30" />
                            <button type="button" onClick={() => removeTimeSlot(sport, cIdx, pIdx)} className="text-slate-600 hover:text-red-400 ml-auto transition-colors"><Trash size={12}/></button>
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

          <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Submit for Approval</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default OwnerDashboard;