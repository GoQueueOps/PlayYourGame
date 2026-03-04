import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const navigate = useNavigate();
  // AUTH DATA
  const { user } = useAuth();

const [profile, setProfile] = useState({
  name: "",
  city: "",
  state: "",
});

const [selectedBadge, setSelectedBadge] = useState(null);
const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, city, state")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProfile(data);
    }
  }

  const copyAthleteId = () => {
    navigator.clipboard.writeText(user.athleteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.name}'s Athlete Profile`,
      text: `Search for my Athlete ID: #${user.athleteId} on Arena Legends!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) { await navigator.share(shareData); } 
      else { await navigator.clipboard.writeText(window.location.href); alert("Profile link copied!"); }
    } catch (err) { console.log("Error sharing:", err); }
  };

  const getPronoun = (type) => {
    const map = { subject: user.gender === "male" ? "he" : "she", possessive: user.gender === "male" ? "his" : "her" };
    return map[type];
  };

  const [vibeCheck] = useState([
    { id: "on-time", name: "On-Time Cheetah", icon: <Timer />, votes: 14, desc: `Arrives before the whistle blows every single time.`, color: "text-emerald-400" },
    { id: "squad", name: "Squad Soul", icon: <Users />, votes: 8, desc: `Doesn't just play; ${getPronoun("subject")} coordinates the whole unit.`, color: "text-blue-400" },
    { id: "accha", name: "Accha Baccha", icon: <ShieldCheck />, votes: 22, desc: "Honest, quick with payments, and follows all ground rules.", color: "text-yellow-400" },
    { id: "trust", name: "Trustable", icon: <Handshake />, votes: -2, desc: `When ${getPronoun("subject")} says ${getPronoun("subject")}'s coming, the team knows ${getPronoun("subject")}'ll be there.`, color: "text-purple-400" },
    { id: "friendly", name: "Vibe Master", icon: <Smile />, votes: 11, desc: `Makes the game fun for everyone, win or lose.`, color: "text-orange-400" }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none italic font-black">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate("/search-users")} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400 active:scale-95 transition-all">
            <Search size={20} />
          </button>
          <button onClick={handleShare} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-95 transition-all">
            <Share2 size={20} />
          </button>
          <button onClick={() => navigate("/settings")} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-95 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* --- PROFILE INFO --- */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl shadow-emerald-500/20 border-2 border-white/10 relative">
          👤
          <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-full border-4 border-[#020617]">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{profile.name}</h2>
        
        <div 
          onClick={copyAthleteId}
          className="mt-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="text-[10px] text-slate-400 tracking-widest font-black uppercase">ID: #{user.athleteId}</span>
          {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-600 group-hover:text-white" />}
        </div>

        <div className="flex items-center gap-2 text-slate-500 mt-4">
          <MapPin size={12} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{profile.city}, {profile.state}</span>
        </div>
      </section>

      {/* --- AURA STATS --- */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-end mb-4 relative z-10">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Athlete Aura</span>
            </div>
            <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Elite Rank</h4>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black italic text-orange-500 leading-none">{user.auraScore}</span>
             <p className="text-[8px] uppercase tracking-widest text-slate-600 mt-1">Street Cred</p>
          </div>
        </div>
        
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative z-10 mb-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${user.auraScore}%` }} className="h-full bg-gradient-to-r from-orange-600 to-yellow-400" />
        </div>

        {/* ✅ UPDATED STATS ROW */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
            <div className="text-center flex-1">
                <p className="text-xl leading-none">{user.stats.games}</p>
                <p className="text-[7px] uppercase tracking-widest text-slate-500 mt-1 font-black">Matches</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            
            {/* Friends Section in Middle */}
            <div className="text-center flex-1">
                <p className="text-xl leading-none">{user.stats.friends}</p>
                <p className="text-[7px] uppercase tracking-widest text-slate-500 mt-1 font-black">Friends</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />

            {/* Global Rank on Right with Green Text */}
            <div className="text-center flex-1 text-emerald-500">
                <p className="text-xl leading-none font-black italic">#{user.stats.rank}</p>
                <p className="text-[7px] uppercase tracking-widest mt-1 opacity-80 font-black">Global Rank</p>
            </div>
        </div>
      </section>

      {/* --- VIBE CHECK --- */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 px-2">Turf Reputation</h4>
        <div className="grid grid-cols-2 gap-4">
          {vibeCheck.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedBadge(item)}
              className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all active:scale-95 bg-[#0b0f1a] shadow-lg ${item.votes < 0 ? 'border-red-500/30' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`${item.color}`}>{React.cloneElement(item.icon, { size: 18, strokeWidth: 3 })}</div>
                <span className="text-[9px] font-black uppercase tracking-tight truncate text-slate-300">{item.name}</span>
              </div>
              <span className={`text-[10px] font-black italic ml-2 ${item.votes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.votes > 0 ? `+${item.votes}` : item.votes}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBadge(null)} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-[#020617] border-t border-white/10 rounded-t-[3.5rem] p-10 pb-16 z-[101]">
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 bg-white/5 ${selectedBadge.color}`}>
                   {React.cloneElement(selectedBadge.icon, { size: 48, strokeWidth: 3 })}
                </div>
                <h3 className="text-3xl uppercase tracking-tighter mb-4 leading-none">{selectedBadge.name}</h3>
                <p className="text-sm font-bold text-slate-400 px-4 mb-12 leading-relaxed">"{selectedBadge.desc}"</p>
                <button onClick={() => setSelectedBadge(null)} className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all">Dismiss</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserProfile;