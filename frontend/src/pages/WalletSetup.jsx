import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConnect, useAccount } from "wagmi";
import { Shield, ArrowRight, Loader2, Key, Globe, Apple, ChevronLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import { useWalletStore } from "../store/walletStore";
import { useMetaMask } from "../hooks/useMetaMask";
import { WalletService } from "../services/walletService";

const CONNECTOR_META = {
  "MetaMask": { icon: "🦊", color: "from-orange-500/20 to-orange-600/5", borderColor: "hover:border-orange-500/40" },
  "WalletConnect": { icon: "🔗", color: "from-blue-500/20 to-blue-600/5", borderColor: "hover:border-blue-500/40" },
  "Injected": { icon: "💎", color: "from-purple-500/20 to-purple-600/5", borderColor: "hover:border-purple-500/40" }
};

export default function WalletSetup() {
  const navigate = useNavigate();
  const { connectors, connect, isPending: isConnectingWagmi, error: connectError } = useConnect();
  const { isConnected: isWagmiConnected } = useAccount();
  const { setVault, addNotification } = useWalletStore();
  const { connectWallet: connectMetaMask, isLoading: isConnectingMetaMask, error: metaMaskError, isConnected: isMetaMaskConnected } = useMetaMask();
  
  const [step, setStep] = useState("welcome"); // welcome, import, create, backup, connect, not_found
  const [seedPhrase, setSeedPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generatedWallet, setGeneratedWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConnected = isWagmiConnected || isMetaMaskConnected;
  const isConnecting = isConnectingWagmi || isConnectingMetaMask;

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

  const resetSecrets = () => {
    setPassword("");
    setConfirmPassword("");
    setSeedPhrase("");
  };

  const validatePassword = () => {
    if (password.length < WalletService.MIN_PASSWORD_LENGTH) {
      addNotification(`Password must be at least ${WalletService.MIN_PASSWORD_LENGTH} characters`, "error");
      return false;
    }

    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    if (!validatePassword()) return;

    if (seedPhrase.trim().split(/\s+/).length < 12) {
      addNotification("Please enter a valid recovery phrase", "error");
      return;
    }

    setIsLoading(true);
    try {
      const vault = await WalletService.importEncryptedWallet(seedPhrase, password);
      setVault(vault);
      addNotification("Wallet imported into encrypted vault", "success");
      resetSecrets();
      navigate("/");
    } catch (error) {
      addNotification(error.message || "Could not import wallet", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const wallet = await WalletService.createEncryptedWallet(password);
      setGeneratedWallet(wallet);
      addNotification("Encrypted wallet created", "success");
      setStep("backup");
    } catch (error) {
      addNotification(error.message || "Could not create wallet", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const finishCreate = () => {
    if (!generatedWallet?.vault) return;
    setVault(generatedWallet.vault);
    resetSecrets();
    setGeneratedWallet(null);
    navigate("/");
  };

  const handleConnect = (connector) => {
    if (connector.name === "MetaMask") {
      connectMetaMask();
    } else {
      connect({ connector });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,var(--accent-light),transparent_50%)]" />
      
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-10 relative z-10">
            <div className="text-center">
              <div className="w-24 h-24 bg-theme rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-xl overflow-hidden border border-theme">
                <img src="/logo.png" alt="Zipzy Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <h1 className="text-5xl font-black text-theme tracking-tighter mb-4">Zipzy</h1>
              <p className="text-muted text-xs font-black uppercase tracking-[0.3em]">The Intelligent Wallet</p>
            </div>

            <div className="space-y-4">
              <button onClick={() => setStep("create")} className="w-full h-16 send-button flex items-center justify-center gap-3 uppercase tracking-widest text-xs transition-all active:scale-95">
                <Key size={20} /> Create New Wallet
              </button>
              <button onClick={() => handleSocialLogin("google")} className="w-full h-16 bg-text-primary text-bg-primary rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                <Globe size={20} /> Continue with Google
              </button>
              <button onClick={() => handleSocialLogin("apple")} className="w-full h-16 bg-text-primary text-bg-primary rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                <Apple size={20} /> Continue with Apple
              </button>
              <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-theme flex-1 opacity-10" />
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">or</span>
                <div className="h-px bg-theme flex-1 opacity-10" />
              </div>
              <button onClick={() => setStep("import")} className="w-full h-16 bg-surface border border-theme text-theme rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-theme transition-all">
                Import Secret Recovery Phrase
              </button>
              <button onClick={() => setStep("connect")} className="w-full h-16 bg-transparent text-accent rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-accent-light transition-all">
                Connect External Wallet
              </button>
            </div>
            
            <p className="text-[10px] text-muted text-center leading-relaxed opacity-40 px-10">
              By continuing, you agree to Zipzy's Terms of Use and Privacy notice.
            </p>
          </motion.div>
        )}

        {step === "create" && (
          <motion.div key="create" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-8 relative z-10">
            <button onClick={() => setStep("welcome")} className="p-3 hover:bg-surface rounded-2xl transition-colors mb-4">
               <ChevronLeft size={24} className="text-theme" />
            </button>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-theme tracking-tight">Create wallet</h2>
              <p className="text-sm text-muted font-bold">Protect your encrypted vault with a local password.</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vault password"
                className="w-full bg-surface border border-theme rounded-[24px] p-5 text-sm font-bold text-theme focus:border-accent/40 outline-none transition-all placeholder:text-muted/40"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-surface border border-theme rounded-[24px] p-5 text-sm font-bold text-theme focus:border-accent/40 outline-none transition-all placeholder:text-muted/40"
              />
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={handleCreate} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Encrypted Wallet"}
            </Button>
          </motion.div>
        )}

        {step === "backup" && generatedWallet && (
          <motion.div key="backup" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-lg w-full space-y-8 relative z-10">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-accent-light rounded-3xl mx-auto flex items-center justify-center text-accent border border-accent/20">
                <Shield size={28} />
              </div>
              <h2 className="text-4xl font-black text-theme tracking-tight">Recovery phrase</h2>
              <p className="text-sm text-muted font-bold">This is shown once. Zipzy stores only the encrypted vault.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface border border-theme rounded-[28px] p-5">
              {generatedWallet.mnemonic.split(" ").map((word, index) => (
                <div key={`${word}-${index}`} className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3">
                  <span className="text-[10px] font-black text-muted w-5">{index + 1}</span>
                  <span className="text-sm font-black text-theme">{word}</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-500/80 font-bold leading-relaxed">
                Anyone with this phrase can control the wallet. The app cannot recover it after this screen.
              </p>
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={finishCreate}>
              I Saved It
            </Button>
          </motion.div>
        )}

        {step === "import" && (
          <motion.div key="import" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-8 relative z-10">
            <button onClick={() => setStep("welcome")} className="p-3 hover:bg-surface rounded-2xl transition-colors mb-4">
               <ChevronLeft size={24} className="text-theme" />
            </button>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-theme tracking-tight">Import a wallet</h2>
              <p className="text-sm text-muted font-bold">Enter your Secret Recovery Phrase</p>
            </div>
            <div className="relative">
              <textarea 
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Add a space between each word and make sure no one is watching."
                className="w-full h-64 bg-surface border border-theme rounded-[32px] p-8 text-lg font-bold text-theme focus:border-accent/40 outline-none transition-all placeholder:text-muted/40 resize-none"
              />
              <button 
                onClick={async () => setSeedPhrase(await navigator.clipboard.readText())}
                className="absolute right-8 bottom-8 text-xs font-black text-accent uppercase tracking-widest hover:opacity-80"
              >
                Paste
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vault password"
                className="w-full bg-surface border border-theme rounded-[24px] p-5 text-sm font-bold text-theme focus:border-accent/40 outline-none transition-all placeholder:text-muted/40"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-surface border border-theme rounded-[24px] p-5 text-sm font-bold text-theme focus:border-accent/40 outline-none transition-all placeholder:text-muted/40"
              />
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
                 className="w-full h-full object-contain drop-shadow-2xl"
               />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-theme tracking-tight">Wallet not found</h2>
              <p className="text-sm text-muted font-bold px-10 leading-relaxed">
                We couldn't find a wallet for your login. Do you want to create a new one with this account?
              </p>
            </div>
            <div className="space-y-4">
              <Button variant="primary" fullWidth size="lg" onClick={() => setStep("create")} disabled={isLoading}>
                Yes, create a new wallet
              </Button>
              <button onClick={() => setStep("welcome")} className="w-full p-5 text-[10px] font-black text-muted uppercase tracking-widest hover:text-theme transition-colors">
                Use a different login method
              </button>
            </div>
          </motion.div>
        )}

        {step === "connect" && (
          <motion.div key="connect" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md w-full space-y-8 relative z-10">
            <button onClick={() => setStep("welcome")} className="p-3 hover:bg-surface rounded-2xl transition-colors mb-4">
               <ChevronLeft size={24} className="text-theme" />
            </button>
            <div className="text-center space-y-4 mb-10">
               <h2 className="text-3xl font-black text-theme tracking-tight">External Wallet</h2>
               <p className="text-xs text-muted font-black uppercase tracking-widest">Select a provider to connect</p>
            </div>
            <div className="space-y-4">
              {connectors.map((connector) => {
                const meta = CONNECTOR_META[connector.name] || CONNECTOR_META["Injected"];
                return (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    className="w-full p-6 rounded-[28px] bg-surface border border-theme hover:border-accent/40 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-3xl">{meta.icon}</span>
                      <div>
                        <h3 className="text-lg font-black text-theme">{connector.name}</h3>
                        <p className="text-xs text-muted font-bold">Extension or mobile app</p>
                      </div>
                    </div>
                    {isConnecting ? <Loader2 className="animate-spin text-muted" /> : <ArrowRight className="text-muted group-hover:translate-x-2 transition-transform" />}
                  </button>
                );
              })}
            </div>
            {(connectError || metaMaskError) && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <Shield className="text-red-400" size={16} />
                <p className="text-xs text-red-400 font-bold">{(connectError?.message || metaMaskError)}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
