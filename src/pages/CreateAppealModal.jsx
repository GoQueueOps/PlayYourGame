import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Search, 
  Clock, 
  Users,
  Trophy,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ARENA_DATABASE = [
  { id: 1, name: "Krater's Arena", location: "CDA Sector 9" },
  { id: 2, name: "Kings Turf", location: "Link Road" },
  { id: 3, name: "Kickoff Football Turf", location: "Patia" },
  { id: 4, name: "Green Turf Academy", location: "Cuttack" },
  { id: 5, name: "Champions Hall", location: "Bhubaneswar" }
];

function CreateAppealModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [bookingStatus, setBookingStatus] = useState("booked");
  
  // Form States
  const [sport, setSport] = useState("Cricket");
  const [venueSearch, setVenueSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredArenas = ARENA_DATABASE.filter(arena => 
    arena.name.toLowerCase().includes(venueSearch.toLowerCase())
  );

  const handlePublish = () => {
    if (!venueSearch.trim() || !time.trim() || !date.trim()) {
      alert("⚠️ ALL FIELDS ARE COMPULSORY!");
      return;
    }

    const appealData = {
      bookingStatus,
      sport,
      venue: venueSearch,
      slotsNeeded: playersNeeded,
      date,
      time,
      id: Date.now()
    };
    if (onCreate) onCreate(appealData);
    onClose();
    // Reset Modal for next time
    setStep(1); setVenueSearch(""); setTime(""); setDate(""); setPlayersNeeded(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic font-black uppercase tracking-tight select-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#0f172a] border border-white/20 w-full max-w-lg rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-visible">
        
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-3xl text-white italic tracking-tighter">Create Appeal</h2>
            <p className="text-[11px] text-emerald-500 mt-1 uppercase tracking-[0.2em] font-bold">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-all bg-white/5 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <p className="text-xs text-slate-300 tracking-widest font-bold uppercase">Venue Status</p>
            <div className="grid gap-4">
              {['booked', 'not-booked'].map((status) => (
                <button 
                  key={status} onClick={() => setBookingStatus(status)}
                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${bookingStatus === status ? "border-emerald-500 bg-emerald-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                >
                  {bookingStatus === status ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-slate-600" size={24} />}
                  <div>
                    <p className="text-sm text-white font-black">{status === 'booked' ? "I HAVE ALREADY BOOKED" : "NO BOOKING YET"}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest">{status === 'booked' ? "I need players to join my slot" : "We split cost and book together"}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-emerald-500 text-black py-5 rounded-2xl text-sm tracking-widest mt-4 shadow-lg hover:bg-emerald-400 transition-all active:scale-95 font-black uppercase">
              Continue »
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] text-emerald-500 flex items-center gap-2 font-bold"><Trophy size={14}/> Select Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-4 text-xs text-white outline-none appearance-none cursor-pointer focus:border-emerald-500 font-black italic uppercase">
                <option className="bg-[#0f172a]">Cricket</option>
                <option className="bg-[#0f172a]">Football</option>
                <option className="bg-[#0f172a]">Badminton</option>
              </select>
            </div>

            <div className="space-y-2 relative" ref={suggestionsRef}>
              <label className="text-[11px] text-emerald-500 flex items-center gap-2 font-bold"><Search size={14}/> {bookingStatus === 'booked' ? 'Which Court/Arena?' : 'Preferred Venue'}</label>
              <input 
                type="text" placeholder="TYPE ARENA NAME..." value={venueSearch}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {setVenueSearch(e.target.value); setShowSuggestions(true);}}
                className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-emerald-500 font-black italic uppercase"
              />
              <AnimatePresence>
                {showSuggestions && venueSearch.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-[110] left-0 right-0 mt-2 bg-[#1e293b] border-2 border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                    {filteredArenas.map(arena => (
                      <button key={arena.id} onClick={() => {setVenueSearch(arena.name); setShowSuggestions(false);}} className="w-full p-4 text-left text-[11px] hover:bg-green-500 hover:text-black border-b border-white/5 font-black transition-colors uppercase italic">{arena.name} — <span className="opacity-60">{arena.location}</span></button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] text-emerald-500 flex items-center gap-2 font-bold"><Calendar size={14}/> Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-4 text-[11px] text-white outline-none focus:border-emerald-500 font-black uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-emerald-500 flex items-center gap-2 font-bold"><Clock size={14}/> Time Range</label>
                <input type="text" placeholder="E.G. 6PM - 8PM" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-4 text-[11px] text-white outline-none focus:border-emerald-500 font-black uppercase italic" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-emerald-500 flex items-center gap-2 font-bold"><Users size={14}/> Players Needed</label>
              <div className="flex items-center justify-between bg-white/10 border-2 border-white/10 rounded-xl p-2">
                <button type="button" onClick={(e) => {e.preventDefault(); setPlayersNeeded(Math.max(1, playersNeeded - 1))}} className="w-12 h-12 bg-white/10 rounded-lg text-white font-black text-xl hover:bg-emerald-500 hover:text-black transition-all">-</button>
                <span className="text-xl text-emerald-400 font-black italic">{playersNeeded}</span>
                <button type="button" onClick={(e) => {e.preventDefault(); setPlayersNeeded(playersNeeded + 1)}} className="w-12 h-12 bg-white/10 rounded-lg text-white font-black text-xl hover:bg-emerald-500 hover:text-black transition-all">+</button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-white/10 py-4 rounded-2xl text-[11px] text-slate-400 font-black transition-all uppercase hover:bg-white/5">Back</button>
              <button onClick={handlePublish} className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl text-[11px] shadow-lg active:scale-95 transition-all font-black uppercase hover:bg-emerald-400">Publish Appeal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateAppealModal;