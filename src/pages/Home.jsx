import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trophy, Zap, MapPin, Star, Sparkles, Flame, Lightbulb, Loader } from "lucide-react";
import heroLogo from "../assets/hero-logo.png";
import { supabase } from "../lib/supabase";

function AnimatedCounter({ from = 0, to, suffix = "", prefix = "" }) {
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => { motionValue.set(to); }, [to, motionValue]);
  useEffect(() => {
    const unsubscribe = springValue.onChange((value) => setDisplayValue(Math.floor(value)));
    return () => unsubscribe();
  }, [springValue]);

  return <span>{prefix}{displayValue}{suffix}</span>;
}

function CourtCard({ court, index, isFeatured }) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const image = court.images?.[0] || court.play_area_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"
  const sports = court.arena_sports?.map(as => as.sports?.name).filter(Boolean) ||
    court.sports?.map(s => s.name).filter(Boolean) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -15, boxShadow: "0 30px 60px rgba(34, 197, 94, 0.2)" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden cursor-pointer"
    >
      <motion.div animate={{ opacity: isHovering ? 1 : 0 }} transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-blue-500/0" />
      <motion.div animate={{ opacity: isHovering ? 0.8 : 0 }}
        className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 blur-2xl rounded-full -mr-16 -mt-16" />

      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.img src={image} alt={court.name}
          animate={{ scale: isHovering ? 1.15 : 1 }} transition={{ duration: 0.5 }}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <motion.div animate={{ scale: isHovering ? 1.15 : 1 }}
          className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-[11px] font-black shadow-lg shadow-green-500/50">
          <Star size={12} fill="currentColor" />
          {court.rating || "4.8"}
        </motion.div>

        {isFeatured && (
          <motion.div animate={{ y: isHovering ? 0 : -40 }}
            className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-[11px] font-black shadow-lg shadow-orange-500/50">
            <Flame size={12} /> FEATURED
          </motion.div>
        )}
      </div>

      <div className="p-5 relative z-10">
        <motion.h3 animate={{ color: isHovering ? "#4ade80" : "#ffffff" }}
          className="text-lg font-black uppercase tracking-tight mb-1 transition-colors">
          {court.name}
        </motion.h3>

        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-3">
          <MapPin size={10} className="text-green-500" />
          <span>{court.city || court.location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {sports.slice(0, 3).map((sport, idx) => (
            <motion.span key={idx} whileHover={{ scale: 1.1 }}
              className="px-2.5 py-1 bg-green-500/20 text-green-400 text-[9px] font-black uppercase rounded-lg border border-green-500/30">
              {sport}
            </motion.span>
          ))}
        </div>

        <motion.button
          onClick={() => navigate(`/play-area/${court.id}`)}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black uppercase text-[10px] py-3 rounded-xl transition-all shadow-lg shadow-green-500/30">
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [featuredArenas, setFeaturedArenas] = useState([]);
  const [allArenas, setAllArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ users: 0, arenas: 0, bookings: 0 });
  const resultsRef = useRef(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch featured arenas (active, not expired)
      const { data: featuredData } = await supabase
        .from('featured_arenas')
        .select(`
          *,
          arenas (
            id, name, location, city, state,
            play_area_images (image_url, image_type),
            arena_sports (sports (name, emoji))
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(8)

      if (featuredData) {
        const mapped = featuredData
          .map(f => f.arenas)
          .filter(Boolean)
          .map(a => ({
            ...a,
            images: a.play_area_images?.filter(i => i.image_type === 'court').map(i => i.image_url) || []
          }))
        setFeaturedArenas(mapped)
      }

      // Fetch all arenas as fallback
      const { data: arenasData } = await supabase
        .from('arenas')
        .select(`
          id, name, location, city, state,
          play_area_images (image_url, image_type),
          arena_sports (sports (name, emoji))
        `)
        .eq('is_active', true)
        .limit(8)

      if (arenasData) {
        const mapped = arenasData.map(a => ({
          ...a,
          images: a.play_area_images?.filter(i => i.image_type === 'court').map(i => i.image_url) || []
        }))
        setAllArenas(mapped)
      }

      // Fetch stats
      const [usersRes, arenasRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('arenas').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        users: usersRes.count || 0,
        arenas: arenasRes.count || 0,
        bookings: bookingsRes.count || 0,
      })

    } catch (err) {
      console.error('Home fetch error:', err)
    }
    setLoading(false)
  }

  const displayArenas = featuredArenas.length > 0 ? featuredArenas : allArenas

  const handleSearch = () => {
    if (searchQuery.trim()) navigate("/booking", { state: { query: searchQuery } })
    else resultsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-green-500/40 font-sans">

      {/* BG GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-green-500/15 blur-[150px] rounded-full" />
        <motion.div animate={{ x: [0, -40, 30, 0], y: [0, 40, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-blue-500/15 blur-[150px] rounded-full" />
        <motion.div animate={{ scale: [1, 1.2, 0.9, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/8 blur-[100px] rounded-full" />
      </div>

      {/* HERO */}
      <div className="relative pt-20 pb-32 px-4 flex flex-col items-center justify-center overflow-hidden min-h-screen">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none flex items-center justify-center -z-5">
          <h1 className="text-[200px] md:text-[350px] font-black text-white/[0.04] uppercase tracking-tighter">P Y G</h1>
        </motion.div>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center w-full max-w-6xl">
          <motion.img src={heroLogo} alt="Play Your Game Logo"
            initial={{ scale: 0.5, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
            whileHover={{ scale: 1.05 }} className="w-48 md:w-64 lg:w-80 mb-8" />

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tighter">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 animate-gradient">PLAY</span>?
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-green-500" />
            <p className="text-gray-300 font-black tracking-[0.5em] text-xs uppercase">Premium Arena Booking</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-green-500" />
          </motion.div>

          {/* SEARCH */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 100 }} className="w-full max-w-3xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex gap-2 bg-white/[0.08] backdrop-blur-2xl border border-white/15 rounded-2xl p-2 hover:border-white/25 transition-colors">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search arenas, sports, or locations..."
                  className="flex-1 bg-transparent px-6 py-4 outline-none text-white font-bold placeholder:text-gray-600 text-sm" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSearch}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black px-10 py-4 rounded-xl font-black uppercase tracking-tighter text-sm transition-all shadow-lg shadow-green-500/40">
                  <Zap size={16} className="inline mr-2" /> Find
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ACTION CARDS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-6">
            {[
              { icon: MessageSquare, label: "Lobby", desc: "Chat & Teams", color: "emerald", href: "/lobby-hub" },
              { icon: Trophy, label: "Challenge", desc: "Call Out Rivals", color: "orange", href: "/challenge" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button key={idx} onClick={() => navigate(item.href)}
                  whileHover={{ scale: 1.08, y: -8 }} whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden">
                  <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className={`absolute inset-0 bg-${item.color}-500/10 blur-xl`} />
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    className={`w-14 h-14 bg-${item.color}-500/20 rounded-2xl flex items-center justify-center text-${item.color}-400 border border-${item.color}-500/40 group-hover:scale-125 transition-transform relative z-10`}>
                    <Icon size={28} />
                  </motion.div>
                  <div className="text-center relative z-10">
                    <motion.p animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}
                      className="text-sm font-black uppercase tracking-tight group-hover:text-white transition-colors">{item.label}</motion.p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 group-hover:text-slate-400 transition-colors">{item.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* STATS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="relative py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {[
            { number: stats.users || 2500, label: "Active Users", suffix: "+" },
            { number: stats.arenas || 500, label: "Arenas", suffix: "+" },
            { number: stats.bookings || 50000, label: "Bookings", suffix: "+" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15)" }}
              className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-lg border border-white/10 hover:border-green-500/40 transition-all cursor-pointer group overflow-hidden">
              <div className="relative z-10">
                <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter to={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FEATURED ARENAS */}
      <motion.div ref={resultsRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="relative py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="flex items-center gap-3 mb-4">
            <motion.div animate={{ width: [30, 50, 30] }} transition={{ duration: 2, repeat: Infinity }}
              className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/50" />
            <span className="text-xs font-black uppercase tracking-[0.5em] text-green-400">
              {featuredArenas.length > 0 ? 'Featured' : 'Top Tier'}
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-tight">
            {featuredArenas.length > 0 ? 'Featured ' : 'Top '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500">
              Arenas
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader size={40} className="text-emerald-500" />
            </motion.div>
          </div>
        ) : displayArenas.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg font-black uppercase">No arenas found</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayArenas.slice(0, 8).map((court, idx) => (
              <CourtCard key={court.id} court={court} index={idx} isFeatured={featuredArenas.length > 0} />
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }} className="flex justify-center mt-12">
          <motion.button whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(34, 197, 94, 0.6)" }}
            whileTap={{ scale: 0.95 }} onClick={() => navigate("/booking")}
            className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black uppercase text-sm rounded-xl shadow-lg shadow-green-500/40 transition-all">
            <Sparkles className="inline mr-2" size={16} /> Explore All Arenas
          </motion.button>
        </motion.div>
      </motion.div>

      {/* FEATURES */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="relative py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Us?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Instant booking confirmations and real-time availability updates" },
            { icon: Lightbulb, title: "Smart Matching", desc: "AI-powered player matching and team formation" },
            { icon: Star, title: "Top Quality", desc: "Access premium arenas and verified venues only" },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)" }}
                className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-lg border border-white/10 hover:border-green-500/40 transition-all overflow-hidden">
                <div className="relative z-10">
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center text-green-400 mb-6 border border-green-500/30">
                    <Icon size={32} />
                  </motion.div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-green-400 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* FOOTER */}
      <footer className="relative mt-20 py-12 border-t border-white/10 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Play Your Game © 2026</p>
          <p className="text-xs text-slate-600 font-bold">Engineered for Athletes • Engineered for Moments</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 3s ease infinite; }
      `}</style>
    </div>
  );
}

export default Home;
