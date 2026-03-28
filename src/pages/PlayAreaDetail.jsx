import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, ChevronLeft, ArrowRight, Clock, Loader } from "lucide-react";
import { supabase } from "../lib/supabase";

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"
];

const slotToHour = (slot) => {
  const [time, period] = slot.split(' ')
  let [hour] = time.split(':').map(Number)
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  return hour
}

// Fetch arena directly with supabase (bypass service for now to debug)
const fetchArenaFromDB = async (id) => {
  const { data, error } = await supabase
    .from('arenas')
    .select(`
      *,
      play_area_images (image_url, image_type, position),
      play_area_amenities (
        amenities (id, name, emoji)
      ),
      arena_sports (
        sports (id, name, emoji)
      ),
      courts (
        id, name, price_per_hour, is_active,
        sports (id, name, emoji)
      ),
      pricing_rules (start_time, end_time, price_per_hour, sport_id)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Sort images
  const courtImages = (data.play_area_images || [])
    .filter(img => img.image_type === 'court')
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map(img => img.image_url)

  const allImages = (data.play_area_images || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map(img => img.image_url)

  // Build sportsManaged
  const sportsManaged = {}
  const activeCourts = (data.courts || []).filter(c => c.is_active)
  activeCourts.forEach(court => {
    const sportName = court.sports?.name
    if (!sportName) return
    if (!sportsManaged[sportName]) sportsManaged[sportName] = []
    sportsManaged[sportName].push({
      id: court.id,
      name: court.name,
      physicalID: court.id,
      pricePerHour: court.price_per_hour,
      sport: court.sports
    })
  })

  const amenities = (data.play_area_amenities || [])
    .map(pa => pa.amenities).filter(Boolean)

  const sports = (data.arena_sports || [])
    .map(as => as.sports).filter(Boolean)

  const prices = activeCourts.map(c => c.price_per_hour).filter(Boolean)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0

  return {
    id: data.id,
    name: data.name,
    location: data.location,
    city: data.city,
    state: data.state,
    country: data.country,
    description: data.description,
    phone: data.phone,
    latitude: data.latitude,
    longitude: data.longitude,
    is_active: data.is_active,
    images: courtImages.length > 0 ? courtImages : allImages,
    amenities,
    sports,
    sportsManaged,
    pricePerHour: minPrice,
    pricingRules: data.pricing_rules || []
  }
}

function PlayAreaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [area, setArea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [selectedSport, setSelectedSport] = useState("")
  const [selectedCourtID, setSelectedCourtID] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [currentPrice, setCurrentPrice] = useState(0)

  // ── FETCH ARENA ──
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchArenaFromDB(id)
        setArea(data)

        const sportNames = Object.keys(data.sportsManaged || {})
        if (sportNames.length > 0) {
          setSelectedSport(sportNames[0])
          const firstCourt = data.sportsManaged[sportNames[0]]?.[0]
          if (firstCourt) {
            setSelectedCourtID(firstCourt.physicalID)
            setCurrentPrice(firstCourt.pricePerHour)
          }
        }
      } catch (err) {
        console.error('Fetch arena error:', err)
        setError(err.message)
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  // ── UPDATE COURT WHEN SPORT CHANGES ──
  useEffect(() => {
    if (area && selectedSport && area.sportsManaged[selectedSport]) {
      const courts = area.sportsManaged[selectedSport]
      if (courts.length > 0) {
        setSelectedCourtID(courts[0].physicalID)
        setCurrentPrice(courts[0].pricePerHour)
        setStartTime(null)
        setEndTime(null)
      }
    }
  }, [selectedSport, area])

  // ── UPDATE PRICE WHEN TIME CHANGES (peak pricing) ──
  useEffect(() => {
    if (!startTime || !area) return
    const hour = slotToHour(startTime)
    const timeStr = `${String(hour).padStart(2, '0')}:00:00`

    // Check pricing rules
    const matchingRule = area.pricingRules?.find(r =>
      timeStr >= r.start_time && timeStr < r.end_time
    )

    if (matchingRule) {
      setCurrentPrice(matchingRule.price_per_hour)
    } else {
      // Fall back to court price
      const court = area.sportsManaged[selectedSport]?.find(c => c.physicalID === selectedCourtID)
      if (court) setCurrentPrice(court.pricePerHour)
    }
  }, [startTime, selectedCourtID, area, selectedSport])

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader size={40} className="text-emerald-500" />
      </motion.div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4">
      <p className="text-white font-black uppercase tracking-widest text-xl opacity-40">Error Loading Arena</p>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={() => navigate(-1)} className="text-emerald-400 underline text-sm">Go Back</button>
    </div>
  )

  if (!area) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <p className="text-white font-black uppercase tracking-widest text-xl opacity-40">Arena Not Found</p>
    </div>
  )

  const onDragEnd = (e, info) => {
    const offset = info.offset.x
    if (offset < -50 && imgIdx < area.images.length - 1) setImgIdx(prev => prev + 1)
    else if (offset > 50 && imgIdx > 0) setImgIdx(prev => prev - 1)
  }

  const getDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i + dayOffset)
      dates.push(d)
    }
    return dates
  }

  const selectedCourtData = area.sportsManaged[selectedSport]?.find(c => c.physicalID === selectedCourtID)
  const selectedCourtName = selectedCourtData?.name
  const startIdx = TIME_SLOTS.indexOf(startTime)
  const endIdx = endTime ? TIME_SLOTS.indexOf(endTime) : startIdx

  const calcHours = () => {
    if (!startTime || !endTime) return 0
    return endIdx - startIdx
  }

  const totalPrice = currentPrice * calcHours()

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-40" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* GRAIN */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "128px",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 relative">

        {/* ── IMAGE GALLERY ── */}
        <div className="relative h-[42vh] w-full overflow-hidden rounded-3xl border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          {area.images.length > 0 ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={onDragEnd}
              animate={{ x: `-${imgIdx * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex h-full w-full cursor-grab active:cursor-grabbing"
            >
              {area.images.map((img, i) => (
                <div key={i} className="w-full h-full shrink-0 relative">
                  <img src={img} alt="arena" className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/30" />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-6xl">🏟️</div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-50 w-9 h-9 bg-black/50 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10"
          >
            <ChevronLeft size={18} />
          </motion.button>

          {area.images.length > 1 && (
            <>
              <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-bold text-white/60">
                {imgIdx + 1} / {area.images.length}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {area.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${imgIdx === i ? "w-6 bg-emerald-400" : "w-1.5 bg-white/25"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/[0.03] border border-white/[0.07] p-6 rounded-3xl backdrop-blur-sm"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">Open Now</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase leading-none tracking-tight">
              {area.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500">
              <MapPin size={12} className="text-blue-400 shrink-0" />
              <p className="text-[11px] font-medium tracking-wide">{area.city} • {area.location}</p>
            </div>
            {area.description && (
              <p className="text-[11px] text-slate-500 mt-2">{area.description}</p>
            )}
          </div>

          <div className="flex gap-2.5 shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`https://maps.google.com/search?q=${encodeURIComponent(area.name + ' ' + area.location)}`, '_blank')}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <MapPin size={13} /> Directions
            </motion.button>
            {area.phone && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`tel:${area.phone}`)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Phone size={13} /> Call
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── AMENITIES ── */}
        {area.amenities?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-4 bg-white/[0.03] border border-white/[0.07] p-5 rounded-3xl"
          >
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mb-4">Amenities & Facilities</p>
            <div className="flex flex-wrap gap-2">
              {area.amenities.map((amenity, i) => (
                <motion.div
                  key={amenity.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3.5 py-2 rounded-xl hover:border-white/15 transition-colors"
                >
                  <span>{amenity.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">{amenity.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DATE SELECTOR ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-4 bg-white/[0.03] border border-white/[0.07] p-5 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Select Date</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => dayOffset > 0 && setDayOffset(dayOffset - 7)}
                disabled={dayOffset === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30"
              >‹</button>
              <span className="text-[11px] font-bold text-slate-400 px-2">
                {getDates()[0].toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setDayOffset(dayOffset + 7)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-all"
              >›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {getDates().map((d, i) => {
              const isActive = selectedDate.toDateString() === d.toDateString()
              const isToday = new Date().toDateString() === d.toDateString()
              return (
                <motion.button
                  key={i} whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center py-3 rounded-2xl border transition-all relative overflow-hidden ${
                    isActive ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />}
                  <span className={`text-sm font-black relative z-10 ${isActive ? "text-emerald-400" : "text-white"}`}>{d.getDate()}</span>
                  <span className={`text-[8px] font-bold uppercase mt-0.5 relative z-10 ${isActive ? "text-emerald-500" : "text-slate-600"}`}>
                    {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  {isToday && !isActive && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-400" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* ── SPORT & COURT SELECTORS ── */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white/[0.03] border border-white/[0.07] p-5 rounded-3xl"
          >
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mb-4">Select Sport</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(area.sportsManaged).map(sport => (
                <motion.button
                  key={sport} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSport(sport)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    selectedSport === sport
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{area.sports?.find(s => s.name === sport)?.emoji}</span>
                  {sport}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/[0.03] border border-white/[0.07] p-5 rounded-3xl"
          >
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em] mb-4">Select Court</p>
            <div className="flex gap-2 flex-wrap">
              {area.sportsManaged[selectedSport]?.map(court => (
                <motion.button
                  key={court.physicalID} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCourtID(court.physicalID)
                    setCurrentPrice(court.pricePerHour)
                    setStartTime(null)
                    setEndTime(null)
                  }}
                  className={`flex flex-col items-start px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    selectedCourtID === court.physicalID
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{court.name}</span>
                  <span className={`text-[8px] font-bold ${selectedCourtID === court.physicalID ? 'text-emerald-600' : 'text-emerald-400'}`}>
                    ₹{court.pricePerHour}/hr
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── TIME SLOTS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-4 bg-white/[0.03] border border-white/[0.07] p-5 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.4em]">Available Slots</p>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock size={11} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {startTime ? `Tap end time to select range` : `Tap to pick start time`}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {TIME_SLOTS.map((t) => {
              const currentIdx = TIME_SLOTS.indexOf(t)
              const isInRange = startTime && currentIdx >= startIdx && currentIdx <= endIdx
              const isStart = t === startTime
              const isEnd = t === endTime
              const isEdge = isStart || isEnd
              return (
                <motion.button
                  key={t} whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    if (!startTime || endTime) { setStartTime(t); setEndTime(null) }
                    else {
                      const sIdx = TIME_SLOTS.indexOf(startTime)
                      const cIdx = TIME_SLOTS.indexOf(t)
                      if (cIdx <= sIdx) { setStartTime(t); setEndTime(null) }
                      else setEndTime(t)
                    }
                  }}
                  className={`relative py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border overflow-hidden ${
                    isEdge
                      ? "bg-emerald-500 border-emerald-500 text-black shadow-md shadow-emerald-500/30"
                      : isInRange
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                      : "bg-transparent border-white/[0.06] text-slate-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {isInRange && !isEdge && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5" />}
                  <span className="relative z-10">{t}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── STICKY FOOTER ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[100]">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="bg-[#030712]/90 backdrop-blur-2xl px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-500">
                {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} · {selectedCourtName || 'Select Court'}
              </span>
              <span className="text-lg font-black uppercase tracking-tight leading-tight mt-0.5">
                {startTime ? (
                  <span>
                    {startTime} <span className="text-slate-600">→</span> {endTime || <span className="text-slate-600 italic">…</span>}
                  </span>
                ) : (
                  <span className="text-slate-600">Pick your time</span>
                )}
              </span>
              {calcHours() > 0 && (
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  {calcHours()} hr{calcHours() > 1 ? "s" : ""} · ₹{totalPrice}
                  {area.pricingRules?.length > 0 && startTime && ' (incl. peak pricing)'}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={!startTime || !endTime}
              onClick={() => navigate("/confirm", {
                state: {
                  area,
                  selectedDate,
                  selectedCourt: selectedCourtID,
                  startTime,
                  endTime,
                  price: totalPrice,
                  selectedSport
                }
              })}
              className="flex items-center gap-2 flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black px-7 py-4 rounded-2xl font-black uppercase text-sm tracking-tight transition-all shadow-xl shadow-emerald-500/20 disabled:shadow-none"
            >
              Confirm & Pay
              <ArrowRight size={15} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayAreaDetail;
