import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Copy, Check, ChevronLeft, Loader2, Lock } from 'lucide-react';
import { ethers } from 'ethers';
import AuthLayout from '../components/AuthLayout';
import { useWalletStore } from '../store/walletStore';

const CreateWallet = () => {
  const navigate = useNavigate();
  const { setVault, addNotification } = useWalletStore();
  
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState([]);
  const [shuffledMnemonic, setShuffledMnemonic] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [showPhrase, setShowPhrase] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step === 2) {
      generateNewWallet();
    }
  }, [step]);

  const generateNewWallet = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const wallet = ethers.Wallet.createRandom();
      const words = wallet.mnemonic.phrase.split(" ");
      setMnemonic(words);
      setShuffledMnemonic([...words].sort(() => Math.random() - 0.5));
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification("Phrase copied to clipboard", "success");
  };

  const handleWordClick = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const verifyPhrase = () => {
    if (selectedWords.join(" ") === mnemonic.join(" ")) {
      setStep(4);
    } else {
      addNotification("Invalid word order. Please try again.", "error");
      setSelectedWords([]);
    }
  };

  const finalizeWallet = () => {
    if (password.length < 8) {
      addNotification("Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    // In a real app, we would encrypt the mnemonic with the password here
    setVault({ address: "0x" + Math.random().toString(16).slice(2, 42) }); // Mock address
    addNotification("Wallet created successfully!", "success");
    navigate("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <AuthLayout illustrationSrc="/auth-illustration.png">
      <div className="max-w-md w-full mx-auto">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#999] hover:text-[#111] transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              <div className="w-20 h-20 bg-[#9d4edd]/10 rounded-3xl flex items-center justify-center text-[#9d4edd] mb-10">
                <Shield size={40} />
              </div>
              <div>
                <h1 className="text-[36px] font-black text-[#111] leading-tight mb-4">Secure your wallet</h1>
                <p className="text-[#666] text-lg font-medium leading-relaxed">
                  Zipzy will generate a Secret Recovery Phrase. This phrase is the ONLY way to recover your wallet if you lose access.
                </p>
              </div>
              <div className="bg-[#fff9f0] border border-[#ffe0b2] p-6 rounded-[24px]">
                <p className="text-[#bf8a3d] text-sm font-bold leading-relaxed">
                  ⚠️ Never share your recovery phrase with anyone. Zipzy will never ask for it.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full h-16 bg-[#9d4edd] hover:bg-[#7b2cbf] text-white rounded-[20px] font-black text-lg transition-all shadow-xl shadow-[#9d4edd]/20 active:scale-[0.98]"
              >
                Generate Phrase
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#111] mb-2">Write down your phrase</h2>
                <p className="text-[#666] font-medium">Keep it offline and in a safe place.</p>
              </div>

              {isGenerating ? (
                <div className="h-64 bg-[#f8f9fa] rounded-[32px] flex flex-col items-center justify-center gap-4 border border-[#eee]">
                  <Loader2 className="animate-spin text-[#9d4edd]" size={32} />
                  <p className="text-sm font-bold text-[#999] uppercase tracking-widest">Generating secure keys...</p>
                </div>
              ) : (
                <div className="relative group">
                  <div className={`grid grid-cols-3 gap-3 p-6 bg-[#f8f9fa] border border-[#eee] rounded-[32px] transition-all duration-500 ${!showPhrase ? 'blur-md select-none' : ''}`}>
                    {mnemonic.map((word, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white border border-[#eee] p-3 rounded-xl shadow-sm">
                        <span className="text-[10px] font-black text-[#ccc] w-4">{i + 1}</span>
                        <span className="text-sm font-bold text-[#111]">{word}</span>
                      </div>
                    ))}
                  </div>
                  {!showPhrase && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => setShowPhrase(true)}
                        className="bg-[#111] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                      >
                        <Eye size={18} /> Reveal Phrase
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 h-14 bg-white border border-[#eee] rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#f8f9fa] transition-all"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  Copy
                </button>
                <button 
                  disabled={!showPhrase}
                  onClick={() => setStep(3)}
                  className="flex-[2] h-14 bg-[#111] text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-20"
                >
                  I've written it down
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#111] mb-2">Verify your phrase</h2>
                <p className="text-[#666] font-medium">Select the words in the correct order.</p>
              </div>

              <div className="min-h-[120px] p-6 bg-[#f8f9fa] border-2 border-dashed border-[#ddd] rounded-[32px] flex flex-wrap gap-2">
                {selectedWords.map((word, i) => (
                  <button 
                    key={i}
                    onClick={() => handleWordClick(word)}
                    className="bg-[#9d4edd] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#7b2cbf] transition-all"
                  >
                    {word}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {shuffledMnemonic.map((word, i) => (
                  <button 
                    key={i}
                    disabled={selectedWords.includes(word)}
                    onClick={() => handleWordClick(word)}
                    className="bg-white border border-[#eee] px-4 py-2 rounded-xl text-sm font-bold text-[#666] hover:border-[#9d4edd] hover:text-[#9d4edd] transition-all disabled:opacity-30"
                  >
                    {word}
                  </button>
                ))}
              </div>

              <button
                disabled={selectedWords.length !== mnemonic.length}
                onClick={verifyPhrase}
                className="w-full h-16 bg-[#111] text-white rounded-[20px] font-black text-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-20"
              >
                Confirm & Continue
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 mb-10">
                <Lock size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#111] mb-2">Set a password</h2>
                <p className="text-[#666] font-medium">This password will unlock your wallet on this device.</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111]"
                />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111]"
                />
              </div>

              <button
                onClick={finalizeWallet}
                className="w-full h-16 bg-[#9d4edd] hover:bg-[#7b2cbf] text-white rounded-[20px] font-black text-lg transition-all shadow-xl shadow-[#9d4edd]/20 active:scale-[0.98]"
              >
                Finish Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default CreateWallet;
