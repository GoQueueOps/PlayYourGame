import { motion } from "framer-motion";

function About() {

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 md:px-20 py-16 font-sans relative overflow-hidden">
      
      {/* Animated Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* HERO SECTION */}
      <motion.div 
        className="text-center max-w-4xl mx-auto mb-16 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tight">
          About <span className="text-emerald-500">Play Your Game</span>
        </h1>
        <motion.p 
          className="mt-6 text-gray-400 text-sm md:text-base font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Your Game. Your Time. Your Arena.
        </motion.p>
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-12">

        {/* WHO WE ARE */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4 uppercase tracking-wide">
            Who We Are
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Play Your Game is a modern sports booking and community platform 
            built to simplify how players discover venues, reserve courts, 
            create teams, and compete.
          </p>
          <p className="text-gray-400 mt-4 leading-relaxed">
            Whether you are organizing a friendly match, challenging another team, 
            or managing your local sports crew, everything happens in one place.
          </p>
        </section>

        {/* MISSION */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4 uppercase tracking-wide">
            Our Mission
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Our mission is to digitize grassroots sports across India and make 
            playing easier than scrolling.
          </p>
        </section>

        {/* WHAT WE OFFER */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-500 mb-6 uppercase tracking-wide">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Seamless court and turf booking
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Real time slot availability
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Team and lobby creation
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Competitive challenge system
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Community groups and crew management
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              Reward based engagement with G and Z Points
            </div>
          </div>
        </section>

        {/* VISION */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4 uppercase tracking-wide">
            Our Vision
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We aim to become India’s leading sports technology platform 
            connecting players, venues, and competitive communities in one 
            unified digital ecosystem.
          </p>
        </section>

        {/* WHY US */}
        <section>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4 uppercase tracking-wide">
            Why Play Your Game
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Finding a ground to play should never be harder than playing the game itself.
          </p>
          <p className="text-gray-400 mt-4 leading-relaxed">
            Play Your Game is built with passion for sports and technology, 
            empowering both players and venue owners with smarter tools, 
            better organization, and stronger communities.
          </p>
        </section>

      </div>
    </div>
  );
}

export default About;
