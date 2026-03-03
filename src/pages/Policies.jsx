import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

function Policies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 md:px-20 py-16 font-sans relative overflow-hidden">
      
      {/* Animated Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ x: -5 }}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10 relative z-10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm uppercase tracking-widest font-bold">
          Back
        </span>
      </motion.button>

      <motion.div 
        className="max-w-4xl mx-auto space-y-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      >

        <motion.h1 
          className="text-4xl font-black uppercase tracking-tight text-emerald-500 flex items-center gap-3"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <RotateCcw size={32} className="text-emerald-500" />
          Refund and Cancellation Policy
        </motion.h1>

        <motion.div
          className="space-y-6"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p 
            className="text-gray-300 leading-relaxed text-lg bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
              <span>Cancellations are subject to the policy set by the respective venue partner.
              You can review the cancellation terms of a venue on its information page
              before confirming a booking.</span>
            </div>
          </motion.p>

          <motion.p 
            className="text-gray-300 leading-relaxed text-lg bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
              <span>Users may initiate cancellations directly from their booking section.
              The refundable amount, if any, will be displayed before confirmation.</span>
            </div>
          </motion.p>

          <motion.p 
            className="text-gray-300 leading-relaxed text-lg bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex gap-3">
              <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" />
              <span>Where applicable, refunds will be credited to the original payment
              method within five to seven working days from cancellation.</span>
            </div>
          </motion.p>
        </motion.div>

        <motion.p 
          className="text-gray-500 text-sm pt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © 2026 Play Your Game. All rights reserved.
        </motion.p>

      </motion.div>
    </div>
  );
}

export default Policies;
