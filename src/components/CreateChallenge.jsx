import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, MapPin, Calendar, Edit3, Loader2, Upload, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

function CreateChallenge({ isOpen, onClose, onChallengeCreated }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sport: "Football",
    mode: "Solo",
    teamSize: 3,
    stakes: 20,
    venue: "",
    date: "",
    logo: null,
    images: []
  });

  if (!isOpen) return null;

  const winnerAmount = formData.stakes * 2;

  const handleCustomStakes = (value) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, stakes: numValue });
  };

  const handleMedia = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'logo') setFormData({ ...formData, logo: ev.target.result });
      else setFormData({ ...formData, images: [...formData.images, ev.target.result] });
    };
    reader.readAsDataURL(file);
  };

  const handleDeploy = async () => {
    if (!formData.venue || !formData.date) {
      alert("PLEASE FILL ALL FIELDS");
      return;
    }

    try {
      setLoading(true);

      const { data: authData } = await supabase.auth.getSession();
      const user = authData?.session?.user;

      if (!user) {
        alert("SESSION EXPIRED. PLEASE LOGIN AGAIN.");
        return;
      }

      const { data, error } = await supabase
        .from("matches")
        .insert([
          {
            created_by: user.id,
            match_type: "challenge",
            status: "open",
            sport: formData.sport,
            venue_name: formData.venue,
            match_time: new Date(formData.date).toISOString(),
            mode: formData.mode,
            max_players: formData.mode === "Solo" ? 2 : formData.teamSize * 2,
            entry_points: formData.stakes
          }
        ])
        .select(`
          *,
          profiles:created_by (full_name, aura_score)
        `)
        .single();

      if (error) throw error;

      alert("CHALLENGE BROADCASTED TO LOBBY");

      if (onChallengeCreated) {
        onChallengeCreated(data);
      }

      onClose();
    } catch (error) {
      console.error("Supabase Error:", error);
      alert(`DEPLOYMENT FAILED: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={!loading ? onClose : null}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar italic font-black uppercase"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl tracking-tighter">
              Launch <span className="text-emerald-500">Challenge</span>
            </h2>
            <button onClick={onClose} disabled={loading} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          {/* MEDIA UPLOAD AREA */}
          <div className="grid grid-cols-3 gap-4">
            <label className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-emerald-500/50">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <><Upload size={16} /><span className="text-[6px] mt-1">Logo</span></>
              )}
              <input type="file" className="hidden" onChange={(e) => handleMedia('logo', e)} />
            </label>
            <label className="col-span-2 aspect-[16/9] bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all">
              <Plus size={16} />
              <span className="text-[6px] mt-1 italic uppercase">Gallery ({formData.images.length})</span>
              <input type="file" className="hidden" multiple onChange={(e) => handleMedia('gallery', e)} />
            </label>
          </div>

          {/* SPORT SELECTOR */}
          <div className="grid grid-cols-2 gap-3">
            {["Football", "Cricket", "Badminton", "Pickleball"].map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => setFormData({ ...formData, sport: s })}
                className={`py-4 rounded-2xl text-[10px] tracking-widest transition-all border ${
                  formData.sport === s ? "bg-white text-black border-white shadow-xl" : "bg-white/5 text-slate-500 border-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {["Solo", "Group"].map((m) => (
              <button
                key={m}
                disabled={loading}
                onClick={() => setFormData({ ...formData, mode: m })}
                className={`flex-1 py-3 rounded-2xl text-[10px] tracking-widest transition-all border ${
                  formData.mode === m ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 text-slate-500 border-white/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {formData.mode === "Group" && (
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((size) => (
                <button
                  key={size}
                  disabled={loading}
                  onClick={() => setFormData({ ...formData, teamSize: size })}
                  className={`px-5 py-2 rounded-xl text-[10px] transition-all border ${
                    formData.teamSize === size ? "bg-blue-500 text-white border-blue-400" : "bg-white/5 text-slate-500"
                  }`}
                >
                  {size}v{size}
                </button>
              ))}
            </div>
          )}

          <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 size={14} className="text-emerald-500" />
              <p className="text-[9px] tracking-widest text-slate-500 text-left">Stakes protocol</p>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {[20, 50, 100].map((pts) => (
                <button
                  key={pts}
                  disabled={loading}
                  onClick={() => setFormData({ ...formData, stakes: pts })}
                  className={`min-w-[70px] py-4 rounded-2xl text-xs transition-all border ${
                    formData.stakes === pts ? "bg-green-500 text-black border-green-400" : "bg-white/5 text-slate-500 border-white/5"
                  }`}
                >
                  {pts}
                </button>
              ))}
              <div className={`relative min-w-[120px] rounded-2xl border flex items-center px-4 ${![20, 50, 100].includes(formData.stakes) ? "bg-emerald-500/10 border-emerald-500" : "bg-white/5 border-white/5"}`}>
                <Edit3 size={14} className="text-emerald-500 mr-2 shrink-0" />
                <input
                  type="number"
                  disabled={loading}
                  placeholder="Custom"
                  className="bg-transparent w-full outline-none text-xs text-white"
                  value={![20, 50, 100].includes(formData.stakes) ? formData.stakes : ""}
                  onChange={(e) => handleCustomStakes(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/80 text-right uppercase">Winner Pool: {winnerAmount} G-PTS</p>
          </div>

          <div className="space-y-3 font-sans non-italic">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                disabled={loading}
                placeholder="VENUE NAME"
                className="w-full bg-white/5 p-5 pl-12 rounded-2xl border border-white/5 text-sm font-bold text-white outline-none focus:border-emerald-500/50"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                disabled={loading}
                type="datetime-local"
                className="w-full bg-white/5 p-5 pl-12 rounded-2xl border border-white/5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={handleDeploy}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-6 rounded-[2rem] font-black text-xs tracking-[0.3em] shadow-2xl transition-all flex justify-center items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Deploy Challenge"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateChallenge;