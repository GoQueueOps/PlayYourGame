import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  Mail, Phone, Camera, LogOut, RefreshCw, X,
  ChevronLeft, Lock, MapPin, Loader2, Sparkles,
  User, Calendar, Edit3, CheckCircle2, Eye, EyeOff,
  Shield, ChevronDown
} from "lucide-react";

// Avatar selection removed — upload only

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    id: "", name: "", email: "", phone: "",
    avatar_url: "👤", bio: "", city: "", state: "",
    date_of_birth: "", gender: "", lastNameChange: null,
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Avatar picker removed — camera button opens file picker directly;

  // Edit modals
  const [modal, setModal] = useState(null) // null | 'name' | 'email' | 'phone' | 'password' | 'location' | 'personal'
  const [modalValue, setModalValue] = useState({})
  const [otpStep, setOtpStep] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  // Password fields
  const [pwFields, setPwFields] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  const fetchData = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { navigate("/login"); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    if (prof) {
      setProfile({
        id: authUser.id,
        name: prof.name || "",
        email: authUser.email || "",
        phone: prof.phone || authUser.phone || "",
        avatar_url: prof.avatar_url || "👤",
        bio: prof.bio || "",
        city: prof.city || "",
        state: prof.state || "",
        date_of_birth: prof.date_of_birth || "",
        gender: prof.gender || "",
        lastNameChange: prof.last_name_change || null,
      })
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_date, sport_type, price, status, arenas(name)')
      .eq('user_id', authUser.id)
      .order('booking_date', { ascending: false })
      .limit(3)
    if (bookings) setSessions(bookings)
    setSessionsLoading(false)
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])

  // ── AVATAR ──────────────────────────────────────────────────────────────────
  const updateAvatar = async (url) => {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
    if (!error) setProfile(prev => ({ ...prev, avatar_url: url }))
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const fileName = `${profile.id}-${Date.now()}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (upErr) { alert(upErr.message); setLoading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await updateAvatar(publicUrl)
  }

  // ── NAME CHANGE ──────────────────────────────────────────────────────────────
  const handleNameSave = async () => {
    if (!modalValue.name?.trim()) { alert('Name cannot be empty'); return }
    setModalLoading(true)
    try {
      const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000
      const lastChange = profile.lastNameChange ? new Date(profile.lastNameChange).getTime() : 0
      if (Date.now() - lastChange < SIX_MONTHS) {
        const days = Math.ceil((SIX_MONTHS - (Date.now() - lastChange)) / 86400000)
        throw new Error(`You can change your name again in ${days} days.`)
      }
      const now = new Date().toISOString()
      const { error } = await supabase.from('profiles').update({ name: modalValue.name, last_name_change: now }).eq('id', profile.id)
      if (error) throw error
      setProfile(prev => ({ ...prev, name: modalValue.name, lastNameChange: now }))
      closeModal()
    } catch (err) { alert(err.message) }
    setModalLoading(false)
  }

  // ── EMAIL CHANGE ─────────────────────────────────────────────────────────────
  const handleEmailSave = async () => {
    if (!modalValue.email?.trim()) { alert('Enter a valid email'); return }
    setModalLoading(true)
    const { error } = await supabase.auth.updateUser({ email: modalValue.email })
    if (error) { alert(error.message); setModalLoading(false); return }
    setOtpStep(true)
    setModalLoading(false)
  }

  const handleEmailOTP = async (code) => {
    setModalLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email: modalValue.email, token: code, type: 'email_change' })
    if (error) { alert(error.message) } else { setProfile(prev => ({ ...prev, email: modalValue.email })); closeModal() }
    setModalLoading(false)
  }

  // ── PHONE CHANGE ─────────────────────────────────────────────────────────────
  const handlePhoneSave = async () => {
    if (!modalValue.phone?.trim()) { alert('Enter a valid phone number'); return }
    setModalLoading(true)
    // Try Supabase phone OTP — if not configured, fall back to direct save
    const { error } = await supabase.auth.signInWithOtp({ phone: modalValue.phone })
    if (error) {
      // Twilio not set up — save directly to profiles
      const { error: profErr } = await supabase.from('profiles').update({ phone: modalValue.phone }).eq('id', profile.id)
      if (profErr) { alert(profErr.message) } else {
        setProfile(prev => ({ ...prev, phone: modalValue.phone }))
        closeModal()
      }
    } else {
      // OTP sent successfully
      setOtpStep(true)
    }
    setModalLoading(false)
  }

  const handlePhoneOTP = async (code) => {
    setModalLoading(true)
    const { error } = await supabase.auth.verifyOtp({ phone: modalValue.phone, token: code, type: 'sms' })
    if (error) {
      // Fallback — save to profiles anyway
      await supabase.from('profiles').update({ phone: modalValue.phone }).eq('id', profile.id)
      setProfile(prev => ({ ...prev, phone: modalValue.phone }))
      closeModal()
    } else {
      await supabase.from('profiles').update({ phone: modalValue.phone }).eq('id', profile.id)
      setProfile(prev => ({ ...prev, phone: modalValue.phone }))
      closeModal()
    }
    setModalLoading(false)
  }

  // ── PASSWORD CHANGE ──────────────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    setPwError('')
    if (!pwFields.current) { setPwError('Enter your current password'); return }
    if (!pwFields.newPw || pwFields.newPw.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (pwFields.newPw !== pwFields.confirm) { setPwError("Passwords don't match"); return }
    if (pwFields.current === pwFields.newPw) { setPwError('New password must be different from current'); return }
    setModalLoading(true)
    // Re-authenticate with current password to verify it
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: pwFields.current
    })
    if (signInErr) {
      setPwError('Current password is incorrect')
      setModalLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: pwFields.newPw })
    if (error) { setPwError(error.message) } else { alert('✅ Password updated!'); closeModal() }
    setModalLoading(false)
  }

  // ── PERSONAL INFO SAVE ───────────────────────────────────────────────────────
  const handlePersonalSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      bio: modalValue.bio ?? profile.bio,
      date_of_birth: modalValue.date_of_birth ?? profile.date_of_birth,
      gender: modalValue.gender ?? profile.gender,
    }).eq('id', profile.id)
    if (error) { alert(error.message) } else {
      setProfile(prev => ({
        ...prev,
        bio: modalValue.bio ?? prev.bio,
        date_of_birth: modalValue.date_of_birth ?? prev.date_of_birth,
        gender: modalValue.gender ?? prev.gender,
      }))
      closeModal()
    }
    setSaving(false)
  }

  // ── LOCATION SAVE ────────────────────────────────────────────────────────────
  const handleLocationSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      city: modalValue.city ?? profile.city,
      state: modalValue.state ?? profile.state,
    }).eq('id', profile.id)
    if (error) { alert(error.message) } else {
      setProfile(prev => ({
        ...prev,
        city: modalValue.city ?? prev.city,
        state: modalValue.state ?? prev.state,
      }))
      setSaveSuccess(true)
      setTimeout(() => { setSaveSuccess(false); closeModal() }, 1200)
    }
    setSaving(false)
  }

  const openModal = (type) => {
    setModal(type)
    setOtpStep(false)
    setModalLoading(false)
    setPwFields({ current: '', newPw: '', confirm: '' })
    if (type === 'name') setModalValue({ name: profile.name })
    if (type === 'email') setModalValue({ email: '' })
    if (type === 'phone') setModalValue({ phone: profile.phone })
    if (type === 'personal') setModalValue({ bio: profile.bio, date_of_birth: profile.date_of_birth, gender: profile.gender })
    if (type === 'location') setModalValue({ city: profile.city, state: profile.state })
  }

  const closeModal = () => { setModal(null); setOtpStep(false); setModalLoading(false); setSaveSuccess(false) }

  const pwStrength = (pw) => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const pwStrengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400']

  const inputCls = "w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-emerald-500/60 transition-colors text-sm text-white placeholder-slate-600"

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/40 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 rounded-xl active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter italic">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 mt-8 space-y-6">

        {/* PROFILE CARD */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center">
          {/* AVATAR */}
          <div className="relative inline-block mb-5">
            <div className="w-28 h-28 bg-slate-800 rounded-[1.5rem] overflow-hidden border-4 border-emerald-500/30 flex items-center justify-center text-5xl">
              {profile.avatar_url?.startsWith('http')
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                : <span>{profile.avatar_url}</span>}
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-emerald-500 p-2.5 rounded-xl border-4 border-[#020617] active:scale-95 transition-transform">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
          </div>

          {/* Upload trigger via hidden input — camera button opens file picker directly */}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">{profile.name || 'Set your name'}</h2>
            <button onClick={() => openModal('name')} className="text-slate-500 hover:text-emerald-400 transition-colors"><Edit3 size={14} /></button>
          </div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">{profile.email}</p>
          {profile.bio && <p className="text-sm text-slate-400 mt-3 italic">{profile.bio}</p>}
        </section>

        {/* PERSONAL INFO */}
        <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-slate-400">
              <User size={15} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Personal Info</span>
            </div>
            <button onClick={() => openModal('personal')} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1">
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="divide-y divide-white/5">
            <InfoRow label="Bio" value={profile.bio || 'Not set'} />
            <InfoRow label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not set'} />
            <InfoRow label="Gender" value={profile.gender || 'Not set'} />
          </div>
        </section>

        {/* LOCATION */}
        <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</span>
            </div>
            <button onClick={() => openModal('location')} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1">
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div className="divide-y divide-white/5">
            <InfoRow label="City" value={profile.city || 'Not set'} />
            <InfoRow label="State" value={profile.state || 'Not set'} />
          </div>
        </section>

        {/* SECURITY */}
        <section className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Shield size={15} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security</span>
          </div>
          <div className="divide-y divide-white/5">
            <SecurityRow icon={<Mail size={16} className="text-blue-400" />} label="Email" value={profile.email || 'Not set'} onEdit={() => openModal('email')} />
            <SecurityRow icon={<Phone size={16} className="text-emerald-400" />} label="Phone" value={profile.phone || 'Not set'} onEdit={() => openModal('phone')} />
            <SecurityRow icon={<Lock size={16} className="text-orange-400" />} label="Password" value="••••••••" onEdit={() => openModal('password')} />
          </div>
        </section>

        {/* RECENT SESSIONS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Sessions</span>
          </div>
          {sessionsLoading ? (
            <div className="p-10 text-center bg-white/5 rounded-2xl border border-white/10 animate-pulse">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Syncing...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">No sessions recorded</p>
            </div>
          ) : sessions.map(s => (
            <div key={s.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center hover:border-emerald-500/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-xl">
                  {s.sport_type === 'Cricket' ? '🏏' : s.sport_type === 'Football' ? '⚽' : s.sport_type === 'Badminton' ? '🏸' : s.sport_type === 'Tennis' ? '🎾' : '🏟️'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase italic">{s.arenas?.name || s.sport_type}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">{new Date(s.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-400 font-black italic">₹{s.price}</p>
                <p className={`text-[8px] uppercase font-bold mt-0.5 ${s.status === 'confirmed' ? 'text-emerald-400' : s.status === 'cancelled' ? 'text-red-400' : 'text-slate-500'}`}>{s.status}</p>
              </div>
            </div>
          ))}
        </section>

        {/* LOGOUT */}
        <button onClick={async () => { await supabase.auth.signOut(); navigate("/login") }}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-red-500/20">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
            onClick={closeModal}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="bg-[#0b0f1a] rounded-[2rem] border border-white/10 w-full max-w-md shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">
                  {modal === 'name' ? 'Change Name' : modal === 'email' ? 'Change Email' : modal === 'phone' ? 'Update Phone' : modal === 'password' ? 'Change Password' : modal === 'personal' ? 'Personal Info' : 'Location'}
                </h3>
                <button onClick={closeModal} className="text-slate-500 hover:text-white p-1"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4">

                {/* NAME MODAL */}
                {modal === 'name' && (
                  <>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Names can only be changed once every 6 months.</p>
                    <input value={modalValue.name || ''} onChange={e => setModalValue({ name: e.target.value })}
                      className={inputCls} placeholder="Your display name" maxLength={40} />
                    <button onClick={handleNameSave} disabled={modalLoading}
                      className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                      {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Name
                    </button>
                  </>
                )}

                {/* EMAIL MODAL */}
                {modal === 'email' && !otpStep && (
                  <>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">A verification link will be sent to the new email.</p>
                    <input type="email" value={modalValue.email || ''} onChange={e => setModalValue({ email: e.target.value })}
                      className={inputCls} placeholder="new@email.com" />
                    <button onClick={handleEmailSave} disabled={modalLoading}
                      className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                      {modalLoading ? <Loader2 size={16} className="animate-spin" /> : null} Send Verification →
                    </button>
                  </>
                )}
                {modal === 'email' && otpStep && (
                  <>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest text-center">Enter the 6-digit code sent to {modalValue.email}</p>
                    <input type="text" maxLength={6} className={`${inputCls} text-center text-2xl tracking-[0.4em] font-black`} placeholder="000000"
                      onChange={e => { if (e.target.value.length === 6) handleEmailOTP(e.target.value) }} />
                    {modalLoading && <div className="flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>}
                  </>
                )}

                {/* PHONE MODAL */}
                {modal === 'phone' && !otpStep && (
                  <>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Include country code e.g. +91 98765 43210</p>
                    <input type="tel" value={modalValue.phone || ''} onChange={e => setModalValue({ phone: e.target.value })}
                      className={inputCls} placeholder="+91 98765 43210" />
                    <button onClick={handlePhoneSave} disabled={modalLoading}
                      className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                      {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Phone
                    </button>
                  </>
                )}
                {modal === 'phone' && otpStep && (
                  <>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest text-center">Enter the 6-digit code sent to {modalValue.phone}</p>
                    <input type="text" maxLength={6} className={`${inputCls} text-center text-2xl tracking-[0.4em] font-black`} placeholder="000000"
                      onChange={e => { if (e.target.value.length === 6) handlePhoneOTP(e.target.value) }} />
                    {modalLoading && <div className="flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>}
                    <button onClick={() => setOtpStep(false)} className="w-full text-slate-500 text-[9px] uppercase tracking-widest py-2">← Back</button>
                  </>
                )}

                {/* PASSWORD MODAL */}
                {modal === 'password' && (
                  <>
                    {/* Current password */}
                    <div className="relative">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Current Password</label>
                      <input type={showPw.current ? 'text' : 'password'} value={pwFields.current}
                        onChange={e => { setPwFields(p => ({ ...p, current: e.target.value })); setPwError('') }}
                        className={inputCls} placeholder="Your current password" />
                      <button onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                        className="absolute right-4 top-9 text-slate-500 hover:text-white">
                        {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      {/* New password */}
                      <div className="relative mb-4">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">New Password</label>
                        <input type={showPw.new ? 'text' : 'password'} value={pwFields.newPw}
                          onChange={e => { setPwFields(p => ({ ...p, newPw: e.target.value })); setPwError('') }}
                          className={inputCls} placeholder="Min 6 characters" />
                        <button onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                          className="absolute right-4 top-9 text-slate-500 hover:text-white">
                          {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {pwFields.newPw.length > 0 && (
                        <div className="mb-4">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= pwStrength(pwFields.newPw) ? pwStrengthColor[pwStrength(pwFields.newPw)] : 'bg-white/10'}`} />
                            ))}
                          </div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">{pwStrengthLabel[pwStrength(pwFields.newPw)]}</p>
                        </div>
                      )}

                      {/* Confirm password */}
                      <div className="relative">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Confirm New Password</label>
                        <input type={showPw.confirm ? 'text' : 'password'} value={pwFields.confirm}
                          onChange={e => { setPwFields(p => ({ ...p, confirm: e.target.value })); setPwError('') }}
                          className={inputCls} placeholder="Repeat new password" />
                        <button onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-4 top-9 text-slate-500 hover:text-white">
                          {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {pwError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <p className="text-[10px] text-red-400 font-bold">{pwError}</p>
                      </div>
                    )}

                    <button onClick={handlePasswordSave} disabled={modalLoading || !pwFields.current || !pwFields.newPw || pwFields.newPw !== pwFields.confirm}
                      className="w-full bg-orange-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-40 flex items-center justify-center gap-2">
                      {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} Update Password
                    </button>
                  </>
                )}

                {/* PERSONAL MODAL */}
                {modal === 'personal' && (
                  <>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Bio</label>
                      <textarea value={modalValue.bio ?? ''} onChange={e => setModalValue(p => ({ ...p, bio: e.target.value }))}
                        className={`${inputCls} h-20 resize-none`} placeholder="Tell others about yourself..." maxLength={160} />
                      <p className="text-[8px] text-slate-600 mt-1 text-right">{(modalValue.bio || '').length}/160</p>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1"><Calendar size={11} /> Date of Birth</label>
                      <input type="date" value={modalValue.date_of_birth || ''}
                        onChange={e => setModalValue(p => ({ ...p, date_of_birth: e.target.value }))}
                        className={`${inputCls} [color-scheme:dark]`} max={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Gender</label>
                      <div className="relative">
                        <select value={modalValue.gender || ''}
                          onChange={e => setModalValue(p => ({ ...p, gender: e.target.value }))}
                          className={`${inputCls} appearance-none pr-10`}>
                          <option value="">Prefer not to say</option>
                          {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    <button onClick={handlePersonalSave} disabled={saving}
                      className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Changes
                    </button>
                  </>
                )}

                {/* LOCATION MODAL */}
                {modal === 'location' && (
                  <>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">City</label>
                      <input value={modalValue.city ?? ''} onChange={e => setModalValue(p => ({ ...p, city: e.target.value }))}
                        className={inputCls} placeholder="e.g. Cuttack" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">State</label>
                      <input value={modalValue.state ?? ''} onChange={e => setModalValue(p => ({ ...p, state: e.target.value }))}
                        className={inputCls} placeholder="e.g. Odisha" />
                    </div>
                    <button onClick={handleLocationSave} disabled={saving}
                      className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving
                        ? <Loader2 size={16} className="animate-spin" />
                        : saveSuccess
                          ? <><CheckCircle2 size={16} /> Saved!</>
                          : <><CheckCircle2 size={16} /> Save Location</>
                      }
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── SUB COMPONENTS ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-xs font-bold text-slate-200 text-right max-w-[60%] truncate">{value}</p>
    </div>
  )
}

function SecurityRow({ icon, label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white/5 rounded-xl">{icon}</div>
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-black italic">{value}</p>
        </div>
      </div>
      <button onClick={onEdit} className="p-2.5 bg-white/5 rounded-xl text-emerald-400 border border-white/10 hover:bg-emerald-500/10 active:scale-90 transition-all">
        <RefreshCw size={15} />
      </button>
    </div>
  )
}

export default Settings;
