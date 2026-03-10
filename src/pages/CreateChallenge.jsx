import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Gamepad2,
  MapPin,
  Calendar,
  Edit3,
  Loader2,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { supabase } from "../lib/supabase";

function CreateChallenge({ isOpen, onClose, onChallengeCreated, gPointsBalance = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sport: "Football",
    mode: "Solo",
    teamSize: 3,
    stakes: 20,
    arenaId: null,
    arenaName: "",
    date: ""
  });

  // ── Venue search state ──
  const [venueSearch, setVenueSearch] = useState("");
  const [venues, setVenues] = useState([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [userCity, setUserCity] = useState(null);
  const venueRef = useRef(null);

  // ── Detect user city via geolocation on mount ──
  useEffect(() => {
    if (!isOpen) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              null;
            setUserCity(city);
          } catch {
            setUserCity(null);
          }
        },
        () => setUserCity(null)
      );
    }
  }, [isOpen]);

  // ── Fetch venues from arenas table, filtered by city + search ──
  useEffect(() => {
    if (!venueOpen) return;
    const fetchVenues = async () => {
      setVenueLoading(true);
      try {
        let query = supabase
          .from("arenas")
          .select("id, name, location, city")
          .order("name");

        if (userCity) {
          query = query.ilike("location", `%${userCity}%`);
        }
        if (venueSearch.trim()) {
          query = query.ilike("name", `%${venueSearch.trim()}%`);
        }

        query = query.limit(10);
        const { data, error } = await query;
        if (error) throw error;
        setVenues(data || []);
      } catch (err) {
        console.error("Venue fetch error:", err.message);
        setVenues([]);
      } finally {
        setVenueLoading(false);
      }
    };
    fetchVenues();
  }, [venueOpen, venueSearch, userCity]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClick = (e) => {
      if (venueRef.current && !venueRef.current.contains(e.target)) {
        setVenueOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isOpen) return null;

  const winnerAmount = formData.stakes * 2;
  const canAfford = gPointsBalance === null || gPointsBalance >= formData.stakes;

  const handleCustomStakes = (value) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, stakes: numValue });
  };

  const selectVenue = (venue) => {
    setFormData({ ...formData, arenaId: venue.id, arenaName: venue.name });
    setVenueSearch(venue.name);
    setVenueOpen(false);
  };

  const handleDeploy = async () => {
    if (!formData.date) {
      alert("PLEASE SELECT A DATE");
      return;
    }

    // ── G-Points balance check ──
    if (gPointsBalance !== null && gPointsBalance < formData.stakes) {
      alert(`Insufficient G-Points. You need ${formData.stakes} G-PTS but only have ${gPointsBalance} G-PTS. Top up your wallet first.`);
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getSession();
      const user = authData?.session?.user;

      if (authError || !user) {
        alert("SESSION EXPIRED: Please login again.");
        return;
      }

      const insertPayload = {
        created_by: user.id,
        match_type: `challenge_${formData.sport}_${formData.mode}`.toLowerCase(),
        status: "open",
        match_time: new Date(formData.date).toISOString(),
        max_players: formData.mode === "Solo" ? 2 : formData.teamSize * 2,
        entry_points: formData.stakes,
      };

      if (formData.arenaId) {
        insertPayload.arena_id = formData.arenaId;
      }

      const { data, error } = await supabase
        .from("matches")
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.error("DB ERROR:", error.message);
        throw error;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      const enrichedMatch = {
        ...data,
        player: { name: profileData?.name || null },
        arena:  { name: formData.arenaName || null },
      };

      if (onChallengeCreated) onChallengeCreated(enrichedMatch);
      onClose();

    } catch (error) {
      alert(`DEPLOYMENT FAILED: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={!loading ? onClose : null}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar italic font-black uppercase"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl uppercase tracking-tighter italic text-white">
                Launch <span className="text-emerald-500">Challenge</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* G-Points Balance Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                canAfford
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}>
                <Gamepad2
                  size={12}
                  className={canAfford ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "text-red-400"}
                />
                <div>
                  <p className="text-[7px] text-slate-500 tracking-widest leading-none mb-0.5">Balance</p>
                  <p className={`text-xs font-black leading-none ${canAfford ? "text-emerald-400" : "text-red-400"}`}>
                    {gPointsBalance === null ? "..." : `${gPointsBalance} G`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* SPORT SELECTION */}
          <div className="grid grid-cols-2 gap-3">
            {["Football", "Cricket", "Badminton", "Pickleball"].map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => setFormData({ ...formData, sport: s })}
                className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                  formData.sport === s
                    ? "bg-white text-black border-white shadow-lg"
                    : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* MODE TOGGLE */}
          <div className="flex gap-3">
            {["Solo", "Group"].map((m) => (
              <button
                key={m}
                disabled={loading}
                onClick={() => setFormData({ ...formData, mode: m })}
                className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                  formData.mode === m
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20 shadow-lg"
                    : "bg-white/5 text-slate-500 border-white/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* TEAM SIZE */}
          {formData.mode === "Group" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
              <p className="text-[9px] text-slate-500 mb-3 uppercase tracking-[0.2em]">Squad Configuration</p>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    disabled={loading}
                    onClick={() => setFormData({ ...formData, teamSize: size })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                      formData.teamSize === size
                        ? "bg-blue-500 text-white border-blue-400 shadow-lg"
                        : "bg-white/5 text-slate-500 border-white/5"
                    }`}
                  >
                    {size}v{size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAKES */}
          <div className={`bg-black/20 p-6 rounded-3xl border space-y-4 transition-all ${
            canAfford ? "border-emerald-500/10" : "border-red-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 size={13} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Stakes (G-Points)</p>
              </div>

              {/* Balance indicator next to stakes label */}
              {gPointsBalance !== null && (
                <div className="flex items-center gap-1.5">
                  {!canAfford && <AlertCircle size={11} className="text-red-400" />}
                  <span className={`text-[9px] font-black tracking-widest ${canAfford ? "text-slate-500" : "text-red-400"}`}>
                    {canAfford
                      ? `${gPointsBalance - formData.stakes} G LEFT AFTER`
                      : `NEED ${formData.stakes - gPointsBalance} MORE G`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {[20, 50, 100].map((pts) => {
                const affordable = gPointsBalance === null || gPointsBalance >= pts;
                return (
                  <button
                    key={pts}
                    disabled={loading}
                    onClick={() => setFormData({ ...formData, stakes: pts })}
                    className={`min-w-[60px] h-[60px] rounded-2xl flex flex-col items-center justify-center font-black transition-all border ${
                      formData.stakes === pts
                        ? affordable
                          ? "bg-emerald-500 text-black border-emerald-400 scale-105 shadow-xl"
                          : "bg-red-500 text-white border-red-400 scale-105 shadow-xl"
                        : affordable
                          ? "bg-white/5 text-slate-500 border-white/5 opacity-50"
                          : "bg-white/5 text-red-500/40 border-red-500/10 opacity-40"
                    }`}
                  >
                    <Gamepad2
                      size={13}
                      className={
                        formData.stakes === pts
                          ? affordable ? "text-black" : "text-white"
                          : "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                      }
                    />
                    <span className="text-xs mt-0.5">{pts}</span>
                  </button>
                );
              })}
              <div className={`relative min-w-[120px] h-[60px] rounded-2xl border flex items-center px-4 ${![20, 50, 100].includes(formData.stakes) ? "bg-emerald-500/10 border-emerald-500" : "bg-white/5 border-white/5"}`}>
                <Edit3 size={14} className="text-emerald-400 mr-2 shrink-0" />
                <input
                  type="number"
                  disabled={loading}
                  placeholder="Custom"
                  className="bg-transparent w-full outline-none text-xs font-black text-white placeholder:text-slate-600"
                  value={![20, 50, 100].includes(formData.stakes) ? formData.stakes : ""}
                  onChange={(e) => handleCustomStakes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[9px] text-slate-500 uppercase italic">Prize Pool</span>
              <div className="flex items-center gap-1.5">
                <Gamepad2 size={14} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <p className="text-emerald-100 text-sm font-black italic tracking-tighter">
                  Winner Takes: <span className="text-emerald-400">{winnerAmount}</span> G-PTS
                </p>
              </div>
            </div>

            {/* Insufficient balance warning */}
            {gPointsBalance !== null && !canAfford && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
              >
                <AlertCircle size={13} className="text-red-400 shrink-0" />
                <p className="text-[9px] text-red-400 uppercase tracking-widest">
                  Insufficient G-Points — Top up your wallet to deploy this challenge
                </p>
              </motion.div>
            )}
          </div>

          {/* VENUE PICKER */}
          <div className="space-y-3 font-sans font-medium not-italic">
            <div className="relative" ref={venueRef}>
              <div
                className={`bg-white/5 p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer ${
                  venueOpen ? "border-emerald-500/50" : "border-white/5 hover:border-white/20"
                }`}
                onClick={() => { if (!loading) setVenueOpen(true); }}
              >
                <MapPin size={18} className="text-emerald-500 shrink-0" />
                <input
                  placeholder={userCity ? `Venues near ${userCity}...` : "Search venues..."}
                  className="bg-transparent outline-none flex-1 text-sm text-white font-bold placeholder:text-slate-500 cursor-pointer"
                  value={venueSearch}
                  onChange={(e) => {
                    setVenueSearch(e.target.value);
                    setVenueOpen(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, arenaId: null, arenaName: "" });
                    }
                  }}
                  onFocus={() => setVenueOpen(true)}
                  disabled={loading}
                />
                {venueLoading
                  ? <Loader2 size={14} className="text-slate-500 animate-spin shrink-0" />
                  : <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform ${venueOpen ? "rotate-180" : ""}`} />
                }
              </div>

              <AnimatePresence>
                {venueOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-[#0d1220] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto no-scrollbar"
                  >
                    {venueLoading ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-black">Searching...</span>
                      </div>
                    ) : venues.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">No venues found</p>
                        {userCity && (
                          <p className="text-[9px] text-slate-600 mt-1">near {userCity}</p>
                        )}
                      </div>
                    ) : (
                      venues.map((venue) => (
                        <button
                          key={venue.id}
                          onClick={() => selectVenue(venue)}
                          className={`w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-emerald-500/10 transition-all border-b border-white/5 last:border-0 ${
                            formData.arenaId === venue.id ? "bg-emerald-500/15" : ""
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            formData.arenaId === venue.id ? "bg-emerald-500" : "bg-white/5"
                          }`}>
                            <MapPin size={12} className={formData.arenaId === venue.id ? "text-black" : "text-emerald-500"} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">{venue.name}</p>
                            {(venue.location || venue.city) && (
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{venue.location || venue.city}</p>
                            )}
                          </div>
                          {formData.arenaId === venue.id && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DATE */}
            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 focus-within:border-emerald-500/50 transition-all">
              <Calendar size={18} className="text-emerald-500" />
              <input
                disabled={loading}
                type="datetime-local"
                className="bg-transparent outline-none flex-1 text-sm text-white font-bold [color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* LAUNCH */}
          <button
            onClick={handleDeploy}
            disabled={loading || !canAfford}
            className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
              canAfford
                ? "bg-emerald-500 text-black"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Deploying...</>
            ) : !canAfford ? (
              <><AlertCircle size={16} /> Insufficient G-Points</>
            ) : (
              "Deploy Challenge"
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateChallenge;