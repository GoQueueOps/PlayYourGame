import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { 
  Mail, Phone, Camera, LogOut, RefreshCw, X,
  ChevronLeft, Lock, MapPin, Loader2, Sparkles
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState({
    id: "",
    name: "Loading...",
    email: "",
    phone: "",
    avatar_url: "👤",
    lastNameChange: null,
    city: "",
    state: ""
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeType, setChangeType] = useState(null); 
  const [newValue, setNewValue] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const DEFAULT_AVATARS = ["🦁", "🐯", "🐱", "🦊", "🐻", "🐺", "🦅", "🐉"];

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { navigate("/login"); return; }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();

    if (profile) {
      setUser({
        id: authUser.id,
        name: profile.name || "Athlete",
        email: authUser.email,
        phone: authUser.phone || "Not Set",
        avatar_url: profile.avatar_url || "👤",
        lastNameChange: profile.last_name_change,
        city: profile.city || "Not Set",
        state: profile.state || "Not Set"
      });
    }

    const { data: bookings } = await supabase.from('bookings').select('*').eq('user_id', authUser.id).order('booking_date', { ascending: false }).limit(3);
    if (bookings) setSessions(bookings);
    setSessionsLoading(false);
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateAvatar = async (url) => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    if (!error) setUser(prev => ({ ...prev, avatar_url: url }));
    setShowAvatarPicker(false);
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${user.id}-${Date.now()}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, file);
    if (upErr) { alert(upErr.message); setLoading(false); return; }
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await updateAvatar(publicUrl);
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      if (changeType === 'name') {
        const sixMonths = 180 * 24 * 60 * 60 * 1000;
        const last = user.lastNameChange ? new Date(user.lastNameChange).getTime() : 0;
        if (Date.now() - last < sixMonths) {
          const days = Math.ceil((sixMonths - (Date.now() - last)) / (86400000));
          throw new Error(`Identity locked for ${days} days.`);
        }
        await supabase.from('profiles').update({ name: newValue, last_name_change: new Date().toISOString() }).eq('id', user.id);
        setUser(prev => ({ ...prev, name: newValue }));
        setIsModalOpen(false);
      } 
      else {
        const updateField = changeType === 'email' ? { email: newValue } : { phone: newValue };
        const { error } = await supabase.auth.updateUser(updateField);
        if (error) throw error;
        setOtpStep(true);
      }
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleVerifyOTP = async (otpCode) => {
    setLoading(true);
    const type = changeType === 'email' ? 'email_change' : 'phone_change';
    const { error } = await supabase.auth.verifyOtp({
      [changeType]: newValue,
      token: otpCode,
      type: type
    });

    if (error) {
      alert(error.message);
    } else {
      setUser(prev => ({ ...prev, [changeType]: newValue }));
      setIsModalOpen(false);
      setOtpStep(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32 italic font-black">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/40 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 rounded-xl active:scale-90 transition-transform"><ChevronLeft size={20}/></button>
        <h1 className="text-xl uppercase tracking-tighter">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        
        {/* PROFILE CARD */}
        <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center shadow-xl">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/30 flex items-center justify-center text-5xl">
              {user.avatar_url.startsWith('http') ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : user.avatar_url}
            </div>
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="absolute bottom-0 right-0 bg-emerald-500 p-3 rounded-xl border-4 border-[#020617] active:scale-95 transition-transform">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
          </div>

          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap gap-3 justify-center mb-6 overflow-hidden">
                {DEFAULT_AVATARS.map(av => (
                  <button key={av} onClick={() => updateAvatar(av)} className="text-3xl p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-emerald-500/20 active:scale-90 transition-transform">{av}</button>
                ))}
                <label className="text-3xl p-3 bg-white/5 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-blue-500/20 active:scale-90 transition-transform">
                  <UploadIcon />
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl uppercase tracking-tighter">{user.name}</h2>
            <button onClick={() => { setChangeType('name'); setNewValue(user.name); setIsModalOpen(true); setOtpStep(false); }} className="text-slate-500 hover:text-emerald-400 transition-colors"><RefreshCw size={14}/></button>
          </div>
        </section>

        {/* LOCATION SECTION */}
        <section className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <MapPin size={18} />
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Current Residence</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-center">
              <p className="text-[8px] text-slate-500 uppercase mb-2 tracking-widest">City</p>
              <p className="text-xs uppercase font-black">{user.city}</p>
            </div>
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-center">
              <p className="text-[8px] text-slate-500 uppercase mb-2 tracking-widest">State</p>
              <p className="text-xs uppercase font-black">{user.state}</p>
            </div>
          </div>
        </section>

        {/* SECURITY ROWS */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Lock size={14} className="text-emerald-400"/> Security Details</h3>
          <SecurityRow icon={<Mail className="text-blue-400"/>} label="Email Address" value={user.email} onEdit={() => { setChangeType('email'); setNewValue(""); setIsModalOpen(true); setOtpStep(false); }} />
          <SecurityRow icon={<Phone className="text-emerald-400"/>} label="Phone Number" value={user.phone} onEdit={() => { setChangeType('phone'); setNewValue(""); setIsModalOpen(true); setOtpStep(false); }} />
        </div>

        {/* RECENT SESSIONS */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Sparkles size={14} className="text-emerald-400"/> Recent Sessions</h3>
          {sessionsLoading ? (
            <div className="p-10 text-center animate-pulse tracking-[0.5em] text-slate-600 text-[10px]">SYNCING...</div>
          ) : sessions.length > 0 ? (
            sessions.map(s => (
              <div key={s.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-xl">{s.sport_type === 'Cricket' ? '🏏' : '⚽'}</div>
                  <div><p className="text-xs uppercase font-black">{s.arena_name}</p><p className="text-[8px] text-slate-500 uppercase tracking-widest">{new Date(s.booking_date).toDateString()}</p></div>
                </div>
                <p className="text-sm text-emerald-500 font-black italic">₹{s.price}</p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-[10px] text-slate-600 uppercase">No sessions recorded</div>
          )}
        </div>

        <button onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }} className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      {/* OTP / UPDATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0b0f1a] p-10 rounded-[3rem] border border-white/10 w-full max-w-md relative z-10 shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
              <h3 className="text-2xl uppercase mb-8 tracking-tighter">Update {changeType}</h3>
              
              {!otpStep ? (
                <div className="space-y-4">
                  <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 rounded-xl outline-none focus:border-emerald-500 transition-colors" placeholder={`Enter New ${changeType}...`} />
                  <button onClick={handleRequestOTP} className="w-full bg-emerald-500 text-black py-5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">{loading ? "Processing..." : "Continue →"}</button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Verification code sent to {newValue}</p>
                  <input type="text" maxLength="6" className="w-full bg-white/5 border border-white/10 p-5 rounded-xl text-center text-3xl tracking-[0.4em] font-black focus:border-emerald-500 outline-none" placeholder="000000" onChange={(e) => e.target.value.length === 6 && handleVerifyOTP(e.target.value)} />
                  {loading && <Loader2 className="animate-spin mx-auto mt-4 text-emerald-500" />}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
const SecurityRow = ({ icon, label, value, onEdit }) => (
  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center group hover:border-emerald-500/20 transition-colors">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
      <div><p className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</p><p className="text-sm uppercase font-black">{value}</p></div>
    </div>
    <button onClick={onEdit} className="p-2.5 bg-white/5 rounded-xl text-emerald-400 border border-white/10 hover:bg-emerald-500/10 active:scale-90 transition-all"><RefreshCw size={16}/></button>
  </div>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

export default Settings;