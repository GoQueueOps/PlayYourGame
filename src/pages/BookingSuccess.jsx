import React, { useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Share2, Home, CheckCircle, Calendar, Clock, MapPin } from "lucide-react";
import logo from "../assets/logo.png";

function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const ticketData = useMemo(() => {
    const b = state || {};

    const extractedSport =
      b.selectedSport ??
      b.sport ??
      b.category ??
      "-";

    return {
      arenaName: b.area?.name || b.arena || "Arena Name",
      location: b.area?.location || b.location || "Location Details",
      sport: extractedSport,
      court: b.courtName || b.selectedCourt || "Main Court",
      timeRange:
        b.startTime && b.endTime
          ? `${b.startTime} - ${b.endTime}`
          : "Time Slot",
      date: b.selectedDate || b.date || new Date(),
      totalPrice: parseInt(
        b.price?.toString().replace(/[₹,]/g, "") || 0
      ),
      amountPaid: parseInt(
        b.payableNow?.toString().replace(/[₹,]/g, "") || 0
      ),
      bookingId:
        b.id ||
        "PG-" +
          Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
  }, [state]);

  const pendingAmount = Math.max(
    0,
    ticketData.totalPrice - ticketData.amountPaid
  );

  const downloadPass = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#020617",
        scale: 3,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Pass-${ticketData.bookingId}.png`;
      link.click();

      setToast("✅ Pass downloaded successfully!");
    } catch (err) {
      setToast("❌ Failed to download");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  const sharePass = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#020617",
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "ticket.png", {
          type: "image/png",
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `Match Ticket - ${ticketData.bookingId}`,
              text: `My booking at ${ticketData.arenaName}`,
              files: [file],
            });
            setToast("📲 Shared successfully!");
          } catch (err) {
            setToast("Share cancelled");
          }
        } else {
          setToast("📋 Copied to clipboard");
        }
      });
    } catch (err) {
      setToast("Failed to share");
    }
    setTimeout(() => setToast(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white flex flex-col items-center py-8 px-4 font-sans overflow-x-hidden relative">
      {/* ANIMATED BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 -left-40 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"
        />
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-2xl shadow-green-500/50 flex items-center gap-2"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-lg flex flex-col items-center"
      >
        {/* SUCCESS CHECKMARK - ENHANCED */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          {/* OUTER RINGS */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.05, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.1 }}
            className="absolute inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl"
          />

          {/* MAIN CIRCLE */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-green-500/60 border-4 border-black"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <CheckCircle size={48} className="text-black" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* MAIN HEADING */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">
            Booking
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400">
              Confirmed!
            </span>
          </h1>
          <p className="text-sm text-slate-400 font-bold tracking-widest mt-3 uppercase">
            Your match is secured
          </p>
        </motion.div>

        {/* BOOKING ID CARD */}
        <motion.div
          variants={itemVariants}
          className="w-full mb-8"
        >
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mb-2">
              Booking ID
            </p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 tracking-wider">
              {ticketData.bookingId}
            </p>
          </div>
        </motion.div>

        {/* TICKET CARD */}
        <motion.div
          ref={ticketRef}
          variants={itemVariants}
          whileHover={{ y: -8, boxShadow: "0 40px 80px rgba(34, 197, 94, 0.2)" }}
          className="w-full mb-8 relative group"
        >
          {/* GRADIENT BORDER EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur" />

          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/15 p-8 rounded-3xl space-y-6 shadow-2xl overflow-hidden">
            {/* DECORATIVE ELEMENTS */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-2xl rounded-full -mr-16 -mt-16"
            />

            {/* HEADER */}
            <div className="relative z-10 text-center pb-6 border-b border-white/10">
              <p className="text-lg font-black uppercase tracking-tight mb-2">
                {ticketData.arenaName}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                <MapPin size={12} className="text-green-400" />
                {ticketData.location}
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="relative z-10 grid grid-cols-2 gap-6">
              {/* SPORT */}
              <motion.div whileHover={{ y: -4 }} className="space-y-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Sport</p>
                <p className="text-lg font-black text-green-400">{ticketData.sport}</p>
              </motion.div>

              {/* COURT */}
              <motion.div whileHover={{ y: -4 }} className="space-y-2 text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Court</p>
                <p className="text-lg font-black text-cyan-400">{ticketData.court}</p>
              </motion.div>

              {/* DATE */}
              <motion.div whileHover={{ y: -4 }} className="space-y-2 flex flex-col">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-amber-400" />
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Date</p>
                </div>
                <p className="text-sm font-black">
                  {new Date(ticketData.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </motion.div>

              {/* TIME */}
              <motion.div whileHover={{ y: -4 }} className="space-y-2 text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Time</p>
                </div>
                <p className="text-sm font-black">{ticketData.timeRange}</p>
              </motion.div>
            </div>

            {/* QR CODE */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative z-10 bg-white p-4 rounded-2xl flex justify-center shadow-lg"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.bookingId}`}
                alt="QR Code"
                className="w-32 h-32"
              />
            </motion.div>

            {/* PAYMENT INFO */}
            <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount Paid</span>
                <span className="text-lg font-black text-green-400">₹{ticketData.amountPaid}</span>
              </div>
              
              {pendingAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between items-center pt-2 border-t border-white/5"
                >
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending</span>
                  <span className="text-lg font-black text-amber-400">₹{pendingAmount}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div variants={itemVariants} className="w-full grid grid-cols-2 gap-4 mb-6">
          <motion.button
            onClick={downloadPass}
            disabled={isDownloading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-gradient-to-r from-white to-slate-100 hover:from-slate-50 hover:to-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-white/20 disabled:opacity-70 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2">
              {isDownloading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                />
              ) : (
                <Download size={16} />
              )}
              <span>{isDownloading ? "Saving..." : "Download"}</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </motion.button>

          <motion.button
            onClick={sharePass}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl shadow-green-500/30 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 size={16} />
              <span>Share</span>
            </div>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors" />
          </motion.button>
        </motion.div>

        {/* BACK HOME BUTTON */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05, x: 10 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-white transition-all uppercase tracking-wider group"
        >
          <Home size={16} />
          <span>Back to Home</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-lg group-hover:text-green-400"
          >
            →
          </motion.span>
        </motion.button>

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-12">
          <motion.img
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            src={logo}
            alt="Logo"
            className="h-8 w-auto opacity-40 hover:opacity-60 transition-opacity"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default BookingSuccess;