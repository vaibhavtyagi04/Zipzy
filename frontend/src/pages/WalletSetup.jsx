import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConnect, useAccount } from "wagmi";
import { Shield, ArrowRight, Loader2, Key, Mail, Globe, Apple, ChevronLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import { useWalletStore } from "../store/walletStore";

const CONNECTOR_META = {
  "MetaMask": { icon: "🦊", color: "from-orange-500/20 to-orange-600/5", borderColor: "hover:border-orange-500/40" },
  "WalletConnect": { icon: "🔗", color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/40" },
  "Injected": { icon: "💎", color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/40" }
};

export default function WalletSetup() {
  const navigate = useNavigate();
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
  const { isConnected } = useAccount();
  const { setVault, addNotification } = useWalletStore();
  
  const [step, setStep] = useState("welcome"); // welcome, import, create, connect, not_found
  const [seedPhrase, setSeedPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      navigate("/", { replace: true });
    }
  }, [isConnected, navigate]);

  const handleSocialLogin = (method) => {
    setIsLoading(true);
    // Simulate social login discovery
    setTimeout(() => {
      setIsLoading(false);
      setStep("not_found");
    }, 1500);
  };

  const handleImport = () => {
    if (seedPhrase.split(" ").length < 12) {
      addNotification("Please enter a valid 12-word recovery phrase", "error");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Mock successful import
      setVault({ address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE" });
      navigate("/");
    }, 2000);
  };

  const handleCreate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVault({ address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72" });
      navigate("/");
    }, 2500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#E9B3A215,transparent_50%)]" />
      
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-10 relative z-10">
            <div className="text-center">
              <div className="w-24 h-24 bg-white rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(233,179,162,0.15)] overflow-hidden border border-white/10">
                <img src="/logo.png" alt="Zipzy Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Zipzy</h1>
              <p className="text-muted text-xs font-black uppercase tracking-[0.3em]">The Intelligent Wallet</p>
            </div>

            <div className="space-y-4">
              <button onClick={() => handleSocialLogin("google")} className="w-full h-16 bg-white text-black rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                <Globe size={20} /> Continue with Google
              </button>
              <button onClick={() => handleSocialLogin("apple")} className="w-full h-16 bg-white text-black rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                <Apple size={20} /> Continue with Apple
              </button>
              <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>
              <button onClick={() => setStep("import")} className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                Import Secret Recovery Phrase
              </button>
              <button onClick={() => setStep("connect")} className="w-full h-16 bg-transparent text-[#E9B3A2] rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-[#E9B3A2]/5 transition-all">
                Connect External Wallet
              </button>
            </div>
            
            <p className="text-[10px] text-muted text-center leading-relaxed opacity-40 px-10">
              By continuing, you agree to Zipzy's Terms of Use and Privacy notice.
            </p>
          </motion.div>
        )}

        {step === "import" && (
          <motion.div key="import" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-8 relative z-10">
            <button onClick={() => setStep("welcome")} className="p-3 hover:bg-white/5 rounded-2xl transition-colors mb-4">
               <ChevronLeft size={24} className="text-white" />
            </button>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tight">Import a wallet</h2>
              <p className="text-sm text-muted font-bold">Enter your Secret Recovery Phrase</p>
            </div>
            <div className="relative">
              <textarea 
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Add a space between each word and make sure no one is watching."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-[32px] p-8 text-lg font-bold text-white focus:border-[#E9B3A2]/40 outline-none transition-all placeholder:text-muted/40 resize-none"
              />
              <button 
                onClick={async () => setSeedPhrase(await navigator.clipboard.readText())}
                className="absolute right-8 bottom-8 text-xs font-black text-[#E9B3A2] uppercase tracking-widest hover:opacity-80"
              >
                Paste
              </button>
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={handleImport} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </motion.div>
        )}

        {step === "not_found" && (
          <motion.div key="not_found" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-10 text-center relative z-10">
            <div className="relative w-72 h-72 mx-auto">
               <img 
                 src="/character.png" 
                 alt="Character" 
                 className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(233,179,162,0.1)]"
               />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tight">Wallet not found</h2>
              <p className="text-sm text-muted font-bold px-10 leading-relaxed">
                We couldn't find a wallet for your login. Do you want to create a new one with this account?
              </p>
            </div>
            <div className="space-y-4">
              <Button variant="primary" fullWidth size="lg" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Yes, create a new wallet"}
              </Button>
              <button onClick={() => setStep("welcome")} className="w-full p-5 text-[10px] font-black text-muted uppercase tracking-widest hover:text-white transition-colors">
                Use a different login method
              </button>
            </div>
          </motion.div>
        )}

        {step === "connect" && (
          <motion.div key="connect" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-8 relative z-10">
            <button onClick={() => setStep("welcome")} className="p-3 hover:bg-white/5 rounded-2xl transition-colors mb-4">
               <ChevronLeft size={24} className="text-white" />
            </button>
            <div className="text-center space-y-4 mb-10">
               <h2 className="text-3xl font-black text-white tracking-tight">External Wallet</h2>
               <p className="text-xs text-muted font-black uppercase tracking-widest">Select a provider to connect</p>
            </div>
            <div className="space-y-4">
              {connectors.map((connector) => {
                const meta = CONNECTOR_META[connector.name] || CONNECTOR_META["Injected"];
                return (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="w-full p-6 rounded-[28px] bg-white/5 border border-white/10 hover:border-[#E9B3A2]/40 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-3xl">{meta.icon}</span>
                      <div>
                        <h3 className="text-lg font-black text-white">{connector.name}</h3>
                        <p className="text-xs text-muted font-bold">Extension or mobile app</p>
                      </div>
                    </div>
                    {isConnecting ? <Loader2 className="animate-spin text-muted" /> : <ArrowRight className="text-muted group-hover:translate-x-2 transition-transform" />}
                  </button>
                );
              })}
            </div>
            {connectError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-red-400" size={16} />
                <p className="text-xs text-red-400 font-bold">{connectError.message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
