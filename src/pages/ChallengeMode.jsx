import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Swords, Gamepad2,
  ChevronLeft, Medal, Star, Target, Users, User, Plus,
  ChevronRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateChallenge from "../pages/CreateChallenge";
import { supabase } from "../lib/supabase";

function ArenaLegendsSection() {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState("Lobby");

  const leaderboardData = {
    Solo: [
      { rank: 1, name: "Nitro", score: 2840, matches: 58, wins: 45 },
      { rank: 2, name: "Z-Storm", score: 2610, matches: 40, wins: 32 },
      { rank: 3, name: "Shadow", score: 2450, matches: 35, wins: 20 },
    ],
    Lobby: [
      { rank: 1, name: "CDA Strikers", score: 8900, matches: 120, wins: 95 },
      { rank: 2, name: "City FC", score: 7200, matches: 98, wins: 85 },
      { rank: 3, name: "BBS Smashers", score: 6800, matches: 80, wins: 60 },
    ]
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 relative z-10 pb-20">
      <div className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        {leaderboardData[boardType].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-8 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-8">
              <div className="w-12 text-center">
                {item.rank === 1
                  ? <Trophy className="text-yellow-500 mx-auto" size={32} />
                  : <Medal size={28} />}
              </div>
              <div>
                <h4 className="text-2xl text-white">{item.name}</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Gamepad2 size={10} />
                  {item.score} G-PTS
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/arena-legends")}
              className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-white"
            >
              Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengeMode() {

  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlab, setSelectedSlab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FULL FETCH QUERY
  const fetchChallenges = async () => {

    try {

      setLoading(true);

      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          created_by,
          match_type,
          status,
          match_time,
          max_players,
          entry_points,
          created_at,
          profiles:created_by (
            name
          )
        `)
        .eq("match_type", "challenge")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChallenges(data || []);

    } catch (err) {

      console.error(err.message);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleChallengeCreated = (newMatch) => {
    setChallenges((prev) => [newMatch, ...prev]);
  };

  const filteredChallenges =
    selectedSlab === "All"
      ? challenges
      : challenges.filter((c) => c.entry_points === selectedSlab);

  const formatMatchTime = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN");
  };

  return (

    <div className="min-h-screen bg-[#020617] text-white p-6">

      <CreateChallenge
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}
      />

      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">

        <div className="flex items-center gap-6">

          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-5xl">Challenge Mode</h1>

        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-black px-10 py-5 rounded-[2.5rem]"
        >
          <Plus size={18} /> Create Challenge
        </button>

      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {loading ? (

          <div className="col-span-full flex justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
          </div>

        ) : filteredChallenges.map((match) => (

          <motion.div
            key={match.id}
            className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8"
          >

            <h3 className="text-3xl text-white">
              {match.profiles?.name || "Player"}
            </h3>

            <p className="text-slate-500 text-sm">
              Challenge Stake: {match.entry_points} G-PTS
            </p>

            <p className="text-slate-500 text-sm">
              Kickoff: {formatMatchTime(match.match_time)}
            </p>

            <button className="w-full bg-emerald-500 text-black py-4 rounded-2xl mt-6">
              Accept Challenge
            </button>

          </motion.div>

        ))}

      </main>

      <ArenaLegendsSection />

    </div>
  );
}

export default ChallengeMode;