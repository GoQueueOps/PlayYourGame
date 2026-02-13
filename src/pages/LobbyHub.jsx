import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  X, 
  Navigation,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LobbyHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  
  // Logic: Defaults to detected location, user can override manually
  const [userCoords, setUserCoords] = useState({ 
    lat: 20.4625, 
    lon: 85.8830, 
    label: "Cuttack, Odisha" 
  });

  const communityGroups = [
    { id: "G-001", name: "CDA Sector-9 Strikers", lat: 20.4800, lon: 85.8550, type: "Public", membersCount: 42, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100" },
    { id: "G-002", name: "Patia Power Hitters", lat: 20.3500, lon: 85.8200, type: "Private", membersCount: 128, image: "https://images.unsplash.com/photo-1626225443005-937748834907?w=100" },
    { id: "G-003", name: "Cyberabad Elite", lat: 17.4483, lon: 78.3915, type: "Public", membersCount: 56, image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=100" }
  ];

  const globalPlayers = [
    { id: "ARENA-102", name: "Blesson", aura: 2100, rank: "Diamond" },
    { id: "ARENA-009", name: "Rahul_K", aura: 1540, rank: "Gold" }
  ];

  // --- 50KM GEOFENCING CALCULATION ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // --- FILTERING LOGIC ---
  const filteredPlayers = searchQuery ? globalPlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredLobbies = communityGroups.filter(g => {
    const dist = calculateDistance(userCoords.lat, userCoords.lon, g.lat, g.lon);
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Show if within 50km; if searching, must also match the name
    return dist <= 50 && (searchQuery ? matchesSearch : true);
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans italic selection:bg-emerald-500/30 pb-32">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0b0f1a] border-b border-white/5 p-8 pt-16 relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <button 
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center gap-3 mb-2 group active:scale-95 transition-all"
          >
            <div className="h-[2px] w-12 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/80 italic flex items-center gap-2 group-hover:text-white">
              <MapPin size={10} /> {userCoords.label}
            </span>
          </button>
          
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-[0.85] flex flex-col">
            <span className="text-white">The</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">Lobby</span>
          </h1>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-2 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all shadow-2xl relative z-20">
          <div className="p-3 text-slate-700"><Search size={18} /></div>
          <input 
            type="text" 
            placeholder="Search Global IDs or Local Lobbies..." 
            className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- RESULTS --- */}
      <div className="px-6 max-w-2xl mx-auto space-y-10">
        {/* PLAYER RESULTS (GLOBAL) */}
        {searchQuery && filteredPlayers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 px-2 italic text-left">Global Registry</h2>
            {filteredPlayers.map(player => (
              <div key={player.id} className="bg-[#0b0f1a] border border-white/5 p-5 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center font-black text-slate-700 border border-white/5">{player.name[0]}</div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic tracking-tight">{player.name}</h4>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">{player.aura} AURA • {player.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOBBY RESULTS (50KM FILTERED) */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic uppercase">
              {searchQuery ? "Lobbies Found" : "Nearby (Within 50km)"}
            </h2>
            <button onClick={() => navigate('/create-group')} className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
              <Plus size={12} /> Create Lobby
            </button>
          </div>

          <div className="space-y-4">
            {filteredLobbies.length > 0 ? (
              filteredLobbies.map((group) => (
                <div key={group.id} onClick={() => navigate(`/group/${group.id}`)} className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-6 active:scale-[0.98] transition-all group cursor-pointer hover:border-white/10">
                  <div className="flex items-start gap-5">
                     <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shrink-0"><img src={group.image} className="w-full h-full object-cover grayscale" alt="G" /></div>
                     <div className="flex-1 text-left">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{group.name}</h3>
                        <p className="text-[9px] font-black text-slate-500 mt-2 uppercase italic">{group.membersCount} Members • {group.type}</p>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem] opacity-30 italic">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Lobbies found in your 50km zone</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- LOCATION PICKER (MANUAL SEARCH OVERRIDE) --- */}
      <AnimatePresence>
        {isLocationOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLocationOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-[3rem] z-[70] p-8 pb-12 h-[60vh] flex flex-col shadow-[0_-20px_80px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] italic text-emerald-500 flex items-center gap-2">
                  <Navigation size={14} /> Change Zone
                </h2>
                <button onClick={() => setIsLocationOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-500 active:scale-90"><X size={18} /></button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-8">
                <Search size={18} className="text-slate-700" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Type City, Sector, or Area Name..."
                  className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto italic text-center py-6">
                 <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-loose">
                   {locationSearch ? `Targeting: ${locationSearch}` : "The radar is set to your current sector. Type to shift the focus."}
                 </p>
              </div>

              <button 
                onClick={() => {
                  if(locationSearch) setUserCoords({...userCoords, label: locationSearch});
                  setIsLocationOpen(false);
                  setLocationSearch("");
                }}
                className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"
              >
                Set Radar to {locationSearch || "Current"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LobbyHub;