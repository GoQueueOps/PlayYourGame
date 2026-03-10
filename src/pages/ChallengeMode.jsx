import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Swords, Gamepad2,
  ChevronLeft, Medal, Star, Target, Users, User, Plus,
  ChevronRight, Loader2, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateChallenge from "../pages/CreateChallenge";
import { supabase } from "../lib/supabase";

function parseMatchType(matchType = "") {
  const parts = matchType.split("_");
  const sport = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "Sport";
  const mode  = parts[2] ? parts[2].charAt(0).toUpperCase() + parts[2].slice(1) : "Solo";
  return { sport, mode };
}

function ArenaLegendsSection() {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState("Lobby");

  const leaderboardData = {
    Solo: [
      { rank: 1, name: "Nitro",        score: 2840, matches: 58,  wins: 45 },
      { rank: 2, name: "Z-Storm",      score: 2610, matches: 40,  wins: 32 },
      { rank: 3, name: "Shadow",       score: 2450, matches: 35,  wins: 20 },
    ],
    Lobby: [
      { rank: 1, name: "CDA Strikers", score: 8900, matches: 120, wins: 95 },
      { rank: 2, name: "City FC",      score: 7200, matches: 98,  wins: 85 },
      { rank: 3, name: "BBS Smashers", score: 6800, matches: 80,  wins: 60 },
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
            <button onClick={() => setBoardType("Solo")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${boardType === "Solo" ? "bg-white text-black shadow-lg" : "text-slate-500"}`}>
              <User size={14} className="mr-2 inline" />Solo
            </button>
            <button onClick={() => setBoardType("Lobby")} className={`px-6 py-2.5 rounded-xl text-[10px] transition-all ${boardType === "Lobby" ? "bg-white text-black shadow-lg" : "text-slate-500"}`}>
              <Users size={14} className="mr-2 inline" />Lobby
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#0b0f1a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        {leaderboardData[boardType].map((item) => (
          <div key={item.name} className="flex items-center justify-between p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all">
            <div className="flex items-center gap-8">
              <div className="w-12 text-center">
                {item.rank === 1
                  ? <Trophy className="text-yellow-500 mx-auto" size={32} />
                  : <Medal className={item.rank === 2 ? "text-slate-300 mx-auto" : "text-orange-700 mx-auto"} size={28} />
                }
              </div>
              <div className="text-left">
                <h4 className="text-2xl text-white flex items-center gap-2">
                  {item.name} {item.rank === 1 && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Gamepad2 size={10} className="drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                    {item.score} G-PTS
                  </span>
                  <span className="text-[9px] text-slate-500">
                    <Target size={10} className="inline mr-1" />{item.matches} Matches
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-slate-500 mb-1">Wins</p>
                <p className="text-xl text-white">{item.wins} WINS</p>
              </div>
              <button onClick={() => navigate("/arena-legends")} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] text-white hover:bg-white hover:text-black transition-all">
                Profile
              </button>
            </div>
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
  const [acceptingId, setAcceptingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [gPointsBalance, setGPointsBalance] = useState(null); // null = loading

  // ── Get current user + wallet balance on mount ──
  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const uid = authData?.session?.user?.id || null;
      setCurrentUserId(uid);

      if (uid) {
        const { data: wallet } = await supabase
          .from("wallet")
          .select("g_points_balance")
          .eq("user_id", uid)
          .single();
        setGPointsBalance(wallet?.g_points_balance ?? 0);
      }
    };
    init();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          created_by,
          accepted_by,
          match_type,
          status,
          match_time,
          created_at,
          max_players,
          entry_points,
          arena_id,
          arena:arenas!matches_arena_fkey ( name )
        `)
        .like("match_type", "challenge_%")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ── Fetch profiles separately — matches_created_by_fkey → auth.users not profiles ──
      const creatorIds = [...new Set((data || []).map((m) => m.created_by).filter(Boolean))];
      let profileMap = {};
      if (creatorIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", creatorIds);
        (profileData || []).forEach((p) => { profileMap[p.id] = p.name; });
      }

      // Attach player name to each match
      const enriched = (data || []).map((m) => ({
        ...m,
        player: { name: profileMap[m.created_by] || null },
      }));
      setChallenges(enriched);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleChallengeCreated = (newMatch) => {
    setChallenges((prev) => [newMatch, ...prev]);
  };

  // ── Accept Challenge ──
  const handleAccept = async (match) => {
    if (!currentUserId) {
      alert("Please login to accept a challenge.");
      return;
    }

    // Prevent creator from accepting their own challenge
    if (match.created_by === currentUserId) {
      alert("You cannot accept your own challenge.");
      return;
    }

    // Check G-Points balance
    if (gPointsBalance !== null && gPointsBalance < match.entry_points) {
      alert(`Insufficient G-Points. You need ${match.entry_points} G-PTS but have ${gPointsBalance}. Top up your wallet.`);
      return;
    }

    try {
      setAcceptingId(match.id);

      // 1. Update match status to accepted + set accepted_by
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "accepted", accepted_by: currentUserId })
        .eq("id", match.id)
        .eq("status", "open"); // safety: only accept if still open

      if (matchError) throw matchError;

      // 2. Add accepter to match_players
      const { error: playerError } = await supabase
        .from("match_players")
        .insert({ match_id: match.id, user_id: currentUserId, team: 2 });

      // Ignore duplicate error (in case already inserted)
      if (playerError && !playerError.message.includes("unique")) {
        throw playerError;
      }

      // 3 & 4. Create conversation + add both members via security definer function
      const { data: convId, error: convError } = await supabase
        .rpc("create_challenge_conversation", {
          p_match_id: match.id,
          p_challenger_id: match.created_by,
          p_accepter_id: currentUserId,
        });

      if (convError) {
        console.error("Conv error:", JSON.stringify(convError));
        throw convError;
      }

      // 5. Remove from local list + navigate to chat
      setChallenges((prev) => prev.filter((c) => c.id !== match.id));
      navigate(`/chat/${convId}`);

    } catch (err) {
      console.error("Accept error:", err.message);
      alert("Failed to accept challenge: " + err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const formatMatchTime = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
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
        onChallengeCreated={handleChallengeCreated}
        gPointsBalance={gPointsBalance}
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

        <div className="flex items-center gap-4 shrink-0">
          {/* G-Points balance HUD */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl">
            <Gamepad2 size={14} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <div>
              <p className="text-[8px] text-slate-500 tracking-widest leading-none mb-0.5">Balance</p>
              <p className="text-sm text-emerald-400 font-black leading-none">
                {gPointsBalance === null ? "..." : `${gPointsBalance} G`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-black px-10 py-5 rounded-[2.5rem] text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> Create Challenge
          </button>
        </div>
      </header>

      {/* SLAB FILTERS */}
      <div className="max-w-6xl mx-auto mb-10 flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {["All", 20, 50, 100].map((slab) => (
          <button
            key={slab}
            onClick={() => setSelectedSlab(slab)}
            className={`px-8 py-4 rounded-2xl border text-[10px] tracking-widest transition-all flex items-center gap-2 ${
              selectedSlab === slab
                ? "bg-white text-black border-white"
                : "bg-white/5 text-slate-500 border-white/10"
            }`}
          >
            {slab === "All" ? "All Stakes" : (
              <>
                <Gamepad2 size={11} className={selectedSlab === slab ? "text-black" : "text-emerald-400"} />
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
            <p className="text-slate-500 tracking-widest">No active challenges.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((match) => {
              const { sport, mode } = parseMatchType(match.match_type);
              const playerName = match.player?.name || "Unknown";
              const arenaName  = match.arena?.name  || "TBD";
              const isOwnChallenge = match.created_by === currentUserId;
              const isAccepting = acceptingId === match.id;
              const canAfford = gPointsBalance === null || gPointsBalance >= match.entry_points;

              return (
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
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[9px] border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {sport}
                        </span>
                        {isOwnChallenge && (
                          <span className="px-3 py-1 rounded-full text-[9px] border bg-orange-500/10 text-orange-400 border-orange-500/20">
                            Yours
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl mt-2 text-white">{playerName}</h3>
                      <p className="text-[10px] text-slate-500">{mode}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 px-4 py-2 rounded-xl text-sm shadow-xl">
                        <Gamepad2 size={14} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
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
                      <p className="text-[11px] truncate text-white">{arenaName}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 mb-1">Kickoff</p>
                      <p className="text-[11px] truncate text-white">{formatMatchTime(match.match_time)}</p>
                    </div>
                  </div>

                  {isOwnChallenge ? (
                    // Creator sees a disabled "Waiting" button
                    <button
                      disabled
                      className="w-full bg-white/5 border border-white/10 text-slate-500 py-5 rounded-2xl text-xs tracking-[0.2em] cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      Waiting for Opponent...
                    </button>
                  ) : !canAfford ? (
                    // Not enough G-Points
                    <button
                      disabled
                      className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-5 rounded-2xl text-xs tracking-[0.2em] cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Gamepad2 size={14} />
                      Need {match.entry_points} G-PTS to Accept
                    </button>
                  ) : (
                    // Others see the Accept button
                    <button
                      onClick={() => handleAccept(match)}
                      disabled={isAccepting}
                      className="w-full bg-emerald-500 text-black py-5 rounded-2xl text-xs tracking-[0.2em] hover:bg-white transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isAccepting ? (
                        <><Loader2 size={14} className="animate-spin" /> Accepting...</>
                      ) : (
                        <><CheckCircle2 size={14} /> Accept Challenge »</>
                      )}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      <ArenaLegendsSection />
    </div>
  );
}

export default ChallengeMode;