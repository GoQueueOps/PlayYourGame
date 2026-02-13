import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Assuming you have your logo here

function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* BRANDING SECTION */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <img src={logo} alt="Play Your Game" className="h-10 w-auto grayscale brightness-200" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Elevate your game. <br /> 
              Book premium arenas in seconds.
            </p>
            <div className="flex gap-4">
              {/* Mock Social Icons */}
              {['📸', '📘', '💼'].map((icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-90">
                  <span className="text-sm">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/booking" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Book Arena</Link></li>
            </ul>
          </div>

          {/* LEGAL SECTION */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Legals</h4>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Support</h4>
            <div className="space-y-1">
              <p className="text-xs font-black text-white italic">jee.tejas@gmail.com</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Response within 24 hours</p>
            </div>
            <button className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
              Live Chat
            </button>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            © 2026 Play Your Game. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-600 uppercase">Built for</span>
            <span className="bg-white/10 px-3 py-1 rounded-md text-[8px] font-black uppercase text-white">Android</span>
            <span className="bg-white/10 px-3 py-1 rounded-md text-[8px] font-black uppercase text-white">iOS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;