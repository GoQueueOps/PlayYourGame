import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [otpSent, setOtpSent] = useState(false);
  const [emailExists, setEmailExists] = useState(true); // default to login

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── PHONE AUTH FLOW ────────────────────────────────

  const handleSendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    if (error) alert(error.message);
    else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });
    if (error) alert(error.message);
    else navigate("/");
    setLoading(false);
  };

  // ─── EMAIL AUTH FLOW ────────────────────────────────

  const handleEmailAction = async () => {
    setLoading(true);
    if (emailExists) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate("/");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) alert(error.message);
      else {
        alert("Account created successfully!");
        navigate("/");
      }
    }
    setLoading(false);
  };

  // ─── SOCIAL AUTH ────────────────────────────────────

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          min-height: 100svh;
          background: #050811;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glow blobs */
        .login-root::before {
          content: '';
          position: fixed;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .login-root::after {
          content: '';
          position: fixed;
          bottom: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
        }

        /* ── Hero Title ── */
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px;
          line-height: 0.9;
          letter-spacing: -1px;
          background: linear-gradient(160deg, #fff 30%, #4b5563);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          text-align: center;
        }
        .hero-accent {
          -webkit-text-fill-color: transparent;
          background: linear-gradient(120deg, #22c55e, #86efac);
          -webkit-background-clip: text;
          background-clip: text;
        }
        .hero-sub {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #374151;
          text-align: center;
          margin-top: 10px;
        }

        /* ── Glass Field ── */
        .field-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #4b5563;
          display: block;
          margin-bottom: 8px;
          margin-left: 4px;
        }

        .glass-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px 20px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .glass-input::placeholder { color: #374151; }
        .glass-input:focus {
          border-color: rgba(34,197,94,0.6);
          background: rgba(34,197,94,0.04);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
        }

        .otp-input {
          text-align: center;
          font-size: 26px;
          letter-spacing: 0.5em;
          font-weight: 900;
        }

        /* ── Pill toggle for login / signup ── */
        .tab-pill {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 4px;
          gap: 2px;
        }
        .tab-btn {
          flex: 1;
          padding: 9px;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #4b5563;
        }
        .tab-btn.active-login {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #000;
          box-shadow: 0 4px 16px rgba(34,197,94,0.3);
        }
        .tab-btn.active-signup {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,130,246,0.3);
        }

        /* ── Primary CTAs ── */
        .btn-primary-green {
          width: 100%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #000;
          padding: 18px;
          border-radius: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(34,197,94,0.25), 0 0 0 1px rgba(34,197,94,0.2);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary-green::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn-primary-green:active { transform: scale(0.97); }
        .btn-primary-green:disabled { opacity: 0.4; }

        .btn-primary-blue {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #fff;
          padding: 18px;
          border-radius: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.2);
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary-blue::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn-primary-blue:active { transform: scale(0.97); }

        .btn-ghost {
          background: transparent;
          border: none;
          color: #4b5563;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 8px;
          width: 100%;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: #9ca3af; }

        /* ── Divider ── */
        .divider-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.05);
        }
        .divider-text {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #1f2937;
        }

        /* ── Alt buttons ── */
        .alt-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          flex: 1;
        }
        .alt-btn:active { transform: scale(0.96); }
        .alt-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }
        .alt-btn-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6b7280;
        }

        /* ── Business Portal ── */
        .biz-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 16px;
        }
        .biz-title {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #374151;
          text-align: center;
          margin-bottom: 10px;
        }
        .biz-btn {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .biz-btn.owner { color: #60a5fa; }
        .biz-btn.owner:hover { background: rgba(96,165,250,0.1); }
        .biz-btn.admin { color: #c084fc; }
        .biz-btn.admin:hover { background: rgba(192,132,252,0.1); }

        /* ── Phone prefix box ── */
        .prefix-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px 16px;
          font-weight: 800;
          font-size: 14px;
          color: #9ca3af;
          white-space: nowrap;
        }

        .space-y-3 > * + * { margin-top: 12px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .space-y-10 > * + * { margin-top: 40px; }
        .flex { display: flex; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .flex-1 { flex: 1; }
        .text-center { text-align: center; }
        .pt-8 { padding-top: 32px; }
      `}</style>

      <div className="login-root">
        <div className="login-card space-y-10">

          {/* ── Hero ── */}
          <div className="text-center">
            <h1 className="hero-title">
              READY <span className="hero-accent">UP ⚡</span>
            </h1>
            <p className="hero-sub">
              {loading ? "Processing..." : otpSent ? "Enter the code sent to your phone" : "Authenticate to Play"}
            </p>
          </div>

          {/* ── Auth Forms ── */}
          <AnimatePresence mode="wait">
            {loginMethod === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {!otpSent ? (
                  <>
                    <div>
                      <label className="field-label">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="prefix-box">+91</div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="00000 00000"
                          className="glass-input flex-1"
                        />
                      </div>
                    </div>
                    <button
                      disabled={loading}
                      onClick={handleSendOTP}
                      className="btn-primary-green"
                    >
                      {loading ? "Sending..." : "Send OTP →"}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="field-label">Enter OTP</label>
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="• • • • • •"
                        className="glass-input otp-input"
                      />
                    </div>
                    <button onClick={handleVerifyOTP} className="btn-primary-green">
                      Verify &amp; Login
                    </button>
                    <button onClick={() => setOtpSent(false)} className="btn-ghost">
                      ← Change Number
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div>
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="glass-input"
                  />
                </div>

                {/* Pill toggle */}
                <div className="tab-pill">
                  <button
                    onClick={() => setEmailExists(true)}
                    className={`tab-btn ${emailExists ? "active-login" : ""}`}
                  >
                    I Have an Account
                  </button>
                  <button
                    onClick={() => setEmailExists(false)}
                    className={`tab-btn ${emailExists === false ? "active-signup" : ""}`}
                  >
                    I'm New Here
                  </button>
                </div>

                {emailExists === true && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="glass-input"
                    />
                  </motion.div>
                )}

                {emailExists === false && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="glass-input"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Password"
                      className="glass-input"
                    />
                  </motion.div>
                )}

                <button
                  onClick={handleEmailAction}
                  className={emailExists === false ? "btn-primary-blue" : "btn-primary-green"}
                >
                  {emailExists === false ? "Create Account" : "Continue →"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Alternatives ── */}
          <div className="space-y-4">
            <div className="divider-wrap">
              <div className="divider-line" />
              <span className="divider-text">Alternative</span>
              <div className="divider-line" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleGoogleLogin} className="alt-btn">
                <span style={{ fontSize: 18 }}>🌐</span>
                <span className="alt-btn-label">Google</span>
              </button>
              <button
                onClick={() => {
                  setLoginMethod(loginMethod === "phone" ? "email" : "phone");
                  setOtpSent(false);
                  setEmailExists(true); // reset to login tab when toggling
                }}
                className="alt-btn"
              >
                <span style={{ fontSize: 18 }}>{loginMethod === "phone" ? "📧" : "📱"}</span>
                <span className="alt-btn-label">{loginMethod === "phone" ? "Email" : "Phone"}</span>
              </button>
            </div>
          </div>

          {/* ── Business Portal ── */}
          <div className="pt-8">
            <div className="biz-card">
              <p className="biz-title">Business Portal</p>
              <div className="flex gap-3">
                <button onClick={() => navigate("/owner-login")} className="biz-btn owner">Owner</button>
                <button onClick={() => navigate("/admin-login")} className="biz-btn admin">Admin</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;