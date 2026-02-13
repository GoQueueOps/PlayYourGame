import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MOCK_BOOKINGS = [
  {
    id: "BK-9921",
    arena: "KRATER'S ARENA",
    sport: "CRICKET",
    date: "2026-02-10",
    time: "08:00 AM",
    price: "800",
    status: "UPCOMING",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da"
  },
  {
    id: "BK-8842",
    arena: "ELITE SPORTS HUB",
    sport: "PICKLEBALL",
    date: "2026-02-05",
    time: "06:00 PM",
    price: "500",
    status: "COMPLETED",
    image: "https://images.unsplash.com/photo-1626225963773-052a233481bc"
  }
];

function MyBookings() {
  return (
    <div className="min-h-screen bg-[#020617] text-white pt-28 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
              MY <span className="text-blue-500">BOOKINGS</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Manage your tickets and game history
            </p>
          </div>
          
          <Link 
            to="/booking" 
            className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center"
          >
            Book New Game
          </Link>
        </div>

        {/* BOOKINGS LIST */}
        <div className="space-y-6">
          {MOCK_BOOKINGS.map((booking) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 items-center group hover:border-blue-500/30 transition-all"
            >
              {/* Arena Image */}
              <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                <img src={booking.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Booking Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase ${
                    booking.status === "UPCOMING" ? "bg-green-500/10 text-green-500" : "bg-white/5 text-gray-500"
                  }`}>
                    {booking.status}
                  </span>
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{booking.id}</span>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-1">
                  {booking.arena}
                </h3>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
                  {booking.sport} • {booking.date} @ {booking.time}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                <span className="text-2xl font-black italic">₹{booking.price}</span>
                <button className="w-full md:w-auto bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  View Ticket
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MyBookings;