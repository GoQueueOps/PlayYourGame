
import { useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  AlertTriangle, 
  UserX, 
  Ghost, 
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function SafetyCenter() {
  const navigate = useNavigate();

  const reportTypes = [
    { 
      id: "false_claim", 
      title: "False Result Claim", 
      desc: "Opponent reported a wrong score in Challenge Mode.",
      icon: <AlertTriangle className="text-orange-500" />
    },
    { 
      id: "no_show", 
      title: "Player No-Show (Ghosting)", 
      desc: "Team did not show up for the booked slot.",
      icon: <Ghost className="text-blue-500" />
    },
    { 
      id: "harassment", 
      title: "Abusive Behavior", 
      desc: "Toxic behavior in match chat or on-field.",
      icon: <UserX className="text-red-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans italic selection:bg-red-500/30">
      
      {/* --- HEADER --- */}
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">SAFETY <span className="text-red-500">CENTER</span></h1>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Zone Integrity & Dispute Resolution</p>
        </div>
      </header>

      {/* --- URGENT DISPUTE ALERT --- */}
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] mb-10">
        <div className="flex items-center gap-4 mb-3">
          <ShieldAlert className="text-red-500" size={24} />
          <h2 className="text-sm font-black uppercase italic tracking-tight">Active Dispute?</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-4">
          Challenges enter "Locked" state if a dispute is filed. Venue managers will review on-field footage or scorecards.
        </p>
      </div>

      {/* --- REPORT CATEGORIES --- */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-2">File a Formal Report</h3>
        
        {reportTypes.map((type) => (
          <button 
            key={type.id}
            className="w-full bg-[#0b0f1a] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group active:bg-red-500/5 active:border-red-500/20 transition-all"
          >
            <div className="flex items-center gap-5 text-left">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                {type.icon}
              </div>
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-tighter">{type.title}</h4>
                <p className="text-[8px] font-bold text-slate-600 uppercase mt-1 tracking-wider">{type.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      {/* --- PENALTY RECAP --- */}
      <div className="mt-12 p-8 bg-black/40 border border-white/5 rounded-[3rem] relative overflow-hidden">
        <MessageSquareWarning className="absolute -right-8 -bottom-8 w-32 h-32 text-white/[0.02] -rotate-12" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={12} className="text-orange-500" /> Integrity Warning
        </h4>
        <ul className="space-y-3">
          <li className="text-[9px] font-black text-slate-500 uppercase">1st False Claim: <span className="text-white">-20 G-Points</span></li>
          <li className="text-[9px] font-black text-slate-500 uppercase">2nd False Claim: <span className="text-white">-40 G-Points</span></li>
          <li className="text-[9px] font-black text-slate-500 uppercase">Repeated Abuse: <span className="text-red-500 italic underline">Permanent Challenge Ban</span></li>
        </ul>
      </div>

    </div>
  );
}

export default SafetyCenter;