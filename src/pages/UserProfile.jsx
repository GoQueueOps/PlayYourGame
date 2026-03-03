import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Timer, Users, ShieldCheck,
  Handshake, Smile, Copy, Check,
  Settings, Share2, MapPin, Flame, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [copied, setCopied] = useState(false);

  // 🔥 Fetch Profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) {
    return <div className="min-h-screen bg-[#020617] text-white p-10">Loading...</div>;
  }

  const copyAthleteId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.name}'s Athlete Profile`,
      text: `Search for my Athlete ID: #${profile.id}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const [vibeCheck] = useState([
    { id: "on-time", name: "On-Time Cheetah", icon: <Timer />, votes: 14, desc: "Arrives before the whistle blows every single time.", color: "text-emerald-400" },
    { id: "squad", name: "Squad Soul", icon: <Users />, votes: 8, desc: "Coordinates the whole unit.", color: "text-blue-400" },
    { id: "accha", name: "Accha Baccha", icon: <ShieldCheck />, votes: 22, desc: "Honest, quick with payments, and follows all ground rules.", color: "text-yellow-400" },
    { id: "trust", name: "Trustable", icon: <Handshake />, votes: -2, desc: "When they say they're coming, they show up.", color: "text-purple-400" },
    { id: "friendly", name: "Vibe Master", icon: <Smile />, votes: 11, desc: "Makes the game fun for everyone, win or lose.", color: "text-orange-400" }
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none italic font-black">

      {/* HEADER */}
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

      {/* PROFILE INFO */}
      <section className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 shadow-2xl shadow-emerald-500/20 border-2 border-white/10 relative">
          👤
          <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-full border-4 border-[#020617]">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
          {profile.name}
        </h2>

        <div
          onClick={copyAthleteId}
          className="mt-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 active:scale-95 transition-all cursor-pointer group"
        >
          <span className="text-[10px] text-slate-400 tracking-widest font-black uppercase">
            ID: #{profile.id.slice(0, 8)}
          </span>
          {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-600 group-hover:text-white" />}
        </div>

        <div className="flex items-center gap-2 text-slate-500 mt-4">
          <MapPin size={12} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {profile.city || "Unknown City"}, {profile.state || "Unknown State"}
          </span>
        </div>
      </section>

      {/* AURA SECTION (Still Mock for now) */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8 shadow-2xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Athlete Aura
              </span>
            </div>
            <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
              Elite Rank
            </h4>
          </div>
          <div>
            <span className="text-3xl font-black italic text-orange-500">92</span>
          </div>
        </div>
      </section>

      {/* VIBE CHECK */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 px-2">
          Turf Reputation
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {vibeCheck.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedBadge(item)}
              className="flex items-center justify-between p-5 rounded-[2rem] border border-white/5 transition-all active:scale-95 bg-[#0b0f1a] shadow-lg"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`${item.color}`}>
                  {React.cloneElement(item.icon, { size: 18, strokeWidth: 3 })}
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight truncate text-slate-300">
                  {item.name}
                </span>
              </div>
              <span className="text-[10px] font-black italic text-emerald-500">
                +{item.votes}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default UserProfile;