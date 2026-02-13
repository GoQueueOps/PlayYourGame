import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  
  // States to handle different flows
  const [loginMethod, setLoginMethod] = useState("phone"); // 'phone' or 'email'
  const [otpSent, setOtpSent] = useState(false);
  const [emailExists, setEmailExists] = useState(null); // null, true, or false
  const [email, setEmail] = useState("");

  // Mock function to simulate checking if email exists
  const checkEmail = () => {
    if (!email) return;
    // For now, let's pretend emails ending in '@test.com' already exist
    setEmailExists(email.endsWith("@test.com"));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-sans p-6">
      <div className="w-full max-w-[400px] space-y-10">
        
        {/* ⚡ BRANDING */}
        <div className="text-center">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            READY <span className="text-green-500">UP ⚡</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            {otpSent ? "Enter the code" : "Authenticate to Play"}
          </p>
        </div>

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
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 flex items-center font-bold">+91</div>
                      <input type="tel" placeholder="00000 00000" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold placeholder:text-gray-800" />
                    </div>
                  </div>
                  <button onClick={() => setOtpSent(true)} className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-green-500/20 active:scale-95 transition-all">
                    Send OTP →
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Enter OTP</label>
                    <input type="text" maxLength="6" placeholder="• • • • • •" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 text-center text-2xl tracking-[0.5em] font-black placeholder:text-gray-800" />
                  </div>
                  <button onClick={() => navigate("/")} className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all">
                    Verify & Login
                  </button>
                  <button onClick={() => setOtpSent(false)} className="w-full text-[10px] font-black text-gray-500 uppercase tracking-widest">Resend or Change Number</button>
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
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={checkEmail}
                  placeholder="name@example.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold placeholder:text-gray-800" 
                />
              </div>

              {emailExists === true && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold" />
                </motion.div>
              )}

              {emailExists === false && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold" />
                  <input type="password" placeholder="Create Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold" />
                </motion.div>
              )}

              <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all">
                {emailExists === false ? "Create Account" : "Continue"}
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
            <button className="bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="text-lg">🌐</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Google</span>
            </button>
            <button 
              onClick={() => {
                setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                setOtpSent(false);
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
              <button onClick={() => navigate("/owner-login")} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase text-blue-400">Owner</button>
              <button onClick={() => navigate("/admin-login")} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase text-purple-400">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;