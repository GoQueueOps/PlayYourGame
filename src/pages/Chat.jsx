import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Send, Loader2, Swords, Gamepad2,
  MapPin, Clock, CalendarCheck, X, CheckCircle2,
  AlertCircle, CreditCard
} from "lucide-react";
import { supabase } from "../lib/supabase";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Book Court Modal ──
function BookCourtModal({ match, conversationId, currentUserId, members, onClose, onBooked }) {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState(null);
  const [myPaymentDone, setMyPaymentDone] = useState(false);
  const [opponentPaymentDone, setOpponentPaymentDone] = useState(false);

  const isChallenger = currentUserId === match?.created_by;
  const opponentId = members.find((m) => m.user_id !== currentUserId)?.user_id;

  useEffect(() => {
    const init = async () => {
      if (match?.id) {
        const { data: existingBooking } = await supabase
          .from("bookings")
          .select("*")
          .eq("match_id", match.id)
          .maybeSingle();

        if (existingBooking) {
          setBooking(existingBooking);
          setMyPaymentDone(isChallenger ? existingBooking.paid_by_challenger : existingBooking.paid_by_accepter);
          setOpponentPaymentDone(isChallenger ? existingBooking.paid_by_accepter : existingBooking.paid_by_challenger);
        }
      }

      if (match?.arena_id) {
        const { data: courtData } = await supabase
          .from("courts")
          .select("id, name")
          .eq("arena_id", match.arena_id);
        setCourts(courtData || []);
      }

      setLoading(false);
    };
    init();
  }, [match, isChallenger]);

  // Realtime booking updates
  useEffect(() => {
    if (!match?.id) return;
    const channel = supabase
      .channel(`booking:${match.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "bookings",
        filter: `match_id=eq.${match.id}`,
      }, (payload) => {
        setBooking(payload.new);
        setMyPaymentDone(isChallenger ? payload.new.paid_by_challenger : payload.new.paid_by_accepter);
        setOpponentPaymentDone(isChallenger ? payload.new.paid_by_accepter : payload.new.paid_by_challenger);
        if (payload.new.status === "confirmed") onBooked();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [match?.id, isChallenger]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load. Check your internet connection.");

      let currentBooking = booking;

      if (!currentBooking) {
        const sport = match.match_type?.split("_")[1] || "sport";
        const { data: newBooking, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            match_id: match.id,
            arena_id: match.arena_id || null,
            court_id: selectedCourt?.id || null,
            user_id: currentUserId,
            arena_name: selectedCourt?.name || match.arena?.name || "TBD",
            booking_date: match.match_time,
            sport_type: sport,
            price: (match.entry_points || 0) * 2,
            status: "pending",
            challenger_id: match.created_by,
            accepter_id: opponentId,
            paid_by_challenger: false,
            paid_by_accepter: false,
            expires_at: match.match_time,
          })
          .select()
          .single();

        if (bookingError) throw bookingError;
        currentBooking = newBooking;
        setBooking(newBooking);
      }

      const amountPaise = (match.entry_points || 20) * 100;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: "INR",
        name: "SportsMate",
        description: `${match.match_type?.split("_")[1] || "Sport"} Challenge — ${match.entry_points} G-PTS Stake`,
        handler: async (response) => {
          const updateField = isChallenger
            ? { paid_by_challenger: true, razorpay_order_id_challenger: response.razorpay_payment_id }
            : { paid_by_accepter: true, razorpay_order_id_accepter: response.razorpay_payment_id };

          await supabase.from("bookings").update(updateField).eq("id", currentBooking.id);
          await supabase.rpc("confirm_booking_if_both_paid", { p_booking_id: currentBooking.id });
          setMyPaymentDone(true);
          setPaying(false);
        },
        prefill: {},
        theme: { color: "#22c55e" },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err.message);
      alert("Payment failed: " + err.message);
      setPaying(false);
    }
  };

  const sport = match?.match_type?.split("_")[1] || "sport";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-lg bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 italic font-black uppercase"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl tracking-tighter text-white">
              Book <span className="text-emerald-500">Court</span>
            </h2>
            <p className="text-[9px] text-slate-500 tracking-[0.3em] mt-1">
              {sport.charAt(0).toUpperCase() + sport.slice(1)} • Both players must pay to confirm
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>
        ) : (
          <>
            {/* Payment Status */}
            <div className="bg-black/30 rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-[9px] text-slate-500 tracking-[0.3em]">Payment Status</p>
              <div className="flex gap-3">
                {[
                  { label: "Challenger", paid: isChallenger ? myPaymentDone : opponentPaymentDone },
                  { label: "Accepter", paid: isChallenger ? opponentPaymentDone : myPaymentDone },
                ].map(({ label, paid }) => (
                  <div key={label} className={`flex-1 p-3 rounded-2xl border flex items-center gap-2 ${paid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"}`}>
                    {paid ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-slate-500" />}
                    <div>
                      <p className="text-[9px] text-slate-400">{label}</p>
                      <p className={`text-[10px] ${paid ? "text-emerald-400" : "text-slate-500"}`}>{paid ? "Paid ✓" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {booking?.status === "confirmed" && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-[10px] text-emerald-400">Court Confirmed! See you on the field.</p>
                </div>
              )}
              {myPaymentDone && !opponentPaymentDone && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3 flex items-center gap-2">
                  <Clock size={14} className="text-yellow-400" />
                  <p className="text-[10px] text-yellow-400">Waiting for opponent. Auto-refund if they don't pay before match time.</p>
                </div>
              )}
            </div>

            {/* Court picker */}
            {!myPaymentDone && courts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] text-slate-500 tracking-[0.3em]">Select Court</p>
                <div className="grid grid-cols-2 gap-2">
                  {courts.map((court) => (
                    <button
                      key={court.id}
                      onClick={() => setSelectedCourt(court)}
                      className={`p-3 rounded-2xl border text-[10px] tracking-wider transition-all ${
                        selectedCourt?.id === court.id
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      {court.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stake summary */}
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Gamepad2 size={16} className="text-emerald-400" />
                <span className="text-[10px] text-slate-400">Your Stake</span>
              </div>
              <span className="text-emerald-400 font-black">
                ₹{match?.entry_points || 0}
              </span>
            </div>

            {/* CTA */}
            {!myPaymentDone ? (
              <button
                onClick={handlePay}
                disabled={paying || booking?.status === "confirmed"}
                className="w-full bg-emerald-500 text-black py-5 rounded-[2rem] text-xs tracking-[0.2em] font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {paying
                  ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  : <><CreditCard size={16} /> Pay ₹{match?.entry_points || 0} via Razorpay</>
                }
              </button>
            ) : (
              <button disabled className="w-full bg-white/5 border border-white/10 text-slate-500 py-5 rounded-[2rem] text-xs tracking-[0.2em] font-black flex items-center justify-center gap-2 cursor-not-allowed">
                <CheckCircle2 size={16} className="text-emerald-400" /> Your Payment Complete
              </button>
            )}

            <p className="text-[8px] text-slate-600 text-center tracking-widest not-italic font-normal">
              Court confirmed only when both players pay • Refund if opponent misses match time
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── MAIN CHAT ──
function Chat() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [members, setMembers] = useState([]);
  const [matchInfo, setMatchInfo] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data?.session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const load = async () => {
      setLoading(true);

      const { data: conv } = await supabase
        .from("conversations")
        .select("id, type, match_id")
        .eq("id", conversationId)
        .single();

      if (conv?.match_id) {
        const { data: match } = await supabase
          .from("matches")
          .select("id, match_type, match_time, entry_points, arena_id, created_by, status")
          .eq("id", conv.match_id)
          .single();

        if (match) {
          if (match.arena_id) {
            const { data: arena } = await supabase.from("arenas").select("name").eq("id", match.arena_id).single();
            setMatchInfo({ ...match, arena });
          } else {
            setMatchInfo(match);
          }
          if (match.status === "confirmed") setBookingConfirmed(true);
        }
      }

      const { data: memberRows } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId);

      if (memberRows?.length) {
        const ids = memberRows.map((m) => m.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", ids);
        setMembers(memberRows.map((m) => ({
          user_id: m.user_id,
          name: profiles?.find((p) => p.id === m.user_id)?.name || "Player",
        })));
      }

      const { data: msgs } = await supabase
        .from("group_messages")
        .select("id, sender_id, message, created_at")
        .eq("group_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setLoading(false);
    };
    load();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "group_messages",
        filter: `group_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !currentUserId || sending) return;
    setSending(true);
    setNewMessage("");
    const { error } = await supabase.from("group_messages").insert({
      group_id: conversationId, sender_id: currentUserId, message: text,
    });
    if (error) { console.error("Send error:", error.message); setNewMessage(text); }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getOpponentName = () => members.find((m) => m.user_id !== currentUserId)?.name || "Opponent";
  const getNameForUser = (uid) => members.find((m) => m.user_id === uid)?.name || "Player";
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatMatchTime = (d) => {
    if (!d) return "TBD";
    return new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };
  const parseSport = (mt = "") => { const p = mt.split("_"); return p[1] ? p[1].charAt(0).toUpperCase() + p[1].slice(1) : "Match"; };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Swords size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="font-black uppercase tracking-tight text-white truncate italic text-sm">
                {loading ? "Loading..." : getOpponentName()}
              </p>
              <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold">
                {bookingConfirmed ? "✓ Court Confirmed" : "Challenge Active"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shrink-0 ${
              bookingConfirmed
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                : "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
            }`}
          >
            <CalendarCheck size={14} />
            {bookingConfirmed ? "Booked" : "Book Court"}
          </button>
        </div>
      </header>

      {/* MATCH BANNER */}
      {matchInfo && (
        <div className="sticky top-[73px] z-10 bg-[#0b0f1a]/80 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Swords size={12} className="text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 italic">{parseSport(matchInfo.match_type)}</span>
            </div>
            {matchInfo.arena?.name && (
              <div className="flex items-center gap-2 shrink-0">
                <MapPin size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">{matchInfo.arena.name}</span>
              </div>
            )}
            {matchInfo.match_time && (
              <div className="flex items-center gap-2 shrink-0">
                <Clock size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{formatMatchTime(matchInfo.match_time)}</span>
              </div>
            )}
            {matchInfo.entry_points && (
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <Gamepad2 size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">{matchInfo.entry_points * 2} G-PTS Pot</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-[10px] uppercase tracking-widest font-black">Loading Chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Swords size={28} className="text-emerald-400" />
              </div>
              <p className="text-white font-black uppercase italic tracking-tight text-xl">Challenge Accepted!</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Say something to your opponent</p>
              <button
                onClick={() => setShowBookModal(true)}
                className="mt-2 bg-emerald-500 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
              >
                <CalendarCheck size={14} /> Book Court Now
              </button>
            </motion.div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest font-black">{date}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {msgs.map((msg) => {
                      const isOwn = msg.sender_id === currentUserId;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                            {!isOwn && (
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black px-2">
                                {getNameForUser(msg.sender_id)}
                              </span>
                            )}
                            <div className={`px-4 py-3 rounded-2xl text-sm font-semibold leading-relaxed ${
                              isOwn
                                ? "bg-emerald-500 text-black rounded-br-sm"
                                : "bg-white/[0.06] border border-white/[0.08] text-white rounded-bl-sm"
                            }`}>
                              {msg.message}
                            </div>
                            <span className="text-[8px] text-slate-600 px-2 font-bold">{formatTime(msg.created_at)}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* INPUT */}
      <div className="sticky bottom-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-t border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-medium"
            disabled={sending || loading}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || loading}
            className="w-14 h-14 bg-emerald-500 text-black rounded-2xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-emerald-500/20"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* BOOK COURT MODAL */}
      <AnimatePresence>
        {showBookModal && matchInfo && (
          <BookCourtModal
            match={matchInfo}
            conversationId={conversationId}
            currentUserId={currentUserId}
            members={members}
            onClose={() => setShowBookModal(false)}
            onBooked={() => { setBookingConfirmed(true); setShowBookModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chat;