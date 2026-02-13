import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, Power, PlusSquare, 
  CheckCircle, XCircle, Settings, MapPin 
} from "lucide-react";

function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState("approvals");

  // Mocked Pending Requests for Admin Approval
  const [pendingRequests] = useState([
    { id: "REQ-01", owner: "Suresh P.", type: "New Venue", name: "Elite Turf Cuttack", status: "pending" },
    { id: "REQ-02", owner: "Ramesh K.", type: "Update Code", name: "KRT-2026-DISCOUNT", status: "pending" }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col select-none pb-24">
      
      {/* --- SUPER ADMIN / ADMIN HEADER --- */}
      <header className="p-6 pt-10 border-b border-white/5 bg-[#0b0f1a]">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-emerald-500" size={18} />
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Admin Nexus</h1>
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
          </div>
          <button className="bg-white/5 p-3 rounded-2xl border border-white/10 text-slate-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* --- QUICK ACTION TABS --- */}
      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar">
        {['Approvals', 'Venues', 'Disputes', 'System'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-6 space-y-8">

        {/* --- APPROVAL QUEUE (Venues & Codes) --- */}
        {activeTab === 'approvals' && (
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">Approval Requests</h4>
            <div className="space-y-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2rem]">
                  <div className="flex justify-between mb-4">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{req.type}</span>
                    <span className="text-[9px] text-slate-700 font-black">#{req.id}</span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-1">{req.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 mb-6">Submitted by: {req.owner}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95"><XCircle size={14}/> Reject</button>
                    <button className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95"><CheckCircle size={14}/> Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- THE KILL SWITCH (Venue Control) --- */}
        {activeTab === 'venues' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Venue Status Control</h4>
              <button className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                <PlusSquare size={14} /> Add Venue
              </button>
            </div>
            
            {/* Example Venue Card with Service Toggles */}
            <div className="bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Krater's Arena</h3>
                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <MapPin size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Sector 9, Cuttack</span>
                  </div>
                </div>
                {/* WHOLE SYSTEM TOGGLE */}
                <button className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:bg-red-500 active:text-white transition-all">
                  <Power size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {['Cricket', 'Badminton', 'Football'].map(sport => (
                  <div key={sport} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest">{sport}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- DISPUTE ALERTS --- */}
        {activeTab === 'disputes' && (
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">Active Disputes</h4>
            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-[2rem] flex items-center gap-4">
              <AlertTriangle className="text-red-500" size={24} />
              <div>
                <h5 className="text-[10px] font-black uppercase text-white tracking-widest mb-1">Challenge Dispute: Match #204</h5>
                <p className="text-[10px] font-bold text-slate-500">Venue Manager and Admin notified. Waiting for resolution.</p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminControlCenter;