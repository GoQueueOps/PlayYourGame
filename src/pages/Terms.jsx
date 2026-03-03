import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";

function Terms() {
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
          Terms and Conditions
        </motion.h1>

        <motion.p 
          className="text-gray-300 leading-relaxed"
          variants={itemVariants}
        >
          By accessing, registering, downloading, or using Play Your Game,
          you agree to be legally bound by these Terms and Conditions and our
          Privacy Policy. If you do not agree, you must immediately stop using the platform.
        </motion.p>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Acceptance of Terms
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            References to "you" include any individual or entity accessing the platform.
            If you use the platform on behalf of an organization, you confirm that
            you have authority to bind that organization to these Terms.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Amendments
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Play Your Game reserves the right to update or modify these Terms at any time.
            Continued use of the platform after changes are posted constitutes acceptance
            of the revised Terms.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Nature of the Platform
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Play Your Game is a technology platform that facilitates booking of sports venues
            and participation in sports activities. We do not own, operate, or control
            any listed venue.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            All venues and services are independently managed by third party providers.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            No Warranty
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We make no warranties regarding venue quality, availability,
            safety, pricing, or service standards.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Payments
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Payments are processed through authorized third party payment gateways.
            We do not store your card details.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            You agree to provide accurate payment information and use only lawful
            payment methods.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Refund Policy
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Refund eligibility depends on venue specific rules.
            Cancellations made at least three hours prior to booking time may qualify
            for refund. Late cancellations may not be refunded.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            User Representations
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            You represent that all information provided is accurate and lawful.
            You agree not to misuse the platform or violate applicable laws.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Account Security
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            You are responsible for maintaining confidentiality of your account credentials.
            We reserve the right to suspend accounts that violate these Terms.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Assumption of Risk
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            Sports involve inherent risks including injury. By booking through
            the platform, you voluntarily assume all such risks.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Limitation of Liability
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages including injury or financial loss.
          </p>
          <p className="text-gray-300 leading-relaxed mt-3">
            Our total liability shall not exceed the amount paid for the
            booking giving rise to the claim.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Indemnification
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            You agree to indemnify and hold harmless Play Your Game and its
            directors, employees, and affiliates from claims, damages,
            or liabilities arising from your use of the platform.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Intellectual Property
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            All platform content, branding, and software are owned by
            Play Your Game. Unauthorized reproduction is prohibited.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Access and Availability
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We do not guarantee uninterrupted or error free platform access.
            Access may be suspended without notice.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Mobile Platform Terms
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            If accessed via mobile devices, you agree that your use is also
            subject to the terms of the respective mobile operator.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Force Majeure
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            We are not liable for failure to perform obligations due to events
            beyond reasonable control including natural disasters, technical failures,
            government restrictions, or other unforeseen circumstances.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="group">
          <motion.h2 
            className="text-xl font-bold uppercase mb-3 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
              <Check size={16} className="text-emerald-500" />
            </div>
            Governing Law
          </motion.h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms are governed by the laws of India.
            Disputes shall be subject to jurisdiction of Indian courts.
          </p>
        </motion.section>

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

export default Terms;
