import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ChevronLeft, Sparkles } from "lucide-react";
import logo from "../assets/logo.png";

/* ─────────────── HELPERS ─────────────── */
function getAdvanceAmount(total) {
  if (total <= 1000) return 100;
  if (total <= 2000) return 200;
  return Math.round(total * 0.1);
}

function formatNiceDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { 
    weekday: "short", 
    day: "2-digit", 
    month: "short"
  });
}

/* ─────────────── COMPONENT ─────────────── */
function ConfirmBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [paymentType, setPaymentType] = useState("advance");
  const [useZPoints, setUseZPoints] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [userWalletBalance] = useState(50); 
  const [isProcessing, setIsProcessing] = useState(false);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-black text-white font-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-5xl">⚠️</div>
          <p className="text-2xl font-black">Session Expired</p>
          <p className="text-sm text-slate-400">Please go back and try again</p>
        </motion.div>
      </div>
    );
  }

  const { area, selectedDate, selectedCourt, startTime, endTime, price } = state;

  let displaySport = state.selectedSport || "Match Session";
  let friendlyCourtName = "Main Court";

  if (area?.sportsManaged) {
    Object.entries(area.sportsManaged).forEach(([sportKey, courtArray]) => {
      const match = courtArray.find((c) => c.physicalID === selectedCourt);
      if (match) {
        displaySport = sportKey;
        friendlyCourtName = match.name;
      }
    });
  }

  const discount = useZPoints ? userWalletBalance : 0;
  const finalPrice = Math.max(0, price - discount);
  const advanceAmount = getAdvanceAmount(finalPrice);
  const payableNow = paymentType === "advance" ? advanceAmount : finalPrice;

  const handleFinalPayment = () => {
    setIsProcessing(true);
    const transactionId = "TXN" + Date.now().toString().slice(-6);
    
    setTimeout(() => {
      navigate("/success", { 
        state: { 
          ...state,         
          payableNow: payableNow,       
          price: finalPrice,
          courtName: friendlyCourtName, 
          selectedSport: displaySport, 
          voucherApplied: voucherCode,
          id: transactionId 
        } 
      });
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white pb-10 pt-6 font-sans overflow-hidden relative">
      {/* ANIMATED BACKGROUND GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 -right-40 w-96 h-96 bg-green-500/20 blur-[100px] rounded-full"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md mx-auto px-4 space-y-6 relative z-10"
      >
        {/* ─────── HEADER ─────── */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl active:scale-90 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <ChevronLeft size={24} className="text-white" />
          </motion.button>
          <motion.img
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            src={logo}
            alt="Logo"
            className="h-10 w-auto opacity-90"
          />
          <div className="w-12" />
        </motion.div>

        {/* ─────── TITLE ─────── */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight leading-none">
            Review Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400">
              Booking
            </span>
          </h1>
        </motion.div>

        {/* ─────── COURT INFO CARD ─────── */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(59, 130, 246, 0.2)" }}
          className="relative group rounded-3xl overflow-hidden"
        >
          {/* GRADIENT BORDER EFFECT */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur" />

          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex gap-5">
            {/* IMAGE WITH GLOW */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-opacity" />
              <img
                src={area?.images?.[0]}
                alt="Court"
                className="relative w-20 h-20 object-cover rounded-2xl border border-white/20"
              />
            </motion.div>

            <div className="flex flex-col justify-between text-left flex-1">
              <div>
                <h2 className="font-black text-lg leading-tight line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
                  {area?.name}
                </h2>
                <p className="text-xs font-black text-blue-400/90 uppercase tracking-widest mb-1">
                  {displaySport} • {friendlyCourtName}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>{startTime} - {endTime}</span>
                </div>
                <p className="text-xs font-black text-green-400/90 tracking-wider">
                  {formatNiceDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─────── PRICE BREAKDOWN ─────── */}
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">
            Price Details
          </p>
          <div className="space-y-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Base Price</span>
              <span className="font-bold">₹{price}</span>
            </div>
            {useZPoints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex justify-between items-center text-sm border-t border-white/5 pt-2"
              >
                <span className="text-yellow-400/80">Z-Points Discount</span>
                <span className="font-bold text-green-400">-₹{discount}</span>
              </motion.div>
            )}
            <div className="flex justify-between items-center text-base border-t border-white/5 pt-2 font-black">
              <span>Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                ₹{finalPrice}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─────── VOUCHER SECTION ─────── */}
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">
            Apply Promo Code
          </p>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
            <div className="relative flex gap-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2 group-focus-within:border-blue-500/50 transition-all">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Enter code"
                className="bg-transparent outline-none text-xs flex-1 text-white placeholder:text-gray-600 font-black uppercase tracking-wider px-4 py-3"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/30"
              >
                Apply
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ─────── Z-POINTS TOGGLE ─────── */}
        <motion.button
          variants={itemVariants}
          onClick={() => setUseZPoints(!useZPoints)}
          whileHover={{ scale: 1.02 }}
          className={`w-full p-5 rounded-2xl border transition-all flex justify-between items-center ${
            useZPoints
              ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/5"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={useZPoints ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black transition-all ${
                useZPoints
                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/50"
                  : "bg-white/10 text-yellow-400"
              }`}
            >
              ⚡
            </motion.div>
            <div className="text-left">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wide">Z-Points</p>
              <p className="text-lg font-black">₹{userWalletBalance}</p>
            </div>
          </div>
          <motion.span
            animate={useZPoints ? { scale: 1 } : { scale: 0.8 }}
            className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-all ${
              useZPoints
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                : "bg-white/10 text-white/60"
            }`}
          >
            {useZPoints ? "✓ Applied" : "Redeem"}
          </motion.span>
        </motion.button>

        {/* ─────── PAYMENT METHODS ─────── */}
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">
            Payment Method
          </p>

          <label
            className={`flex justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
              paymentType === "advance"
                ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/5"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex gap-3 items-center">
              <motion.input
                type="radio"
                checked={paymentType === "advance"}
                onChange={() => setPaymentType("advance")}
                className="w-5 h-5 accent-green-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-black">Pay Advance</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                  Secure your slot
                </span>
              </div>
            </div>
            <motion.span
              animate={paymentType === "advance" ? { scale: 1.1 } : { scale: 1 }}
              className="font-black text-lg text-green-400"
            >
              ₹{advanceAmount}
            </motion.span>
          </label>

          <label
            className={`flex justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
              paymentType === "full"
                ? "border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/5"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex gap-3 items-center">
              <motion.input
                type="radio"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-black">Full Payment</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                  Skip the queue
                </span>
              </div>
            </div>
            <motion.span
              animate={paymentType === "full" ? { scale: 1.1 } : { scale: 1 }}
              className="font-black text-lg text-blue-400"
            >
              ₹{finalPrice}
            </motion.span>
          </label>
        </motion.div>

        {/* ─────── FINAL CHECKOUT ─────── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* ANIMATED BACKGROUND */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-green-600/20 to-transparent" />
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/30 blur-3xl rounded-full"
          />

          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                Total Amount
              </p>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400"
              >
                ₹{payableNow}
              </motion.div>
            </div>

            <motion.button
              onClick={handleFinalPayment}
              disabled={isProcessing}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 hover:from-blue-400 hover:via-cyan-400 hover:to-green-400 text-black py-5 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-blue-500/40 transition-all disabled:opacity-70 relative overflow-hidden group"
            >
              {isProcessing ? (
                <motion.div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  Processing...
                </motion.div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock size={20} />
                  Confirm & Pay
                  <Sparkles size={20} />
                </div>
              )}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-30 transition-opacity" />
            </motion.button>

            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Check size={12} />
              Secure Payment
            </p>
          </div>
        </motion.div>

        {/* TRUST BADGES */}
        <motion.div
          variants={itemVariants}
          className="flex justify-around pt-4 text-center"
        >
          {["🔒 Secure", "✓ Verified", "⚡ Instant"].map((badge, idx) => (
            <div key={idx} className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {badge}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ConfirmBooking;