import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [otpSent, setOtpSent] = useState(false);
  const [emailExists, setEmailExists] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    // FIXED: Correct template literal syntax
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    if (error) alert(error.message);
    else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    });
    if (error) alert(error.message);
    else navigate("/");
    setLoading(false);
  };

  const handleEmailAction = async () => {
    setLoading(true);

    if (emailExists) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      navigate("/");
    } else {
      // SIGNUP logic
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // This goes to raw_user_meta_data for the trigger
          },
        },
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // NOTE: Manual profile insert removed. 
      // The SQL Trigger handle_new_user() now does this automatically.
      alert("Verification email sent! Please check your inbox.");
      navigate("/");
    }
    setLoading(false);
  };

  // ... (Rest of the component remains the same, but ensure backticks are used in classNames)
  return (
    <div className="login-root">
      {/* Ensure your tab-btn classes use backticks: className={`tab-btn ${emailExists ? "active-login" : ""}`} */}
      {/* Rest of UI... */}
    </div>
  );
}

export default Login;