import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// This goes up to 'src', then down into 'lib' to find 'supabase'
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();
  
  // Auth States
  const [loginMethod, setLoginMethod] = useState("phone"); 
  const [otpSent, setOtpSent] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  
  // Input States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── PHONE AUTH FLOW ────────────────────────────────

  const handleSendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });

    if (error) {
      alert(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  // ─── EMAIL AUTH FLOW ────────────────────────────────

  // Note: Supabase doesn't have a "checkIfEmailExists" method for security reasons.
  // Instead, we try to sign in; if it fails, we assume we might need to sign up.
  // Or, you can just have separate Login/Signup buttons.
  const handleEmailAction = async () => {
    setLoading(true);
    if (emailExists) {
      // SIGN IN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate("/");
    } else {
      // SIGN UP
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) {
  alert(error.message);
} else {
  alert("Account created successfully!");
  navigate("/");
}
    }
    setLoading(false);
  };

  // ─── SOCIAL AUTH ────────────────────────────────────

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-sans p-6 italic">
      <div className="w-full max-w-[400px] space-y-10">
        
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            READY <span className="text-green-500">UP ⚡</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            {loading ? "Processing..." : otpSent ? "Enter the code" : "Authenticate to Play"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loginMethod === "phone" ? (
            <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center font-bold">+91</div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="00000 00000" 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white" 
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    onClick={handleSendOTP} 
                    className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send OTP →"}
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
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 text-center text-2xl tracking-[0.5em] font-black text-white" 
                    />
                  </div>
                  <button onClick={handleVerifyOTP} className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all">
                    Verify & Login
                  </button>
                  <button onClick={() => setOtpSent(false)} className="w-full text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Change Number</button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white" 
                />
              </div>

              {/* Toggle Login/Signup UI manually for now since DB checking isn't a direct Supabase client feature */}
              <div className="flex gap-4 px-4">
                <button 
                  onClick={() => setEmailExists(true)} 
                  className={`text-[9px] font-black uppercase ${emailExists ? 'text-green-500' : 'text-gray-600'}`}
                >
                  I have an account
                </button>
                <button 
                  onClick={() => setEmailExists(false)} 
                  className={`text-[9px] font-black uppercase ${emailExists === false ? 'text-blue-500' : 'text-gray-600'}`}
                >
                  I'm New Here
                </button>
              </div>

              {emailExists === true && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white" />
                </motion.div>
              )}

              {emailExists === false && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white" />
                </motion.div>
              )}

              <button 
                onClick={handleEmailAction}
                className={`w-full ${emailExists === false ? "bg-blue-600" : "bg-green-500"} text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter transition-all`}
              >
                {emailExists === false ? "Create Account" : "Continue"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="flex items-center gap-4 my-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Alternative</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleGoogleLogin} className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="text-lg">🌐</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Google</span>
            </button>
            <button 
              onClick={() => {
                setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                setOtpSent(false);
                setEmailExists(null);
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
      </div>
    </div>
  );
}

export default Login;