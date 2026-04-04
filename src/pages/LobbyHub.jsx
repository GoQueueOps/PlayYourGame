import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, X, Navigation, Plus, User, UserPlus,
  MessageCircle, Zap, Eye,Users,
  Award, Clock, Check, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

function LobbyHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState(null);
  const [friendRequests, setFriendRequests] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [userCoords, setUserCoords] = useState({
    lat: 20.4625, lon: 85.8830, label: "Detecting..."
  });

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data?.session?.user?.id || null)
    })
  }, [])

  // ── Location detection ──
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            )
            const data = await res.json()
            const city = data.address.city || data.address.town || data.address.village || "India"
            setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: city })
          } catch {
            setUserCoords(prev => ({ ...prev, label: "India" }))
          }
        },
        () => setUserCoords(prev => ({ ...prev, label: "India" }))
      )
    }
  }, [])

  // ── Fetch players ──
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoadingPlayers(true)
      let query = supabase
        .from('profiles')
        .select(`
          id, name, city, state, email,
          player_stats (matches_played, matches_won, aura_level, rank),
          wallet (g_points_balance)
        `)
        .neq('id', currentUserId || '00000000-0000-0000-0000-000000000000')
        .limit(20)

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      const { data } = await query
      setPlayers(data || [])
      setLoadingPlayers(false)
    }

    fetchPlayers()
  }, [searchQuery, currentUserId])

  // ── Fetch groups ──
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true)
      let query = supabase
        .from('groups')
        .select(`
          id, name, type, created_at, is_permanent,
          group_members (count)
        `)
        .eq('is_permanent', true)
        .limit(10)

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      const { data } = await query
      setGroups(data || [])
      setLoadingGroups(false)
    }

    fetchGroups()
  }, [searchQuery])

  const handleSendFriendRequest = async (playerId) => {
    setFriendRequests(prev => ({ ...prev, [playerId]: "pending" }))
    // Insert friendship request
    await supabase.from('friendships').insert({
      user_id: currentUserId,
      friend_id: playerId,
      status: 'pending'
    })
  }

  const handleDirectMessage = async (playerId) => {
    navigate(`/chat/direct/${playerId}`)
  }

  const getAuraRank = (aura) => {
    if (aura >= 80) return { label: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' }
    if (aura >= 60) return { label: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
    if (aura >= 40) return { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' }
    return { label: 'Silver', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#050818] text-white font-sans italic selection:bg-emerald-500/30 pb-32">

      {/* BG GLOW */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 -left-96 w-96 h-96 bg-emerald-500/15 blur-[150px] rounded-full"
        />
      </div>

      {/* HEADER */}
      <div className="relative z-10 bg-[#0b0f1a]/80 backdrop-blur-xl border-b border-white/5 p-8 pt-16 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center gap-3 mb-2 group active:scale-95 transition-all"
          >
            <div className="h-[2px] w-12 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/80 italic flex items-center gap-2 group-hover:text-white">
              <MapPin size={10} /> {userCoords.label}
            </span>
          </motion.button>

          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85] flex flex-col mb-6">
            <span className="text-white">The</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">Lobby</span>
          </h1>

          <div className="flex gap-2">
            {[
              { id: "all", label: "Discover", icon: <Eye size={13} /> },
              { id: "friends", label: "Friends", icon: <Users size={13} /> },
              { id: "pending", label: "Requests", icon: <Clock size={13} /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-3 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all shadow-2xl">
          <div className="p-3 text-slate-700"><Search size={18} /></div>
          <input
            type="text"
            placeholder="Search players, groups..."
            className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-2 text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto space-y-10">

        {/* PLAYERS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
              {activeTab === "all" ? "Players" : activeTab === "friends" ? "Your Friends" : "Friend Requests"}
            </h2>
            {loadingPlayers && <Loader2 size={14} className="animate-spin text-emerald-500" />}
          </div>

          <div className="space-y-4">
            {players.length === 0 && !loadingPlayers ? (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl opacity-40 italic">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No players found</p>
              </div>
            ) : (
              players.map(player => {
                const stats = player.player_stats?.[0] || {}
                const rank = getAuraRank(stats.aura_level || 0)

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border ${rank.bg}`}>
                          <span className={rank.color}>{player.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black uppercase italic tracking-tight">{player.name}</h3>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${rank.bg} ${rank.color}`}>
                              {rank.label}
                            </span>
                          </div>
                          <div className="flex gap-3 flex-wrap text-[8px] text-slate-500 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Zap size={10} className="text-emerald-400" /> {stats.aura_level || 0} Aura
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Award size={10} /> {stats.matches_won || 0}W {(stats.matches_played || 0) - (stats.matches_won || 0)}L
                            </span>
                            {player.city && <><span>•</span><span>{player.city}</span></>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSelectedPlayerProfile(player)}
                          className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-2 rounded-lg text-[9px] font-black"
                        >
                          <User size={12} /> View
                        </motion.button>

                        {!friendRequests[player.id] ? (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleSendFriendRequest(player.id)}
                            className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-[9px] font-black"
                          >
                            <UserPlus size={12} /> Add
                          </motion.button>
                        ) : (
                          <motion.button className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-2 rounded-lg text-[9px] font-black">
                            <Clock size={12} /> Pending
                          </motion.button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleDirectMessage(player.id)}
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 px-3 py-2 rounded-lg text-[9px] font-black"
                        >
                          <MessageCircle size={12} /> Chat
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* GROUPS */}
        {activeTab === "all" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                Community Groups
              </h2>
              <div className="flex items-center gap-3">
                {loadingGroups && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/create-group')}
                  className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:text-emerald-400"
                >
                  <Plus size={12} /> Create Group
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {groups.length === 0 && !loadingGroups ? (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl opacity-40 italic">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No groups yet</p>
                  <button onClick={() => navigate('/create-group')} className="mt-4 bg-emerald-500 text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    Create First Group
                  </button>
                </div>
              ) : (
                groups.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 active:scale-[0.98] transition-all cursor-pointer hover:border-emerald-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
                        👥
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black uppercase italic tracking-tighter">{group.name}</h3>
                          {group.type === "Private" && (
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              PRIVATE
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 text-[8px] text-slate-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <Users size={10} /> {group.group_members?.[0]?.count || 0} Members
                          </span>
                        </div>
                      </div>
                      <Plus size={20} className="text-emerald-500" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PLAYER PROFILE MODAL */}
      <AnimatePresence>
        {selectedPlayerProfile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayerProfile(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0b0f1a] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedPlayerProfile(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>

              {(() => {
                const stats = selectedPlayerProfile.player_stats?.[0] || {}
                const rank = getAuraRank(stats.aura_level || 0)
                const winRate = stats.matches_played > 0
                  ? Math.round((stats.matches_won / stats.matches_played) * 100)
                  : 0

                return (
                  <>
                    <div className="flex items-start gap-6 mb-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl border ${rank.bg}`}>
                        <span className={rank.color}>{selectedPlayerProfile.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-black uppercase italic">{selectedPlayerProfile.name}</h2>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${rank.bg} ${rank.color}`}>{rank.label}</span>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
                          <span className="flex items-center gap-1"><Zap size={11} className="text-emerald-400" /> {stats.aura_level || 0} Aura</span>
                          {selectedPlayerProfile.city && <><span>•</span><span>{selectedPlayerProfile.city}</span></>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Matches</p>
                        <p className="text-2xl font-black">{stats.matches_played || 0}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Wins</p>
                        <p className="text-2xl font-black text-emerald-400">{stats.matches_won || 0}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Win Rate</p>
                        <p className="text-2xl font-black text-blue-400">{winRate}%</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {!friendRequests[selectedPlayerProfile.id] ? (
                        <button
                          onClick={() => { handleSendFriendRequest(selectedPlayerProfile.id); setSelectedPlayerProfile(null) }}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-black py-3 rounded-lg font-black uppercase text-[10px]"
                        >
                          <UserPlus size={14} /> Add Friend
                        </button>
                      ) : (
                        <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-lg font-black uppercase text-[10px]">
                          <Check size={14} /> Request Sent
                        </button>
                      )}
                      <button
                        onClick={() => { handleDirectMessage(selectedPlayerProfile.id); setSelectedPlayerProfile(null) }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 py-3 rounded-lg font-black uppercase text-[10px]"
                      >
                        <MessageCircle size={14} /> Message
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOCATION PICKER */}
      <AnimatePresence>
        {isLocationOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLocationOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-3xl z-[70] p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] italic text-emerald-500 flex items-center gap-2">
                  <Navigation size={14} /> Change Zone
                </h2>
                <button onClick={() => setIsLocationOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-8">
                <Search size={18} className="text-slate-700" />
                <input
                  autoFocus type="text" placeholder="Type City or Area..."
                  className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  if (locationSearch) setUserCoords(prev => ({ ...prev, label: locationSearch }))
                  setIsLocationOpen(false)
                  setLocationSearch("")
                }}
                className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                Set to {locationSearch || "Current"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LobbyHub;
