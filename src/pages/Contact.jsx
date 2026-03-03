import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";

function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 md:px-20 py-16 font-sans relative overflow-hidden">
      
      {/* Animated Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

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

      {/* HERO */}
      <motion.div 
        className="text-center max-w-3xl mx-auto mb-16 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tight">
          Contact <span className="text-emerald-500">Us</span>
        </h1>
        <motion.p 
          className="mt-6 text-gray-400 text-sm md:text-base font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          We are here to help you.
        </motion.p>
      </motion.div>

      {/* CONTACT SECTION */}
      <motion.div 
        className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 relative z-10"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        initial="hidden"
        animate="visible"
      >

        {/* LEFT SIDE INFO */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              whileHover={{ x: 5 }}
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Mail className="text-emerald-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-emerald-500 uppercase tracking-wide">
                Get In Touch
              </h2>
            </motion.div>
            <p className="text-gray-300 leading-relaxed">
              Whether you are a player, venue owner, or partner, 
              we would love to hear from you. 
              Reach out to us for support, partnerships, or general inquiries.
            </p>
          </div>

          <motion.div 
            className="space-y-4 text-gray-300"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ x: 5 }}
              className="group"
            >
              <p className="font-bold text-white flex items-center gap-2">
                <Mail size={16} className="text-emerald-500" /> Email
              </p>
              <p className="text-gray-400">jee.tejas@gmail.com</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ x: 5 }}
              className="group"
            >
              <p className="font-bold text-white">Business Inquiries</p>
              <p className="text-gray-400">Partnerships and collaborations welcome</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ x: 5 }}
              className="group"
            >
              <p className="font-bold text-white flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" /> Location
              </p>
              <p className="text-gray-400">India</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE FORM */}
        <motion.div 
          className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 backdrop-blur-xl relative group"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -5, borderColor: "rgba(16, 185, 129, 0.3)" }}
        >
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Full Name
            </label>
            <motion.input
              type="text"
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-black/60 transition-all"
              placeholder="Enter your name"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
            <motion.input
              type="email"
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-black/60 transition-all"
              placeholder="Enter your email"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Message
            </label>
            <motion.textarea
              rows="4"
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-black/60 transition-all"
              placeholder="Write your message"
              whileFocus={{ scale: 1.01 }}
            ></motion.textarea>
          </motion.div>

          <motion.button
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Send size={18} />
            Send Message
          </motion.button>

        </motion.div>

      </motion.div>

    </div>
  );
}

export default Contact;
