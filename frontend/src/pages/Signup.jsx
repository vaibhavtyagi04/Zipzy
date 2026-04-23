// pages/Signup.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import Background from "../components/Background";

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore(s => s.signup);
  const addNotification = useWalletStore(s => s.addNotification);

  const handleSignup = (e) => {
    e.preventDefault();
    signup({ name: "Vaibhav", email: "vaibhav@zipzy.eth" });
    addNotification("Account created! Welcome to the ecosystem.", "success");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-phantom-bg text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Background />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#D4FF75] rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#D4FF75]/20">
            <Zap size={32} className="text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Join Zipzy ⚡</h1>
          <p className="text-gray-500 font-bold">The next generation of Web3 portals</p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Vaibhav Tya6i" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-phantom-purple/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="name@zipzy.eth" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-phantom-purple/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-phantom-purple/30 transition-all text-sm"
                />
              </div>
            </div>

            <Button variant="neon" fullWidth icon={ArrowRight} className="py-5">
              Launch Portal
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500">
              Already have a portal?{" "}
              <Link to="/login" className="text-phantom-purple hover:underline underline-offset-4">Log In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
