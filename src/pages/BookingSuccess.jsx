import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // navigate now used
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";

function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate(); // Used in the Back to Home button
  const ticketRef = useRef(null);
  const [toast, setToast] = useState(null);

  const b = state || {};
  const ticketData = {
    arenaName: b.area?.name || b.arena || b.name || "Arena Name",
    location: b.area?.location || b.location || "Location Details",
    court: b.selectedCourt || b.court || "Main Court",
    sport: b.area?.sport || "Sport",
    timeRange: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : (b.time || "00:00 AM"),
    date: b.selectedDate || b.date || new Date(),
    totalPrice: parseInt(b.price?.toString().replace(/[₹,]/g, '') || 0),
    amountPaid: parseInt(b.payableNow?.toString().replace(/[₹,]/g, '') || b.price?.toString().replace(/[₹,]/g, '') || 0),
    bookingId: b.id || "PG-" + Math.random().toString(36).substr(2, 6).toUpperCase()
  };

  // pendingAmount calculation for the ticket display
  const pendingAmount = Math.max(0, ticketData.totalPrice - ticketData.amountPaid);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const downloadPass = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { backgroundColor: "#0f172a", scale: 3 });
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = `Pass-${ticketData.bookingId}.png`;
    link.click();
    showToast("Pass Saved! 📥");
  };

  const sharePass = async () => {
    const canvas = await html2canvas(ticketRef.current, { backgroundColor: "#0f172a", scale: 2 });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "ticket.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: "My Match Ticket", files: [file] });
        } catch (err) { console.log("Cancelled"); }
      } else {
        showToast("Link Copied!");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center py-8 px-5 font-sans overflow-x-hidden italic">
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 z-[300] bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ENTRY ANIMATIONS --- */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="relative mb-6 flex items-center justify-center"
      >
        <div className="relative w-20 h-20 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>⚡</motion.span>
        </div>
      </motion.div>

      <motion.h1 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-3xl font-black uppercase italic tracking-tighter mb-8"
      >
        MATCH <span className="text-green-500">FIXED!</span>
      </motion.h1>

      {/* TICKET SECTION */}
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        ref={ticketRef} style={{ backgroundColor: "#0f172a" }}
        className="w-full max-w-[350px] border border-white/10 p-8 rounded-[3rem] space-y-6 shadow-2xl"
      >
        <div className="text-center pb-5 border-b border-white/5">
          <p className="text-sm font-black text-white uppercase">{ticketData.arenaName}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{ticketData.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-y-6 text-[10px] font-black uppercase">
          <div>
            <p className="text-gray-600 mb-1 tracking-widest">Date</p>
            <p className="text-white">{new Date(ticketData.date).toDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 mb-1 tracking-widest">Time Slot</p>
            <p className="text-white">{ticketData.timeRange}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-[2rem] flex justify-center">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.bookingId}`} alt="QR" className="w-28 h-28" />
        </div>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase">
            <p className="text-gray-500">Paid Now</p>
            <p className="text-green-500">₹{ticketData.amountPaid}</p>
          </div>
          {/* pendingAmount is now used here */}
          <div className="flex justify-between text-[10px] font-black uppercase">
            <p className="text-gray-500">Payment Pending</p>
            <p className="text-white">₹{pendingAmount}</p>
          </div>
        </div>
      </motion.div>

      {/* ACTIONS */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="w-full max-w-[350px] mt-8 grid grid-cols-2 gap-4"
      >
        <button onClick={downloadPass} className="bg-white text-black py-4 rounded-2xl font-black uppercase text-[11px] active:scale-95 transition-all">Download 📥</button>
        <button onClick={sharePass} className="bg-[#22c55e] text-black py-4 rounded-2xl font-black uppercase text-[11px] active:scale-95 transition-all">Share 📲</button>
      </motion.div>

      {/* navigate is now used here */}
      <motion.button 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        onClick={() => navigate("/")} 
        className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all"
      >
        Back to Home
      </motion.button>

      <motion.img 
        initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.4 }}
        src={logo} alt="Logo" className="h-6 mt-12 grayscale" 
      />
    </div>
  );
}

export default BookingSuccess;