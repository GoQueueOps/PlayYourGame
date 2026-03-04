import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { 
  Mail, Phone, Camera, LogOut, RefreshCw, X,
  ChevronLeft, Lock, Shield, MapPin, Loader2, Upload
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // LIVE USER STATE
  const [user, setUser] = useState({
    id: "",
    name: "Loading...",
    email: "",
    phone: "",
    avatar_url: null,
    lastNameChange: null,
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeType, setChangeType] = useState(null); // 'email', 'phone', or 'name'
  const [step, setStep] = useState(1); // 1: Input new, 2: Verification
  const [newValue, setNewValue] = useState("");

  // ─── 1. MANUAL IMAGE UPLOAD ──────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile Table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. EMAIL/PHONE CHANGE LOGIC ──────────────────
  const handleStartUpdate = async () => {
    setLoading(true);
    try {
      if (changeType === 'email') {
        // Supabase sends a confirmation to BOTH the old and new email
        const { error } = await supabase.auth.updateUser({ email: newValue });
        if (error) throw error;
        alert("Verification links sent to both current and new email!");
      } 
      else if (changeType === 'phone') {
        const { error } = await supabase.auth.updateUser({ phone: newValue });
        if (error) throw error;
        setStep(2); // Move to OTP entry
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async (otp) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: newValue,
      token: otp,
      type: 'phone_change'
    });
    if (error) alert(error.message);
    else setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-black italic">
      
      {/* PROFILE HEADER */}
      <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/30 flex items-center justify-center text-4xl">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : "👤"}
            </div>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
            
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-emerald-500 p-3 rounded-xl border-4 border-[#020617] hover:scale-110 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-3xl uppercase tracking-tighter">{user.name}</h1>
              <button onClick={() => { setChangeType('name'); setIsModalOpen(true); }} className="text-slate-500 hover:text-white">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT SETTINGS */}
      <div className="space-y-4">
        {/* Email Row */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Mail className="text-blue-400" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Current Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => { setChangeType('email'); setIsModalOpen(true); setStep(1); }}
            className="p-2 bg-blue-500/20 rounded-xl text-blue-400"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Phone Row */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Phone className="text-emerald-400" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase">Current Phone</p>
              <p className="text-sm">{user.phone}</p>
            </div>
          </div>
          <button 
            onClick={() => { setChangeType('phone'); setIsModalOpen(true); setStep(1); }}
            className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div className="bg-[#0b0f1a] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md relative z-10">
              <h3 className="text-2xl uppercase mb-6">Change {changeType}</h3>
              
              {step === 1 ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder={`Enter New ${changeType}`}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                  <button 
                    onClick={handleStartUpdate}
                    className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase"
                  >
                    {loading ? "Sending..." : "Verify & Update"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-400 uppercase">Enter the code sent to {newValue}</p>
                  <input 
                    type="text" 
                    maxLength="6"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center text-2xl tracking-[0.5em]"
                    onChange={(e) => e.target.value.length === 6 && verifyPhoneOTP(e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;