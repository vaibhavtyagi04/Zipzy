import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wallet, Plus, Key } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { AuthService } from "../services/authService";
import { useMetaMask } from "../hooks/useMetaMask";

const SocialIcon = ({ type }) => {
  if (type === 'google') return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  if (type === 'apple') return <svg className="w-5 h-5" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-31.1-13.3-51.7-40.7-51.7-91.9zm-90.4-181.8c15.2-18.4 25.1-43.7 22.3-68.9-22 1-48.4 14.8-64.1 33.1-13.6 15.6-25.5 41.5-22.1 66.1 24.3 1.9 48.7-11.9 63.9-30.3z"/></svg>;
  if (type === 'facebook') return <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  return null;
};

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const addNotification = useWalletStore((state) => state.addNotification);
  const { connectWallet, isLoading: metaMaskLoading } = useMetaMask();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await AuthService.login(email.trim(), password);
      setSession(result.user);
      addNotification("Welcome back to Zipzy!", "success");
      navigate("/dashboard");
    } catch (error) {
      addNotification(error.message || "Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout illustrationSrc="/auth-illustration.png">
      <div className="max-w-md w-full mx-auto space-y-10">
        <div>
          <h1 className="text-[42px] font-black text-[#111] leading-tight mb-4">Hello Again!</h1>
          <p className="text-[#666] text-lg font-medium">Let's get started with your Zipzy account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111] placeholder:text-[#999]"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111] placeholder:text-[#999]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/recovery" className="text-sm font-bold text-[#666] hover:text-[#111] transition-colors">
              Recovery Password
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-[#8c5a6d] hover:bg-[#7a4e5e] text-white rounded-[20px] font-black text-lg transition-all shadow-xl shadow-[#8c5a6d]/20 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#eee]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#999] font-bold">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center justify-center h-16 bg-white border border-[#eee] rounded-[20px] hover:bg-[#f8f9fa] transition-all shadow-sm">
            <SocialIcon type="google" />
          </button>
          <button className="flex items-center justify-center h-16 bg-white border border-[#eee] rounded-[20px] hover:bg-[#f8f9fa] transition-all shadow-sm">
            <SocialIcon type="apple" />
          </button>
          <button className="flex items-center justify-center h-16 bg-white border border-[#eee] rounded-[20px] hover:bg-[#f8f9fa] transition-all shadow-sm">
            <SocialIcon type="facebook" />
          </button>
        </div>

        <div className="pt-6 border-t border-[#eee] space-y-4">
          <p className="text-center text-xs font-black text-[#999] uppercase tracking-widest">Web3 Wallet Options</p>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => navigate('/wallet/create')}
              className="flex items-center justify-between p-4 bg-[#f8f9fa] border border-[#eee] rounded-[18px] hover:border-[#9d4edd]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#9d4edd]/10 rounded-xl flex items-center justify-center text-[#9d4edd]">
                  <Plus size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#111]">Create New Wallet</p>
                  <p className="text-[10px] font-bold text-[#666]">Generate a new secure phrase</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#999] group-hover:text-[#9d4edd] group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/wallet/import')}
              className="flex items-center justify-between p-4 bg-[#f8f9fa] border border-[#eee] rounded-[18px] hover:border-[#9d4edd]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#9d4edd]/10 rounded-xl flex items-center justify-center text-[#9d4edd]">
                  <Key size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#111]">Import Seed Phrase</p>
                  <p className="text-[10px] font-bold text-[#666]">Restore from 12/24 words</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#999] group-hover:text-[#9d4edd] group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={connectWallet}
              className="flex items-center justify-between p-4 bg-[#f8f9fa] border border-[#eee] rounded-[18px] hover:border-[#9d4edd]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#9d4edd]/10 rounded-xl flex items-center justify-center text-[#9d4edd]">
                  <Wallet size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#111]">Connect External</p>
                  <p className="text-[10px] font-bold text-[#666]">MetaMask, WalletConnect, etc.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#999] group-hover:text-[#9d4edd] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
