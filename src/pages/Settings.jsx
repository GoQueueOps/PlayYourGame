import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { 
  Mail, Phone, Camera, LogOut, RefreshCw, X,
  ChevronLeft, Lock, Shield, MapPin
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    phone: "",
    zPoints: 0, 
    gPoints: 0, 
    avatar: "🦁",
    verified: true,
    joinedDate: "2026",
    city: "",
    state: "",
    country: ""
  });

  const [locLoading, setLocLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeType, setChangeType] = useState(null);
  const [newValue, setNewValue] = useState("");

  const DEFAULT_AVATARS = ["🦁", "🐯", "🐱", "🦊", "🐻", "🐺", "🦅", "🐉"];

  // ─── FETCH LIVE DATA ──────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          name: profile.name || "Athlete",
          email: authUser.email,
          phone: profile.phone || "Not Set",
          zPoints: profile.z_points || 0,
          gPoints: profile.g_points || 0,
          avatar: profile.avatar || "🦁",
          verified: profile.verified || false,
          joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "2026",
          city: profile.city || "",
          state: profile.state || "",
          country: profile.country || ""
        });
      }
    };
    fetchUserData();
  }, [navigate]);

  // ─── MOUSE PARALLAX ──────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ─── RESTORED FUNCTIONS ──────────────────
  const openChangeModal = (type) => {
    setChangeType(type);
    setNewValue("");
    setIsModalOpen(true);
  };

  const handleUpdateComplete = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const updateObj = { [changeType]: newValue };
    const { error } = await supabase.from('profiles').update(updateObj).eq('id', authUser.id);
    
    if (!error) {
      setUser(prev => ({ ...prev, ...updateObj }));
      setIsModalOpen(false);
    } else {
      alert(error.message);
    }
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await res.json();
        const updateData = {
          city: data.city || data.locality || "",
          state: data.principalSubdivision || "",
          country: data.countryName || ""
        };
        const { data: { user: authUser } } = await supabase.auth.getUser();
        await supabase.from('profiles').update(updateData).eq('id', authUser.id);
        setUser(prev => ({ ...prev, ...updateData }));
      } catch (err) {
        console.error(err);
      } finally {
        setLocLoading(false);
      }
    }, () => setLocLoading(false));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-white pb-32 italic font-black relative overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <motion.div 
        animate={{ x: mousePosition.x * 40, y: mousePosition.y * 40 }}
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"
      />

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 border border-white/20 rounded-xl">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight">Settings</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 relative z-10">
        
        {/* PROFILE SECTION */}
        <section className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-[2.5rem] border border-white/20 mb-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-[2.5rem] flex items-center justify-center text-6xl border-3 border-white/30 shadow-2xl">
                <span>{user.avatar}</span>
              </div>
              <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="absolute bottom-3 -right-3 bg-emerald-500 p-3 rounded-xl border-4 border-[#020617]">
                <Camera size={18} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{user.name}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                <Shield size={14} className="text-emerald-400" />
                Verified Athlete • Joined {user.joinedDate}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap gap-3 mb-8 justify-center">
                {DEFAULT_AVATARS.map(av => (
                  <button key={av} onClick={() => { setUser(p => ({...p, avatar: av})); setShowAvatarPicker(false); }} className="text-3xl p-3 bg-white/5 rounded-xl border border-white/10">
                    {av}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOCATION SUB-SECTION */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Base Location</span>
              </div>
              <button onClick={detectLocation} disabled={locLoading} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 active:scale-95 transition-all">
                {locLoading ? "Locating..." : "Auto-Detect Location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                 <p className="text-[8px] text-slate-600 uppercase mb-1">City</p>
                 <p className="text-xs uppercase">{user.city || "---"}</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                 <p className="text-[8px] text-slate-600 uppercase mb-1">State / Country</p>
                 <p className="text-xs uppercase truncate">{user.state ? `${user.state}, ${user.country}` : "---"}</p>
               </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT CARDS */}
        <div className="space-y-4 mb-8">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
            <Lock size={14} className="text-emerald-400" />
            Account Details
          </h2>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Mail size={20} className="text-blue-400" />
              </div>
              <div className="truncate">
                <p className="text-[9px] text-slate-500 uppercase">Email</p>
                <p className="text-sm uppercase truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={() => openChangeModal('email')} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-blue-400"><RefreshCw size={16}/></button>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <Phone size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase">Phone</p>
                <p className="text-sm uppercase">{user.phone}</p>
              </div>
            </div>
            <button onClick={() => openChangeModal('phone')} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400"><RefreshCw size={16}/></button>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-lg"
        >
          <LogOut size={16} /> Logout Account
        </button>
      </div>

      {/* UPDATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <div className="bg-[#0b0f1a] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400"><X size={20} /></button>
                <div className="text-center space-y-4">
                   <h3 className="text-2xl uppercase">Update {changeType}</h3>
                   <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full bg-white/5 border border-white/20 p-4 rounded-xl outline-none focus:border-emerald-500" placeholder={`New ${changeType}...`} />
                   <button onClick={handleUpdateComplete} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-widest">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;