import React, { useState } from "react";
import { 
  Plus, Droplets, CheckCircle2, X, Lock, Unlock,
  Clock, Swords, Bell, Users, Phone, Trash2
} from "lucide-react";

function VenueManager() {
  const [activeTab, setActiveTab] = useState("slots"); 
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customPrice, setCustomPrice] = useState("");
  const [lastAdded, setLastAdded] = useState(null);

  const [newUser, setNewUser] = useState({ name: "", phone: "", fee: "" });

  const [bookings, setBookings] = useState([
    { 
      id: 101, 
      time: "06:00 PM", 
      user: "TEJAS", 
      phone: "9876543210", 
      fee: 800, 
      advancedPaid: 100, 
      zPointsUsed: 10, 
      extras: [], 
      isLocked: false,
      status: "booked" 
    },
    { 
      id: 102, 
      time: "08:00 PM", 
      user: "ARYAN", 
      phone: "9988776655", 
      fee: 1500, 
      advancedPaid: 1500, 
      zPointsUsed: 0,
      extras: [], 
      isLocked: false,
      status: "booked" 
    }
  ]);

  const timeSlots = ["04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"];

  const getSpotPay = (b) => {
    const extrasTotal = b.extras.reduce((sum, item) => sum + item.price, 0);
    return (b.fee + extrasTotal) - (b.advancedPaid + b.zPointsUsed);
  };

  const addExtra = (id, item, price) => {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) return;
    setBookings(prev => prev.map(b => 
      (b.id === id && !b.isLocked) ? { ...b, extras: [...b.extras, { id: Date.now(), name: item, price: p }] } : b
    ));
    setLastAdded(`${item} Added!`);
    setCustomPrice("");
    setTimeout(() => setLastAdded(null), 2000);
  };

  // Logic: Remove specific extra item
  const removeExtra = (bookingId, extraId) => {
    setBookings(prev => prev.map(b => 
      (b.id === bookingId && !b.isLocked) ? { ...b, extras: b.extras.filter(e => e.id !== extraId) } : b
    ));
  };

  const toggleLock = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, isLocked: !b.isLocked } : b));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-32 overflow-x-hidden">
      
      {/* NAVIGATION TABS */}
      <nav className="bg-[#0b0f1a] border-b border-white/5 px-4 pt-6 sticky top-0 z-[100] w-full">
        <div className="flex justify-around max-w-lg mx-auto">
          {[
            { id: "slots", icon: <Users size={18}/>, label: "Schedule" },
            { id: "timeline", icon: <Clock size={18}/>, label: "Billing" },
            { id: "challenges", icon: <Swords size={18}/>, label: "Arena" },
            { id: "alerts", icon: <Bell size={18}/>, label: "Alerts" }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 pb-3 px-4 transition-all relative ${activeTab === tab.id ? "text-emerald-400" : "text-slate-600"}`}>
              {tab.icon}
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 w-full h-0.5 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6 max-w-lg mx-auto">
        
        {/* --- SCHEDULE GRID --- */}
        {activeTab === "slots" && (
          <div className="space-y-3">
            {timeSlots.map(slotTime => {
              const booking = bookings.find(b => b.time === slotTime);
              return (
                <div key={slotTime} className={`p-5 rounded-[2rem] border flex items-center justify-between ${booking ? "bg-white/5 border-white/10" : "bg-emerald-400/5 border-emerald-400/20"}`}>
                  <div className="flex items-center gap-6 cursor-pointer" onClick={() => !booking ? (setSelectedSlot(slotTime), setShowBookingModal(true)) : setActiveTab("timeline")}>
                    <span className={`text-xs font-black italic w-16 ${booking ? "text-slate-500" : "text-emerald-400"}`}>{slotTime}</span>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${booking ? "text-white" : "text-slate-700 italic"}`}>{booking ? booking.user : "Open Slot"}</h4>
                      {booking && <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{booking.phone}</p>}
                    </div>
                  </div>
                  {booking ? (
                    <a href={`tel:${booking.phone}`} className="p-3 bg-emerald-500 text-black rounded-2xl shadow-lg active:scale-90 transition-transform"><Phone size={18} /></a>
                  ) : <Plus size={18} className="text-emerald-400 opacity-30" />}
                </div>
              );
            })}
          </div>
        )}

        {/* --- BILLING TIMELINE --- */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            {bookings.map(b => (
              <div key={b.id} className={`bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-6 relative ${b.isLocked ? "border-emerald-500/30" : ""}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">{b.user}</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">{b.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic leading-none">Spot Pay</p>
                    <p className="text-2xl font-black italic text-emerald-400 mt-1">₹{getSpotPay(b)}</p>
                  </div>
                </div>

                {/* Extras List with Trash Button */}
                <div className="space-y-2 mb-6">
                  {b.extras.map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase">{e.name}</span>
                        <span className="text-[10px] text-yellow-500 font-black italic">₹{e.price}</span>
                      </div>
                      {!b.isLocked && (
                        <button onClick={() => removeExtra(b.id, e.id)} className="p-2 text-red-500/50 hover:text-red-500 active:scale-90 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Billing Panel */}
                {!b.isLocked ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button onClick={() => addExtra(b.id, "Water", 10)} className="flex-1 bg-white/5 py-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-all">
                        <Droplets size={16} className="text-blue-400"/><span className="text-[10px] font-black italic">₹10</span>
                      </button>
                      <div className="flex-[2] flex bg-white/5 border border-white/5 rounded-2xl px-4 items-center gap-2">
                        <Plus size={16} className="text-emerald-400" />
                        <input type="number" placeholder="Custom ₹" className="bg-transparent w-full text-[11px] font-black focus:outline-none" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
                        <button onClick={() => addExtra(b.id, "Misc", customPrice)} className="text-emerald-400"><CheckCircle2 size={20}/></button>
                      </div>
                    </div>
                    {lastAdded && <p className="text-center text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">{lastAdded}</p>}
                    <button onClick={() => toggleLock(b.id)} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                      <Lock size={14} strokeWidth={3}/> Lock Calculation
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-center py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 italic tracking-widest">
                      ✅ Billing Finalized
                    </div>
                    <button onClick={() => toggleLock(b.id)} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-500 hover:text-white transition-all">
                      <Unlock size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0b0f1a] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Book Slot</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-500"><X /></button>
            </div>
            <div className="space-y-4 mb-10">
              <input className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-black focus:border-emerald-400 outline-none uppercase" placeholder="NAME" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-black focus:border-emerald-400 outline-none" placeholder="PHONE" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              <input type="number" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-black focus:border-emerald-400 outline-none" placeholder="FEE ₹" value={newUser.fee} onChange={e => setNewUser({...newUser, fee: e.target.value})} />
            </div>
            <button onClick={() => {
              setBookings([...bookings, { id: Date.now(), time: selectedSlot, user: newUser.name.toUpperCase(), phone: newUser.phone, fee: parseFloat(newUser.fee), advancedPaid: 0, zPointsUsed: 0, extras: [], isLocked: false, status: "booked" }]);
              setShowBookingModal(false);
            }} className="w-full bg-emerald-400 text-black py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest">Confirm Booking</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default VenueManager;