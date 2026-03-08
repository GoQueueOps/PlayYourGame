import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trophy, Zap, Users, MapPin, Star, Sparkles, Flame, Lightbulb } from "lucide-react";
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

function CourtCard({ court, index }) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const handleBookNow = () => navigate(`/play-area/${court.id}`);

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
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.img
          src={court.image_url || "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"}
          alt={court.name}
          animate={{ scale: isHovering ? 1.15 : 1 }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-[11px] font-black shadow-lg">
          <Star size={12} fill="currentColor" /> {court.rating || '4.5'}
        </div>
      </div>
      <div className="p-5 relative z-10">
        <h3 className="text-lg font-black uppercase tracking-tight mb-1">{court.name}</h3>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-3">
          <MapPin size={10} className="text-green-500" />
          <span>{court.city}</span>
        </div>
        <motion.button
          onClick={handleBookNow}
          whileHover={{ scale: 1.08 }}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black uppercase text-[10px] py-3 rounded-xl shadow-lg"
        >
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [featuredCourts, setFeaturedCourts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const resultsRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('arenas').select('*').limit(4);
      if (data) setFeaturedCourts(data);
    };
    fetchFeatured();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) navigate("/booking", { state: { query: searchQuery } });
    else resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-green-500/40 font-sans">
      {/* Background Glows and Hero Content remains same as provided template */}
      <div className="relative pt-20 pb-32 px-4 flex flex-col items-center justify-center min-h-screen">
         <motion.img src={heroLogo} className="w-48 md:w-80 mb-8" />
         <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter">Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">PLAY</span>?</h2>
         <div className="w-full max-w-3xl mt-8">
            <div className="relative flex gap-2 bg-white/[0.08] backdrop-blur-2xl border border-white/15 rounded-2xl p-2">
                <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search arenas or locations..." className="flex-1 bg-transparent px-6 py-4 outline-none text-white font-bold" />
                <button onClick={handleSearch} className="bg-green-500 text-black px-10 py-4 rounded-xl font-black uppercase">Find</button>
            </div>
         </div>
      </div>

      <div ref={resultsRef} className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-5xl font-black uppercase mb-12">Featured Arenas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourts.map((court, idx) => (
            <CourtCard key={court.id} court={court} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
export default Home;