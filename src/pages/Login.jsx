import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase";

function Login() {
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("phone"); // 'phone' | 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Phone OTP state ──────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // ── Email state ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailExists, setEmailExists] = useState(null); // null | true | false
  const [checkingEmail, setCheckingEmail] = useState(false);

  const clearError = () => setError("");

  // ── Helpers ──────────────────────────────────────────────────────────────

  // Check if an account exists for this email by attempting a sign-in with
  // a dummy password — Supabase returns different error codes for
  // "user not found" vs "wrong password", letting us branch the UI.
  const checkEmail = async () => {
    if (!email || !email.includes("@")) return;
    setCheckingEmail(true);
    clearError();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "__probe__",
      });
      if (!signInError || signInError.message.toLowerCase().includes("invalid login")) {
        // "Invalid login credentials" → account exists, wrong password
        setEmailExists(true);
      } else if (signInError.message.toLowerCase().includes("user not found") ||
                 signInError.message.toLowerCase().includes("no user")) {
        setEmailExists(false);
      } else {
        // Network or other error — default to showing login form
        setEmailExists(true);
      }
    } catch {
      setEmailExists(true);
    } finally {
      setCheckingEmail(false);
    }
  };

  // ── Phone: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    clearError();
    const cleaned = phone.replace(/\s/g, "");
    if (!cleaned || cleaned.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: `+91${cleaned}`,
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setOtpSent(true);
    }
  };

  // ── Phone: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    clearError();
    if (!otp || otp.length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: `+91${phone.replace(/\s/g, "")}`,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
    } else {
      navigate("/");
    }
  };

  // ── Email: Login ──────────────────────────────────────────────────────────
  const handleEmailLogin = async () => {
    clearError();
    if (!password) { setError("Enter your password."); return; }
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
    } else {
      navigate("/");
    }
  };

  // ── Email: Sign up ────────────────────────────────────────────────────────
  const handleEmailSignup = async () => {
    clearError();
    if (!fullName.trim()) { setError("Enter your full name."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (signupError) {
      setError(signupError.message);
    } else {
      // Supabase sends a confirmation email by default.
      // If email confirmation is disabled in your project, the user is
      // logged in immediately and navigate("/") works right away.
      navigate("/");
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    clearError();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`, // adjust if needed
      },
    });
    if (oauthError) setError(oauthError.message);
  };

  // ── Email continue button handler ─────────────────────────────────────────
  const handleEmailContinue = () => {
    if (emailExists === true) handleEmailLogin();
    else if (emailExists === false) handleEmailSignup();
    else checkEmail(); // first press just probes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#020617] to-black text-white flex flex-col items-center justify-center font-sans p-6 italic relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] space-y-10 relative z-10"
      >
        {/* BRANDING */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h1
            className="text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            READY <span className="text-green-500">UP ⚡</span>
          </motion.h1>
          <motion.p
            className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {otpSent ? "Enter the code" : "Authenticate to Play"}
          </motion.p>
        </motion.div>

        {/* ERROR BANNER */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider px-4 py-3 rounded-2xl text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN AUTH AREA */}
        <AnimatePresence mode="wait">
          {loginMethod === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {!otpSent ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center font-bold text-sm">+91</div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); clearError(); }}
                        placeholder="00000 00000"
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold placeholder:text-gray-800 text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "Send OTP →"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Enter OTP</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value); clearError(); }}
                      placeholder="• • • • • •"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 text-center text-2xl tracking-[0.5em] font-black placeholder:text-gray-800 text-white"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? "Verifying…" : "Verify & Login"}
                  </button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(""); clearError(); }}
                    className="w-full text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2"
                  >
                    Resend or Change Number
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailExists(null); clearError(); }}
                  onBlur={checkEmail}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold placeholder:text-gray-800 text-white"
                />
                {checkingEmail && (
                  <p className="text-[9px] text-gray-500 ml-4 mt-1 uppercase tracking-widest font-black">Checking…</p>
                )}
              </div>

              {/* Existing user → show password */}
              {emailExists === true && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                </motion.div>
              )}

              {/* New user → show signup fields */}
              {emailExists === false && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearError(); }}
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    placeholder="Create Password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                </motion.div>
              )}

              <button
                onClick={handleEmailContinue}
                disabled={loading}
                className={`w-full ${emailExists === false ? "bg-blue-600" : "bg-green-500"} text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all disabled:opacity-50`}
              >
                {loading
                  ? "Please wait…"
                  : emailExists === false
                  ? "Create Account"
                  : emailExists === true
                  ? "Login"
                  : "Continue"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOCIAL & METHOD TOGGLE */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 my-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Alternative</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogle}
              className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="text-lg">🌐</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Google</span>
            </button>
            <button
              onClick={() => {
                setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                setOtpSent(false);
                setEmailExists(null);
                setOtp("");
                setPassword("");
                setFullName("");
                clearError();
              }}
              className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span className="text-lg">{loginMethod === "phone" ? "📧" : "📱"}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                {loginMethod === "phone" ? "Email" : "Phone"}
              </span>
            </button>
          </div>
        </div>

        {/* BUSINESS ACCESS */}
        <div className="pt-8">
          <div className="bg-white/5 border border-white/5 p-5 rounded-[2.5rem] flex flex-col gap-3">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Business Portal</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/owner-login")} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase text-blue-400 hover:bg-blue-400/10">Owner</button>
              <button onClick={() => navigate("/admin-login")} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase text-purple-400 hover:bg-purple-400/10">Admin</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;