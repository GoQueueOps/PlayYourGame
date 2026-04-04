import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user to this page with a session in the URL hash
  // We need to wait for the session to be established
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if session already exists (page refresh case)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setError(null);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        .reset-root {
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
        .reset-root::before {
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
      `}</style>

      <div className="reset-root">
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

          {/* ICON */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-8">
            <div style={{
              width: 72, height: 72, borderRadius: 24,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <KeyRound size={32} color="#22c55e" />
            </div>
          </motion.div>

          {/* TITLE */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 52,
              lineHeight: 0.95,
              letterSpacing: -1,
              background: 'linear-gradient(160deg, #fff 30%, #4b5563)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              RESET<br />
              <span style={{
                WebkitTextFillColor: 'transparent',
                background: 'linear-gradient(120deg, #22c55e, #86efac)',
                WebkitBackgroundClip: 'text'
              }}>PASSWORD</span>
            </h1>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#374151', marginTop: 12 }}>
              Enter your new password below
            </p>
          </motion.div>

          {/* SUCCESS STATE */}
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: 32, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 24 }}>
              <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 700, fontSize: 16, color: '#4ade80' }}>Password Updated!</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Redirecting you to login...</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.4), transparent)' }} />

              {/* NEW PASSWORD */}
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4b5563', display: 'block', marginBottom: 8 }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    placeholder="Min 6 characters"
                    className="glass-input"
                    style={{ paddingRight: 52 }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4b5563', display: 'block', marginBottom: 8 }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  placeholder="Repeat new password"
                  className="glass-input"
                />
              </div>

              {/* PASSWORD STRENGTH */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: password.length >= i * 2
                          ? i <= 1 ? '#ef4444' : i <= 2 ? '#f97316' : i <= 3 ? '#eab308' : '#22c55e'
                          : 'rgba(255,255,255,0.08)'
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    {password.length < 4 ? 'Weak' : password.length < 6 ? 'Fair' : password.length < 10 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={14} color="#f87171" />
                  <p style={{ fontSize: 11, color: '#f87171', fontWeight: 700, margin: 0 }}>{error}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                onClick={handleReset}
                disabled={loading || !password || !confirm || !sessionReady}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#000',
                  padding: 18,
                  borderRadius: 16,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 18,
                  letterSpacing: 2,
                  border: 'none',
                  cursor: loading || !password || !confirm || !sessionReady ? 'not-allowed' : 'pointer',
                  opacity: loading || !password || !confirm || !sessionReady ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(34,197,94,0.25)',
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Set New Password →'}
              </button>

              {!sessionReady && (
                <p style={{ fontSize: 10, color: '#4b5563', textAlign: 'center', fontWeight: 600 }}>
                  Waiting for reset link verification...
                </p>
              )}
            </motion.div>
          )}

          {/* BACK TO LOGIN */}
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            onClick={() => navigate("/login")}
            style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: 9, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', width: '100%', marginTop: 24, padding: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#9ca3af'}
            onMouseLeave={e => e.target.style.color = '#4b5563'}
          >
            ← Back to Login
          </motion.button>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}

export default ResetPassword;
