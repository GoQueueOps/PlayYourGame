import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Gamepad2,
  MapPin,
  Calendar,
  Edit3,
  Loader2
} from "lucide-react";
import { supabase } from "../lib/supabase";

function CreateChallenge({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sport: "Football",
    mode: "Solo",
    teamSize: 3,
    stakes: 20,
    venue: "",
    date: ""
  });

  if (!isOpen) return null;

  const winnerAmount = formData.stakes * 2;

  const handleCustomStakes = (value) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, stakes: numValue });
  };

  // ─── LIVE DEPLOYMENT LOGIC ──────────────────────────────────────────────────
  const handleDeploy = async () => {
    // Basic Validation
    if (!formData.venue || !formData.date) {
      alert("PLEASE FILL ALL FIELDS");
      return;
    }

    try {
      setLoading(true);

      // 1. Get Current User Session
      const { data: authData, error: authError } = await supabase.auth.getSession();
      const user = authData?.session?.user;
      
      if (authError || !user) {
        alert("SESSION EXPIRED: Please login again.");
        return;
      }

      // 2. Insert into Supabase
      // Note: Ensure your table name is 'lobby_appeals' 
      const { error } = await supabase
        .from('lobby_appeals') 
        .insert([
          {
            host_id: user.id,
            sport: formData.sport,
            mode: formData.mode,
            needed_players: formData.mode === "Solo" ? 1 : formData.teamSize,
            stakes: formData.stakes,
            venue_name: formData.venue, 
            scheduled_at: new Date(formData.date).toISOString(), // Ensure ISO format
            status: 'open'
          }
        ]);

      if (error) {
        // This will tell you EXACTLY what is wrong in the console
        console.error("SUPABASE ERROR:", error.code, error.message, error.details);
        throw error;
      }

      alert("CHALLENGE LIVE IN LOBBY");
      onClose();
      
    } catch (error) {
      alert(`DEPLOYMENT FAILED: ${error.message || "Check Console"}`);
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
          className="relative w-full max-w-xl bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar italic font-black"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl uppercase tracking-tighter italic">
              Launch <span className="text-emerald-500">Challenge</span>
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
            >
              <X size={20} />
            </button>
          </div>

          {/* SPORT SELECTION */}
          <div className="grid grid-cols-2 gap-3">
            {["Football", "Cricket", "Badminton", "Pickleball"].map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => setFormData({ ...formData, sport: s })}
                className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  formData.sport === s
                    ? "bg-white text-black shadow-lg"
                    : "bg-white/5 text-slate-500 border border-white/5 hover:border-white/20"
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
                className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  formData.mode === m
                    ? "bg-emerald-500 text-black shadow-emerald-500/20 shadow-lg"
                    : "bg-white/5 text-slate-500 border border-white/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* TEAM SIZE */}
          {formData.mode === "Group" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
              <p className="text-[9px] text-slate-500 mb-3 uppercase tracking-[0.2em]">Squad Size</p>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    disabled={loading}
                    onClick={() => setFormData({ ...formData, teamSize: size })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                      formData.teamSize === size
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-white/5 text-slate-500 border border-white/5"
                    }`}
                  >
                    {size}v{size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAKES */}
          <div className="bg-black/20 p-6 rounded-3xl border border-green-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 size={13} className="text-emerald-400" />
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Stakes (G-Points)</p>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {[20, 50, 100].map((pts) => (
                <button
                  key={pts}
                  disabled={loading}
                  onClick={() => setFormData({ ...formData, stakes: pts })}
                  className={`min-w-[60px] h-[60px] rounded-2xl flex flex-col items-center justify-center font-black transition-all border ${
                    formData.stakes === pts
                      ? "bg-green-500 text-black border-green-400 scale-105"
                      : "bg-white/5 text-slate-500 border-white/5 opacity-50"
                  }`}
                >
                  <span className="text-xs">{pts}</span>
                </button>
              ))}
              <div className={`relative min-w-[120px] h-[60px] rounded-2xl flex items-center px-3 border transition-all ${![20, 50, 100].includes(formData.stakes) ? "bg-green-500/10 border-green-500" : "bg-white/5 border-white/5"}`}>
                <Edit3 size={14} className="text-green-500 mr-2 shrink-0" />
                <input
                  type="number"
                  disabled={loading}
                  placeholder="Custom"
                  className="bg-transparent w-full outline-none text-xs font-black text-white"
                  value={![20, 50, 100].includes(formData.stakes) ? formData.stakes : ""}
                  onChange={(e) => handleCustomStakes(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/80 text-right">Pot Pool: {winnerAmount} G-PTS</p>
          </div>

          {/* INPUTS */}
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5">
              <MapPin size={18} className="text-emerald-500" />
              <input
                disabled={loading}
                placeholder="Venue Name"
                className="bg-transparent outline-none flex-1 text-sm text-white font-bold"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5">
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
            disabled={loading}
            className="w-full bg-emerald-500 text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Deploy Challenge"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateChallenge;