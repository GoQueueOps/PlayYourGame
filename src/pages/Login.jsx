import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [otpSent] = useState(false);

  const [emailExists, setEmailExists] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // 🔥 REAL EMAIL CHECK (tries to sign in silently)
  const checkEmail = async () => {
    if (!email) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "temporary-check-password",
    });

    if (error && error.message.includes("Invalid login credentials")) {
      setEmailExists(true); // account exists
    } else {
      setEmailExists(false); // account does not exist
    }
  };

  // 🔥 LOGIN
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");
    }
  };

  // 🔥 SIGNUP
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created! You can now log in.");
      setEmailExists(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center font-sans p-6 italic">
      <div className="w-full max-w-[400px] space-y-10">

        <div className="text-center">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            READY <span className="text-green-500">UP ⚡</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
            {otpSent ? "Enter the code" : "Authenticate to Play"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loginMethod === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="text-center text-gray-500 text-sm">
                Phone authentication coming in Phase 2 🚀
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={checkEmail}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold placeholder:text-gray-800 text-white"
                />
              </div>

              {emailExists === true && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full bg-green-500 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {emailExists === false && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                  <input
                    type="password"
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-500 font-bold text-white"
                  />
                  <button
                    onClick={handleSignup}
                    className="w-full bg-blue-600 text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter active:scale-95 transition-all"
                  >
                    Create Account
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setLoginMethod(loginMethod === "phone" ? "email" : "phone");
              setEmailExists(null);
            }}
            className="bg-white/5 border border-white/10 py-4 rounded-2xl active:scale-95 transition-all"
          >
            Switch Method
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;