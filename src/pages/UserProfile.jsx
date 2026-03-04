import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import {
  ChevronLeft,
  Timer,
  Users,
  ShieldCheck,
  Handshake,
  Smile,
  Copy,
  Check,
  Settings,
  Share2,
  MapPin,
  Flame,
  Search
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initializing with empty strings to prevent "undefined" text showing on UI
  const [profile, setProfile] = useState({
    name: "",
    city: "",
    state: ""
  });

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const auraScore = 92;

  // Memoized fetch function to satisfy useEffect dependency rules
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, city, state")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyAthleteId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.name || 'Athlete'}'s Profile`,
      text: `Check out my Athlete ID: #${user?.id?.slice(0, 8)} on PlayYourGame`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard");
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Error sharing:", err);
    }
  };

  const vibeCheck = [
    { id: "on-time", name: "On-Time Cheetah", icon: <Timer />, votes: 14, desc: "Arrives before the whistle blows every time.", color: "text-emerald-400" },
    { id: "squad", name: "Squad Soul", icon: <Users />, votes: 8, desc: "Coordinates the whole team during matches.", color: "text-blue-400" },
    { id: "accha", name: "Accha Baccha", icon: <ShieldCheck />, votes: 22, desc: "Honest and follows all ground rules.", color: "text-yellow-400" },
    { id: "trust", name: "Trustable", icon: <Handshake />, votes: -2, desc: "If they say they're coming, they will.", color: "text-purple-400" },
    { id: "friendly", name: "Vibe Master", icon: <Smile />, votes: 11, desc: "Makes the game fun for everyone.", color: "text-orange-400" }
  ];

  if (loading && !profile.name) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 font-black italic">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => navigate("/search-users")} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400 active:scale-95 transition-transform">
            <Search size={20} />
          </button>
          <button onClick={handleShare} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
          <button onClick={() => navigate("/settings")} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-95 transition-transform">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* PROFILE SECTION */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 relative shadow-2xl shadow-emerald-500/20">
          👤
          <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-full border-4 border-[#020617]">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl uppercase tracking-tighter">
          {profile.name || "New Athlete"}
        </h2>

        <div onClick={copyAthleteId} className="mt-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            ID: #{user?.id?.slice(0, 8)}...
          </span>
          {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-500" />}
        </div>

        <div className="flex items-center gap-2 text-slate-500 mt-4">
          <MapPin size={12} className="text-emerald-500" />
          <span className="text-[9px] uppercase tracking-widest">
            {profile.city ? `${profile.city}, ${profile.state}` : "Location not set"}
          </span>
        </div>
      </section>

      {/* AURA CARD */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8 shadow-xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] uppercase text-slate-500 tracking-[0.2em]">Athlete Aura</span>
            </div>
            <h4 className="text-2xl uppercase tracking-tighter">Elite Rank</h4>
          </div>
          <div className="text-right">
            <span className="text-3xl text-orange-500 font-black">{auraScore}</span>
          </div>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${auraScore}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-orange-600 to-yellow-400" />
        </div>
      </section>

      {/* REPUTATION GRID */}
      <section>
        <h4 className="text-[10px] uppercase text-slate-600 mb-6 tracking-[0.3em] px-2">Turf Reputation</h4>
        <div className="grid grid-cols-2 gap-4">
          {vibeCheck.map((item) => (
            <button key={item.id} onClick={() => setSelectedBadge(item)} className="flex items-center justify-between p-5 rounded-[2rem] border border-white/5 bg-[#0b0f1a] active:scale-95 transition-transform text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={item.color}>
                  {React.cloneElement(item.icon, { size: 18, strokeWidth: 3 })}
                </div>
                <span className="text-[9px] text-slate-300 uppercase truncate">{item.name}</span>
              </div>
              <span className={`text-[10px] font-black ${item.votes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.votes > 0 ? `+${item.votes}` : item.votes}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* MODAL FOR BADGES */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBadge(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-[3rem] p-10 z-50 text-center">
              <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 bg-white/5 ${selectedBadge.color}`}>
                {React.cloneElement(selectedBadge.icon, { size: 40, strokeWidth: 3 })}
              </div>
              <h3 className="text-2xl uppercase mb-2">{selectedBadge.name}</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium italic">"{selectedBadge.desc}"</p>
              <button onClick={() => setSelectedBadge(null)} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest">Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserProfile;