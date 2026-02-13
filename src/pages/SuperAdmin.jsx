import React, { useState } from "react";
import { 
  ShieldCheck, Globe, UserPlus, Settings, Activity, LayoutDashboard, 
  TrendingUp, Users, Edit3, Eye, Power, AlertCircle, 
  MapPin, Trash2, X, Layers
} from "lucide-react";

function SuperAdmin() {
  const [activeView, setActiveView] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArena, setEditingArena] = useState(null);

  // Requests: Detailed tracking of owner-submitted changes
  const [requests] = useState([
    { 
      id: 901, 
      type: "Edit", 
      venue: "Cuttack Turf King", 
      owner: "Rohan S.", 
      changeLog: "Price changed from ₹800 to ₹1200 for Cricket slots.",
      timestamp: "10 mins ago" 
    },
    { 
      id: 902, 
      type: "New Venue", 
      venue: "BBS Smashers", 
      owner: "Aryan K.", 
      changeLog: "New registration: 3 Football courts, 1 Cricket net.",
      timestamp: "1 hour ago" 
    }
  ]);

  // Inventory: Master control over global arena structures
  const [inventory] = useState([
    { 
      id: 1, 
      name: "Krater's Arena", 
      city: "Cuttack", 
      status: "Active", 
      totalSlots: 24,
      basePrice: 1200,
      categories: [
        { name: "Cricket", active: true, courtCount: 2 },
        { name: "Football", active: true, courtCount: 1 },
        { name: "Tennis", active: false, courtCount: 1 }
      ]
    }
  ]);

  const openFullEdit = (arena) => {
    setEditingArena(arena);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden flex select-none">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="w-72 bg-[#0b0f1a] border-r border-white/5 h-screen sticky top-0 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <ShieldCheck size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Command</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: "overview", label: "Overview", icon: <LayoutDashboard size={18}/> },
            { id: "requests", label: "Approvals", icon: <AlertCircle size={18}/> },
            { id: "inventory", label: "Inventory", icon: <Globe size={18}/> },
            { id: "admins", label: "Platform Team", icon: <UserPlus size={18}/> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeView === item.id ? "bg-emerald-500 text-black shadow-lg" : "text-slate-500 hover:bg-white/5"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button className="flex items-center gap-4 px-6 py-4 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-12 bg-gradient-to-br from-[#020617] to-[#0b0f1a]">
        
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
              {activeView === "overview" && "Global Pulse"}
              {activeView === "requests" && "Approval Queue"}
              {activeView === "inventory" && "Arena Architect"}
              {activeView === "admins" && "Platform Admins"}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em]">Krater Emergent AI Systems</p>
          </div>
          <div className="bg-[#0b0f1a] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Live</span>
          </div>
        </header>

        {/* --- 1. OVERVIEW (Global Stats) --- */}
        {activeView === "overview" && (
          <div className="grid grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-[#0b0f1a] border border-white/5 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <TrendingUp size={100} className="absolute -right-8 -bottom-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-all" />
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Global Revenue</p>
              <h3 className="text-4xl font-black italic">₹1,240,000</h3>
            </div>
            <div className="bg-[#0b0f1a] border border-white/5 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <Users size={100} className="absolute -right-8 -bottom-8 text-blue-500/5 group-hover:text-blue-500/10 transition-all" />
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Registered Players</p>
              <h3 className="text-4xl font-black italic">4,890</h3>
            </div>
            <div className="bg-[#0b0f1a] border border-white/5 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <ShieldCheck size={100} className="absolute -right-8 -bottom-8 text-yellow-500/5 group-hover:text-yellow-500/10 transition-all" />
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Live Disputes</p>
              <h3 className="text-4xl font-black italic text-yellow-500">02</h3>
            </div>
          </div>
        )}

        {/* --- 2. REQUESTS (Detailed Table) --- */}
        {activeView === "requests" && (
          <div className="bg-[#0b0f1a] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-8 py-6">Type</th>
                  <th className="px-8 py-6">Venue & Owner</th>
                  <th className="px-8 py-6">Change Log</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-8">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${req.type === 'Edit' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-black italic text-sm">{req.venue}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{req.owner}</p>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-[11px] font-bold text-slate-400 italic">"{req.changeLog}"</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <button className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Review & Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- 3. INVENTORY (Arena Architect Control) --- */}
        {activeView === "inventory" && (
          <div className="grid grid-cols-2 gap-6 animate-in fade-in">
            {inventory.map(arena => (
              <div key={arena.id} className="bg-[#0b0f1a] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${arena.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      <Power size={28} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">{arena.name}</h4>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12}/> {arena.city} • {arena.totalSlots} Slots Overall
                      </p>
                    </div>
                  </div>
                  <button onClick={() => openFullEdit(arena)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                    <Edit3 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-10">
                  {arena.categories.map(cat => (
                    <div key={cat.name} className={`p-4 rounded-2xl border flex flex-col gap-3 ${cat.active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5 grayscale opacity-40'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{cat.name}</span>
                      <span className="text-lg font-black italic">{cat.courtCount} Courts</span>
                    </div>
                  ))}
                </div>

                <button 
                   onClick={() => openFullEdit(arena)}
                   className="w-full bg-white/5 border border-white/5 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-300 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-3"
                >
                  <Layers size={16} /> Enter Full Architect Mode
                </button>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* --- MASTER ARCHITECT MODAL --- */}
      {showEditModal && editingArena && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-[#020617]/95 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-[#0b0f1a] border border-white/10 w-full max-w-4xl rounded-[4rem] p-16 shadow-2xl flex gap-12 max-h-[90vh]">
            <div className="w-64 flex flex-col gap-4">
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] text-center mb-4">
                <p className="text-[10px] font-black uppercase text-emerald-500 mb-2 tracking-widest">Global Status</p>
                <h3 className="text-3xl font-black italic text-emerald-500 uppercase">{editingArena.status}</h3>
              </div>
              <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-xl">Apply Changes</button>
              <button onClick={() => setShowEditModal(false)} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancel</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-6 no-scrollbar">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Edit Structure: {editingArena.name}</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-500"><X size={24}/></button>
              </div>

              <div className="space-y-12 pb-12">
                <section>
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em]">Court Inventory</h4>
                      <button className="text-emerald-500 text-[10px] font-black uppercase">+ New Section</button>
                   </div>
                   <div className="space-y-3">
                      {editingArena.categories.map(cat => (
                        <div key={cat.name} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                          <span className="text-lg font-black italic uppercase">{cat.name} Courts</span>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl">
                               <span className="text-sm font-black">{cat.courtCount} Courts</span>
                            </div>
                            <button className="text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] mb-6">Pricing & Availability</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                         <label className="text-[9px] font-black uppercase text-slate-500 block mb-2">Base Rate (₹)</label>
                         <input type="number" defaultValue={editingArena.basePrice} className="bg-transparent text-2xl font-black italic focus:outline-none w-full text-emerald-500" />
                      </div>
                      <button className="bg-white/5 border-2 border-dashed border-white/10 p-6 rounded-3xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center">
                         Master Slot Matrix
                      </button>
                   </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdmin;