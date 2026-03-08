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

// --- 1. ARENA LEGENDS PREVIEW SECTION ---
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
    <div className="max-w-6xl mx-auto mt-20 relative z-10 pb-20 font-sans italic font-black uppercase">
      <div className="flex flex-col md:flex-row items-end justify-between mb-8 px-4 gap-6">
        <div className="w-full md:w-auto text-left">
          <h2 className="text-4xl italic tracking-tighter leading-none text-white">
            Arena <span className="text-emerald-500">Legends</span>
          </h2>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-2">Top Performers • Global</p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button onClick={() => navigate("/arena-legends")} className="group flex items-center gap-2 text-[10px] text-emerald-500 transition-all">
            <span className="border-b border-emerald-500/20 pb-1 group-hover:border-emerald-500">View Full Rankings</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex bg-[#0b0f1a] p-1 rounded-2xl border border-white/10 italic">
            <button onClick={() => setBoardType("Solo")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${boardType === 'Solo' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}><User size={14} className="mr-2 inline"/>Solo</button>
            <button onClick={() => setBoardType("Lobby")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${boardType === 'Lobby' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}><Users size={14} className="mr-2 inline"/>Lobby</button>
          </div>
        </div>
      </div>

      <div className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        {leaderboardData[boardType].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all">
            <div className="flex items-center gap-8">
              <div className="w-12 text-center">
                {item.rank === 1 ? <Trophy className="text-yellow-500 mx-auto" size={32} /> : <Medal className={item.rank === 2 ? "text-slate-300 mx-auto" : "text-orange-700 mx-auto"} size={28} />}
              </div>
              <div className="text-left">
                <h4 className="text-2xl text-white flex items-center gap-2">
                  {item.name} {item.rank === 1 && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  {/* G-Points with Gamepad2 icon to match Explore style */}
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Gamepad2 size={10} className="drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                    {item.score} G-PTS
                  </span>
                  <span className="text-[9px] text-slate-500"><Target size={10} className="inline mr-1" />{item.matches} Matches</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-slate-500 mb-1">Wins</p>
                <p className="text-xl text-white">{item.wins} WINS</p>
              </div>
              <button onClick={() => navigate("/arena-legends")} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] text-white hover:bg-white hover:text-black transition-all">Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN CHALLENGE MODE ---
function ChallengeMode() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlab, setSelectedSlab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(`*, profiles:created_by (name, aura_points)`)
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

  // ── Functional update so we never capture a stale `challenges` closure ──
  const handleChallengeCreated = (newMatch) => {
    setChallenges((prev) => [newMatch, ...prev]);
  };

  const formatMatchTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredChallenges = selectedSlab === "All"
    ? challenges
    : challenges.filter((c) => c.entry_points === selectedSlab);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 lg:p-12 relative overflow-x-hidden italic font-black uppercase">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

      <CreateChallenge
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}   // ← wired up correctly
      />

      <header className="max-w-6xl mx-auto mb-12 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-left w-full">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all text-white">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 text-orange-500">
              <Swords size={16} />
              <span className="text-[10px] tracking-[0.4em]">Lobby & Duels</span>
            </div>
            <h1 className="text-5xl italic tracking-tighter leading-none">Challenge Mode</h1>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-black px-10 py-5 rounded-[2.5rem] text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3 shrink-0"
        >
          <Plus size={18} strokeWidth={3} /> Create Challenge
        </button>
      </header>

      {/* SLAB FILTERS */}
      <div className="max-w-6xl mx-auto mb-10 flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {["All", 20, 50, 100].map((slab) => (
          <button
            key={slab}
            onClick={() => setSelectedSlab(slab)}
            className={`px-8 py-4 rounded-2xl border text-[10px] tracking-widest transition-all flex items-center gap-2 ${
              selectedSlab === slab
                ? "bg-white text-black"
                : "bg-white/5 text-slate-500 border-white/10"
            }`}
          >
            {slab === "All" ? (
              "All Stakes"
            ) : (
              <>
                <Gamepad2
                  size={11}
                  className={selectedSlab === slab ? "text-black" : "text-emerald-400"}
                />
                {slab} G-PTS
              </>
            )}
          </button>
        ))}
      </div>

      {/* CHALLENGE CARDS */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
            <p className="text-[10px] tracking-widest">Syncing Grid...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 text-center">
            <p className="text-slate-500 tracking-widest">No active nodes.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((match) => (
              <motion.div
                key={match.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 group hover:border-emerald-500/50 transition-all text-left"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    {/* sport now populated from DB */}
                    <span className="px-3 py-1 rounded-full text-[9px] border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {match.sport || "Sport"}
                    </span>
                    <h3 className="text-3xl mt-2 text-white">
                      {match.profiles?.name || "Athlete"}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {match.mode || "Solo"} • Aura: {match.profiles?.aura_points || 0}
                    </p>
                  </div>

                  {/* G-Points badge with Gamepad2 icon */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 px-4 py-2 rounded-xl text-sm shadow-xl">
                      <Gamepad2
                        size={14}
                        className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                      />
                      <span className="font-black">{match.entry_points}</span>
                    </div>
                    <p className="text-[9px] text-emerald-500 mt-2 flex items-center justify-end gap-1">
                      <Gamepad2 size={9} className="text-emerald-400" />
                      Pot: {match.entry_points * 2} G-PTS
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 mb-1">Venue</p>
                    {/* venue_name now populated from DB */}
                    <p className="text-[11px] truncate text-white">{match.venue_name || "TBD"}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 mb-1">Kickoff</p>
                    <p className="text-[11px] truncate text-white">{formatMatchTime(match.match_time)}</p>
                  </div>
                </div>

                <button className="w-full bg-emerald-500 text-black py-5 rounded-2xl text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95">
                  Accept Challenge »
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      <ArenaLegendsSection />
    </div>
  );
}

export default ChallengeMode;