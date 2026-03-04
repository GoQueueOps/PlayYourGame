import React, { useState, useEffect } from "react";
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

import { motion } from "framer-motion";

function UserProfile() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    city: "",
    state: ""
  });

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [copied, setCopied] = useState(false);

  const auraScore = 92;

  useEffect(() => {

    if (!user) return;

    const fetchProfile = async () => {

      const { data, error } = await supabase
        .from("profiles")
        .select("name, city, state")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setProfile(data);
      }

    };

    fetchProfile();

  }, [user]);

  const copyAthleteId = () => {

    if (!user) return;

    navigator.clipboard.writeText(user.id);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

  };

  const handleShare = async () => {

    const shareData = {
      title: `${profile.name}'s Athlete Profile`,
      text: `Search my Athlete ID: #${user?.id} on PlayYourGame`,
      url: window.location.href
    };

    try {

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied");
      }

    } catch (err) {
      console.log(err);
    }

  };

  const vibeCheck = [
    {
      id: "on-time",
      name: "On-Time Cheetah",
      icon: <Timer />,
      votes: 14,
      desc: "Arrives before the whistle blows every time.",
      color: "text-emerald-400"
    },
    {
      id: "squad",
      name: "Squad Soul",
      icon: <Users />,
      votes: 8,
      desc: "Coordinates the whole team during matches.",
      color: "text-blue-400"
    },
    {
      id: "accha",
      name: "Accha Baccha",
      icon: <ShieldCheck />,
      votes: 22,
      desc: "Honest and follows all ground rules.",
      color: "text-yellow-400"
    },
    {
      id: "trust",
      name: "Trustable",
      icon: <Handshake />,
      votes: -2,
      desc: "If they say they're coming, they will.",
      color: "text-purple-400"
    },
    {
      id: "friendly",
      name: "Vibe Master",
      icon: <Smile />,
      votes: 11,
      desc: "Makes the game fun for everyone.",
      color: "text-orange-400"
    }
  ];

  return (

    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32">

      {/* HEADER */}

      <header className="flex items-center justify-between mb-8">

        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">

          <button
            onClick={() => navigate("/search-users")}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-emerald-400"
          >
            <Search size={20} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400"
          >
            <Share2 size={20} />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400"
          >
            <Settings size={20} />
          </button>

        </div>

      </header>

      {/* PROFILE */}

      <section className="flex flex-col items-center mb-10 text-center">

        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-4 relative">
          👤
          <div className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-full border-4 border-[#020617]">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black uppercase">
          {profile.name || "Athlete"}
        </h2>

        <div
          onClick={copyAthleteId}
          className="mt-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 cursor-pointer"
        >

          <span className="text-[10px] text-slate-400 uppercase">
            ID: #{user?.id}
          </span>

          {copied
            ? <Check size={10} className="text-emerald-500" />
            : <Copy size={10} className="text-slate-500" />
          }

        </div>

        <div className="flex items-center gap-2 text-slate-500 mt-4">
          <MapPin size={12} className="text-emerald-500" />
          <span className="text-[9px] uppercase">
            {profile.city}, {profile.state}
          </span>
        </div>

      </section>

      {/* AURA */}

      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8">

        <div className="flex justify-between items-end mb-4">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500" />
              <span className="text-[10px] uppercase text-slate-500">
                Athlete Aura
              </span>
            </div>

            <h4 className="text-2xl uppercase">
              Elite Rank
            </h4>

          </div>

          <div className="text-right">
            <span className="text-3xl text-orange-500">
              {auraScore}
            </span>
          </div>

        </div>

        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${auraScore}%` }}
            className="h-full bg-gradient-to-r from-orange-600 to-yellow-400"
          />

        </div>

      </section>

      {/* BADGES */}

      <section>

        <h4 className="text-[10px] uppercase text-slate-600 mb-6">
          Turf Reputation
        </h4>

        <div className="grid grid-cols-2 gap-4">

          {vibeCheck.map((item) => (

            <div
              key={item.id}
              onClick={() => setSelectedBadge(item)}
              className="flex items-center justify-between p-5 rounded-[2rem] border border-white/5 bg-[#0b0f1a]"
            >

              <div className="flex items-center gap-3">

                <div className={item.color}>
                  {React.cloneElement(item.icon, { size: 18 })}
                </div>

                <span className="text-[9px] text-slate-300">
                  {item.name}
                </span>

              </div>

              <span className="text-[10px]">
                {item.votes > 0 ? `+${item.votes}` : item.votes}
              </span>

            </div>

          ))}

        </div>

      </section>

    </div>

  );

}

export default UserProfile;