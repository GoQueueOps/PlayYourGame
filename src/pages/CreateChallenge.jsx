import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, MapPin, Calendar, Edit3, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

function CreateChallenge({ isOpen, onClose, onChallengeCreated }) {
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
        alert("SESSION EXPIRED. LOGIN AGAIN.");
        return;
      }

      const { data, error } = await supabase
        .from("matches")
        .insert([
          {
            created_by: user.id,
            match_type: "challenge",
            status: "open",
            match_time: new Date(formData.date).toISOString(),
            max_players: formData.mode === "Solo" ? 2 : formData.teamSize * 2,
            entry_points: formData.stakes
          }
        ])
        .select()
        .single();

      if (error) {
        console.error(error);
        throw error;
      }

      alert("CHALLENGE LIVE IN LOBBY");

      // update parent component list
      if (onChallengeCreated) {
        onChallengeCreated(data);
      }

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
          className="relative w-full max-w-xl bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl uppercase">
              Launch <span className="text-emerald-500">Challenge</span>
            </h2>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* SPORT */}
          <div className="grid grid-cols-2 gap-3">
            {["Football", "Cricket", "Badminton", "Pickleball"].map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => setFormData({ ...formData, sport: s })}
                className={`py-4 rounded-xl ${
                  formData.sport === s
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* MODE */}
          <div className="flex gap-3">
            {["Solo", "Group"].map((m) => (
              <button
                key={m}
                disabled={loading}
                onClick={() => setFormData({ ...formData, mode: m })}
                className={`flex-1 py-3 rounded-xl ${
                  formData.mode === m
                    ? "bg-emerald-500 text-black"
                    : "bg-white/5 text-gray-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* TEAM SIZE */}
          {formData.mode === "Group" && (
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((size) => (
                <button
                  key={size}
                  onClick={() => setFormData({ ...formData, teamSize: size })}
                  className={`px-4 py-2 rounded-xl ${
                    formData.teamSize === size
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {size}v{size}
                </button>
              ))}
            </div>
          )}

          {/* STAKES */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {[20, 50, 100].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setFormData({ ...formData, stakes: pts })}
                  className={`px-4 py-2 rounded-xl ${
                    formData.stakes === pts
                      ? "bg-green-500 text-black"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {pts}
                </button>
              ))}
            </div>

            <p className="text-sm text-emerald-400">
              Pot Pool: {winnerAmount} G-PTS
            </p>
          </div>

          {/* VENUE */}
          <input
            placeholder="Venue Name"
            className="w-full bg-white/5 p-3 rounded-xl"
            value={formData.venue}
            onChange={(e) =>
              setFormData({ ...formData, venue: e.target.value })
            }
          />

          {/* DATE */}
          <input
            type="datetime-local"
            className="w-full bg-white/5 p-3 rounded-xl"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />

          <button
            onClick={handleDeploy}
            disabled={loading}
            className="w-full bg-emerald-500 text-black py-4 rounded-xl flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Deploy Challenge"}
          </button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateChallenge;