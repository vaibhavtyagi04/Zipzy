// pages/Login.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import Background from "../components/Background";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const addNotification = useWalletStore(s => s.addNotification);

  const handleLogin = (e) => {
    e.preventDefault();
    login({ name: "Vaibhav", email: "vaibhav@zipzy.eth" });
    addNotification("Welcome back to Zipzy!", "success");
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
          <div className="w-16 h-16 bg-phantom-purple rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-phantom-purple/20">
            <Zap size={32} className="text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-bold">Log in to your Zipzy ⚡ Portal</p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
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

            <Button variant="primary" fullWidth icon={ArrowRight} className="py-5">
              Access Portal
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500">
              Don't have a portal?{" "}
              <Link to="/signup" className="text-phantom-purple hover:underline underline-offset-4">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
