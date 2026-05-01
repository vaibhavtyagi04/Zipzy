import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { AuthService } from "../services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const addNotification = useWalletStore((state) => state.addNotification);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await AuthService.signup(name.trim(), email.trim(), password);
      setSession(result.user);
      addNotification("Account created successfully!", "success");
      navigate("/wallet/setup");
    } catch (error) {
      addNotification(error.message || "Signup failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout illustrationSrc="/auth-illustration.png">
      <div className="max-w-md w-full mx-auto space-y-10">
        <div>
          <h1 className="text-[42px] font-black text-[#111] leading-tight mb-4">Create Account</h1>
          <p className="text-[#666] text-lg font-medium">Join the Zipzy ecosystem today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111] placeholder:text-[#999]"
              required
            />
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-[#111] hover:bg-[#222] text-white rounded-[20px] font-black text-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="pt-6 border-t border-[#eee] text-center">
          <p className="text-[#666] font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#9d4edd] font-black hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
