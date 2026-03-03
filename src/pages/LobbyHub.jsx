import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  X, 
  Navigation,
  Plus,
  User,
  UserPlus,
  UserCheck,
  MessageCircle,
  Crown,
  Zap,
  Users,
  Eye,
  Flame,
  Award,
  Clock,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LobbyHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState(null);
  const [friendRequests, setFriendRequests] = useState({});
  const [activeTab, setActiveTab] = useState("all"); // "all" | "friends" | "pending"
  
  const [userCoords, setUserCoords] = useState({ 
    lat: 20.4625, 
    lon: 85.8830, 
    label: "Cuttack, Odisha" 
  });

  const communityGroups = [
    { 
      id: "G-001", 
      name: "CDA Sector-9 Strikers", 
      lat: 20.4800, 
      lon: 85.8550, 
      type: "Public", 
      membersCount: 42, 
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100",
      sport: "Cricket",
      creator: "Rajesh_K",
      description: "Weekly cricket matches every Sunday"
    },
    { 
      id: "G-002", 
      name: "Patia Power Hitters", 
      lat: 20.3500, 
      lon: 85.8200, 
      type: "Private", 
      membersCount: 128, 
      image: "https://images.unsplash.com/photo-1626225443005-937748834907?w=100",
      sport: "Football",
      creator: "Vikram_S",
      description: "Elite football club for serious players"
    },
    { 
      id: "G-003", 
      name: "Cyberabad Elite", 
      lat: 17.4483, 
      lon: 78.3915, 
      type: "Public", 
      membersCount: 56, 
      image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=100",
      sport: "Badminton",
      creator: "Priya_D",
      description: "Professional badminton training group"
    }
  ];

  const globalPlayers = [
    { 
      id: "ARENA-102", 
      name: "Blesson", 
      aura: 2100, 
      rank: "Diamond",
      avatar: "B",
      city: "Bangalore",
      sports: ["Cricket", "Football"],
      wins: 156,
      losses: 23,
      joinedDate: "Jan 2024",
      bio: "Competitive cricket player | Football enthusiast"
    },
    { 
      id: "ARENA-009", 
      name: "Rahul_K", 
      aura: 1540, 
      rank: "Gold",
      avatar: "R",
      city: "Cuttack",
      sports: ["Badminton", "Tennis"],
      wins: 89,
      losses: 34,
      joinedDate: "Feb 2024",
      bio: "Badminton coach | Love competitive play"
    },
    { 
      id: "ARENA-045", 
      name: "Priya_D", 
      aura: 1850, 
      rank: "Platinum",
      avatar: "P",
      city: "Cuttack",
      sports: ["Basketball", "Volleyball"],
      wins: 124,
      losses: 18,
      joinedDate: "Dec 2023",
      bio: "Basketball lover | Team player"
    },
    { 
      id: "ARENA-078", 
      name: "Arjun_V", 
      aura: 1320, 
      rank: "Silver",
      avatar: "A",
      city: "Hyderabad",
      sports: ["Tennis"],
      wins: 67,
      losses: 42,
      joinedDate: "Mar 2024",
      bio: "Tennis player | Always ready for matches"
    },
  ];

  // --- GEOFENCING CALCULATION ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // --- FILTERING LOGIC ---
  const filteredPlayers = searchQuery ? globalPlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sports.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const filteredLobbies = communityGroups.filter(g => {
    const dist = calculateDistance(userCoords.lat, userCoords.lon, g.lat, g.lon);
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return dist <= 50 && (searchQuery ? matchesSearch : true);
  });

  const handleSendFriendRequest = (playerId) => {
    setFriendRequests(prev => ({
      ...prev,
      [playerId]: "pending"
    }));
  };

  const getRankColor = (rank) => {
    const colors = {
      "Diamond": "text-cyan-400",
      "Platinum": "text-purple-400",
      "Gold": "text-yellow-400",
      "Silver": "text-slate-400"
    };
    return colors[rank] || "text-slate-400";
  };

  const getRankBg = (rank) => {
    const bgs = {
      "Diamond": "bg-cyan-500/10 border-cyan-500/20",
      "Platinum": "bg-purple-500/10 border-purple-500/20",
      "Gold": "bg-yellow-500/10 border-yellow-500/20",
      "Silver": "bg-slate-500/10 border-slate-500/20"
    };
    return bgs[rank] || "bg-slate-500/10 border-slate-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#050818] text-white font-sans italic selection:bg-emerald-500/30 pb-32">
      
      {/* ANIMATED BG GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 -left-96 w-96 h-96 bg-emerald-500/15 blur-[150px] rounded-full"
        />
      </div>

      {/* --- HEADER --- */}
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

          {/* TABS */}
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

      {/* --- SEARCH BAR --- */}
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-3 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all shadow-2xl"
        >
          <div className="p-3 text-slate-700"><Search size={18} /></div>
          <input 
            type="text" 
            placeholder="Search players, groups, or sports..." 
            className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </div>

      {/* --- RESULTS --- */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto space-y-10">
        
        {/* PLAYER RESULTS */}
        {(activeTab === "all" || activeTab === "friends" || activeTab === "pending") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                {activeTab === "all" && (searchQuery ? "Players Found" : "Discover Players")}
                {activeTab === "friends" && "Your Friends"}
                {activeTab === "pending" && "Friend Requests"}
              </h2>
            </div>

            <div className="space-y-4">
              {filteredPlayers.length > 0 || activeTab !== "all" ? (
                filteredPlayers.map(player => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* AVATAR */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border ${getRankBg(player.rank)}`}>
                          {player.avatar}
                        </div>

                        {/* INFO */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black uppercase italic tracking-tight">{player.name}</h3>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${getRankBg(player.rank)} ${getRankColor(player.rank)}`}>
                              {player.rank}
                            </span>
                          </div>

                          <p className="text-[9px] text-slate-400 mb-2">{player.bio}</p>

                          <div className="flex gap-3 flex-wrap text-[8px] text-slate-500 font-bold uppercase">
                            <span className="flex items-center gap-1"><Zap size={10} className="text-emerald-400" /> {player.aura} Aura</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Award size={10} /> {player.wins}W {player.losses}L</span>
                            <span>•</span>
                            <span>{player.city}</span>
                            <span>•</span>
                            <span>Joined {player.joinedDate}</span>
                          </div>

                          {/* SPORTS */}
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {player.sports.map((sport, idx) => (
                              <span key={idx} className="text-[8px] font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
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
                        ) : friendRequests[player.id] === "pending" ? (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-2 rounded-lg text-[9px] font-black"
                          >
                            <Clock size={12} /> Pending
                          </motion.button>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-[9px] font-black"
                          >
                            <UserCheck size={12} /> Friend
                          </motion.button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 px-3 py-2 rounded-lg text-[9px] font-black"
                        >
                          <MessageCircle size={12} /> Chat
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl opacity-40 italic">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No players found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOBBY RESULTS */}
        {activeTab === "all" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                {searchQuery ? "Groups Found" : "Nearby Groups (Within 50km)"}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/create-group')}
                className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:text-emerald-400"
              >
                <Plus size={12} /> Create Group
              </motion.button>
            </div>

            <div className="space-y-4">
              {filteredLobbies.length > 0 ? (
                filteredLobbies.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-5 active:scale-[0.98] transition-all group cursor-pointer hover:border-emerald-500/30"
                  >
                    <div className="flex items-start gap-4">
                      {/* GROUP IMAGE */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 rounded-2xl border border-white/10 overflow-hidden shrink-0"
                      >
                        <img src={group.image} className="w-full h-full object-cover" alt="Group" />
                      </motion.div>

                      {/* GROUP INFO */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black uppercase italic tracking-tighter">{group.name}</h3>
                          {group.type === "Private" && (
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              PRIVATE
                            </span>
                          )}
                        </div>

                        <p className="text-[9px] text-slate-400 mb-2">{group.description}</p>

                        <div className="flex gap-3 flex-wrap text-[8px] text-slate-500 font-bold uppercase">
                          <span className="flex items-center gap-1"><Users size={10} /> {group.membersCount} Members</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Flame size={10} className="text-red-400" /> {group.sport}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Crown size={10} className="text-yellow-400" /> {group.creator}</span>
                        </div>
                      </div>

                      {/* ACTION */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-emerald-500 group-hover:text-emerald-400"
                      >
                        <Plus size={20} />
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl opacity-40 italic">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No groups in your 50km zone</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- PLAYER PROFILE MODAL --- */}
      <AnimatePresence>
        {selectedPlayerProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayerProfile(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0b0f1a] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* CLOSE BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedPlayerProfile(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </motion.button>

              {/* PROFILE HEADER */}
              <div className="flex items-start gap-6 mb-6">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center font-black text-3xl border ${getRankBg(selectedPlayerProfile.rank)}`}>
                  {selectedPlayerProfile.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-black uppercase italic">{selectedPlayerProfile.name}</h2>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getRankBg(selectedPlayerProfile.rank)} ${getRankColor(selectedPlayerProfile.rank)}`}>
                      {selectedPlayerProfile.rank}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-3">{selectedPlayerProfile.bio}</p>

                  <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-emerald-400" /> {selectedPlayerProfile.aura} Aura</span>
                    <span>•</span>
                    <span>{selectedPlayerProfile.city}</span>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Wins</p>
                  <p className="text-2xl font-black text-emerald-400">{selectedPlayerProfile.wins}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Losses</p>
                  <p className="text-2xl font-black text-red-400">{selectedPlayerProfile.losses}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Win Rate</p>
                  <p className="text-2xl font-black text-blue-400">
                    {Math.round((selectedPlayerProfile.wins / (selectedPlayerProfile.wins + selectedPlayerProfile.losses)) * 100)}%
                  </p>
                </div>
              </div>

              {/* SPORTS */}
              <div className="mb-6">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-3">Sports Played</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedPlayerProfile.sports.map((sport, idx) => (
                    <span key={idx} className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>

              {/* MEMBER SINCE */}
              <div className="text-[9px] text-slate-500 font-bold uppercase mb-6">
                Member since {selectedPlayerProfile.joinedDate}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                {!friendRequests[selectedPlayerProfile.id] ? (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      handleSendFriendRequest(selectedPlayerProfile.id);
                      setSelectedPlayerProfile(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-black uppercase text-[10px]"
                  >
                    <UserPlus size={14} /> Send Friend Request
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-lg font-black uppercase text-[10px]"
                  >
                    <Check size={14} /> {friendRequests[selectedPlayerProfile.id] === "pending" ? "Request Sent" : "Friends"}
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-3 rounded-lg font-black uppercase text-[10px]"
                >
                  <MessageCircle size={14} /> Send Message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LOCATION PICKER --- */}
      <AnimatePresence>
        {isLocationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0b0f1a] border-t border-white/10 rounded-t-3xl z-[70] p-8 pb-12 max-h-[80vh] flex flex-col shadow-[0_-20px_80px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] italic text-emerald-500 flex items-center gap-2">
                  <Navigation size={14} /> Change Zone
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLocationOpen(false)}
                  className="p-2 bg-white/5 rounded-full text-slate-500 hover:bg-white/10"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-8">
                <Search size={18} className="text-slate-700" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Type City, Sector, or Area Name..."
                  className="bg-transparent flex-1 outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-800"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto italic text-center py-6">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-loose">
                  {locationSearch ? `Targeting: ${locationSearch}` : "The radar is set to your current sector. Type to shift the focus."}
                </p>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if(locationSearch) setUserCoords({...userCoords, label: locationSearch});
                  setIsLocationOpen(false);
                  setLocationSearch("");
                }}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/10 transition-all"
              >
                Set Radar to {locationSearch || "Current"}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LobbyHub;
