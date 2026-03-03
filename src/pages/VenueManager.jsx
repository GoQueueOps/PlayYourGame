import React, { useState } from "react";
import { 
  Plus, CheckCircle2, X, Clock, Swords, 
  Bell, Users, Phone, Share2, Unlock, 
  Droplets, Sandwich, Trash2, Download, Lock
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

function VenueManager() {
  const [activeTab, setActiveTab] = useState("slots"); 
  const [activeSport, setActiveSport] = useState("Football");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [miscName, setMiscName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [newUser, setNewUser] = useState({ name: "", phone: "", fee: "" });

  const sports = ["Football", "Cricket", "Pickleball"];
  const timeSlots = ["04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"];

  const [bookings, setBookings] = useState([
    { 
      id: 101, sport: "Football", time: ["06:00 PM"], user: "TEJAS", phone: "9876543210", 
      fee: 800, advancePaid: 200, source: "online", 
      extras: [{ id: 1, name: "Water", price: 20 }, { id: 2, name: "Snacks", price: 50 }], isLocked: true 
    },
    { 
      id: 102, sport: "Cricket", time: ["08:00 PM"], user: "ARYAN", phone: "9988776655", 
      fee: 1200, advancePaid: 400, source: "online", 
      extras: [{ id: 3, name: "Juice", price: 60 }], isLocked: false 
    }
  ]);

  const getBalanceDue = (b) => {
    const extrasTotal = b.extras.reduce((sum, item) => sum + item.price, 0);
    return (b.fee + extrasTotal) - (b.advancePaid || 0);
  };

  // ✅ FIXED SHARE LOGIC: NOW SHOWS TOTAL PER SPORT
  const shareMasterReport = async () => {
    let totalOnline = 0;
    let totalSpot = 0;
    let grandRevenue = 0;
    let message = `*🏟️ ARENA MASTER SETTLEMENT*\n*Date:* ${new Date().toLocaleDateString()}\n--------------------------\n`;

    sports.forEach(sport => {
      const sportBookings = bookings.filter(b => b.sport === sport);
      if (sportBookings.length === 0) return;

      let sportSubTotal = 0; // ✅ Total for this specific sport
      message += `\n*${sport.toUpperCase()} SECTOR*\n`;
      
      sportBookings.forEach(b => {
        const total = b.fee + b.extras.reduce((s, e) => s + e.price, 0);
        const spot = total - b.advancePaid;
        totalOnline += b.advancePaid;
        totalSpot += spot;
        sportSubTotal += total;
        message += `• ${b.time[0]}: ${b.user} (₹${total})\n`;
      });
      
      message += `> *${sport} Total: ₹${sportSubTotal}*\n`;
      grandRevenue += sportSubTotal;
    });

    message += `\n--------------------------\n*GRAND SUMMARY*\n`;
    message += `Online/Advance: ₹${totalOnline}\n`;
    message += `Spot Collection: ₹${totalSpot}\n`;
    message += `*NET REVENUE: ₹${grandRevenue}*\n--------------------------\n_Sent via Venue Manager Admin_`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Arena Report', text: message });
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // ✅ FIXED PDF LOGIC: NOW SHOWS TOTAL PER SPORT
  const downloadMasterReportPDF = () => {
    const doc = new jsPDF();
    let totalOnlineAll = 0;
    let totalSpotAll = 0;
    let grandRevenueAll = 0;
    let currentY = 20;

    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text("FINAL REVENUE RECONCILIATION", 14, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    currentY += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()} | Arena Ledger`, 14, currentY);
    doc.line(14, currentY + 2, 196, currentY + 2);
    currentY += 15;

    sports.forEach((sport) => {
      const sportBookings = bookings.filter(b => b.sport === sport);
      if (sportBookings.length === 0) return;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${sport.toUpperCase()} DIVISION`, 14, currentY);
      currentY += 5;

      let sportSubTotal = 0;
      const tableRows = sportBookings.map((b) => {
        const extrasSum = b.extras.reduce((s, e) => s + e.price, 0);
        const total = b.fee + extrasSum;
        const spot = total - b.advancePaid;
        
        sportSubTotal += total;
        totalOnlineAll += b.advancePaid;
        totalSpotAll += spot;
        
        return [
          b.time.join(", "),
          b.user,
          `Fee: ${b.fee}\nExtras: ${b.extras.map(e => `${e.name}(${e.price})`).join(", ")}`,
          `Rs. ${b.advancePaid}`,
          `Rs. ${spot}`,
          `Rs. ${total}`
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['SLOT', 'PLAYER', 'BREAKDOWN', 'ONLINE', 'SPOT', 'TOTAL']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillStyle: [31, 41, 55], fontSize: 9 },
        styles: { fontSize: 8 },
      });

      grandRevenueAll += sportSubTotal;
      currentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text(`Sub-Total (${sport}): Rs. ${sportSubTotal}`, 145, currentY - 2);
      currentY += 10;

      if (currentY > 230) { doc.addPage(); currentY = 20; }
    });

    doc.setFillColor(245, 245, 245);
    doc.rect(14, currentY, 182, 45, 'F');
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("GRAND SUMMARY (ALL SPORTS)", 20, currentY + 12);
    doc.setFontSize(10);
    doc.text(`Online/Advance: Rs. ${totalOnlineAll}`, 20, currentY + 22);
    doc.text(`Spot Collection: Rs. ${totalSpotAll}`, 20, currentY + 29);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`NET REVENUE: RS. ${grandRevenueAll}`, 20, currentY + 38);
    
    currentY += 60;
    doc.setDrawColor(200);
    doc.line(140, currentY, 190, currentY);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Manager Signature", 152, currentY + 5);

    doc.save(`Master_Settlement_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-32 italic select-none font-black">
      <nav className="bg-[#0b0f1a] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex justify-around p-4 max-w-lg mx-auto">
          {[
            { id: "slots", icon: <Users size={18}/>, label: "Schedule" }, 
            { id: "timeline", icon: <Clock size={18}/>, label: "Billing" }, 
            { id: "challenges", icon: <Swords size={18}/>, label: "Arena" },
            { id: "alerts", icon: <Bell size={18}/>, label: "Alerts" }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? "text-emerald-400" : "text-slate-600"}`}>
              {tab.icon} <span className="text-[8px] uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-3 p-5 bg-black/40 border-t border-white/5">
          {sports.map(sport => (
            <button key={sport} onClick={() => setActiveSport(sport)} className={`px-10 py-3 rounded-2xl text-[11px] uppercase tracking-tighter border transition-all ${activeSport === sport ? "bg-white text-black border-white shadow-xl scale-105" : "border-white/10 text-slate-500"}`}>
              {sport}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6 max-w-lg mx-auto">
        {activeTab === "slots" && (
          <div className="space-y-3">
            {timeSlots.map((slotTime) => {
              const booking = bookings.find(b => b.time.includes(slotTime) && b.sport === activeSport);
              return (
                <div key={slotTime} onClick={() => !booking ? (setSelectedSlot(slotTime), setShowBookingModal(true)) : setActiveTab("timeline")} className={`p-6 rounded-[2.5rem] border flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all ${booking ? "bg-white/5 border-white/10" : "bg-emerald-400/5 border-emerald-400/10"}`}>
                  <div className="flex items-center gap-8 text-left">
                    <span className={`text-[12px] w-16 ${booking ? "text-slate-600" : "text-emerald-400"}`}>{slotTime}</span>
                    <div>
                      <h4 className={`text-sm uppercase tracking-tight ${booking ? "text-white" : "text-slate-800"}`}>{booking ? booking.user : "Open Slot"}</h4>
                      {booking && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[7px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase">Online</span>
                          {booking.advancePaid > 0 && <span className="text-[8px] text-emerald-400 tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">Paid ₹{booking.advancePaid}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  {booking ? <Phone size={18} className="text-emerald-500 opacity-50" /> : <Plus size={18} className="text-emerald-400 opacity-20" />}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadMasterReportPDF} className="bg-white text-black py-5 rounded-[2rem] uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl italic">
                <Download size={14}/> Download PDF
              </button>
              <button onClick={shareMasterReport} className="bg-emerald-500 text-black py-5 rounded-[2rem] uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl italic">
                <Share2 size={14}/> Share Report
              </button>
            </div>

            {bookings.filter(b => b.sport === activeSport).map(b => (
              <div key={b.id} className={`bg-[#0b0f1a] border rounded-[3rem] p-8 transition-all ${b.isLocked ? "border-emerald-500/20 opacity-80" : "border-white/5 shadow-2xl"}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="text-left">
                    <h3 className="text-2xl uppercase tracking-tighter text-emerald-400 leading-none">{b.user}</h3>
                    <p className="text-[10px] text-slate-500 uppercase mt-2">{b.time.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase italic">Collection Due</p>
                    <p className="text-3xl text-white mt-1 font-black">₹{getBalanceDue(b)}</p>
                  </div>
                </div>

                <div className="flex justify-between bg-white/5 p-4 rounded-2xl mb-6 border border-white/5 italic">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">Online Advance</span>
                  <span className="text-[10px] text-emerald-400 font-black">₹{b.advancePaid}</span>
                </div>

                <div className="space-y-2 mb-8">
                  {b.extras.map(e => (
                    <div key={e.id} className="flex justify-between items-center bg-black/40 px-5 py-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">{e.name} (₹{e.price})</span>
                      {!b.isLocked && <button onClick={() => setBookings(prev => prev.map(book => book.id === b.id ? { ...book, extras: book.extras.filter(ex => ex.id !== e.id) } : book))} className="text-red-500/40 hover:text-red-500"><Trash2 size={14}/></button>}
                    </div>
                  ))}
                </div>

                {!b.isLocked ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={() => {setMiscName("Water"); setCustomPrice("20")}} className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all">
                            <Droplets size={16} className="text-blue-400"/><span className="text-[8px] uppercase">Water (₹20)</span>
                        </button>
                        <button onClick={() => {setMiscName("Snack"); setCustomPrice("50")}} className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all">
                            <Sandwich size={16} className="text-orange-400"/><span className="text-[8px] uppercase">Snack (₹50)</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                       <input className="bg-white/5 border border-white/5 p-4 rounded-2xl text-[10px] uppercase outline-none" placeholder="ITEM NAME" value={miscName} onChange={e => setMiscName(e.target.value)} />
                       <div className="flex bg-white/5 border border-white/5 rounded-2xl pr-2 items-center">
                        <input type="number" className="bg-transparent w-full p-4 text-[10px] outline-none" placeholder="PRICE ₹" value={customPrice} onChange={e => setCustomPrice(e.target.value)} />
                        <button onClick={() => {
                          if (!customPrice || !miscName) return;
                          setBookings(prev => prev.map(book => book.id === b.id ? {...book, extras: [...book.extras, {id: Date.now(), name: miscName, price: parseFloat(customPrice)}]} : book));
                          setMiscName(""); setCustomPrice("");
                        }} className="text-emerald-400"><CheckCircle2 size={24}/></button>
                      </div>
                    </div>
                    <button onClick={() => setBookings(prev => prev.map(item => item.id === b.id ? {...item, isLocked: true} : item))} className="w-full bg-emerald-500 text-black py-5 rounded-[1.5rem] uppercase text-[10px] tracking-widest shadow-xl italic flex items-center justify-center gap-2">
                      <Lock size={14}/> Finalize Bill
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                    <div className="flex-1 text-center py-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[10px] text-emerald-500 uppercase tracking-[0.2em]">✅ Billing Finalized</div>
                    <button onClick={() => setBookings(prev => prev.map(item => item.id === b.id ? {...item, isLocked: false} : item))} className="p-5 bg-white/5 rounded-2xl border border-white/10 text-slate-500 hover:text-white transition-all">
                      <Unlock size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="p-10 text-center space-y-4">
            <Bell size={48} className="mx-auto text-slate-700" />
            <p className="text-xs uppercase text-slate-500 tracking-widest">No New Alerts</p>
          </div>
        )}
      </main>

      {/* MANUAL ENTRY MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0b0f1a] border border-white/10 w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl uppercase tracking-tighter leading-none text-left">Manual <span className="text-emerald-400">Entry</span></h2>
              <button onClick={() => setShowBookingModal(false)}><X /></button>
            </div>
            <div className="space-y-4 mb-10 text-left">
              <input className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-[11px] uppercase outline-none" placeholder="USER NAME" onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-[11px] outline-none" placeholder="PHONE NUMBER" onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              <input type="number" className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl text-[11px] outline-none" placeholder="TOTAL FEE ₹" onChange={e => setNewUser({...newUser, fee: e.target.value})} />
            </div>
            <button onClick={() => {
                if (!newUser.name || !newUser.fee) return;
                setBookings([...bookings, { id: Date.now(), sport: activeSport, time: [selectedSlot], user: newUser.name.toUpperCase(), phone: newUser.phone, fee: parseFloat(newUser.fee), advancePaid: 0, source: 'manual', extras: [], isLocked: false }]);
                setShowBookingModal(false);
              }} className="w-full bg-emerald-400 text-black py-6 rounded-[2rem] uppercase text-[10px] tracking-[0.2em]">Confirm Slot</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueManager;