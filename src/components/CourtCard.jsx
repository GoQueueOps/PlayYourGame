import { Link } from "react-router-dom";

function CourtCard({ court }) {
  return (
    <Link to={`/play-area/${court.id}`} className="group block">
      <div className="relative h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 bg-slate-900 transition-all duration-500 hover:border-green-500/50 hover:-translate-y-2 shadow-2xl">
        
        {/* BACKGROUND IMAGE with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={court.images?.[0] || "https://images.unsplash.com/photo-1521412644187-c49fa049e84d"}
            alt={court.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        {/* TOP BADGE: Distance */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-green-400">
            {court.distance} AWAY
          </span>
        </div>

        {/* BOTTOM CONTENT: Info Glass Box */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transition-transform duration-500 group-hover:-translate-y-2">
          
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              {/* Sport Category Tags */}
              <div className="flex gap-2">
                {court.sports.map((sport, idx) => (
                  <span key={idx} className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter border-l border-green-500 pl-2">
                    {sport}
                  </span>
                ))}
              </div>

              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                {court.name}
              </h3>
              
              <p className="text-xs text-gray-400 font-medium">
                {court.city || "Cuttack"}
              </p>
            </div>

            {/* ACTION CIRCLE */}
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-all">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>

        {/* HOVER GLOW EFFECT */}
        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}

export default CourtCard;