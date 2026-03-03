import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Share2, User, Eye } from "lucide-react";
import { motion } from "framer-motion";

function Privacy() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

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
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >

        <motion.h1 
          className="text-4xl font-black uppercase tracking-tight text-emerald-500"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Privacy Policy
        </motion.h1>

        <motion.p 
          className="text-gray-300 leading-relaxed"
          variants={itemVariants}
        >
          At Play Your Game, we value your privacy and are committed to protecting
          your personal information. This Privacy Policy explains how we collect,
          use, and safeguard your data when you use our platform.
        </motion.p>

        {/* Information We Collect */}
        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <User size={16} className="text-emerald-500" />
            </div>
            Information We Collect
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We may collect basic personal information such as your name,
            email address, phone number, profile details, and location data.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            We also collect booking activity, participation in challenges,
            and interactions within community groups to improve user experience.
          </p>
        </motion.section>

        {/* How We Use Information */}
        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Eye size={16} className="text-emerald-500" />
            </div>
            How We Use Your Information
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Your information is used to provide court discovery, booking services,
            matchmaking features, and account management.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            Location data helps display venues near you. You may disable
            location access and search manually at any time.
          </p>
        </motion.section>

        {/* Data Protection */}
        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Lock size={16} className="text-emerald-500" />
            </div>
            Data Protection
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We implement appropriate security measures to protect your data
            against unauthorized access or misuse.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            Payment transactions are processed securely through trusted
            third-party payment providers. We do not store your payment details.
          </p>
        </motion.section>

        {/* Data Sharing */}
        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Share2 size={16} className="text-emerald-500" />
            </div>
            Data Sharing
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We do not sell or rent your personal information to third parties.
            Data may only be shared with service providers necessary for
            platform functionality, such as hosting or payment processing.
          </p>
        </motion.section>

        {/* User Rights */}
        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Shield size={16} className="text-emerald-500" />
            </div>
            Your Rights
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            You may request access, correction, or deletion of your personal data
            by contacting us at
            <span className="text-emerald-400"> support@playyourgame.in</span>.
          </p>
        </motion.section>

        <motion.p 
          className="text-gray-500 text-sm pt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Last Updated: January 2026
        </motion.p>

      </motion.div>
    </div>
  );
}

export default Privacy;
