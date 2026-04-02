import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, Loader, Calendar, Clock, MapPin } from "lucide-react";

const STATUS_STYLES = {
  confirmed:        { label: 'Confirmed',        bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  pending:          { label: 'Pending Payment',  bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  border: 'border-yellow-500/20' },
  active:           { label: 'Active',            bg: 'bg-blue-500/10',   text: 'text-blue-400',    border: 'border-blue-500/20' },
  payment_verified: { label: 'Payment Verified', bg: 'bg-cyan-500/10',   text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  completed:        { label: 'Completed',         bg: 'bg-white/5',       text: 'text-slate-400',   border: 'border-white/10' },
  cancelled:        { label: 'Cancelled',         bg: 'bg-red-500/10',    text: 'text-red-400',     border: 'border-red-500/20' },
  expired:          { label: 'Expired',           bg: 'bg-red-500/5',     text: 'text-red-400/60',  border: 'border-red-500/10' },
}

function MyBookings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      setLoading(true)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          arenas (name, city),
          courts (name, sports(name, emoji))
        `)
        .or(`challenger_id.eq.${user.id},accepter_id.eq.${user.id}`)
        .order('booking_date', { ascending: false })

      if (error) console.error('Bookings error:', error)
      else setBookings(data || [])
      setLoading(false)
    }
    fetchBookings()
  }, [user])

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => {
        if (filter === 'upcoming') return ['pending', 'confirmed', 'active', 'payment_verified'].includes(b.status)
        if (filter === 'completed') return b.status === 'completed'
        if (filter === 'cancelled') return ['cancelled', 'expired'].includes(b.status)
        return true
      })

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata'
    })
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-slate-400 active:scale-90 transition-transform">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              MY <span className="text-blue-500">BOOKINGS</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/booking"
            className="ml-auto bg-emerald-500 text-black px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
          >
            + Book
          </Link>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-white text-black'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader size={32} className="text-blue-500" />
            </motion.div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-white font-black uppercase text-lg">No Bookings Found</p>
            <p className="text-slate-500 text-sm mt-2 mb-6">Time to get on the turf!</p>
            <Link to="/booking" className="bg-emerald-500 text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Book a Slot
            </Link>
          </div>
        )}

        {/* BOOKINGS LIST */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((booking, idx) => {
              const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending
              const sport = booking.courts?.sports
              const isChallenger = booking.challenger_id === user?.id

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-blue-500/20 transition-all"
                >
                  {/* SPORT ICON */}
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-white/5">
                    {sport?.emoji || '🏟️'}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {statusStyle.label}
                      </span>
                      <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
                        {isChallenger ? 'Challenger' : 'Accepter'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight mb-1">
                      {booking.arenas?.name || booking.arena_name}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-blue-400" />
                        {booking.arenas?.city || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} className="text-emerald-400" />
                        {formatDate(booking.booking_date)}
                      </span>
                      {booking.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="text-yellow-400" />
                          {booking.start_time} → {booking.end_time}
                        </span>
                      )}
                      {booking.courts?.name && (
                        <span className="text-slate-600">{booking.courts.name}</span>
                      )}
                    </div>
                  </div>

                  {/* PRICE & ACTION */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-2xl font-black italic">₹{booking.price}</p>
                      <p className="text-[8px] text-slate-600 uppercase tracking-wider">
                        {booking.paid_by_challenger && booking.paid_by_accepter
                          ? 'Fully Paid'
                          : isChallenger && booking.paid_by_challenger
                          ? 'You Paid'
                          : 'Pending Payment'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/confirm`, { state: { bookingId: booking.id } })}
                      className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings;
