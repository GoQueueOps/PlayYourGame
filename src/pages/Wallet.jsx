import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Gamepad2, ArrowLeftRight, History,
  ChevronLeft, CheckCircle2, Lock, TrendingUp, Loader
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [wallet, setWallet] = useState({ g_points_balance: 0, z_points_balance: 0, locked_points: 0 });
  const [transactions, setTransactions] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [convertedThisMonth, setConvertedThisMonth] = useState(0);
  const [convertAmount, setConvertAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallet')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (walletData) setWallet(walletData)

      // Fetch transactions
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (txData) setTransactions(txData)

      // Count bookings in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .or(`challenger_id.eq.${user.id},accepter_id.eq.${user.id}`)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['confirmed', 'completed', 'active'])
      setBookingsCount(count || 0)

      // Count Z points converted this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { data: convData } = await supabase
        .from('g_to_z_conversions')
        .select('z_points_received')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
      const total = (convData || []).reduce((sum, c) => sum + c.z_points_received, 0)
      setConvertedThisMonth(total)

    } catch (err) {
      console.error('Wallet fetch error:', err)
    }
    setLoading(false)
  }

  const Z_CAP = 70
  const isEligible = bookingsCount >= 3
  const remainingZCapacity = Z_CAP - convertedThisMonth
  const maxGAllowed = Math.min(wallet.g_points_balance, remainingZCapacity * 10)

  const handleConvert = async () => {
    if (convertAmount < 10) return
    setConverting(true)
    setError(null)

    try {
      const zGained = Math.floor(convertAmount / 10)

      // Update wallet
      const { error: walletError } = await supabase
        .from('wallet')
        .update({
          g_points_balance: wallet.g_points_balance - convertAmount,
          z_points_balance: wallet.z_points_balance + zGained
        })
        .eq('user_id', user.id)

      if (walletError) throw walletError

      // Log conversion
      await supabase.from('g_to_z_conversions').insert({
        user_id: user.id,
        g_points_used: convertAmount,
        z_points_received: zGained,
        conversion_rate: 10
      })

      // Log transactions
      await supabase.from('wallet_transactions').insert([
        { user_id: user.id, currency: 'G', points: -convertAmount, transaction_type: 'conversion_out' },
        { user_id: user.id, currency: 'Z', points: zGained, transaction_type: 'conversion_in' }
      ])

      setConvertAmount(0)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      await fetchAll()

    } catch (err) {
      setError(err.message)
    }
    setConverting(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata'
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader size={40} className="text-emerald-500" />
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 select-none font-sans italic relative overflow-hidden">

      {/* SUCCESS */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6"
          >
            <div className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={18} /> Conversion Successful! Z-Points Added.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">My Wallet</h1>
      </header>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 gap-4 mb-8">

        {/* Z POINTS */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
          <Zap size={120} className="absolute -right-8 -top-8 text-yellow-500/5 rotate-12" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Zone Points
            </div>
            <Zap size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter relative z-10">
            {wallet.z_points_balance} <span className="text-sm opacity-40 italic">Z</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase mt-4 tracking-widest relative z-10">
            Value: ₹{wallet.z_points_balance}
          </p>
        </div>

        {/* G POINTS */}
        <div className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
          <Gamepad2 size={120} className="absolute -right-8 -top-8 text-white/5 rotate-12" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Game Points
            </div>
            <Gamepad2 size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter relative z-10">
            {wallet.g_points_balance} <span className="text-sm opacity-40 italic">G</span>
          </h2>
          {wallet.locked_points > 0 && (
            <p className="text-[10px] text-orange-400/70 font-black uppercase mt-2 tracking-widest relative z-10">
              🔒 {wallet.locked_points} G locked in active matches
            </p>
          )}
          <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-widest italic relative z-10">
            Conversion: 10 G = 1 Z
          </p>
        </div>
      </div>

      {/* CONVERSION HUB */}
      <section className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <ArrowLeftRight size={20} />
          </div>
          <h3 className="text-sm font-black uppercase italic tracking-tight">G ➔ Z Conversion</h3>
        </div>

        <div className="space-y-8">
          {/* PROGRESS BARS */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[8px] font-black text-slate-600 uppercase">Booking Streak</p>
                <span className="text-[8px] font-black text-white">{bookingsCount}/3</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min((bookingsCount / 3) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[8px] font-black text-slate-600 uppercase">Monthly Cap</p>
                <span className="text-[8px] font-black text-white">{convertedThisMonth}/{Z_CAP} Z</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(convertedThisMonth / Z_CAP) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* SLIDER */}
          {isEligible && maxGAllowed >= 10 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-500 uppercase">Select Amount</p>
                <p className="text-xl font-black text-emerald-500 italic">+{Math.floor(convertAmount / 10)} Z</p>
              </div>
              <input
                type="range" min="0" max={maxGAllowed} step="10" value={convertAmount}
                onChange={(e) => setConvertAmount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-700">
                <span>0 G</span>
                <span className="text-white bg-white/5 px-2 py-1 rounded-md">{convertAmount} G-POINTS</span>
                <span>{maxGAllowed} G</span>
              </div>
            </motion.div>
          )}

          {/* ELIGIBILITY */}
          <div className="bg-black/40 rounded-3xl p-5 flex items-start gap-4 border border-white/5">
            {isEligible
              ? <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              : <Lock className="text-slate-600 shrink-0" size={18} />
            }
            <p className="text-[11px] text-slate-400 font-bold uppercase italic leading-relaxed">
              {isEligible
                ? "Eligibility unlocked. Convert G-Points manually to gain Zone value."
                : `Complete ${3 - bookingsCount} more bookings this month to unlock conversion.`
              }
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-[10px] font-black uppercase tracking-wider">{error}</p>
          )}

          <button
            onClick={handleConvert}
            disabled={!isEligible || convertAmount < 10 || converting}
            className={`w-full py-5 rounded-[22px] font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
              isEligible && convertAmount >= 10 && !converting
                ? 'bg-white text-black shadow-xl active:scale-95'
                : 'bg-white/5 text-slate-700 cursor-not-allowed'
            }`}
          >
            {converting ? (
              <><Loader size={14} className="animate-spin" /> Converting...</>
            ) : (
              <>Confirm Transfer <TrendingUp size={14} /></>
            )}
          </button>
        </div>
      </section>

      {/* TRANSACTION HISTORY */}
      <section className="px-2">
        <div className="flex items-center gap-3 mb-6">
          <History size={18} className="text-slate-500" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Financial Log</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.currency === 'Z' ? 'bg-yellow-400/5 text-yellow-400' : 'bg-emerald-400/5 text-emerald-400'}`}>
                    {tx.currency === 'Z' ? <Zap size={20} /> : <Gamepad2 size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter">
                      {tx.transaction_type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-slate-600 font-black uppercase mt-1 tracking-widest">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-black italic tracking-tighter ${tx.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points} {tx.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Wallet;
