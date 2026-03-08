import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

function CreateChallenge({ isOpen, onClose, onChallengeCreated }) {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    mode: "Solo",
    teamSize: 3,
    stakes: 20,
    date: ""
  });

  if (!isOpen) return null;

  const handleDeploy = async () => {

    try {

      setLoading(true);

      const { data: authData } = await supabase.auth.getSession();
      const user = authData?.session?.user;

      if (!user) {
        alert("Login required");
        return;
      }

      // FULL INSERT QUERY
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
        .select(`
          id,
          created_by,
          match_type,
          status,
          match_time,
          max_players,
          entry_points,
          profiles:created_by (
            name
          )
        `)
        .single();

      if (error) throw error;

      if (onChallengeCreated) onChallengeCreated(data);

      onClose();

    } catch (err) {

      alert(err.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <AnimatePresence>

      <div className="fixed inset-0 flex items-center justify-center">

        <motion.div className="bg-[#0b0f1a] p-8 rounded-2xl">

          <button onClick={onClose}>
            <X />
          </button>

          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />

          <button onClick={handleDeploy}>
            {loading ? <Loader2 className="animate-spin" /> : "Deploy Challenge"}
          </button>

        </motion.div>

      </div>

    </AnimatePresence>
  );
}

export default CreateChallenge;