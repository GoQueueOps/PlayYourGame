import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, Zap, 
  Coins, Camera, Plus, LogOut, RefreshCw, X,
  ChevronLeft, Lock, Shield,
  Sparkles, Check, ArrowRight
} from "lucide-react";

const RECENT_SESSIONS = [
  { id: "PG-X921", arena: "Krater's Arena", date: "05 Feb 2026", sport: "Cricket", status: "Completed", zUsed: 50, price: 450 },
  { id: "PG-B102", arena: "Sector 9 Turf", date: "02 Feb 2026", sport: "Football", status: "Completed", zUsed: 0, price: 600 },
  { id: "PG-A442", arena: "Apex Padel", date: "15 Jan 2026", sport: "Padel", status: "Completed", zUsed: 100, price: 800 }
];

const DEFAULT_AVATARS = ["🦁", "🐯", "🐱", "🦊", "🐻", "🐺", "🦅", "🐉"];

function Settings() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [user, setUser] = useState({
    name: "Aryan Sharma",
    email: "aryan@example.com",
    phone: "+91 9876543210",
    zPoints: 450, 
    gPoints: 1200, 
    avatar: "🦁",
    verified: true,
    joinedDate: "Jan 15, 2025"
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeType, setChangeType] = useState(null);
  const [step, setStep] = useState(1);
  const [newValue, setNewValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const openChangeModal = (type) => {
    setChangeType(type);
    setNewValue("");
    setStep(1);
    setOtp(["", "", "", ""]);
    setIsModalOpen(true);
  };

  const handleUpdateComplete = () => {
    setUser({ ...user, [changeType]: newValue });
    setIsModalOpen(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#050818] text-white pb-32 font-sans relative overflow-x-hidden">
      
      {/* ANIMATED BACKGROUND GRADIENT */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(ellipse 800px 800px at 0% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse 800px 800px at 100% 100%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse 800px 800px at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)",
          ]
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* PARALLAX CURSOR GLOW */}
      <motion.div
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * 50,
        }}
        className="absolute w-[300px] h-[300px] bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"
        style={{ top: "10%", right: "5%", zIndex: 0 }}
      />

      {/* HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/40"
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <h1 className="text-xl font-black uppercase tracking-tight">Settings</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-6 mt-8 relative z-10">
        
        {/* PROFILE HEADER SECTION */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/20 shadow-2xl backdrop-blur-md mb-8 relative overflow-hidden"
        >
          {/* BACKGROUND GLOW */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 blur-2xl"
          />

          <div className="relative z-10">
            {/* AVATAR SECTION */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative group"
              >
                <div className="w-32 h-32 bg-gradient-to-tr from-emerald-500 via-green-500 to-cyan-400 rounded-[2.5rem] flex items-center justify-center text-6xl border-3 border-white/30 shadow-2xl shadow-emerald-500/40 relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/20 to-emerald-500/0"
                  />
                  <span className="relative z-10 group-hover:scale-110 transition-transform">{user.avatar}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-xl border-4 border-[#020617] shadow-xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all"
                >
                  <Camera size={18} strokeWidth={2.5} />
                </motion.button>

                {user.verified && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-3 border-[#020617] flex items-center justify-center shadow-lg z-20"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* USER INFO */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent mb-2"
                >
                  {user.name}
                </motion.h1>

                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-2 justify-center md:justify-start"
                >
                  <Shield size={14} className="text-emerald-400" />
                  Verified Athlete
                  <span className="text-[11px]">•</span>
                  Joined {user.joinedDate}
                </motion.p>

                {/* AVATAR PICKER */}
                <AnimatePresence>
                  {showAvatarPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 flex flex-wrap justify-center md:justify-start gap-3"
                    >
                      {DEFAULT_AVATARS.map((av, idx) => (
                        <motion.button
                          key={av}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.15 }}
                          onClick={() => {
                            setUser({ ...user, avatar: av });
                            setShowAvatarPicker(false);
                          }}
                          className="text-3xl p-3 bg-white/10 hover:bg-emerald-500/30 rounded-xl border border-white/20 hover:border-emerald-500/50 transition-all"
                        >
                          {av}
                        </motion.button>
                      ))}
                      <label className="p-3 bg-white/10 hover:bg-blue-500/30 rounded-xl cursor-pointer border border-white/20 hover:border-blue-500/50 transition-all group">
                        <Plus size={24} className="group-hover:text-blue-400 transition-colors" />
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WALLET SECTION */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-white/10"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap size={20} className="text-yellow-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Z-Points Balance</span>
                </div>
                <p className="text-3xl font-black tracking-tight text-yellow-400">{user.zPoints}</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Coins size={20} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">G-Points Balance</span>
                </div>
                <p className="text-3xl font-black tracking-tight text-emerald-400">{user.gPoints}</p>
              </motion.div>
            </motion.div>

            {/* VIEW WALLET BUTTON */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/wallet")}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-black py-4 rounded-xl font-black uppercase text-sm tracking-[0.15em] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 border border-emerald-400/30 flex items-center justify-center gap-2 transition-all"
            >
              View Wallet
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* ACCOUNT SETTINGS SECTION */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
            <Lock size={14} className="text-emerald-400" />
            Account Settings
          </h2>

          {/* EMAIL CARD */}
          <motion.div
            whileHover={{ scale: 1.02, borderColor: "rgb(52, 211, 153)" }}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/30"
                >
                  <Mail size={20} className="text-blue-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-black uppercase tracking-tight truncate text-white mt-1">{user.email}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openChangeModal('email')}
                className="p-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl border border-blue-500/30 transition-all"
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* PHONE CARD */}
          <motion.div
            whileHover={{ scale: 1.02, borderColor: "rgb(52, 211, 153)" }}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/30"
                >
                  <Phone size={20} className="text-emerald-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white mt-1">{user.phone}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openChangeModal('phone')}
                className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl border border-emerald-500/30 transition-all"
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* PASSWORD CARD */}
          <motion.div
            whileHover={{ scale: 1.02, borderColor: "rgb(168, 85, 247)" }}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl border border-purple-500/30"
                >
                  <Lock size={20} className="text-purple-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Password</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white mt-1">••••••••</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl border border-purple-500/30 transition-all"
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* BOOKING HISTORY SECTION */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            Recent Sessions
          </h2>

          <div className="space-y-3">
            {RECENT_SESSIONS.map((bk, idx) => (
              <motion.div
                key={bk.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-black rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 flex-shrink-0">
                      {bk.sport === "Cricket" ? "🏏" : bk.sport === "Football" ? "⚽" : "🎾"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black uppercase tracking-tight text-white truncate">{bk.arena}</h4>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5">
                        {bk.date} • <span className="text-emerald-400">{bk.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-emerald-400">₹{bk.price}</p>
                    {bk.zUsed > 0 && (
                      <p className="text-[8px] font-black text-yellow-400 uppercase mt-1 flex items-center gap-1 justify-end">
                        <Zap size={10} /> -{bk.zUsed}Z
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* LOGOUT & FOOTER */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6 border-t border-white/10 space-y-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/30 text-red-400 hover:text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-500/30 transition-all shadow-lg"
          >
            <LogOut size={16} />
            Logout
          </motion.button>

          <div className="text-center space-y-2 py-4">
            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Play Your Game</p>
            <p className="text-[7px] text-slate-800 uppercase tracking-[0.4em]">v1.0.4</p>
          </div>
        </motion.div>
      </div>

      {/* --- CHANGE EMAIL/PHONE MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-10 rounded-[2.5rem] border border-white/20 w-full max-w-md backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* BACKGROUND GLOW */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 blur-2xl" />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white z-10 p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X size={20} />
                </motion.button>

                <div className="relative z-10">
                  {step === 1 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2 mb-8">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Update {changeType === 'email' ? 'Email' : 'Phone'}</h3>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">Enter your new {changeType}. We'll send a verification code.</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">New {changeType}</label>
                        <input
                          type={changeType === 'email' ? 'email' : 'tel'}
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder={changeType === 'email' ? 'your@email.com' : '+91 XXXXX XXXXX'}
                          className="w-full bg-white/10 border border-white/20 p-4 rounded-xl outline-none focus:border-emerald-500/50 text-sm font-bold uppercase transition-all"
                          autoFocus
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(2)}
                        disabled={!newValue}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-black py-4 rounded-xl font-black uppercase text-sm tracking-[0.15em] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Send OTP Code
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2 mb-8">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Verify OTP</h3>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Code sent to {newValue}</p>
                      </div>

                      <div className="flex gap-3 justify-center mb-8">
                        {[0, 1, 2, 3].map((i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            maxLength={1}
                            value={otp[i]}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            className="w-14 h-14 bg-white/10 border border-white/20 p-3 rounded-xl text-center text-2xl font-black uppercase outline-none focus:border-emerald-500/50 transition-all"
                            placeholder="-"
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpdateComplete}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-black py-4 rounded-xl font-black uppercase text-sm tracking-[0.15em] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                      >
                        Confirm Update
                      </motion.button>

                      <button
                        onClick={() => setStep(1)}
                        className="w-full text-emerald-400 hover:text-emerald-300 text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Edit {changeType}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
