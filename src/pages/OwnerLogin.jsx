import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LayoutDashboard, Lock, Mail, ArrowRight, Loader } from "lucide-react";
import { supabase } from "../lib/supabase";

function OwnerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (authError) throw authError

      // 2. Small delay to let session propagate
      await new Promise(r => setTimeout(r, 500))

      // 3. Fetch role_id from user_roles
      const { data: userRoleRow, error: urError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', data.user.id)
        .single()

      if (urError || !userRoleRow) {
        await supabase.auth.signOut()
        throw new Error(`Could not fetch role. ${urError?.message || 'No role found.'}`)
      }

      // 4. Fetch role name from roles using role_id
      const { data: roleRow, error: rError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRoleRow.role_id)
        .single()

      if (rError || !roleRow) {
        await supabase.auth.signOut()
        throw new Error(`Could not fetch role name. ${rError?.message}`)
      }

      const userRole = roleRow.name

      // 5. Check role
      if (userRole !== 'owner' && userRole !== 'venue_manager') {
        await supabase.auth.signOut()
        throw new Error(`Access denied. Your role is "${userRole}" — must be owner or venue manager.`)
      }

      // 6. Redirect
      if (userRole === 'venue_manager') {
        navigate('/manager')
      } else {
        navigate('/owner')
      }

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 italic font-sans relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="owner-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="12" stroke="white" strokeWidth="1" fill="none" />
            <path d="M 120 20 L 140 40 M 140 20 L 120 40" stroke="white" strokeWidth="2" />
            <path d="M 20 120 Q 80 80 140 120" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="10,5" />
            <path d="M 135 115 L 145 120 L 135 125 Z" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#owner-pattern)" />
        </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full z-0" />

      <div className="w-full max-w-[450px] space-y-10 relative z-10">

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-all group absolute -top-16 left-0"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit to Player Portal</span>
        </button>

        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="relative bg-black/40 border border-white/10 p-5 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
              <LayoutDashboard className="text-blue-500" size={42} strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none whitespace-nowrap">
              OWNER <span className="text-blue-500">HUB</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4 opacity-70">
              Ground Management System · v2.0
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] space-y-5 backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="space-y-4">
            <div className="relative group/input">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="BUSINESS EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{ textTransform: 'none' }}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-blue-500/50 font-black text-[11px] tracking-[0.2em] transition-all placeholder:text-gray-800"
              />
            </div>

            <div className="relative group/input">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-blue-500/50 font-black text-[11px] tracking-[0.2em] transition-all placeholder:text-gray-800"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                <p className="text-red-400 text-[10px] font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase italic tracking-wider shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 mt-4"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>Access Dashboard <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">
          Forgot Credentials?{" "}
          <span className="text-blue-400 cursor-pointer hover:text-white transition-colors">
            Contact Support
          </span>
        </p>
      </div>
    </div>
  );
}

export default OwnerLogin;
