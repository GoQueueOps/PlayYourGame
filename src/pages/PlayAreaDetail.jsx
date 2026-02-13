import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import playAreas from "../data/playAreas";

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"
];

function PlayAreaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const area = playAreas.find(p => String(p.id) === String(id));

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayOffset, setDayOffset] = useState(0); 
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCourtID, setSelectedCourtID] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    if (area?.sportsManaged) {
      const sports = Object.keys(area.sportsManaged);
      if (sports.length > 0) {
        setSelectedSport(sports[0]);
      }
    }
  }, [area]);

  useEffect(() => {
    if (area && selectedSport && area.sportsManaged[selectedSport]) {
      const courts = area.sportsManaged[selectedSport];
      if (courts.length > 0) {
        setSelectedCourtID(courts[0].physicalID);
      }
    }
  }, [selectedSport, area]);

  if (!area) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black italic text-center">ARENA NOT FOUND</div>;

  // --- DRAG LOGIC (Handles Next/Prev internally) ---
  const onDragEnd = (e, info) => {
    const offset = info.offset.x;
    if (offset < -50 && imgIdx < area.images.length - 1) {
      setImgIdx(prev => prev + 1);
    } else if (offset > 50 && imgIdx > 0) {
      setImgIdx(prev => prev - 1);
    }
  };

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + dayOffset);
      dates.push(d);
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-40 overflow-x-hidden font-sans">
      
      {/* 1. IMAGE GALLERY */}
      <div className="relative h-[40vh] w-full bg-black overflow-hidden">
        <motion.div 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          animate={{ x: `-${imgIdx * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex h-full w-full cursor-grab active:cursor-grabbing"
        >
          {area.images.map((img, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <img 
                src={img} 
                alt="arena" 
                className="w-full h-full object-cover pointer-events-none" 
              />
            </div>
          ))}
        </motion.div>

        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 text-xl font-bold">←</button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {area.images.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${imgIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-[#0f172a] border border-white/10 p-5 rounded-[2rem] shadow-2xl relative z-20">
          <h1 className="text-2xl font-extrabold uppercase italic tracking-tight mb-1">{area.name}</h1>
          <p className="text-gray-400 text-[10px] font-semibold uppercase mb-5">📍 {area.location}</p>

          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase active:scale-95 transition-all">↗ Directions</button>
            <button className="flex-1 bg-[#22c55e] text-black py-2.5 rounded-xl text-[10px] font-bold uppercase active:scale-95 transition-all">📞 Call</button>
          </div>
        </div>

        {/* DATE SELECTOR */}
        <div className="mt-6 bg-[#0f172a] border border-white/5 p-5 rounded-[2rem]">
          <div className="flex items-center justify-between mb-5 px-1">
            <button onClick={() => dayOffset > 0 && setDayOffset(dayOffset - 7)} className="text-xl text-gray-500">‹</button>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getDates()[0].toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => setDayOffset(dayOffset + 7)} className="text-xl text-gray-500">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {getDates().map((d, i) => {
              const isActive = selectedDate.toDateString() === d.toDateString();
              return (
                <button key={i} onClick={() => setSelectedDate(d)} className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${isActive ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5 bg-transparent"}`}>
                  <span className={`text-sm font-bold ${isActive ? 'text-[#22c55e]' : 'text-white'}`}>{d.getDate()}</span>
                  <span className={`text-[8px] font-medium uppercase ${isActive ? 'text-[#22c55e]' : 'text-gray-500'}`}>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTIONS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0f172a] p-5 rounded-[2rem] border border-white/5">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Sport</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(area.sportsManaged).map(sport => (
                <button key={sport} onClick={() => setSelectedSport(sport)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${selectedSport === sport ? "bg-blue-600" : "bg-white/5 text-gray-400"}`}>{sport}</button>
              ))}
            </div>
          </div>
          <div className="bg-[#0f172a] p-5 rounded-[2rem] border border-white/5">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Court</p>
            <div className="flex gap-2 flex-wrap">
              {area.sportsManaged[selectedSport]?.map(court => (
                <button key={court.physicalID} onClick={() => setSelectedCourtID(court.physicalID)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase ${selectedCourtID === court.physicalID ? "bg-white text-black" : "bg-white/5 text-gray-400"}`}>{court.name}</button>
              ))}
            </div>
          </div>
        </div>

        {/* TIME SLOTS */}
        <div className="mt-6 bg-[#0f172a] border border-white/5 p-5 rounded-[2rem]">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-5 tracking-widest">Available Slots</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {TIME_SLOTS.map(t => {
              const startIdx = TIME_SLOTS.indexOf(startTime);
              const endIdx = endTime ? TIME_SLOTS.indexOf(endTime) : startIdx;
              const currentIdx = TIME_SLOTS.indexOf(t);
              const isSelected = startTime && currentIdx >= startIdx && currentIdx <= endIdx;
              return (
                <button 
                  key={t} 
                  onClick={() => {
                    if (!startTime || endTime) { setStartTime(t); setEndTime(null); }
                    else {
                      const sIdx = TIME_SLOTS.indexOf(startTime);
                      const cIdx = TIME_SLOTS.indexOf(t);
                      if (cIdx <= sIdx) { setStartTime(t); setEndTime(null); }
                      else setEndTime(t);
                    }
                  }} 
                  className={`py-3.5 rounded-xl text-[11px] font-bold transition-all border ${isSelected ? "bg-[#22c55e] border-[#22c55e] text-black" : "bg-transparent border-white/5 text-gray-500"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-[#020617]/95 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#22c55e] uppercase tracking-widest">{selectedSport}</span>
            <span className="text-sm font-bold text-white italic">{startTime ? `${startTime} - ${endTime || '...'}` : 'PICK TIME'}</span>
          </div>
          <button 
            disabled={!startTime || !endTime} 
            onClick={() => navigate("/confirm", { state: { area, selectedDate, selectedCourt: selectedCourtID, startTime, endTime, price: area.pricePerHour }})} 
            className="flex-1 bg-[#22c55e] text-black py-4 rounded-2xl font-extrabold uppercase italic disabled:opacity-20 transition-all shadow-xl shadow-[#22c55e]/20"
          >
            Confirm & Pay →
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayAreaDetail;