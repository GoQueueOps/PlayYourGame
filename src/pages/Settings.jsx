import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { 
  Mail, Phone, Camera, LogOut, RefreshCw, X,
  ChevronLeft, Lock, Shield, MapPin, Loader2, Sparkles 
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // --- STATE ---
  const [user, setUser] = useState({
    id: "",
    name: "Loading...",
    email: "",
    phone: "",
    avatar_url: null,
    lastNameChange: null,
    city: "",
    state: "",
    zPoints: 0
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeType, setChangeType] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [step, setStep] = useState(1);

  // --- 1. FETCH PROFILE & SESSIONS ---
  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate("/login");
      return;
    }

    // Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      setUser({
        id: authUser.id,
        name: profile.name || "Athlete",
        email: authUser.email,
        phone: profile.phone || "Not Set",
        avatar_url: profile.avatar_url,
        lastNameChange: profile.last_name_change,
        city: profile.city || "Not set",
        state: profile.state || "",
        zPoints: profile.z_points || 0
      });
    }

    // Fetch Bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', authUser.id)
      .order('booking_date', { ascending: false })
      .limit(3);

    if (bookings) setSessions(bookings);
    setSessionsLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 2. IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setUser(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SECURE UPDATES (NAME LOCK / EMAIL / PHONE) ---
  const handleStartUpdate = async () => {
    setLoading(true);
    try {
      if (changeType === 'name') {
        const sixMonths = 180 * 24 * 60 * 60 * 1000;
        const lastChange = user.lastNameChange ? new Date(user.lastNameChange).getTime() : 0;
        if (Date.now() - lastChange < sixMonths) {
          const days = Math.ceil((sixMonths - (Date.now() - lastChange)) / (1000 * 60 * 60 * 24));
          throw new Error(`Identity Lock: Change available in ${days} days.`);
        }
        await supabase.from('profiles').update({ name: newValue, last_name_change: new Date().toISOString() }).eq('id', user.id);
        setUser(prev => ({ ...prev, name: newValue }));
        setIsModalOpen(false);
      } 
      else if (changeType === 'email') {
        const { error } = await supabase.auth.updateUser({ email: newValue });
        if (error) throw error;
        alert("Check both old and new emails for confirmation links!");
        setIsModalOpen(false);
      }
      else if (changeType === 'phone') {
        const { error } = await supabase.auth.updateUser({ phone: newValue });
        if (error) throw error;
        setStep(2);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (otp) => {
    const { error } = await supabase.auth.verifyOtp({ phone: newValue, token: otp, type: 'phone_change' });
    if (error) alert(error.message);
    else {
       setUser(prev => ({ ...prev, phone: newValue }));
       setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32 italic font-black relative overflow-x-hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 border border-white/20 rounded-xl active:scale-90 transition-transform">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl uppercase tracking-tight">Settings</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        
        {/* PROFILE CARD */}
        <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/30">
              {user.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-emerald-500 p-3 rounded-xl border-4 border-[#020617] shadow-lg">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl uppercase tracking-tighter">{user.name}</h2>
            <button onClick={() => { setChangeType('name'); setNewValue(user.name); setIsModalOpen(true); setStep(1); }} className="text-slate-500 hover:text-emerald-400 transition-colors"><RefreshCw size={14} /></button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-slate-500 text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500"/> Verified</span>
            <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500"/> {user.city}</span>
          </div>
        </section>

        {/* ACCOUNT SETTINGS */}
        <div className="space-y-4">
          <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Lock size={14} className="text-emerald-400"/> Security</h3>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl"><Mail size={20} className="text-blue-400" /></div>
              <div><p className="text-[9px] text-slate-500 uppercase">Email Address</p><p className="text-sm truncate max-w-[150px]">{user.email}</p></div>
            </div>
            <button onClick={() => { setChangeType('email'); setNewValue(""); setIsModalOpen(true); setStep(1); }} className="p-2.5 bg-white/5 rounded-xl text-blue-400"><RefreshCw size={16}/></button>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl"><Phone size={20} className="text-emerald-400" /></div>
              <div><p className="text-[9px] text-slate-500 uppercase">Mobile Number</p><p className="text-sm">{user.phone}</p></div>
            </div>
            <button onClick={() => { setChangeType('phone'); setNewValue(""); setIsModalOpen(true); setStep(1); }} className="p-2.5 bg-white/5 rounded-xl text-emerald-400"><RefreshCw size={16}/></button>
          </div>
        </div>

        {/* RECENT MATCHES */}
        <div className="space-y-4">
          <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Sparkles size={14} className="text-emerald-400"/> Recent Matches</h3>
          {sessionsLoading ? (
            <div className="py-10 text-center animate-pulse text-[10px] uppercase text-slate-600">Fetching Arena Data...</div>
          ) : sessions.map(session => (
            <div key={session.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-xl border border-white/5">
                  {session.sport_type === 'Cricket' ? '🏏' : '⚽'}
                </div>
                <div>
                  <p className="text-xs uppercase font-black">{session.arena_name}</p>
                  <p className="text-[8px] text-slate-500 uppercase mt-1">{new Date(session.booking_date).toDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-emerald-500">₹{session.price}</p>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <button onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }} className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0b0f1a] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md relative z-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500"><X size={20}/></button>
              <h3 className="text-2xl uppercase mb-8">Update {changeType}</h3>
              {step === 1 ? (
                <div className="space-y-4">
                  <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-xl outline-none focus:border-emerald-500" placeholder={`New ${changeType}...`} />
                  <button onClick={handleStartUpdate} className="w-full bg-emerald-500 text-black py-5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{loading ? "Processing..." : "Confirm"}</button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Enter OTP sent to {newValue}</p>
                  <input type="text" maxLength="6" onChange={(e) => e.target.value.length === 6 && verifyPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-xl text-center text-3xl tracking-[0.5em]" placeholder="000000" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
 
  );
}

export default Settings;