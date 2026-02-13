import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Circle, 
  CreditCard 
} from "lucide-react";

function CreateAppealModal({ isOpen, onClose }) {
  const [bookingStatus, setBookingStatus] = useState("booked"); // 'booked' or 'not-booked'
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Create Appeal</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: CHOOSE BOOKING STATUS */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-slate-300">Do you already have a venue secured?</p>
            
            <div className="grid gap-4">
              <button 
                onClick={() => setBookingStatus("booked")}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                  bookingStatus === "booked" 
                  ? "border-green-500 bg-green-500/5" 
                  : "border-white/5 bg-white/5 hover:border-white/20"
                }`}
              >
                {bookingStatus === "booked" ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-600" />}
                <div>
                  <p className="font-black uppercase text-xs text-white">I have already booked</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase">I need players to join my existing slot</p>
                </div>
              </button>

              <button 
                onClick={() => setBookingStatus("not-booked")}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                  bookingStatus === "not-booked" 
                  ? "border-green-500 bg-green-500/5" 
                  : "border-white/5 bg-white/5 hover:border-white/20"
                }`}
              >
                {bookingStatus === "not-booked" ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-600" />}
                <div>
                  <p className="font-black uppercase text-xs text-white">No booking yet</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase">We will split the cost and book together</p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-green-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest mt-4 hover:bg-white transition-all shadow-xl shadow-green-500/10 active:scale-95"
            >
              Continue »
            </button>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Players Needed</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num} 
                    className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl hover:border-green-500 hover:text-green-500 transition-all font-black text-xs text-slate-400"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Method</label>
              <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                <CreditCard size={18} className="text-green-500" />
                <span className="text-xs font-bold uppercase text-slate-300">
                  {bookingStatus === "booked" ? "Direct Payment to Host" : "Automatic Shared Pot"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 border border-white/10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
              >
                Back
              </button>
              <button 
                className="flex-[2] bg-green-500 text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-green-500/10 hover:bg-white transition-all active:scale-95"
              >
                Publish Appeal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CreateAppealModal;