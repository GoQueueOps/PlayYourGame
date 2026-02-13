import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

/* ---------------- HELPERS ---------------- */
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

/* ---------------- COMPONENT ---------------- */
function ConfirmBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [paymentType, setPaymentType] = useState("advance");
  const [useZPoints, setUseZPoints] = useState(false); // FIXED: Now used in Z-Points button
  const [voucherCode, setVoucherCode] = useState(""); // FIXED: Connected to input
  const [userWalletBalance] = useState(50); 

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black uppercase italic">
        Session Expired
      </div>
    );
  }

  const { area, selectedDate, selectedCourt, startTime, endTime, price } = state;

  // CALCULATIONS
  const discount = useZPoints ? userWalletBalance : 0;
  const finalPrice = Math.max(0, price - discount); // Ensure price doesn't go negative
  const advanceAmount = getAdvanceAmount(finalPrice);
  const payableNow = paymentType === "advance" ? advanceAmount : finalPrice;

  const handleFinalPayment = () => {
    const transactionId = "TXN" + Date.now().toString().slice(-6);
    navigate("/success", { 
      state: { 
        ...state,         
        payableNow,       
        price: finalPrice,
        voucherApplied: voucherCode, // FIXED: Passes voucher info to success
        id: transactionId 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-10 pt-6 font-sans">
      <div className="max-w-md mx-auto px-5 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center px-1">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl active:scale-90 transition-all">←</button>
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <div className="w-10" /> 
        </div>

        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Review Booking</h1>

        {/* COURT INFO CARD */}
        <div className="bg-white/5 rounded-[2.5rem] p-6 flex gap-5 border border-white/5">
          <img src={area?.images?.[0]} alt="Court" className="w-20 h-20 object-cover rounded-3xl border border-white/10" />
          <div className="flex flex-col justify-center">
            <h2 className="font-black text-xl uppercase italic leading-none mb-1">{area?.name}</h2>
            <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">{selectedCourt} • {startTime} - {endTime}</p>
            <p className="text-[10px] text-green-500 font-bold mt-1 uppercase">{formatNiceDate(selectedDate)}</p>
          </div>
        </div>

        {/* PROMOTIONS SECTION */}
        <div className="space-y-3">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2">Promotions</p>
          <div className="bg-white/5 border border-white/10 p-2 pl-6 rounded-2xl flex justify-between items-center focus-within:border-blue-500 transition-all">
            <input 
              value={voucherCode} // FIXED: Value connected
              onChange={(e) => setVoucherCode(e.target.value)} // FIXED: Setter connected
              placeholder="Voucher Code" 
              className="bg-transparent outline-none text-[10px] flex-1 text-white placeholder:text-gray-700 font-black uppercase tracking-widest" 
            />
            <button className="bg-white/10 text-white px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all">
              Apply
            </button>
          </div>
        </div>

        {/* Z-POINTS SECTION */}
        <button 
          onClick={() => setUseZPoints(!useZPoints)} // FIXED: Setter connected
          className={`w-full p-6 rounded-[2.5rem] border transition-all flex justify-between items-center ${useZPoints ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-white/5'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${useZPoints ? 'bg-yellow-500 text-black shadow-lg' : 'bg-white/5 text-yellow-500'}`}>⚡</div>
            <div className="text-left">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Z-Points Balance</p>
              <p className="text-xl font-black">{userWalletBalance}</p>
            </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${useZPoints ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
            {useZPoints ? 'Applied' : 'Redeem'}
          </span>
        </button>

        {/* PAYMENT METHOD */}
        <div className="space-y-3">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2">Payment Strategy</p>
          <label className={`flex justify-between p-5 rounded-3xl border transition-all cursor-pointer ${paymentType === 'advance' ? 'border-green-500 bg-green-500/5' : 'border-white/5 bg-white/5'}`}>
            <div className="flex gap-4 items-center">
              <input type="radio" checked={paymentType === "advance"} onChange={() => setPaymentType("advance")} className="w-4 h-4 accent-green-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase italic">Pay Advance</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">Safe booking</span>
              </div>
            </div>
            <span className="font-black text-green-400 text-lg italic">₹{advanceAmount}</span>
          </label>

          <label className={`flex justify-between p-5 rounded-3xl border transition-all cursor-pointer ${paymentType === 'full' ? 'border-green-500 bg-green-500/5' : 'border-white/5 bg-white/5'}`}>
            <div className="flex gap-4 items-center">
              <input type="radio" checked={paymentType === "full"} onChange={() => setPaymentType("full")} className="w-4 h-4 accent-green-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase italic">Full Payment</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">Skip the queue</span>
              </div>
            </div>
            <span className="font-black text-green-400 text-lg italic">₹{finalPrice}</span>
          </label>
        </div>

        {/* CHECKOUT BOX */}
        <div className="bg-slate-900 p-10 rounded-[3rem] border-t border-green-500/50 shadow-2xl text-center space-y-5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Payable Now</p>
          <p className="text-6xl font-black italic tracking-tighter text-white">₹{payableNow}</p>
          <button 
            onClick={handleFinalPayment} 
            className="w-full bg-green-500 text-black py-6 rounded-[1.5rem] font-black text-xl uppercase italic tracking-tighter shadow-xl shadow-green-500/20 active:scale-95 transition-all"
          >
            Confirm & Pay →
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmBooking;